import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getToolBySlug } from "@/data/tools";
import type { Tool } from "@/data/tools";

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ hero: null, grid: [], detail: [] });
  }

  const { data: listings } = await admin
    .from("sponsored_listings")
    .select("tool_slug, tier")
    .eq("status", "active");

  if (!listings || listings.length === 0) {
    return NextResponse.json({ hero: null, grid: [], detail: [] });
  }

  let hero: Tool | null = null;
  const grid: Tool[] = [];
  const detail: Tool[] = [];

  for (const listing of listings) {
    const tool = getToolBySlug(listing.tool_slug);
    if (!tool) continue;

    switch (listing.tier) {
      case "hero":
        hero = tool;
        break;
      case "grid":
        grid.push(tool);
        break;
      case "detail":
        detail.push(tool);
        break;
    }
  }

  return NextResponse.json({ hero, grid, detail });
}
