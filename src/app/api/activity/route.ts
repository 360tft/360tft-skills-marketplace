import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";
import { extractTopics } from "@/lib/query-analysis";

export async function POST(req: NextRequest) {
  try {
    const { toolSlug, action, queryText, metadata } = await req.json();

    if (!toolSlug || !action) {
      return NextResponse.json(
        { error: "toolSlug and action are required" },
        { status: 400 }
      );
    }

    const validActions = ["view", "try", "install", "api_call", "favourite"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();
    if (!db) {
      return NextResponse.json({ success: true, stored: false });
    }

    // Try to get authenticated user
    let userId: string | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // No-op for API routes
          },
        },
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    // Hash IP for anonymous tracking
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const anonymousId = userId
      ? null
      : crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const topics = queryText ? extractTopics(queryText) : [];
    const enrichedMetadata = {
      ...(metadata || {}),
      ...(topics.length > 0 ? { topics } : {}),
    };

    await db.from("user_activity").insert({
      user_id: userId,
      anonymous_id: anonymousId,
      tool_slug: toolSlug,
      action,
      query_text: queryText || null,
      metadata: enrichedMetadata,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, stored: false });
  }
}
