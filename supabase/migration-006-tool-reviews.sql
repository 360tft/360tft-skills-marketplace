-- Tool reviews and ratings
CREATE TABLE IF NOT EXISTS tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tool_slug, user_id)
);

-- Indexes
CREATE INDEX idx_tool_reviews_slug ON tool_reviews(tool_slug);
CREATE INDEX idx_tool_reviews_user ON tool_reviews(user_id);
CREATE INDEX idx_tool_reviews_rating ON tool_reviews(rating);

-- RLS
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews are publicly readable"
  ON tool_reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can create their own reviews"
  ON tool_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON tool_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON tool_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on reviews"
  ON tool_reviews FOR ALL
  USING (auth.role() = 'service_role');
