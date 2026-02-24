import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { sendToolApprovedEmail, sendToolRejectedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  const envSecret = process.env.ADMIN_SECRET;
  if (!envSecret) return false;
  return secret === envSecret;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ submissions: [], total: 0 });
  }

  const db = getSupabaseAdmin()!;
  const status = req.nextUrl.searchParams.get("status") || "pending";

  try {
    const { data, count } = await db
      .from("tool_submissions")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      submissions: data || [],
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const db = getSupabaseAdmin()!;

  try {
    const { id, status, adminNotes } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updates: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes;
    }

    // Fetch submission details for email
    const { data: submission } = await db
      .from("tool_submissions")
      .select("email, name")
      .eq("id", id)
      .single();

    const { error } = await db
      .from("tool_submissions")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notification email (non-blocking)
    if (submission?.email && submission?.name) {
      if (status === "approved") {
        sendToolApprovedEmail(submission.email, submission.name).catch(() => {});
        // Promote user to creator role
        if (submission.email) {
          db.from("profiles")
            .update({ role: "creator", updated_at: new Date().toISOString() })
            .eq("email", submission.email)
            .then(() => {});
        }
      } else if (status === "rejected") {
        sendToolRejectedEmail(submission.email, submission.name).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
