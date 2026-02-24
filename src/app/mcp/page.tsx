import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Football MCP Servers",
  description:
    "Model Context Protocol (MCP) servers for football coaching, refereeing, and scouting. Install football AI tools into Claude Desktop and other MCP-compatible clients.",
  keywords: [
    "football MCP",
    "MCP tools for coaching",
    "football MCP server",
    "Model Context Protocol football",
    "MCP football coaching",
  ],
};

const servers = [
  {
    name: "FootballGPT",
    path: "footballgpt",
    description:
      "5 tools covering coaching advice from 18 specialist advisors, session plan generation, animated drill creation, player stats from 100+ leagues, and drill library search.",
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
    description:
      "3 tools for referee education. Look up any Law of the Game with RAG, analyse match incidents with law references, and generate training quizzes at any difficulty.",
    tools: ["check_law", "analyze_incident", "generate_quiz"],
    productUrl: "https://refereegpt.co",
  },
  {
    name: "CoachReflect",
    path: "coachreflect",
    description:
      "3 tools for coaching development. Log session reflections, find patterns across your coaching history, and chat with your reflection journal.",
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
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            Football MCP Servers
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            Model Context Protocol (MCP) lets AI assistants discover and use
            external tools. AI Football runs 3 MCP servers with 11 football
            tools that work with Claude Desktop, OpenClaw, and any
            MCP-compatible client.
          </p>
        </div>

        {/* MCP Servers */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Servers
          </h2>
          <div className="space-y-6">
            {servers.map((server) => (
              <div
                key={server.path}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
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
            All-in-one config
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Add all 3 servers to Claude Desktop at once. Paste this into your{" "}
            <code className="text-[var(--accent)]">
              claude_desktop_config.json
            </code>{" "}
            file.
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
            Registry listings
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            AI Football MCP servers are listed on these registries:
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
            Install now
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Follow the step-by-step guide to add football AI tools to Claude
            Desktop in under 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/docs/claude-desktop"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Claude Desktop Guide
            </Link>
            <Link
              href="/openclaw"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              OpenClaw Guide
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
