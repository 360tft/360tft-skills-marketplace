import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { notifyToolSubmission } from "@/lib/email";
import { scoreSubmission } from "@/lib/rubric";

const VALID_TOOL_TYPES = ["mcp_server", "api", "claude_skill", "custom_gpt"];

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      description,
      category,
      toolType,
      connectionUrl,
      mcpUrl,
      apiDocsUrl,
      email,
    } = await req.json();

    // Validate required fields
    if (
      !name?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !email?.trim()
    ) {
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

    if (toolType && !VALID_TOOL_TYPES.includes(toolType)) {
      return NextResponse.json(
        { error: "Invalid tool type." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, stored: false });
    }

    // Run quality rubric
    const rubric = scoreSubmission({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      toolType: toolType || undefined,
      connectionUrl: connectionUrl?.trim() || undefined,
      email: email.toLowerCase().trim(),
    });

    const { error } = await supabase.from("tool_submissions").insert({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      tool_type: toolType || null,
      connection_url: connectionUrl?.trim() || null,
      mcp_url: mcpUrl?.trim() || connectionUrl?.trim() || null,
      api_docs_url: apiDocsUrl?.trim() || null,
      email: email.toLowerCase().trim(),
      status: rubric.autoApprove ? "approved" : "pending",
      rubric_score: rubric.score,
      rubric_flags: rubric.flags,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save submission. Please try again." },
        { status: 500 }
      );
    }

    // Notify admin (non-blocking)
    notifyToolSubmission(email.toLowerCase().trim(), name.trim()).catch(
      () => {}
    );

    return NextResponse.json({ success: true, stored: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
