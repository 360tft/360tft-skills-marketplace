-- Add tool_type and connection_url columns to tool_submissions
ALTER TABLE tool_submissions
  ADD COLUMN IF NOT EXISTS tool_type TEXT CHECK (tool_type IN ('mcp_server', 'api', 'claude_skill', 'custom_gpt')),
  ADD COLUMN IF NOT EXISTS connection_url TEXT,
  ADD COLUMN IF NOT EXISTS rubric_score INTEGER,
  ADD COLUMN IF NOT EXISTS rubric_flags JSONB DEFAULT '[]'::jsonb;

-- Index for filtering by tool type
CREATE INDEX IF NOT EXISTS idx_tool_submissions_tool_type ON tool_submissions(tool_type);
