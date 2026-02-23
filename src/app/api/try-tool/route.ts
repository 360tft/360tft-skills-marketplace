import { NextRequest, NextResponse } from "next/server";

const MCP_GATEWAY_URL =
  process.env.MCP_GATEWAY_URL || "https://mcp.360tft.com";

// Simple in-memory rate limiting (replace with Upstash in production)
const tries = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = ip;
  const entry = tries.get(key);

  if (!entry || entry.resetAt < now) {
    tries.set(key, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
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

    // Call the MCP gateway
    const response = await fetch(
      `${MCP_GATEWAY_URL}/${mcpServerPath}/api/${mcpToolName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MCP-Service-Key": process.env.MCP_SERVICE_SECRET || "",
        },
        body: JSON.stringify({ query, message: query }),
      }
    );

    if (!response.ok) {
      // If MCP gateway is not available, return a demo response
      return NextResponse.json({
        result: `[Demo Mode] This is a preview of the ${mcpToolName} tool. The full MCP gateway integration is being configured. Install this tool to Claude Desktop for the real experience.\n\nYour query: "${query}"`,
        demo: true,
      });
    }

    const data = await response.json();
    return NextResponse.json(
      { result: data.result || data.content || JSON.stringify(data) },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    // Fallback demo response when gateway is unavailable
    return NextResponse.json({
      result: `[Demo Mode] The MCP gateway is being configured. Install this tool to Claude Desktop for the full experience.`,
      demo: true,
    });
  }
}
