import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";

function getAuthClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {},
    },
  });
}

/**
 * GET /api/reviews?toolSlug=xxx - Get reviews for a tool
 */
export async function GET(req: NextRequest) {
  const toolSlug = req.nextUrl.searchParams.get("toolSlug");
  if (!toolSlug) {
    return NextResponse.json(
      { error: "toolSlug parameter required" },
      { status: 400 }
    );
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ reviews: [], averageRating: 0, count: 0 });
  }

  const { data, error } = await db
    .from("tool_reviews")
    .select("id, tool_slug, rating, review_text, created_at")
    .eq("tool_slug", toolSlug)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }

  const reviews = data || [];
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return NextResponse.json({
    reviews,
    averageRating: Math.round(averageRating * 10) / 10,
    count: reviews.length,
  });
}

/**
 * POST /api/reviews - Submit a review (authenticated)
 * Body: { toolSlug, rating, reviewText? }
 */
export async function POST(req: NextRequest) {
  const supabase = getAuthClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
  }

  const { toolSlug, rating, reviewText } = await req.json();

  if (!toolSlug || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "toolSlug and rating (1-5) are required" },
      { status: 400 }
    );
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data, error } = await db
    .from("tool_reviews")
    .upsert(
      {
        tool_slug: toolSlug,
        user_id: user.id,
        rating,
        review_text: reviewText?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tool_slug,user_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    );
  }

  return NextResponse.json({ review: data });
}
