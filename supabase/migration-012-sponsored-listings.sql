-- Sponsored listings for marketplace monetisation
-- Tracks active sponsorships tied to Stripe subscriptions

CREATE TABLE sponsored_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  tier TEXT NOT NULL CHECK (tier IN ('hero', 'grid', 'detail')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'expired')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsored_status ON sponsored_listings(status);
CREATE INDEX idx_sponsored_tool ON sponsored_listings(tool_slug);
CREATE INDEX idx_sponsored_user ON sponsored_listings(user_id);
CREATE INDEX idx_sponsored_tier_status ON sponsored_listings(tier, status);

-- Only 1 active hero at a time
CREATE UNIQUE INDEX idx_sponsored_hero_active
  ON sponsored_listings(tier) WHERE tier = 'hero' AND status = 'active';

-- Max 3 active grid promotions enforced in application code

-- RLS
ALTER TABLE sponsored_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own sponsorships"
  ON sponsored_listings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public read active sponsorships"
  ON sponsored_listings FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Service role manages sponsorships"
  ON sponsored_listings FOR ALL TO service_role
  USING (true) WITH CHECK (true);
