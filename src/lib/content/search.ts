/**
 * Content search handlers for local tools:
 * - Game Model: vector similarity search (RAG)
 * - Session Library: full-text search
 * - Cheat Sheets: full-text search
 */
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateQueryEmbedding } from "./embeddings";

interface SearchResult {
  chunk_text: string;
  similarity?: number;
  rank?: number;
  doc_title: string;
  doc_slug: string;
  gumroad_url: string | null;
  metadata: Record<string, unknown>;
}

function formatGameModelResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `No results found for "${query}" in the 360TFT Game Model.\n\nThe Game Model covers formations, tactics, player development, and coaching methodology across 750+ pages. Try a different search term.`;
  }

  let output = `**360TFT Game Model — Search Results**\n\n`;
  output += `*Query: "${query}"*\n\n`;

  for (const r of results) {
    const similarity = r.similarity ? ` (${Math.round(r.similarity * 100)}% match)` : "";
    output += `---\n**From: ${r.doc_title}**${similarity}\n\n`;
    output += `${r.chunk_text}\n\n`;
  }

  output += `---\n*The 360TFT Game Model is a 750+ page coaching resource by Coach Kevin Middleton covering formations, tactics, player development pathways, and session design for every age group.*`;
  return output;
}

function formatSessionResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `No results found for "${query}" in the Session Library.\n\nThe library contains 350+ sessions across ball mastery, 1v1s, finishing, tactical scenarios, SSGs, and more. Try a different search term.`;
  }

  let output = `**360TFT Session Library — Search Results**\n\n`;
  output += `*Query: "${query}"*\n\n`;

  // Group by document
  const byDoc = new Map<string, SearchResult[]>();
  for (const r of results) {
    const existing = byDoc.get(r.doc_title) || [];
    existing.push(r);
    byDoc.set(r.doc_title, existing);
  }

  for (const [docTitle, chunks] of byDoc) {
    const gumroadUrl = chunks[0]?.gumroad_url;
    output += `---\n**${docTitle}**`;
    if (gumroadUrl) {
      output += ` — [Get the full pack](${gumroadUrl})`;
    }
    output += `\n\n`;

    for (const r of chunks.slice(0, 3)) {
      output += `${r.chunk_text.slice(0, 400)}${r.chunk_text.length > 400 ? "..." : ""}\n\n`;
    }
  }

  output += `---\n*These sessions are from the 360TFT Session Plan collection — ready-to-use training sessions for every age group and topic.*`;
  return output;
}

function formatCheatsheetResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `No results found for "${query}" in the AI Coaching Cheat Sheets.\n\nAvailable guides cover: Football AI, Tactical Analysis, Coach Reflection, Player Development, Referee AI, and Individual Development Plans. Try a different search term.`;
  }

  let output = `**AI Coaching Cheat Sheets — Search Results**\n\n`;
  output += `*Query: "${query}"*\n\n`;

  for (const r of results) {
    output += `---\n**${r.doc_title}**\n\n`;
    output += `${r.chunk_text}\n\n`;
  }

  output += `---\n*Free AI prompt guides for football coaches. Join AI Football Skool for the full library, weekly calls, and 1,500+ coaches learning AI.*`;
  return output;
}

export async function searchGameModel(query: string): Promise<string> {
  const db = getSupabaseAdmin();
  if (!db) {
    return "Content search is not available (database not configured).";
  }

  try {
    const embedding = await generateQueryEmbedding(query);
    const embeddingStr = `[${embedding.join(",")}]`;

    const { data, error } = await db.rpc("search_content_chunks", {
      query_embedding: embeddingStr,
      source_filter: "game_model",
      match_count: 5,
      match_threshold: 0.3,
    });

    if (error) throw error;
    return formatGameModelResults(data || [], query);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Search error: ${message}. Try again or install the tool for the full experience.`;
  }
}

export async function searchSessions(query: string): Promise<string> {
  const db = getSupabaseAdmin();
  if (!db) {
    return "Content search is not available (database not configured).";
  }

  try {
    const { data, error } = await db.rpc("search_content_fulltext", {
      query_text: query,
      source_filter: "session_plan",
      match_count: 10,
    });

    if (error) throw error;
    return formatSessionResults(data || [], query);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Search error: ${message}. Try again or install the tool for the full experience.`;
  }
}

export async function searchCheatsheets(query: string): Promise<string> {
  const db = getSupabaseAdmin();
  if (!db) {
    return "Content search is not available (database not configured).";
  }

  try {
    const { data, error } = await db.rpc("search_content_fulltext", {
      query_text: query,
      source_filter: "cheat_sheet",
      match_count: 5,
    });

    if (error) throw error;
    return formatCheatsheetResults(data || [], query);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Search error: ${message}. Try again or install the tool for the full experience.`;
  }
}
