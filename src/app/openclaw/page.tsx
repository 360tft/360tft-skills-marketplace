import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublishedTools } from "@/data/tools";

export const metadata: Metadata = {
  title: "Use AI Football Tools in OpenClaw",
  description:
    "Install football coaching, refereeing, and scouting AI skills into your OpenClaw agents. Free MCP tools for Claude Desktop and OpenClaw.",
  keywords: [
    "football OpenClaw skills",
    "coaching AI agent OpenClaw",
    "football MCP OpenClaw",
    "OpenClaw football tools",
  ],
};

const mcpServers = [
  {
    name: "FootballGPT",
    path: "footballgpt",
    description:
      "Coaching advice, session plans, animated drills, player stats, drill library",
    toolCount: 5,
  },
  {
    name: "RefereeGPT",
    path: "refereegpt",
    description: "Law lookup, incident analysis, referee quizzes",
    toolCount: 3,
  },
  {
    name: "CoachReflect",
    path: "coachreflect",
    description: "Reflection logging, pattern analysis, journal chat",
    toolCount: 3,
  },
];

export default function OpenClawPage() {
  const tools = getPublishedTools();

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
          <span className="text-[var(--foreground)]">OpenClaw</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            Use AI Football Tools in OpenClaw
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            OpenClaw is an open marketplace for AI agent skills. AI Football
            publishes {tools.length} football-specific MCP tools that you can
            install into any OpenClaw-compatible agent. Coaching advice, session
            plans, referee law lookups, and more.
          </p>
        </div>

        {/* How to install */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            How to install
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Get your API key
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Sign up at{" "}
                  <Link
                    href="/developer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    aifootball.co/developer
                  </Link>{" "}
                  to get a free API key. 10 calls per day on the free tier.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Add the MCP server to your agent
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Point your OpenClaw agent at one of the MCP server URLs below.
                  Each server exposes multiple tools.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Start using football AI tools
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Your agent can now access coaching advice, session plans,
                  referee laws, and more via natural language.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MCP Servers */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Available MCP Servers
          </h2>
          <div className="space-y-4">
            {mcpServers.map((server) => (
              <div
                key={server.path}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {server.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)]">
                    {server.toolCount} tools
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {server.description}
                </p>
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted)] mb-1">
                    MCP Server URL
                  </p>
                  <code className="text-sm text-[var(--accent)] break-all">
                    https://mcp.360tft.com/{server.path}/mcp
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All tools list */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            All {tools.length} tools
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Tool
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium hidden sm:table-cell">
                    Server
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Pricing
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                      >
                        <span className="mr-1.5">{tool.iconEmoji}</span>
                        {tool.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted-foreground)] hidden sm:table-cell">
                      {tool.mcpServerPath}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          tool.pricingType === "free"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {tool.pricingType === "free" ? "Free" : "Free + Pro"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Get started
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Get your free API key and start using football AI tools in OpenClaw,
            Claude Desktop, or ChatGPT.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/developer"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Get API Key
            </Link>
            <Link
              href="/docs/claude-desktop"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Setup Guide
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
