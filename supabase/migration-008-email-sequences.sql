-- Email sequence tracking
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('consumer', 'creator')),
  current_step INTEGER NOT NULL DEFAULT 0,
  source_tool TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  unsubscribed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, sequence_type)
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_pending
  ON email_sequences(sequence_type, current_step, completed, unsubscribed);
CREATE INDEX IF NOT EXISTS idx_email_sequences_email ON email_sequences(email);

-- RLS
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_sequences"
  ON email_sequences FOR ALL
  USING (auth.role() = 'service_role');
