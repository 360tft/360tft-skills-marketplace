import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    if (!db) {
      return NextResponse.json({ success: true });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Mark all sequences as unsubscribed
    await db
      .from("email_sequences")
      .update({ unsubscribed: true })
      .eq("email", cleanEmail);

    // Remove from marketplace_emails
    await db.from("marketplace_emails").delete().eq("email", cleanEmail);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
