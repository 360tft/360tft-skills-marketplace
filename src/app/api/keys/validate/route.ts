import { NextRequest, NextResponse } from "next/server";
import { validateAndIncrement } from "@/lib/api-keys";

/**
 * POST /api/keys/validate — Validate an API key and increment usage
 * Called by the MCP gateway on every tool call
 * Body: { key, tool_slug }
 *
 * Protected by MCP_SERVICE_SECRET header
 */
export async function POST(req: NextRequest) {
  // Verify this is from the MCP gateway
  const serviceKey = req.headers.get("x-mcp-service-key");
  if (serviceKey !== process.env.MCP_SERVICE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, tool_slug } = await req.json();

    if (!key || !tool_slug) {
      return NextResponse.json(
        { error: "key and tool_slug required" },
        { status: 400 }
      );
    }

    const result = await validateAndIncrement(key, tool_slug);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
          tier: result.tier,
          upgrade_url: "https://aifootball.co/developer",
        },
        { status: result.error === "Rate limit exceeded" ? 429 : 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      tier: result.tier,
      remaining: result.remaining,
    });
  } catch {
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
