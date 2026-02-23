import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

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
  const thisMonth = new Date().toISOString().slice(0, 7);

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

    return NextResponse.json({
      configured: true,
      overview: {
        totalKeys: totalKeys || 0,
        activeKeys: activeKeys || 0,
        uniqueDevelopers: uniqueEmails.size,
        callsToday,
      },
      tierBreakdown: tierCounts,
      productBreakdown: productCounts,
      topToolsToday: toolTotals,
      dailyUsage: dailyTotals,
      recentKeys: recentKeys || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
