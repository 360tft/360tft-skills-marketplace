-- Add security risk scoring columns to tool_submissions
ALTER TABLE tool_submissions
  ADD COLUMN IF NOT EXISTS risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS risk_flags JSONB DEFAULT '[]'::jsonb;
