-- Add author_response column to tool_reviews
ALTER TABLE tool_reviews ADD COLUMN IF NOT EXISTS author_response TEXT;
ALTER TABLE tool_reviews ADD COLUMN IF NOT EXISTS author_response_at TIMESTAMPTZ;
