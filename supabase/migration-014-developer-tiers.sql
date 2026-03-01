-- Migration 014: Developer tiers (builder/scale/enterprise)
-- Adds Stripe columns to api_keys, migrates developer→builder, updates tier limits

-- Add Stripe subscription tracking to api_keys
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for webhook lookups by subscription ID
CREATE INDEX IF NOT EXISTS idx_api_keys_stripe_sub ON api_keys(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Migrate existing developer tier keys to builder (same 1000/day limit)
UPDATE api_keys SET tier = 'builder' WHERE tier = 'developer';

-- Replace increment_api_usage with updated tier limits
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_key_hash TEXT,
  p_tool_slug TEXT
)
RETURNS TABLE(
  allowed BOOLEAN,
  key_id UUID,
  key_tier TEXT,
  remaining_today INTEGER,
  key_email TEXT
) AS $$
DECLARE
  v_key api_keys%ROWTYPE;
  v_limit INTEGER;
BEGIN
  -- Find the key
  SELECT * INTO v_key FROM api_keys WHERE key_hash = p_key_hash AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'invalid'::TEXT, 0, ''::TEXT;
    RETURN;
  END IF;

  -- Reset daily counter if new day
  IF v_key.last_call_date IS NULL OR v_key.last_call_date < CURRENT_DATE THEN
    UPDATE api_keys SET calls_today = 0, last_call_date = CURRENT_DATE WHERE id = v_key.id;
    v_key.calls_today := 0;
  END IF;

  -- Reset monthly counter if new month
  IF v_key.last_call_month IS NULL OR v_key.last_call_month < to_char(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE api_keys SET calls_this_month = 0, last_call_month = to_char(CURRENT_DATE, 'YYYY-MM') WHERE id = v_key.id;
    v_key.calls_this_month := 0;
  END IF;

  -- Determine limit based on tier
  v_limit := CASE v_key.tier
    WHEN 'free' THEN 10
    WHEN 'pro' THEN 100
    WHEN 'builder' THEN 1000
    WHEN 'scale' THEN 5000
    WHEN 'enterprise' THEN 999999
    WHEN 'unlimited' THEN 999999
    ELSE 10
  END;

  -- Check limit
  IF v_key.calls_today >= v_limit THEN
    RETURN QUERY SELECT false, v_key.id, v_key.tier, 0, v_key.email;
    RETURN;
  END IF;

  -- Increment counters
  UPDATE api_keys
  SET calls_today = calls_today + 1,
      calls_this_month = calls_this_month + 1,
      updated_at = now()
  WHERE id = v_key.id;

  -- Track per-tool usage
  INSERT INTO api_usage_daily (api_key_id, tool_slug, date, call_count)
  VALUES (v_key.id, p_tool_slug, CURRENT_DATE, 1)
  ON CONFLICT (api_key_id, tool_slug, date)
  DO UPDATE SET call_count = api_usage_daily.call_count + 1;

  RETURN QUERY SELECT true, v_key.id, v_key.tier, (v_limit - v_key.calls_today - 1), v_key.email;
END;
$$ LANGUAGE plpgsql;
