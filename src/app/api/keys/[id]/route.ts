import { NextRequest, NextResponse } from "next/server";
import { revokeApiKey, getKeyUsageStats } from "@/lib/api-keys";

/**
 * DELETE /api/keys/[id] — Revoke an API key
 * Body: { email } (ownership verification)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required for verification" },
        { status: 400 }
      );
    }

    const result = await revokeApiKey(id, email.toLowerCase().trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to revoke key" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to revoke key" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/keys/[id]?email=xxx — Get usage stats for a key
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter required" },
      { status: 400 }
    );
  }

  const result = await getKeyUsageStats(id, email.toLowerCase().trim());

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
