import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";
import { extractTopics } from "@/lib/query-analysis";

// Product base URLs for direct API calls
const PRODUCT_URLS: Record<string, string> = {
  footballgpt: "https://footballgpt.co",
  refereegpt: "https://refereegpt.co",
  coachreflect: "https://coachreflection.com",
};

// Product display names for branding
const PRODUCT_NAMES: Record<string, string> = {
  footballgpt: "FootballGPT",
  refereegpt: "RefereeGPT",
  coachreflect: "CoachReflect",
};

// Map MCP tool names to product API action paths
const TOOL_TO_ACTION: Record<string, string> = {
  // FootballGPT
  get_coaching_advice: "coaching-advice",
  generate_session_plan: "session-plan",
  animate_drill: "animate-drill",
  search_player_stats: "search-stats",
  search_drills: "search-drills",
  // RefereeGPT
  check_law: "check-law",
  analyze_incident: "analyze-incident",
  generate_quiz: "generate-quiz",
  // CoachReflect
  log_reflection: "log-reflection",
  get_patterns: "get-patterns",
  coaching_chat: "coaching-chat",
};

function toolNameToAction(mcpToolName: string): string {
  return TOOL_TO_ACTION[mcpToolName] || mcpToolName.replace(/_/g, "-");
}

// Simple in-memory rate limiting
const tries = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = tries.get(ip);

  if (!entry || entry.resetAt < now) {
    tries.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return { allowed: true, remaining: 1 };
  }

  if (entry.count >= 2) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: 2 - entry.count };
}

async function logActivity(
  req: NextRequest,
  toolSlug: string,
  queryText: string
) {
  try {
    const db = getSupabaseAdmin();
    if (!db) return;

    let userId: string | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {},
        },
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const anonymousId = userId
      ? null
      : crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const topics = extractTopics(queryText);

    await db.from("user_activity").insert({
      user_id: userId,
      anonymous_id: anonymousId,
      tool_slug: toolSlug,
      action: "try",
      query_text: queryText,
      metadata: topics.length > 0 ? { topics } : {},
    });
  } catch {
    // Non-critical, don't block
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed, remaining } = getRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message:
          "You have used all 5 free tries today. Install this tool or subscribe for unlimited access.",
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  try {
    const { mcpServerPath, mcpToolName, query } = await req.json();

    if (!mcpServerPath || !mcpToolName || !query) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const productUrl = PRODUCT_URLS[mcpServerPath];
    if (!productUrl) {
      return NextResponse.json(
        { error: "Unknown product" },
        { status: 400 }
      );
    }

    const action = toolNameToAction(mcpToolName);
    const apiUrl = `${productUrl}/api/mcp/${action}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MCP-Service-Key": process.env.MCP_SERVICE_SECRET || "",
      },
      body: JSON.stringify({ query, message: query }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        {
          result: `This tool is temporarily unavailable. Install it to Claude Desktop for the full experience.\n\nError: ${response.status}${errorText ? ` - ${errorText.slice(0, 200)}` : ""}`,
          demo: true,
        },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const data = await response.json();
    const result = data.text || data.result || data.content || JSON.stringify(data);
    const productName = PRODUCT_NAMES[mcpServerPath] || mcpServerPath;

    // Log activity (non-blocking)
    logActivity(req, action, query).catch(() => {});

    return NextResponse.json(
      {
        result,
        poweredBy: { name: productName, url: productUrl },
      },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    return NextResponse.json({
      result: `Connection error. The product API may be temporarily unavailable. Install this tool to Claude Desktop for the full experience.`,
      demo: true,
    });
  }
}
