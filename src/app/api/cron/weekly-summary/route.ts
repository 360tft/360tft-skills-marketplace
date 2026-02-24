import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendWeeklyUsageSummary } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();

  try {
    // Get all active users with activity this week
    const { data: activeUsers } = await db
      .from("user_activity")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", weekAgoISO);

    const uniqueUserIds = [
      ...new Set((activeUsers || []).map((a) => a.user_id).filter(Boolean)),
    ];

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({ sent: 0, message: "No active users this week" });
    }

    // Get trending tools across all users
    const { data: trendingData } = await db
      .from("user_activity")
      .select("tool_slug")
      .eq("action", "try")
      .gte("created_at", weekAgoISO);

    const toolCounts: Record<string, number> = {};
    for (const row of trendingData || []) {
      toolCounts[row.tool_slug] = (toolCounts[row.tool_slug] || 0) + 1;
    }
    const trendingTools = Object.entries(toolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(
        ([slug, count]) =>
          `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} (${count} tries)`
      );

    let sent = 0;

    for (const userId of uniqueUserIds) {
      // Get user's profile and email
      const { data: profile } = await db
        .from("profiles")
        .select("email, display_name")
        .eq("id", userId)
        .single();

      if (!profile?.email) continue;

      // Get user's activity this week
      const { data: userActivity } = await db
        .from("user_activity")
        .select("tool_slug, action")
        .eq("user_id", userId)
        .gte("created_at", weekAgoISO);

      const toolTries = (userActivity || []).filter(
        (a) => a.action === "try"
      ).length;
      const apiCalls = (userActivity || []).filter(
        (a) => a.action === "api_call"
      ).length;

      // User's top tools
      const userToolCounts: Record<string, number> = {};
      for (const row of (userActivity || []).filter(
        (a) => a.action === "try"
      )) {
        userToolCounts[row.tool_slug] =
          (userToolCounts[row.tool_slug] || 0) + 1;
      }
      const topTools = Object.entries(userToolCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(
          ([slug, count]) =>
            `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} (${count} tries)`
        );

      await sendWeeklyUsageSummary(profile.email, {
        toolTries,
        apiCalls,
        topTools,
        trendingTools,
      });

      sent++;
    }

    return NextResponse.json({ sent, total: uniqueUserIds.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
