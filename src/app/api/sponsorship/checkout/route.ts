import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, getStripePriceId, SPONSORSHIP_TIERS } from "@/lib/stripe";
import { getToolBySlug } from "@/data/tools";
import type { SponsorshipTier, BillingInterval } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { tier, toolSlug, interval = "monthly" } = body as {
      tier: SponsorshipTier;
      toolSlug: string;
      interval?: BillingInterval;
    };

    // Validate tier
    if (!tier || !SPONSORSHIP_TIERS[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Validate interval
    if (interval !== "monthly" && interval !== "yearly") {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    // Validate tool exists
    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const priceId = getStripePriceId(tier, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this tier" },
        { status: 503 }
      );
    }

    // Check slot availability
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { data: activeListings } = await admin
      .from("sponsored_listings")
      .select("id")
      .eq("tier", tier)
      .eq("status", "active");

    const activeCount = activeListings?.length ?? 0;
    const maxSlots = SPONSORSHIP_TIERS[tier].maxSlots;

    if (activeCount >= maxSlots) {
      return NextResponse.json(
        {
          error: `No ${tier} slots available. All ${maxSlots} slot${maxSlots === 1 ? " is" : "s are"} taken.`,
        },
        { status: 409 }
      );
    }

    // Check if user already has an active sponsorship for this tool + tier
    const { data: existing } = await admin
      .from("sponsored_listings")
      .select("id")
      .eq("tool_slug", toolSlug)
      .eq("tier", tier)
      .eq("status", "active")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This tool already has an active sponsorship for this tier" },
        { status: 409 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        tool_slug: toolSlug,
        tier,
        user_id: user.id,
      },
      customer_email: user.email,
      success_url: `${appUrl}/dashboard/creator?sponsored=success&tier=${tier}`,
      cancel_url: `${appUrl}/dashboard/creator?sponsored=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
