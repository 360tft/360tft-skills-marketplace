import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ listings: [] });
  }

  const { data: listings } = await admin
    .from("sponsored_listings")
    .select(
      "id, tool_slug, tier, status, starts_at, expires_at, stripe_subscription_id, created_at"
    )
    .order("created_at", { ascending: false });

  return NextResponse.json({ listings: listings || [] });
}
