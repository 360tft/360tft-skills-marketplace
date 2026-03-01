/**
 * Security risk scanner for tool submissions.
 * Scores submissions 0-100 based on URL analysis,
 * content inspection, and MCP endpoint probing.
 */

export interface SecurityScanResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFlags: string[];
}

// --- Static patterns ---

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".buzz"];

const FREE_HOSTING = [
  "netlify.app",
  "vercel.app",
  "railway.app",
  "render.com",
  "glitch.me",
  "replit.dev",
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now/i,
  /disregard\s+(all\s+)?prior/i,
  /system\s*prompt/i,
  /\bDAN\b/,
  /do\s+anything\s+now/i,
  /jailbreak/i,
];

const DANGEROUS_CAPABILITY_PATTERNS = [
  /\b(exec|eval|spawn|subprocess)\b/i,
  /\b(rm\s+-rf|delete\s+file|write\s+file|read\s+file)\b/i,
  /\b(shell|terminal|command\s+line)\b/i,
  /\bfetch\b.*\bexternal\b/i,
  /\bsend\b.*\b(data|info|credentials)\b/i,
  /\bupload\b/i,
];

const DANGEROUS_TOOL_NAMES = [
  /file[_-]?write/i,
  /shell[_-]?exec/i,
  /send[_-]?http/i,
  /run[_-]?command/i,
  /execute/i,
  /bash/i,
  /terminal/i,
  /system[_-]?call/i,
];

const BASE64_PATTERN = /[A-Za-z0-9+/]{40,}={0,2}/;
const HEX_PATTERN = /(?:0x)?[0-9a-f]{40,}/i;

// --- Scoring functions ---

function analyseUrl(url: string | undefined, toolType: string | undefined): string[] {
  const flags: string[] = [];
  if (!url) {
    if (toolType === "mcp_server") {
      flags.push("missing_url:+10 No connection URL for MCP server");
    }
    return flags;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    flags.push("invalid_url:+15 Connection URL is malformed");
    return flags;
  }

  // HTTP instead of HTTPS
  if (parsed.protocol === "http:") {
    flags.push("http_not_https:+30 Connection uses HTTP instead of HTTPS");
  }

  // IP address instead of domain
  const hostname = parsed.hostname;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost") {
    flags.push("ip_address:+25 Connection URL uses an IP address instead of a domain");
  }

  // Suspicious TLD
  const tld = hostname.slice(hostname.lastIndexOf("."));
  if (SUSPICIOUS_TLDS.includes(tld)) {
    flags.push(`suspicious_tld:+15 Domain uses suspicious TLD (${tld})`);
  }

  // Free hosting (informational)
  if (FREE_HOSTING.some((h) => hostname.endsWith(h))) {
    flags.push("free_hosting:+5 Hosted on a free platform");
  }

  return flags;
}

function analyseContent(name: string, description: string): string[] {
  const flags: string[] = [];
  const combined = `${name} ${description}`;

  // Prompt injection
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(combined)) {
      flags.push("prompt_injection:+30 Contains prompt injection patterns");
      break;
    }
  }

  // Dangerous capabilities
  const dangerousMatches: string[] = [];
  for (const pattern of DANGEROUS_CAPABILITY_PATTERNS) {
    const match = combined.match(pattern);
    if (match) {
      dangerousMatches.push(match[0]);
    }
  }
  if (dangerousMatches.length > 0) {
    flags.push(
      `dangerous_capabilities:+20 References dangerous operations (${dangerousMatches.slice(0, 3).join(", ")})`
    );
  }

  // Base64 or hex-encoded content
  if (BASE64_PATTERN.test(combined)) {
    flags.push("base64_content:+15 Contains base64-encoded content");
  }
  if (HEX_PATTERN.test(combined)) {
    flags.push("hex_content:+15 Contains hex-encoded content");
  }

  // Excessive URLs
  const urlCount = (combined.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    flags.push(`excessive_urls:+10 Contains ${urlCount} URLs in description`);
  }

  return flags;
}

