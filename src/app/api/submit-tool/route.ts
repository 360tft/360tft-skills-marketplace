import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { notifyToolSubmission } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, description, category, mcpUrl, apiDocsUrl, email } =
      await req.json();

    // Validate required fields
    if (!name?.trim() || !description?.trim() || !category?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name, description, category, and email are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // If Supabase isn't configured, return success anyway
      // Kevin will see these in logs or configure later
      return NextResponse.json({ success: true, stored: false });
    }

    const { error } = await supabase.from("tool_submissions").insert({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      mcp_url: mcpUrl?.trim() || null,
      api_docs_url: apiDocsUrl?.trim() || null,
      email: email.toLowerCase().trim(),
      status: "pending",
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save submission. Please try again." },
        { status: 500 }
      );
    }

    // Notify admin (non-blocking)
    notifyToolSubmission(email.toLowerCase().trim(), name.trim()).catch(() => {});

    return NextResponse.json({ success: true, stored: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
