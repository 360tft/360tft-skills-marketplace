/**
 * Content ingestion script
 * Extracts text from PDFs and cheatsheet files, chunks, embeds (game model only), and inserts into Supabase.
 *
 * Run: npx tsx scripts/ingest-content.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { getDocumentProxy, extractText } from "unpdf";

// ---- Config ----

const CONTENT_DIR = "/tmp/aifootball-content";

const GAME_MODEL_FILES = [
  {
    file: "game-model/Master_The_Game_GM.pdf",
    slug: "master-the-game",
    title: "Master The Game — Game Model",
    description:
      "Core coaching methodology: formations, principles of play, player roles, and tactical frameworks.",
  },
  {
    file: "game-model/Master_The_Opponent_GM.pdf",
    slug: "master-the-opponent",
    title: "Master The Opponent — Game Model",
    description:
      "Opposition analysis, pressing systems, defensive structures, and match preparation strategies.",
  },
  {
    file: "game-model/Age_Group_Sessions.pdf",
    slug: "age-group-sessions",
    title: "Age Group Sessions — Game Model",
    description:
      "Age-specific session plans and development pathways from U5 to Senior level.",
  },
];

const SESSION_PLAN_FILES = [
  {
    file: "sessions/30_Tactical_Scenario_Sessions.pdf",
    slug: "30-tactical-scenarios",
    title: "30 Tactical Scenario Sessions",
    description: "Match-realistic tactical training scenarios.",
    gumroadUrl: "",
  },
  {
    file: "sessions/52_Match-Based_Training_Sessions_.pdf",
    slug: "52-match-based-training",
    title: "52 Match-Based Training Sessions",
    description: "Full match-based training sessions for all age groups.",
    gumroadUrl: "",
  },
  {
    file: "sessions/45_Ball_Mastery_Sessions_-_Control,__Confidence,__Creativity.pdf",
    slug: "45-ball-mastery",
    title: "45 Ball Mastery Sessions",
    description: "Control, confidence, and creativity ball mastery sessions.",
    gumroadUrl: "",
  },
  {
    file: "sessions/45_Essential_1v1_Sessions_for_Attackers_&_Defenders__.pdf",
    slug: "45-essential-1v1",
    title: "45 Essential 1v1 Sessions",
    description: "1v1 sessions for attackers and defenders.",
    gumroadUrl: "",
  },
  {
    file: "sessions/57_Finishing_Sessions_To_Score_More_Goals.pdf",
    slug: "57-finishing-sessions",
    title: "57 Finishing Sessions",
    description: "Finishing sessions to score more goals.",
    gumroadUrl: "",
  },
  {
    file: "sessions/53_Technical_Sessions_For_Any_Player.pdf",
    slug: "53-technical-sessions",
    title: "53 Technical Sessions",
    description: "Technical sessions for any player at any level.",
    gumroadUrl: "",
  },
  {
    file: "sessions/76_SSG,_Possession,_&_Rondo_.pdf",
    slug: "76-ssg-possession-rondo",
    title: "76 SSG, Possession & Rondo Sessions",
    description: "Small-sided games, possession, and rondo sessions.",
    gumroadUrl: "",
  },
];

const CHEATSHEET_TITLES: Record<string, string> = {
  "football-ai.txt": "The Football AI Cheat Sheet",
  "tactical-analysis.txt": "AI Tactical Analysis Cheat Sheet",
  "coach-reflection.txt": "AI Coach Reflection Cheat Sheet",
  "idp.txt": "AI Individual Development Plan Cheat Sheet",
  "players-ai-training-guide.txt": "AI Player Training Guide",
  "referees-ai.txt": "AI Referee Cheat Sheet",
};

// ---- Chunking ----

function chunkText(
  text: string,
  targetSize = 800,
  overlap = 100
): { text: string; index: number }[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: { text: string; index: number }[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();

    if (
      currentChunk.length + trimmed.length > targetSize &&
      currentChunk.length > 0
    ) {
      chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });

      if (overlap > 0) {
        const words = currentChunk.trim().split(/\s+/);
        const overlapWords = Math.ceil(overlap / 5);
        currentChunk = words.slice(-overlapWords).join(" ") + "\n\n";
      } else {
        currentChunk = "";
      }
    }

    if (trimmed.length > targetSize * 1.5) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      for (const sentence of sentences) {
        if (
          currentChunk.length + sentence.length > targetSize &&
          currentChunk.length > 0
        ) {
          chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
          const words = currentChunk.trim().split(/\s+/);
          const overlapWords = Math.ceil(overlap / 5);
          currentChunk = words.slice(-overlapWords).join(" ") + " ";
        }
        currentChunk += sentence;
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ text: currentChunk.trim(), index: chunkIndex });
  }

  return chunks;
}

// ---- Embedding ----

const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not set");

  const response = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini embedding failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.embedding.values as number[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- PDF Extraction ----

async function extractPdfText(filePath: string): Promise<string> {
  console.log(`  Extracting text from ${filePath.split("/").pop()}...`);
  const buffer = readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  console.log(`  -> ${totalPages} pages, ${text.length} chars`);
  return text;
}

// ---- Main ----

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }
  if (!googleKey) {
    console.error("Missing GOOGLE_AI_API_KEY (needed for game model embeddings)");
    process.exit(1);
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("=== Content Ingestion ===\n");

  // ---- 1. Game Model PDFs (vector search) ----
  console.log("--- Game Model PDFs ---");
  for (const gm of GAME_MODEL_FILES) {
    const filePath = join(CONTENT_DIR, gm.file);
    const text = await extractPdfText(filePath);
    const chunks = chunkText(text, 800, 100);
    console.log(`  ${chunks.length} chunks from ${gm.slug}`);

    // Upsert document
    const { data: doc, error: docErr } = await db
      .from("content_documents")
      .upsert(
        {
          slug: gm.slug,
          title: gm.title,
          source_type: "game_model",
          description: gm.description,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (docErr) {
      console.error(`  Error upserting document ${gm.slug}:`, docErr.message);
      continue;
    }

    // Delete existing chunks for this document
    await db
      .from("content_chunks")
      .delete()
      .eq("document_id", doc.id);

    // Insert chunks with embeddings (batched to avoid rate limits)
    let embeddedCount = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.text);
        const embeddingStr = `[${embedding.join(",")}]`;

        const { error: chunkErr } = await db.from("content_chunks").insert({
          document_id: doc.id,
          chunk_text: chunk.text,
          chunk_index: chunk.index,
          embedding: embeddingStr,
          metadata: {},
        });

        if (chunkErr) {
          console.error(`  Chunk ${chunk.index} error:`, chunkErr.message);
        } else {
          embeddedCount++;
        }

        // Rate limit: Gemini free tier is ~1500 RPM, but be conservative
        if (embeddedCount % 50 === 0) {
          console.log(`  Embedded ${embeddedCount}/${chunks.length} chunks...`);
          await sleep(1000);
        }
      } catch (err) {
        console.error(`  Embedding error on chunk ${chunk.index}:`, err);
        await sleep(2000);
      }
    }
    console.log(`  Done: ${embeddedCount}/${chunks.length} chunks embedded\n`);
  }

  // ---- 2. Session Plan PDFs (full-text search only, no embeddings) ----
  console.log("--- Session Plan PDFs ---");
  for (const sp of SESSION_PLAN_FILES) {
    const filePath = join(CONTENT_DIR, sp.file);
    const text = await extractPdfText(filePath);
    const chunks = chunkText(text, 800, 100);
    console.log(`  ${chunks.length} chunks from ${sp.slug}`);

    const { data: doc, error: docErr } = await db
      .from("content_documents")
      .upsert(
        {
          slug: sp.slug,
          title: sp.title,
          source_type: "session_plan",
          description: sp.description,
          gumroad_url: sp.gumroadUrl || null,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (docErr) {
      console.error(`  Error upserting document ${sp.slug}:`, docErr.message);
      continue;
    }

    await db
      .from("content_chunks")
      .delete()
      .eq("document_id", doc.id);

    // Insert chunks without embeddings (tsvector is auto-generated)
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize).map((c) => ({
        document_id: doc.id,
        chunk_text: c.text,
        chunk_index: c.index,
        metadata: {},
      }));

      const { error: batchErr } = await db.from("content_chunks").insert(batch);
      if (batchErr) {
        console.error(`  Batch insert error:`, batchErr.message);
      } else {
        inserted += batch.length;
      }
    }
    console.log(`  Done: ${inserted}/${chunks.length} chunks inserted\n`);
  }

  // ---- 3. Cheat Sheets (full-text search, no embeddings) ----
  console.log("--- Cheat Sheets ---");
  const cheatDir = join(CONTENT_DIR, "cheatsheets");
  const cheatFiles = readdirSync(cheatDir).filter((f) => f.endsWith(".txt"));

  for (const file of cheatFiles) {
    const filePath = join(cheatDir, file);
    const text = readFileSync(filePath, "utf-8");
    const slug = `cheat-${file.replace(".txt", "")}`;
    const title = CHEATSHEET_TITLES[file] || file.replace(".txt", "");

    const chunks = chunkText(text, 600, 50);
    console.log(`  ${chunks.length} chunks from ${slug}`);

    const { data: doc, error: docErr } = await db
      .from("content_documents")
      .upsert(
        {
          slug,
          title,
          source_type: "cheat_sheet",
          description: `Free AI prompt guide: ${title}`,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (docErr) {
      console.error(`  Error upserting document ${slug}:`, docErr.message);
      continue;
    }

    await db
      .from("content_chunks")
      .delete()
      .eq("document_id", doc.id);

    const rows = chunks.map((c) => ({
      document_id: doc.id,
      chunk_text: c.text,
      chunk_index: c.index,
      metadata: {},
    }));

    const { error: insertErr } = await db.from("content_chunks").insert(rows);
    if (insertErr) {
      console.error(`  Insert error:`, insertErr.message);
    } else {
      console.log(`  Done: ${rows.length} chunks inserted\n`);
    }
  }

  console.log("=== Ingestion complete ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
