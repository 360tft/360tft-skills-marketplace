import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getDeveloperPriceId } from "@/lib/stripe";
import type { DeveloperTier } from "@/lib/stripe";

const VALID_TIERS: DeveloperTier[] = ["builder", "scale"];

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
    const { tier } = body as { tier: DeveloperTier };

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = getDeveloperPriceId(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this tier" },
        { status: 503 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        type: "developer_tier",
        tier,
        user_email: user.email || "",
      },
      customer_email: user.email,
      success_url: `${appUrl}/developer?upgraded=success&tier=${tier}`,
      cancel_url: `${appUrl}/developer?upgraded=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
