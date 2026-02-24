import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "AI Agents for Football Coaching",
  description:
    "Give your AI assistant football coaching expertise. Install MCP tools into Claude Desktop, OpenClaw, or ChatGPT for coaching advice, session plans, referee laws, and scouting.",
  keywords: [
    "football AI agent",
    "AI coaching assistant",
    "football coaching AI",
    "AI agent for football",
    "football MCP tools",
  ],
};

const platforms = [
  {
    name: "Claude Desktop",
    description:
      "Anthropic's desktop app. Add football tools via MCP config and they appear as native capabilities in every conversation.",
    setupTime: "2 minutes",
    guideUrl: "/docs/claude-desktop",
    features: [
      "Full MCP integration",
      "All 11 tools available",
      "Natural language queries",
    ],
  },
  {
    name: "OpenClaw",
    description:
      "Open marketplace for AI agent skills. Install football skills into any OpenClaw-compatible agent or workflow.",
    setupTime: "2 minutes",
    guideUrl: "/openclaw",
    features: [
      "Open skill marketplace",
      "Works with multiple agents",
      "Community-driven",
    ],
  },
  {
    name: "ChatGPT",
    description:
      "Use Custom GPTs pre-configured with football coaching knowledge. No setup required, just open and start chatting.",
    setupTime: "Instant",
    guideUrl: "/docs/chatgpt",
    features: [
      "No setup needed",
      "Pre-built Custom GPTs",
      "Works on mobile",
    ],
  },
];

const useCases = [
  {
    title: "Session planning",
    description:
      "Ask your AI assistant to create a complete training session plan for your U12s on 1v1 defending. Get warm-up, main activity, progressions, and cool-down in seconds.",
    tool: "Session Plan Generator",
    toolSlug: "session-plan-generator",
  },
  {
    title: "Law queries",
    description:
      "Mid-conversation, ask your assistant whether a goalkeeper can pick up a throw-in. It checks the IFAB Laws of the Game and gives you the exact law reference.",
    tool: "Law of the Game Lookup",
    toolSlug: "law-lookup",
  },
  {
    title: "Player research",
    description:
      "Ask your assistant to pull up stats for any player across 100+ leagues. Goals, assists, xG, per-90 metrics. Real data, not hallucinated.",
    tool: "Player Stats Search",
    toolSlug: "player-stats-search",
  },
  {
    title: "Coaching reflection",
    description:
      "After your session, tell your assistant how it went. It logs your reflection and over time identifies patterns in your coaching development.",
    tool: "Coaching Reflection Logger",
    toolSlug: "coaching-reflection",
  },
];

export default function AgentsPage() {
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
          <span className="text-[var(--foreground)]">Agents</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            AI Agents for Football Coaching
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            Your AI assistant already knows a lot. Football coaching tools give
            it specialist knowledge: session planning, referee laws, player
            stats, and coaching reflection. Install once, use every day.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-[var(--accent)] font-bold">1</span>
              </div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Install a skill
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Add an MCP server URL to your AI assistant. Takes under 2
                minutes.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-[var(--accent)] font-bold">2</span>
              </div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Agent connects to football AI
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Your assistant gains access to specialist football tools built
                on real coaching experience.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-[var(--accent)] font-bold">3</span>
              </div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                Ask football questions
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Ask naturally. &quot;Plan a U14 session on pressing&quot; or
                &quot;What&apos;s the offside rule for deflections?&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Supported platforms
          </h2>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {platform.name}
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Setup: {platform.setupTime}
                    </p>
                  </div>
                  <Link
                    href={platform.guideUrl}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Setup guide
                  </Link>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {platform.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {platform.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-1 rounded bg-white/5 text-[var(--muted-foreground)]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            What you can do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-2">
                  {uc.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">
                  {uc.description}
                </p>
                <Link
                  href={`/tools/${uc.toolSlug}`}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Try {uc.tool}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Browse all tools
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            11 tools across coaching, refereeing, and analytics. Free to try on
            the web, or install into your AI assistant.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Browse Tools
            </Link>
            <Link
              href="/learn"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
