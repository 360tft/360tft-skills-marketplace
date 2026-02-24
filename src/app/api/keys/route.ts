import { NextRequest, NextResponse } from "next/server";
import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { sendApiKeyCreatedEmail } from "@/lib/email";

/**
 * POST /api/keys — Create a new API key
 * Body: { email, name?, product? }
 * Returns the full key ONCE (never stored in plaintext)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, product } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const result = await createApiKey(
      email.toLowerCase().trim(),
      name || "Default",
      product || "all"
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Send email notification (non-blocking)
    sendApiKeyCreatedEmail(
      email.toLowerCase().trim(),
      result.key_prefix,
      product || "all"
    ).catch(() => {});

    return NextResponse.json({
      id: result.id,
      key: result.full_key,
      prefix: result.key_prefix,
      name: result.name,
      product: result.product,
      tier: result.tier,
      message:
        "Save this key now. It will not be shown again.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/keys?email=xxx — List keys for an email
 * Returns key prefixes and metadata (never full keys)
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter required" },
      { status: 400 }
    );
  }

  const result = await listApiKeys(email.toLowerCase().trim());

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ keys: result });
}
