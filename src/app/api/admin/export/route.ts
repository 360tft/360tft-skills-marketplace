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
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const db = getSupabaseAdmin()!;
  const type = req.nextUrl.searchParams.get("type") || "activity";
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  try {
    if (type === "activity") {
      // Export anonymised activity data
      const { data } = await db
        .from("user_activity")
        .select("tool_slug, action, query_text, created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(10000);

      const rows = (data || []).map((r) => ({
        tool_slug: r.tool_slug,
        action: r.action,
        query_text: r.query_text || "",
        date: r.created_at.split("T")[0],
      }));

      const csv = [
        "tool_slug,action,query_text,date",
        ...rows.map(
          (r) =>
            `"${r.tool_slug}","${r.action}","${r.query_text.replace(/"/g, '""')}","${r.date}"`
        ),
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="aifootball-activity-${days}d.csv"`,
        },
      });
    }

    if (type === "queries") {
      // Export query aggregations
      const { data } = await db
        .from("user_activity")
        .select("tool_slug, query_text")
        .eq("action", "try")
        .not("query_text", "is", null)
        .gte("created_at", sinceISO)
        .limit(10000);

      const queryCounts: Record<string, { count: number; tool: string }> = {};
      for (const row of data || []) {
        if (row.query_text) {
          const key = row.query_text.toLowerCase().trim();
          if (!queryCounts[key]) {
            queryCounts[key] = { count: 0, tool: row.tool_slug };
          }
          queryCounts[key].count++;
        }
      }

      const sorted = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 1000);

      const csv = [
        "query,tool,count",
        ...sorted.map(
          ([query, { tool, count }]) =>
            `"${query.replace(/"/g, '""')}","${tool}",${count}`
        ),
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="aifootball-queries-${days}d.csv"`,
        },
      });
    }

    if (type === "tools") {
      // Export tool usage
      const { data } = await db
        .from("user_activity")
        .select("tool_slug, action")
        .gte("created_at", sinceISO)
        .limit(50000);

      const toolStats: Record<
        string,
        { views: number; tries: number; installs: number }
      > = {};
      for (const row of data || []) {
        if (!toolStats[row.tool_slug]) {
          toolStats[row.tool_slug] = { views: 0, tries: 0, installs: 0 };
        }
        if (row.action === "view") toolStats[row.tool_slug].views++;
        else if (row.action === "try") toolStats[row.tool_slug].tries++;
        else if (row.action === "install") toolStats[row.tool_slug].installs++;
      }

      const csv = [
        "tool_slug,views,tries,installs",
        ...Object.entries(toolStats)
          .sort(([, a], [, b]) => b.tries - a.tries)
          .map(
            ([slug, s]) => `"${slug}",${s.views},${s.tries},${s.installs}`
          ),
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="aifootball-tools-${days}d.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid type. Use "activity", "queries", or "tools".' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
