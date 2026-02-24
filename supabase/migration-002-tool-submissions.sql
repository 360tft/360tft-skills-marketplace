-- Tool submissions table for creator listing flow
CREATE TABLE IF NOT EXISTS tool_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  mcp_url TEXT,
  api_docs_url TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin queries
CREATE INDEX idx_tool_submissions_status ON tool_submissions(status);
CREATE INDEX idx_tool_submissions_created_at ON tool_submissions(created_at DESC);

-- RLS
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin dashboard uses service role)
CREATE POLICY "Service role full access" ON tool_submissions
  FOR ALL USING (auth.role() = 'service_role');
