import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

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
    return NextResponse.json({
      configured: false,
      message: "Supabase not configured yet. Run the migration when your project is ready.",
    });
  }

  const db = getSupabaseAdmin()!;
  const today = new Date().toISOString().split("T")[0];

  try {
    // Total keys
    const { count: totalKeys } = await db
      .from("api_keys")
      .select("id", { count: "exact", head: true });

    // Active keys
    const { count: activeKeys } = await db
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Unique emails (developers)
    const { data: emailData } = await db
      .from("api_keys")
      .select("email")
      .eq("is_active", true);
    const uniqueEmails = new Set(emailData?.map((r) => r.email) || []);

    // Keys by tier
    const { data: tierData } = await db
      .from("api_keys")
      .select("tier")
      .eq("is_active", true);
    const tierCounts: Record<string, number> = {};
    for (const row of tierData || []) {
      tierCounts[row.tier] = (tierCounts[row.tier] || 0) + 1;
    }

    // Keys by product
    const { data: productData } = await db
      .from("api_keys")
      .select("product")
      .eq("is_active", true);
    const productCounts: Record<string, number> = {};
    for (const row of productData || []) {
      productCounts[row.product] = (productCounts[row.product] || 0) + 1;
    }

    // Today's total calls
    const { data: todayUsage } = await db
      .from("api_usage_daily")
      .select("call_count")
      .eq("date", today);
    const callsToday = (todayUsage || []).reduce(
      (sum, r) => sum + r.call_count,
      0
    );

    // Top tools today
    const { data: toolUsage } = await db
      .from("api_usage_daily")
      .select("tool_slug, call_count")
      .eq("date", today)
      .order("call_count", { ascending: false })
      .limit(10);

    // Aggregate tool calls
    const toolTotals: Record<string, number> = {};
    for (const row of toolUsage || []) {
      toolTotals[row.tool_slug] =
        (toolTotals[row.tool_slug] || 0) + row.call_count;
    }

    // Recent keys (last 10)
    const { data: recentKeys } = await db
      .from("api_keys")
      .select("id, email, key_prefix, name, product, tier, calls_today, calls_this_month, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Usage over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: weekUsage } = await db
      .from("api_usage_daily")
      .select("date, call_count")
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    const dailyTotals: Record<string, number> = {};
    for (const row of weekUsage || []) {
      dailyTotals[row.date] = (dailyTotals[row.date] || 0) + row.call_count;
    }

    // --- Enhanced analytics (Phase 4) ---

    // Total registered users
    const { count: totalUsers } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true });

    // Users registered this week
    const { count: usersThisWeek } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Active users this week (unique user_ids in user_activity)
    const { data: weeklyActiveData } = await db
      .from("user_activity")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", sevenDaysAgo.toISOString());
    const weeklyActiveUsers = new Set(
      (weeklyActiveData || []).map((r) => r.user_id).filter(Boolean)
    ).size;

    // Active today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: dailyActiveData } = await db
      .from("user_activity")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", todayStart.toISOString());
    const dailyActiveUsers = new Set(
      (dailyActiveData || []).map((r) => r.user_id).filter(Boolean)
    ).size;

    // Top 20 queries this week
    const { data: topQueriesData } = await db
      .from("user_activity")
      .select("query_text")
      .eq("action", "try")
      .not("query_text", "is", null)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    const queryCounts: Record<string, number> = {};
    for (const row of topQueriesData || []) {
      if (row.query_text) {
        const q = row.query_text.toLowerCase().trim();
        queryCounts[q] = (queryCounts[q] || 0) + 1;
      }
    }
    const topQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    // Tool popularity by tries this week
    const { data: toolPopData } = await db
      .from("user_activity")
      .select("tool_slug")
      .eq("action", "try")
      .gte("created_at", sevenDaysAgo.toISOString());

    const toolPopCounts: Record<string, number> = {};
    for (const row of toolPopData || []) {
      toolPopCounts[row.tool_slug] =
        (toolPopCounts[row.tool_slug] || 0) + 1;
    }
    const toolPopularity = Object.entries(toolPopCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([slug, count]) => ({ slug, tries: count }));

    // New signups (last 10)
    const { data: recentSignups } = await db
      .from("profiles")
      .select("email, display_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      configured: true,
      overview: {
        totalKeys: totalKeys || 0,
        activeKeys: activeKeys || 0,
        uniqueDevelopers: uniqueEmails.size,
        callsToday,
        totalUsers: totalUsers || 0,
        usersThisWeek: usersThisWeek || 0,
        dailyActiveUsers,
        weeklyActiveUsers,
      },
      tierBreakdown: tierCounts,
      productBreakdown: productCounts,
      topToolsToday: toolTotals,
      dailyUsage: dailyTotals,
      recentKeys: recentKeys || [],
      topQueries,
      toolPopularity,
      recentSignups: recentSignups || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
