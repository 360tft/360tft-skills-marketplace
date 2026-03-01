import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  sendSponsorshipConfirmation,
  sendSponsorshipCancelled,
  sendDeveloperTierConfirmation,
  sendDeveloperTierCancelled,
  sendRateLimitWarning,
} from "@/lib/email";
import { TIER_LIMITS } from "@/lib/api-keys";
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

      // Developer tier upgrade
      if (session.metadata?.type === "developer_tier") {
        const devTier = session.metadata.tier;
        const userEmail = session.metadata.user_email;

        if (devTier && userEmail) {
          await admin
            .from("api_keys")
            .update({
              tier: devTier,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq("email", userEmail)
            .eq("is_active", true);

          const limit = TIER_LIMITS[devTier] || 1000;
          sendDeveloperTierConfirmation(userEmail, devTier, limit).catch(() => {});
        }
        break;
      }

      // Sponsorship checkout
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

      // Check if this is a developer tier subscription
      const { data: devKeys } = await admin
        .from("api_keys")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .limit(1);

      if (devKeys && devKeys.length > 0) {
        if (status === "canceled" || status === "unpaid") {
          await admin
            .from("api_keys")
            .update({
              tier: "free",
              stripe_subscription_id: null,
              stripe_customer_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
        }
        break;
      }

      // Sponsorship subscription
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

      // Check if this is a developer tier subscription
      const { data: devKeysToCancel } = await admin
        .from("api_keys")
        .select("id, email, tier")
        .eq("stripe_subscription_id", subscription.id)
        .limit(1);

      if (devKeysToCancel && devKeysToCancel.length > 0) {
        const cancelledTier = devKeysToCancel[0].tier;
        const cancelledEmail = devKeysToCancel[0].email;

        await admin
          .from("api_keys")
          .update({
            tier: "free",
            stripe_subscription_id: null,
            stripe_customer_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (cancelledEmail) {
          sendDeveloperTierCancelled(cancelledEmail, cancelledTier).catch(() => {});
        }
        break;
      }

      // Sponsorship subscription
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
        // Check if this is a developer tier subscription
        const { data: failedDevKeys } = await admin
          .from("api_keys")
          .select("id, email")
          .eq("stripe_subscription_id", subId)
          .limit(1);

        if (failedDevKeys && failedDevKeys.length > 0) {
          if (failedDevKeys[0].email) {
            const limit = TIER_LIMITS["builder"] || 1000;
            sendRateLimitWarning(failedDevKeys[0].email, limit, limit).catch(() => {});
          }
          break;
        }

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
