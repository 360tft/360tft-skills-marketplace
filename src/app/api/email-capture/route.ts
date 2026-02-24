import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, sourceTool } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // If Supabase isn't configured, still allow the flow to continue
      return NextResponse.json({ success: true, stored: false });
    }

    // Upsert email (don't fail on duplicates)
    const { error } = await supabase.from("marketplace_emails").upsert(
      {
        email: email.toLowerCase().trim(),
        source_tool: sourceTool || null,
      },
      { onConflict: "email" }
    );

    if (error) {
      return NextResponse.json({ success: true, stored: false });
    }

    // Log install activity + increment count (non-critical)
    if (sourceTool) {
      try {
        await supabase.rpc("increment_install_count", {
          p_tool_slug: sourceTool,
        });
      } catch {
        // Non-critical, don't block
      }

      try {
        await supabase.from("user_activity").insert({
          tool_slug: sourceTool,
          action: "install",
          metadata: { email: email.toLowerCase().trim() },
        });
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true, stored: true });
  } catch {
    return NextResponse.json({ success: true, stored: false });
  }
}
