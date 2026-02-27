-- Email capture table for install flow leads
CREATE TABLE IF NOT EXISTS marketplace_emails (
  email TEXT PRIMARY KEY,
  source_tool TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_emails_source ON marketplace_emails(source_tool);
CREATE INDEX IF NOT EXISTS idx_marketplace_emails_created ON marketplace_emails(created_at DESC);

-- RLS
ALTER TABLE marketplace_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write
CREATE POLICY "Service role full access on marketplace_emails"
  ON marketplace_emails FOR ALL
  USING (auth.role() = 'service_role');

-- Install count tracking per tool
CREATE TABLE IF NOT EXISTS tool_stats (
  tool_slug TEXT PRIMARY KEY,
  install_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tool_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats
CREATE POLICY "Tool stats are publicly readable"
  ON tool_stats FOR SELECT
  USING (true);

-- Service role can write
CREATE POLICY "Service role full access on tool_stats"
  ON tool_stats FOR ALL
  USING (auth.role() = 'service_role');

-- RPC function to atomically increment install count
CREATE OR REPLACE FUNCTION increment_install_count(p_tool_slug TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_stats (tool_slug, install_count, updated_at)
  VALUES (p_tool_slug, 1, now())
  ON CONFLICT (tool_slug)
  DO UPDATE SET
    install_count = tool_stats.install_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
