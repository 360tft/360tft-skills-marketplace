import { NextRequest, NextResponse } from "next/server";

// Product base URLs for direct API calls
const PRODUCT_URLS: Record<string, string> = {
  footballgpt: "https://footballgpt.co",
  refereegpt: "https://refereegpt.co",
  coachreflect: "https://coachreflection.com",
};

// Map tool names (underscore) to API action paths (hyphenated)
function toolNameToAction(mcpToolName: string): string {
  return mcpToolName.replace(/_/g, "-");
}

// Simple in-memory rate limiting
const tries = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = tries.get(ip);

  if (!entry || entry.resetAt < now) {
    tries.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return { allowed: true, remaining: 4 };
  }

  if (entry.count >= 5) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: 5 - entry.count };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed, remaining } = getRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message:
          "You have used all 5 free tries today. Install this tool or subscribe for unlimited access.",
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  try {
    const { mcpServerPath, mcpToolName, query } = await req.json();

    if (!mcpServerPath || !mcpToolName || !query) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const productUrl = PRODUCT_URLS[mcpServerPath];
    if (!productUrl) {
      return NextResponse.json(
        { error: "Unknown product" },
        { status: 400 }
      );
    }

    const action = toolNameToAction(mcpToolName);
    const apiUrl = `${productUrl}/api/mcp/${action}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MCP-Service-Key": process.env.MCP_SERVICE_SECRET || "",
      },
      body: JSON.stringify({ query, message: query }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        {
          result: `This tool is temporarily unavailable. Install it to Claude Desktop for the full experience.\n\nError: ${response.status}${errorText ? ` - ${errorText.slice(0, 200)}` : ""}`,
          demo: true,
        },
        { headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const data = await response.json();
    const result = data.text || data.result || data.content || JSON.stringify(data);

    return NextResponse.json(
      { result },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err) {
    return NextResponse.json({
      result: `Connection error. The product API may be temporarily unavailable. Install this tool to Claude Desktop for the full experience.`,
      demo: true,
    });
  }
}
