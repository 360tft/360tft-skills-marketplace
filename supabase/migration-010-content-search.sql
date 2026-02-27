-- Migration 010: Content search tables for Game Model, Session Library, Cheat Sheets
-- Requires pgvector extension for vector similarity search

CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table: one row per source file (PDF or cheat sheet)
CREATE TABLE content_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('game_model', 'session_plan', 'cheat_sheet')),
  description TEXT,
  gumroad_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks table: text chunks with optional embeddings and full-text search
CREATE TABLE content_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES content_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(768),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chunks_embedding ON content_chunks
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_chunks_search ON content_chunks USING gin (search_vector);
CREATE INDEX idx_chunks_document ON content_chunks(document_id);
CREATE INDEX idx_documents_source ON content_documents(source_type);

-- Vector similarity search function (used by Game Model search)
CREATE OR REPLACE FUNCTION search_content_chunks(
  query_embedding vector(768),
  source_filter TEXT DEFAULT NULL,
  match_count INTEGER DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.3
) RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  doc_title TEXT,
  doc_slug TEXT,
  gumroad_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.document_id,
    cc.chunk_text,
    1 - (cc.embedding <=> query_embedding) AS similarity,
    cc.metadata,
    cd.title AS doc_title,
    cd.slug AS doc_slug,
    cd.gumroad_url
  FROM content_chunks cc
  JOIN content_documents cd ON cc.document_id = cd.id
  WHERE (source_filter IS NULL OR cd.source_type = source_filter)
    AND cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Full-text search function (used by Session Library and Cheat Sheets)
CREATE OR REPLACE FUNCTION search_content_fulltext(
  query_text TEXT,
  source_filter TEXT DEFAULT NULL,
  match_count INTEGER DEFAULT 10
) RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  rank FLOAT,
  metadata JSONB,
  doc_title TEXT,
  doc_slug TEXT,
  gumroad_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.document_id,
    cc.chunk_text,
    ts_rank(cc.search_vector, websearch_to_tsquery('english', query_text)) AS rank,
    cc.metadata,
    cd.title AS doc_title,
    cd.slug AS doc_slug,
    cd.gumroad_url
  FROM content_chunks cc
  JOIN content_documents cd ON cc.document_id = cd.id
  WHERE cc.search_vector @@ websearch_to_tsquery('english', query_text)
    AND (source_filter IS NULL OR cd.source_type = source_filter)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- RLS: Public read access, service role for writes
ALTER TABLE content_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to content documents"
  ON content_documents FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages content documents"
  ON content_documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read access to content chunks"
  ON content_chunks FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages content chunks"
  ON content_chunks FOR ALL TO service_role
  USING (true) WITH CHECK (true);
