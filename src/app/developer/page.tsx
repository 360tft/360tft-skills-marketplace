import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DeveloperPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Developer Portal
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          Build AI tools for football coaches using 360TFT infrastructure.
          Get API access to FootballGPT, RefereeGPT, CoachReflect, and more.
          Publish your tools on this marketplace and earn revenue.
        </p>

        {/* What you get */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              API Access
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Call any 360TFT tool via REST API. Coaching advice, session
              plans, law lookups, drill animations, player stats, and more.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              MCP Server
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Connect to our MCP gateway at mcp.360tft.com. Works with
              Claude Desktop, ChatGPT, and any MCP-compatible AI assistant.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Publish Tools
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Submit your own AI tools to the marketplace. Reach thousands
              of football coaches. Earn 70% of revenue on paid tools.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Builder Bootcamp
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Get the FootballGPT codebase, weekly calls with Coach Kevin,
              and a 30-day curriculum to launch your own football AI product.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          API Pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--foreground)] mb-1">Free</h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $0
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>10 API calls per day</li>
              <li>All tools available</li>
              <li>Rate limited by IP</li>
              <li>No API key needed</li>
            </ul>
          </div>
          <div className="bg-[var(--card)] border-2 border-[var(--accent)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--accent)] mb-1">
              Developer
            </h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $29<span className="text-sm font-normal text-[var(--muted)]">/month</span>
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>1,000 API calls per day</li>
              <li>API key with analytics</li>
              <li>Priority support</li>
              <li>Publish tools to marketplace</li>
            </ul>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Builder Bootcamp
            </h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $497<span className="text-sm font-normal text-[var(--muted)]"> one-time</span>
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>Everything in Developer</li>
              <li>FootballGPT codebase</li>
              <li>30-day curriculum</li>
              <li>Weekly calls with Kevin</li>
            </ul>
          </div>
        </div>

        {/* Quick start */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Quick Start
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-10">
          <h3 className="font-medium text-[var(--foreground)] mb-3">
            1. Add to Claude Desktop
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Add this to your Claude Desktop MCP config:
          </p>
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto mb-5">
{`{
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
}`}
          </pre>

          <h3 className="font-medium text-[var(--foreground)] mb-3">
            2. Call via REST API
          </h3>
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
{`curl -X POST https://mcp.360tft.com/footballgpt/api/get_coaching_advice \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Best warm-up for U12s?"}' `}
          </pre>
        </div>

        {/* CTA */}
        <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Ready to build?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Join AI Football Skool to get started. Builder Bootcamp students
            get full access plus the FootballGPT codebase.
          </p>
          <a
            href="https://www.skool.com/aifootball"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
          >
            Join AI Football Skool (Free)
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
