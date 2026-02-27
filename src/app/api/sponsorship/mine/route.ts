import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ sponsorships: [] });
    }

    const { data: sponsorships } = await admin
      .from("sponsored_listings")
      .select("id, tool_slug, tier, status, starts_at, expires_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ sponsorships: sponsorships || [] });
  } catch {
    return NextResponse.json({ sponsorships: [] });
  }
}
