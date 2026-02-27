import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  sendSponsorshipConfirmation,
  sendSponsorshipCancelled,
} from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();

  if (!stripe || !admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { tool_slug, tier, user_id } = session.metadata || {};

      if (!tool_slug || !tier || !user_id) break;

      await admin.from("sponsored_listings").insert({
        tool_slug,
        tier,
        user_id,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: "active",
      });

      // Send confirmation email
      if (session.customer_email) {
        sendSponsorshipConfirmation(
          session.customer_email,
          tool_slug,
          tier
        ).catch(() => {});
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = subscription.status;

      let mappedStatus: string;
      if (status === "active") mappedStatus = "active";
      else if (status === "past_due") mappedStatus = "past_due";
      else if (status === "canceled" || status === "unpaid")
        mappedStatus = "expired";
      else break;

      await admin
        .from("sponsored_listings")
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const { data: listing } = await admin
        .from("sponsored_listings")
        .select("tool_slug, tier")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      await admin
        .from("sponsored_listings")
        .update({
          status: "expired",
          expires_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      // Send cancellation email
      if (listing) {
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );
        if ("email" in customer && customer.email) {
          sendSponsorshipCancelled(
            customer.email,
            listing.tool_slug,
            listing.tier
          ).catch(() => {});
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details;
      const subId =
        typeof subDetails?.subscription === "string"
          ? subDetails.subscription
          : subDetails?.subscription?.id ?? null;

      if (subId) {
        await admin
          .from("sponsored_listings")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
