import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { extractTopics } from "@/lib/query-analysis";

export const dynamic = "force-dynamic";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  const envSecret = process.env.ADMIN_SECRET;
  if (!envSecret) return false;
  return secret === envSecret;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const db = getSupabaseAdmin()!;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekAgoISO = sevenDaysAgo.toISOString();

  try {
    // Get all try queries this week
    const { data: queries } = await db
      .from("user_activity")
      .select("query_text, tool_slug, created_at")
      .eq("action", "try")
      .not("query_text", "is", null)
      .gte("created_at", weekAgoISO)
      .order("created_at", { ascending: false })
      .limit(500);

    // Extract topics from each query
    const topicCounts: Record<string, number> = {};
    const topicQueries: Record<string, string[]> = {};

    for (const row of queries || []) {
      if (!row.query_text) continue;
      const topics = extractTopics(row.query_text);
      for (const topic of topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        if (!topicQueries[topic]) topicQueries[topic] = [];
        if (topicQueries[topic].length < 5) {
          topicQueries[topic].push(row.query_text);
        }
      }
    }

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, count]) => ({
        topic,
        count,
        exampleQueries: topicQueries[topic] || [],
      }));

    // Top queries (unique)
    const queryCounts: Record<string, number> = {};
    for (const row of queries || []) {
      if (row.query_text) {
        const q = row.query_text.toLowerCase().trim();
        queryCounts[q] = (queryCounts[q] || 0) + 1;
      }
    }
    const topQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([query, count]) => ({ query, count }));

    // Tool ranking by tries
    const { data: toolTriesData } = await db
      .from("user_activity")
      .select("tool_slug")
      .eq("action", "try")
      .gte("created_at", weekAgoISO);

    const toolTrieCounts: Record<string, number> = {};
    for (const row of toolTriesData || []) {
      toolTrieCounts[row.tool_slug] =
        (toolTrieCounts[row.tool_slug] || 0) + 1;
    }
    const toolRanking = Object.entries(toolTrieCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([slug, tries]) => ({ slug, tries }));

    // Peak usage hours
    const hourCounts: Record<number, number> = {};
    for (const row of queries || []) {
      const hour = new Date(row.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // User retention — % of users active in week N who are active in week N+1
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const { data: prevWeekData } = await db
      .from("user_activity")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", weekAgoISO);

    const { data: thisWeekData } = await db
      .from("user_activity")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", weekAgoISO);

    const prevWeekUsers = new Set(
      (prevWeekData || []).map((r) => r.user_id).filter(Boolean)
    );
    const thisWeekUsers = new Set(
      (thisWeekData || []).map((r) => r.user_id).filter(Boolean)
    );

    let retainedCount = 0;
    for (const userId of prevWeekUsers) {
      if (thisWeekUsers.has(userId)) retainedCount++;
    }

    const retentionRate =
      prevWeekUsers.size > 0
        ? Math.round((retainedCount / prevWeekUsers.size) * 100)
        : null;

    // Content opportunity — topics with high demand but no dedicated tool
    // (This is a heuristic: topics asked about but tool_slug doesn't match)
    const contentOpportunities = topTopics
      .filter((t) => t.count >= 3)
      .slice(0, 5)
      .map((t) => ({
        topic: t.topic,
        queryCount: t.count,
        suggestion: `Users are asking about "${t.topic}" ${t.count} times this week. Consider a dedicated tool.`,
      }));

    return NextResponse.json({
      topTopics,
      topQueries,
      toolRanking,
      peakHours,
      retention: {
        prevWeekUsers: prevWeekUsers.size,
        thisWeekUsers: thisWeekUsers.size,
        retained: retainedCount,
        rate: retentionRate,
      },
      contentOpportunities,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
