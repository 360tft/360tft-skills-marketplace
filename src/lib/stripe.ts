import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

export type SponsorshipTier = "hero" | "grid" | "detail";
export type BillingInterval = "monthly" | "yearly";

export const SPONSORSHIP_TIERS: Record<
  SponsorshipTier,
  {
    label: string;
    monthlyAmount: number;
    yearlyAmount: number;
    description: string;
    maxSlots: number;
  }
> = {
  hero: {
    label: "Hero Banner",
    monthlyAmount: 9900,
    yearlyAmount: 99000,
    description: "Full-width banner above the tool grid. 1 slot available.",
    maxSlots: 1,
  },
  grid: {
    label: "Grid Promoted",
    monthlyAmount: 4900,
    yearlyAmount: 49000,
    description: "Pinned to top of grid with Sponsored badge. Up to 3 slots.",
    maxSlots: 3,
  },
  detail: {
    label: "Detail Page",
    monthlyAmount: 2900,
    yearlyAmount: 29000,
    description:
      "Appears in \"You might also like\" on other tools' detail pages.",
    maxSlots: 10,
  },
};

export function getStripePriceId(
  tier: SponsorshipTier,
  interval: BillingInterval = "monthly"
): string | undefined {
  const map: Record<SponsorshipTier, Record<BillingInterval, string | undefined>> = {
    hero: {
      monthly: process.env.STRIPE_PRICE_HERO,
      yearly: process.env.STRIPE_PRICE_HERO_YEARLY,
    },
    grid: {
      monthly: process.env.STRIPE_PRICE_GRID,
      yearly: process.env.STRIPE_PRICE_GRID_YEARLY,
    },
    detail: {
      monthly: process.env.STRIPE_PRICE_DETAIL,
      yearly: process.env.STRIPE_PRICE_DETAIL_YEARLY,
    },
  };
  return map[tier][interval];
}
