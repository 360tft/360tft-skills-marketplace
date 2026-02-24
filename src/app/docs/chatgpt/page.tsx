import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatGPT Custom GPTs | 360TFT Skills Docs",
  description:
    "Use 360TFT AI tools as Custom GPTs in ChatGPT. FootballGPT, RefereeGPT, CoachReflect, and CruiseGPT.",
};

const gpts = [
  {
    name: "FootballGPT",
    description:
      "AI coaching assistant with 18 specialist advisors. Session plans, drill animations, player stats from 100+ leagues, and coaching guidance for every level.",
    features: [
      "5 tools: Coaching Advice, Session Plans, Drill Animations, Player Stats, Drill Library",
      "Coach Mode, Player Mode, FM Mode, Goalkeeper Mode",
      "Real stats from API-Football and soccerdata",
    ],
    url: "https://footballgpt.co",
  },
  {
    name: "RefereeGPT",
    description:
      "AI referee education tool. Look up any Law of the Game, analyse match incidents, and take training quizzes. 9 countries supported.",
    features: [
      "3 tools: Law Lookup (RAG), Incident Analyzer, Knowledge Quiz",
      "Full IFAB Laws of the Game with country-specific variations",
      "Exam preparation with multiple difficulty levels",
    ],
    url: "https://refereegpt.co",
  },
  {
    name: "CoachReflect",
    description:
      "AI coaching journal. Log session reflections, discover coaching patterns over time, and chat with your reflection history.",
    features: [
      "3 tools: Reflection Logger, Pattern Finder, Journal Chat",
      "Tracks mood, energy, and session type",
      "AI-powered pattern analysis across all reflections",
    ],
    url: "https://coachreflection.com",
  },
  {
    name: "CruiseGPT",
    description:
      "AI cruise planning assistant. Compare cruise lines, plan port itineraries, and get expert advice from an experienced cruiser.",
    features: [
      "3 tools: Cruise Advice, Compare Cruises, Plan Itinerary",
      "Coverage of major cruise lines worldwide",
      "Port-by-port day plans with local recommendations",
    ],
    url: "https://360cruising.com",
  },
];

export default function ChatGPTDocsPage() {
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
          <span className="text-[var(--foreground)]">ChatGPT Custom GPTs</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          ChatGPT Custom GPTs
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          360TFT tools are also available as Custom GPTs in ChatGPT. Each GPT
          connects to the same AI backend as the MCP tools, so you get the same
          quality responses in whichever platform you prefer.
        </p>

        {/* Status */}
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-[var(--accent)] mb-2">
            Coming soon to the GPT Store
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Custom GPT listings are being prepared for the OpenAI GPT Store.
            In the meantime, you can use the tools via{" "}
            <Link href="/docs/claude-desktop" className="text-[var(--accent)] hover:underline">
              Claude Desktop
            </Link>{" "}
            or the{" "}
            <Link href="/docs/api" className="text-[var(--accent)] hover:underline">
              REST API
            </Link>
            .
          </p>
        </div>

        {/* GPT listings */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Available GPTs
        </h2>
        <div className="space-y-4 mb-10">
          {gpts.map((gpt) => (
            <div
              key={gpt.name}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--foreground)]">
                  {gpt.name}
                </h3>
                <a
                  href={gpt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  {gpt.url.replace("https://", "")}
                </a>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                {gpt.description}
              </p>
              <ul className="text-xs text-[var(--muted)] space-y-1">
                {gpt.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            How it works
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
            Each Custom GPT is configured with an OpenAPI schema that maps to
            the 360TFT MCP gateway. When you ask a question, ChatGPT calls the
            same API endpoints used by Claude Desktop and the REST API.
          </p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            The schemas are defined in the{" "}
            <code className="text-xs font-mono text-[var(--accent)]">
              custom-gpts/
            </code>{" "}
            directory of the 360tft-mcp repository. If you're building your own
            Custom GPT and want to connect to 360TFT tools, you can use these
            schemas as a starting point.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-2">
            Prefer Claude Desktop?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            The MCP integration with Claude Desktop is live and ready to use
            right now. Setup takes 2 minutes.
          </p>
          <Link
            href="/docs/claude-desktop"
            className="inline-block text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
          >
            Claude Desktop Setup Guide
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
