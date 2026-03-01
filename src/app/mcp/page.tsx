import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Add Football AI to Claude Desktop",
  description:
    "Plan sessions, check laws, animate drills, and reflect on your coaching — all from your AI assistant. Set up in under 2 minutes.",
  keywords: [
    "football MCP",
    "football AI Claude Desktop",
    "football MCP server",
    "AI coaching tools",
    "MCP football coaching",
  ],
};

const servers = [
  {
    name: "FootballGPT",
    path: "footballgpt",
    tagline: "Your coaching assistant inside Claude",
    description:
      "Ask for a session plan and get one. Ask for coaching advice from 18 specialist advisors. Generate animated drills, search player stats across 100+ leagues, or browse a drill library. All from your AI assistant.",
    tools: [
      "get_coaching_advice",
      "generate_session_plan",
      "animate_drill",
      "search_player_stats",
      "search_drills",
    ],
    productUrl: "https://footballgpt.co",
  },
  {
    name: "RefereeGPT",
    path: "refereegpt",
    tagline: "Law of the Game at your fingertips",
    description:
      "Ask Claude about any law and get the exact wording with references. Describe a match incident and get a ruling. Generate quizzes at any difficulty for referee training sessions.",
    tools: ["check_law", "analyze_incident", "generate_quiz"],
    productUrl: "https://refereegpt.co",
  },
  {
    name: "CoachReflect",
    path: "coachreflect",
    tagline: "Reflect on your coaching, conversationally",
    description:
      "Log a session reflection straight from Claude. Ask what patterns are showing up in your coaching. Chat with your reflection journal to spot trends you might have missed.",
    tools: ["log_reflection", "get_patterns", "coaching_chat"],
    productUrl: "https://coachreflection.com",
  },
];

export default function McpPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link
            href="/"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">MCP</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            Add Football AI to Your AI Assistant
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed mb-5">
            Plan sessions, check laws, animate drills, and reflect on your
            coaching — all from your AI assistant. 11 tools, 3 servers. Free
            to start.
          </p>

          {/* Entry points — MCP vs OpenClaw vs Web */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Link
              href="#mcp-setup"
              className="bg-[var(--card)] border border-[var(--accent)]/30 rounded-xl p-4 hover:border-[var(--accent)]/60 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  MCP (Claude Desktop, Cursor, etc.)
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Paste a JSON config, restart, done. Works with any
                MCP-compatible client.
              </p>
            </Link>
            <Link
              href="/openclaw"
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🦞</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  OpenClaw
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Connect your OpenClaw agent to football AI skills. One-click
                install.
              </p>
            </Link>
            <Link
              href="/"
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/40 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Try on the web
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                No setup needed. Try every tool free in your browser right
                now.
              </p>
            </Link>
          </div>
        </div>

        {/* MCP Setup — 3 steps */}
        <div id="mcp-setup" className="scroll-mt-8 mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            MCP setup in 3 steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">1</div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Copy the config
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Grab the JSON snippet below and paste it into your Claude
                Desktop settings.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">2</div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Restart Claude
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Claude Desktop picks up the new tools automatically on restart.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="text-2xl font-bold text-[var(--accent)] mb-2">3</div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Start coaching
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Ask Claude to plan a session, check a law, or animate a drill.
                It just works.
              </p>
            </div>
          </div>
        </div>

        {/* MCP Servers */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Available servers
          </h2>
          <div className="space-y-6">
            {servers.map((server) => (
              <div
                key={server.path}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {server.name}
                  </h3>
                  <a
                    href={server.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    {server.productUrl.replace("https://", "")}
                  </a>
                </div>
                <p className="text-xs text-[var(--muted)] mb-2">
                  {server.tagline}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  {server.description}
                </p>

                {/* Server URL */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 mb-4">
                  <p className="text-xs text-[var(--muted)] mb-1">
                    Server URL (Streamable HTTP)
                  </p>
                  <code className="text-sm text-[var(--accent)] break-all">
                    https://mcp.360tft.com/{server.path}/mcp
                  </code>
                </div>

                {/* JSON config */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 mb-4">
                  <p className="text-xs text-[var(--muted)] mb-1">
                    Claude Desktop config
                  </p>
                  <pre className="text-xs text-[var(--foreground)] overflow-x-auto">
                    {JSON.stringify(
                      {
                        mcpServers: {
                          [server.path]: {
                            type: "streamable-http",
                            url: `https://mcp.360tft.com/${server.path}/mcp`,
                          },
                        },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* Tools list */}
                <div>
                  <p className="text-xs text-[var(--muted)] mb-2">
                    {server.tools.length} tools exposed:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {server.tools.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-[var(--muted-foreground)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All-in-one config */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Get everything at once
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            One config, all 3 servers, 11 tools. Paste this into your{" "}
            <code className="text-[var(--accent)]">
              claude_desktop_config.json
            </code>{" "}
            and restart Claude.
          </p>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <pre className="text-xs text-[var(--foreground)] overflow-x-auto">
              {JSON.stringify(
                {
                  mcpServers: {
                    footballgpt: {
                      type: "streamable-http",
                      url: "https://mcp.360tft.com/footballgpt/mcp",
                    },
                    refereegpt: {
                      type: "streamable-http",
                      url: "https://mcp.360tft.com/refereegpt/mcp",
                    },
                    coachreflect: {
                      type: "streamable-http",
                      url: "https://mcp.360tft.com/coachreflect/mcp",
                    },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </section>

        {/* Registries */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Also available on
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Find AI Football tools on these MCP registries:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Smithery.ai
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                MCP server registry. Search &quot;football&quot; to find our
                servers.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                OpenClaw / ClawHub
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Open skill marketplace. Football coaching, refereeing, and
                reflection skills available.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                mcp.so
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Community MCP directory. Submitted and pending indexing.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Ready to try it?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-5 max-w-md mx-auto">
            Pick your method. You will be planning sessions from your AI
            assistant in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/docs/claude-desktop"
              className="text-sm font-medium px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Claude Desktop setup guide
            </Link>
            <Link
              href="/openclaw"
              className="text-sm font-medium px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              🦞 OpenClaw setup guide
            </Link>
            <Link
              href="/"
              className="text-sm font-medium px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Try on the web first
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
