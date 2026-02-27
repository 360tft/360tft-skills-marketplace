-- Migration 011: Fix overly permissive RLS policies on api_keys and api_usage_daily
-- CRITICAL-1: Previous policies used USING (true), exposing all developer emails,
-- tiers, and usage data to any anonymous client.

-- Drop the permissive policies
DROP POLICY IF EXISTS "Users read own keys by email" ON api_keys;
DROP POLICY IF EXISTS "Usage readable" ON api_usage_daily;

-- api_keys: authenticated users can only read their own keys (matched by email in JWT)
CREATE POLICY "Users read own keys" ON api_keys
  FOR SELECT TO authenticated
  USING (email = auth.jwt()->>'email');

-- api_keys: service role has full access (used by API routes)
CREATE POLICY "Service role manages keys" ON api_keys
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- api_usage_daily: authenticated users can only read usage for their own keys
CREATE POLICY "Users read own usage" ON api_usage_daily
  FOR SELECT TO authenticated
  USING (
    api_key_id IN (
      SELECT id FROM api_keys WHERE email = auth.jwt()->>'email'
    )
  );

-- api_usage_daily: service role has full access
CREATE POLICY "Service role manages usage" ON api_usage_daily
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
