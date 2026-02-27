import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";
import { extractTopics } from "@/lib/query-analysis";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  searchGameModel,
  searchSessions,
  searchCheatsheets,
} from "@/lib/content/search";

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

// Local tools served from this app's own database (not proxied to external products)
const LOCAL_TOOLS: Record<string, (query: string) => Promise<string>> = {
  search_game_model: searchGameModel,
  search_sessions: searchSessions,
  search_cheatsheets: searchCheatsheets,
};

// Tools exempt from rate limiting (lead magnets)
const LOCAL_TOOLS_NO_RATE_LIMIT = new Set(["search_cheatsheets"]);

/**
 * Extract real client IP from x-forwarded-for header.
 * Behind Traefik, the proxy appends the real IP as the last entry.
 * Reading the rightmost value prevents client-side spoofing (MEDIUM-1 fix).
 */
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((s) => s.trim());
    return parts[parts.length - 1] || "unknown";
  }
  return "unknown";
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

    const ip = getClientIp(req);
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
  const ip = getClientIp(req);

  try {
    const { mcpServerPath, mcpToolName, query } = await req.json();

    if (!mcpServerPath || !mcpToolName || !query) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- Local tools (served from this app's database) ---
    const localHandler = LOCAL_TOOLS[mcpToolName];
    if (localHandler) {
      // Cheat sheets are free (no rate limit), others are rate-limited
      if (!LOCAL_TOOLS_NO_RATE_LIMIT.has(mcpToolName)) {
        const { allowed, remaining } = await checkRateLimit(
          `try:${ip}`,
          RATE_LIMITS.TRY_TOOL
        );
        if (!allowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              message:
                "You have used all your free tries today. Install this tool or subscribe for unlimited access.",
            },
            { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
          );
        }

        const result = await localHandler(query);
        logActivity(req, mcpToolName, query).catch(() => {});
        return NextResponse.json(
          {
            result,
            poweredBy: { name: "360TFT", url: "https://360tft.co.uk" },
          },
          { headers: { "X-RateLimit-Remaining": String(remaining) } }
        );
      }

      // No rate limit path (cheat sheets)
      const result = await localHandler(query);
      logActivity(req, mcpToolName, query).catch(() => {});
      return NextResponse.json({
        result,
        poweredBy: { name: "360TFT", url: "https://360tft.co.uk" },
      });
    }

    // --- External tools (proxied to product APIs) ---
    const { allowed, remaining } = await checkRateLimit(
      `try:${ip}`,
      RATE_LIMITS.TRY_TOOL
    );
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message:
            "You have used all your free tries today. Install this tool or subscribe for unlimited access.",
        },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
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
    const result =
      data.text || data.result || data.content || JSON.stringify(data);
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
  } catch {
    return NextResponse.json({
      result: `Connection error. The product API may be temporarily unavailable. Install this tool to Claude Desktop for the full experience.`,
      demo: true,
    });
  }
}