async function probeMcpEndpoint(url: string): Promise<string[]> {
  const flags: string[] = [];

  try {
    // Basic connectivity check
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
      signal: AbortSignal.timeout(5000),
      redirect: "manual",
    });

    // Check for redirect to different domain
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        try {
          const originalHost = new URL(url).hostname;
          const redirectHost = new URL(location).hostname;
          if (originalHost !== redirectHost) {
            flags.push(
              `redirect_different_domain:+20 Redirects to a different domain (${redirectHost})`
            );
          }
        } catch {
          flags.push("redirect_invalid:+10 Redirects to an unparseable URL");
        }
      }
    }

    // Check content type
    const contentType = response.headers.get("content-type") || "";
    if (
      response.ok &&
      !contentType.includes("json") &&
      !contentType.includes("text")
    ) {
      flags.push(
        `unexpected_content_type:+10 Unexpected response content-type (${contentType.split(";")[0]})`
      );
    }

    // Try to get tool list
    if (response.ok) {
      try {
        const toolsResponse = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "tools/list",
            id: 2,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (toolsResponse.ok) {
          const data = await toolsResponse.json();
          const tools = data?.result?.tools;
          if (Array.isArray(tools)) {
            for (const tool of tools) {
              const toolName = tool.name || "";
              const toolDesc = tool.description || "";

              // Check tool names
              for (const pattern of DANGEROUS_TOOL_NAMES) {
                if (pattern.test(toolName)) {
                  flags.push(
                    `dangerous_tool:+15 MCP server exposes dangerous tool: ${toolName}`
                  );
                  break;
                }
              }

              // Check tool descriptions for dangerous capabilities
              for (const pattern of DANGEROUS_CAPABILITY_PATTERNS) {
                if (pattern.test(toolDesc)) {
                  flags.push(
                    `dangerous_tool_desc:+15 Tool "${toolName}" description mentions dangerous operations`
                  );
                  break;
                }
              }
            }
          }
        }
      } catch {
        // tools/list failed — not necessarily suspicious, many servers won't support this without auth
      }
    }
  } catch (error) {
    // Connection failed entirely
    if (error instanceof DOMException && error.name === "TimeoutError") {
      flags.push("endpoint_timeout:+10 MCP endpoint did not respond within 5 seconds");
    } else {
      flags.push("endpoint_unreachable:+10 MCP endpoint could not be reached");
    }
  }

  return flags;
}

function calculateScore(flags: string[]): number {
  let score = 0;
  for (const flag of flags) {
    const match = flag.match(/:([+-]\d+)\s/);
    if (match) {
      score += parseInt(match[1], 10);
    }
  }
  return Math.min(100, Math.max(0, score));
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

// --- Main export ---

export async function scanSubmission(submission: {
  name: string;
  description: string;
  toolType?: string;
  connectionUrl?: string;
}): Promise<SecurityScanResult> {
  const flags: string[] = [];

  // Static checks (instant)
  flags.push(...analyseUrl(submission.connectionUrl, submission.toolType));
  flags.push(...analyseContent(submission.name, submission.description));

  // Network probe (MCP servers only, 5s timeout)
  if (
    submission.toolType === "mcp_server" &&
    submission.connectionUrl
  ) {
    try {
      const probeFlags = await probeMcpEndpoint(submission.connectionUrl);
      flags.push(...probeFlags);
    } catch {
      flags.push("probe_error:+5 Security probe encountered an unexpected error");
    }
  }

  // De-duplicate flags by prefix (keep first occurrence)
  const seen = new Set<string>();
  const uniqueFlags = flags.filter((f) => {
    const prefix = f.split(":")[0];
    if (seen.has(prefix)) return false;
    seen.add(prefix);
    return true;
  });

  const riskScore = calculateScore(uniqueFlags);

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    riskFlags: uniqueFlags,
  };
}
