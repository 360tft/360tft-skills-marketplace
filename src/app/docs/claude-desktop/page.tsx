import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Desktop Setup | AI Football Docs",
  description:
    "Install FootballGPT, RefereeGPT, and CoachReflect in Claude Desktop. Step-by-step guide with config and troubleshooting.",
};

const fullConfig = `{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/footballgpt/mcp"
    },
    "refereegpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/refereegpt/mcp"
    },
    "coachreflect": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/coachreflect/mcp"
    }
  }
}`;

const singleConfigs: Record<string, string> = {
  footballgpt: `{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/footballgpt/mcp"
    }
  }
}`,
  refereegpt: `{
  "mcpServers": {
    "refereegpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/refereegpt/mcp"
    }
  }
}`,
  coachreflect: `{
  "mcpServers": {
    "coachreflect": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/coachreflect/mcp"
    }
  }
}`,
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative">
      {label && (
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

export default function ClaudeDesktopDocsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link href="/docs" className="hover:text-[var(--foreground)] transition-colors">
            Docs
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Claude Desktop Setup</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Claude Desktop Setup
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8">
          Install FootballGPT, RefereeGPT, and CoachReflect as MCP tools in
          Claude Desktop. Takes about 2 minutes. After setup, you can ask
          Claude to plan sessions, look up laws, log reflections, and animate
          drills directly in conversation.
        </p>

        {/* Prerequisites */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-[var(--foreground)] mb-2">
            Before you start
          </h2>
          <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
            <li>
              You need{" "}
              <a
                href="https://claude.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Claude Desktop
              </a>{" "}
              installed (Mac, Windows, or Linux)
            </li>
            <li>
              Free tier: 10 tool calls per day. Upgrade to a product
              subscription for more.
            </li>
          </ul>
        </div>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              1
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Open Claude Desktop settings
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed ml-10">
            Click the gear icon in the top-right of Claude Desktop, then go to
            the <strong>MCP Servers</strong> section. Click{" "}
            <strong>Edit Config</strong> to open your config file.
          </p>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              2
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Add the config
            </h2>
          </div>
          <div className="ml-10 space-y-4">
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              To install all 3 products at once, paste this into your config
              file:
            </p>
            <CodeBlock code={fullConfig} label="All products" />
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Or install one at a time:
            </p>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                FootballGPT only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.footballgpt} />
              </div>
            </details>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                RefereeGPT only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.refereegpt} />
              </div>
            </details>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                CoachReflect only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.coachreflect} />
              </div>
            </details>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              3
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Restart Claude Desktop
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed ml-10">
            Save the config file and restart Claude Desktop. You should see a
            tools icon (hammer) in the chat input. Click it to confirm your MCP
            servers are connected.
          </p>
        </div>

        {/* Step 4 - Try it */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              4
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Try it
            </h2>
          </div>
          <div className="ml-10 space-y-3">
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Start a new conversation and try these:
            </p>
            <div className="space-y-2">
              {[
                "Plan a 60-minute U12 session on 1v1 defending",
                "Can a goalkeeper pick up a throw-in from their own player?",
                "Log a reflection: today's session went well, the pressing drill clicked",
                "Animate a 4v2 rondo with rotation on turnover",
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)]"
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            What each product gives you
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                FootballGPT (5 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Coaching Advice (18 specialist advisors)</li>
                <li>Session Plan Generator</li>
                <li>Animated Drill Creator</li>
                <li>Player Stats Search (100+ leagues)</li>
                <li>Drill Library Search</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                RefereeGPT (3 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Law of the Game Lookup (IFAB, 9 countries)</li>
                <li>Match Incident Analyzer</li>
                <li>Referee Knowledge Quiz</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                CoachReflect (3 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Coaching Reflection Logger</li>
                <li>Coaching Pattern Finder</li>
                <li>Coaching Journal Chat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Troubleshooting
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                Tools not appearing after restart
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Make sure you saved the config file before restarting</li>
                <li>Check the JSON is valid (no trailing commas, matching braces)</li>
                <li>If you already have an existing config, merge the mcpServers entries rather than replacing the whole file</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                Tool calls failing or timing out
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Check your internet connection</li>
                <li>The free tier has 10 calls/day. If you're hitting the limit, upgrade to a product subscription</li>
                <li>If a specific tool keeps failing, try the others. One product may be undergoing maintenance</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                Config file location
              </h3>
              <div className="text-sm text-[var(--muted-foreground)] space-y-1">
                <p><strong>Mac:</strong> ~/Library/Application Support/Claude/claude_desktop_config.json</p>
                <p><strong>Windows:</strong> %APPDATA%\Claude\claude_desktop_config.json</p>
                <p><strong>Linux:</strong> ~/.config/Claude/claude_desktop_config.json</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">
            Next steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link
              href="/learn"
              className="text-[var(--accent)] hover:underline"
            >
              Take the 45-minute skills course
            </Link>
            <Link
              href="/docs/api"
              className="text-[var(--accent)] hover:underline"
            >
              Explore the REST API
            </Link>
            <Link
              href="/"
              className="text-[var(--accent)] hover:underline"
            >
              Browse all tools
            </Link>
            <a
              href="https://www.skool.com/aifootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Join AI Football Skool
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
