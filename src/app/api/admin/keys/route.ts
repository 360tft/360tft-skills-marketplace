import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  const envSecret = process.env.ADMIN_SECRET;
  if (!envSecret) return false;
  return secret === envSecret;
}

// GET /api/admin/keys?page=1&limit=20&search=email@example.com
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ keys: [], total: 0 });
  }

  const db = getSupabaseAdmin()!;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
  const search = req.nextUrl.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  let query = db
    .from("api_keys")
    .select(
      "id, email, key_prefix, name, product, tier, calls_today, calls_this_month, is_active, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    keys: data || [],
    total: count || 0,
    page,
    limit,
  });
}

// PATCH /api/admin/keys — update tier or deactivate
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { keyId, tier, is_active } = body;

  if (!keyId) {
    return NextResponse.json({ error: "keyId required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (tier !== undefined) updates.tier = tier;
  if (is_active !== undefined) updates.is_active = is_active;

  const { error } = await getSupabaseAdmin()!
    .from("api_keys")
    .update(updates)
    .eq("id", keyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
