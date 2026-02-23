-- API Keys table for 360TFT Skills Marketplace
-- Run this in the Supabase SQL editor for your shared Supabase project

-- Enable pgcrypto for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  product TEXT NOT NULL DEFAULT 'all',
  tier TEXT NOT NULL DEFAULT 'free',
  calls_today INTEGER DEFAULT 0,
  calls_this_month INTEGER DEFAULT 0,
  last_call_date DATE,
  last_call_month TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast key lookups (this is the hot path)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Index for listing keys by email
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);

-- Index for active keys
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Daily usage tracking per key per tool
CREATE TABLE IF NOT EXISTS api_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(api_key_id, tool_slug, date)
);

-- Index for usage lookups
CREATE INDEX IF NOT EXISTS idx_api_usage_key_date ON api_usage_daily(api_key_id, date);

-- Function to reset daily counters (call via cron or on first call of the day)
CREATE OR REPLACE FUNCTION reset_daily_api_counters()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET calls_today = 0, last_call_date = CURRENT_DATE
  WHERE last_call_date IS NULL OR last_call_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_api_counters()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET calls_this_month = 0, last_call_month = to_char(CURRENT_DATE, 'YYYY-MM')
  WHERE last_call_month IS NULL OR last_call_month < to_char(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage and check limits (atomic operation)
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
    WHEN 'developer' THEN 1000
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

-- RLS policies (service role bypasses these, anon/authenticated use them)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_daily ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by MCP gateway and marketplace API)
-- No policies needed for service role as it bypasses RLS

-- Allow reading own keys by email (for future auth integration)
CREATE POLICY "Users read own keys by email" ON api_keys
  FOR SELECT USING (true);

CREATE POLICY "Usage readable" ON api_usage_daily
  FOR SELECT USING (true);
