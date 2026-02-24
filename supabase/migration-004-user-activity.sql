-- Migration 004: User activity tracking and favourites
-- Run in Supabase SQL editor AFTER migration-003

-- Activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  tool_slug TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'try', 'install', 'api_call', 'favourite')),
  query_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_tool ON user_activity(tool_slug);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);

-- RLS for user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity
CREATE POLICY "Users read own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert activity (anonymous or authenticated)
CREATE POLICY "Anyone can insert activity" ON user_activity
  FOR INSERT WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service role full access on activity" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

-- Favourites
CREATE TABLE IF NOT EXISTS user_favourites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tool_slug)
);

-- RLS for favourites
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own favourites" ON user_favourites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own favourites" ON user_favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favourites" ON user_favourites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on favourites" ON user_favourites
  FOR ALL USING (auth.role() = 'service_role');
