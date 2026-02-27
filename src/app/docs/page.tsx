import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | AI Football",
  description:
    "Setup guides, API reference, and integration docs for AI Football tools. Install to Claude Desktop, use the REST API, or connect via ChatGPT.",
};

const guides = [
  {
    title: "Claude Desktop Setup",
    description:
      "Install AI coaching tools in Claude Desktop in under 2 minutes. Copy one config block and you're done.",
    href: "/docs/claude-desktop",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Developer API Reference",
    description:
      "REST API docs for all 11 tools. Authentication, rate limits, request/response examples, and curl commands.",
    href: "/docs/api",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "ChatGPT Custom GPTs",
    description:
      "Use AI Football tools as Custom GPTs in ChatGPT. Links to GPT Store listings and setup instructions.",
    href: "/docs/chatgpt",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: "Submission Guidelines",
    description:
      "What we accept, how the review process works, and tips for getting your football AI tool listed.",
    href: "/docs/submit",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Documentation
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          AI Football gives coaches, developers, and entrepreneurs access to
          AI tools built specifically for football. Install them in Claude
          Desktop, call them via REST API, or use them as ChatGPT Custom GPTs.
        </p>

        {/* Who it's for */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Coaches
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Install tools in Claude Desktop. Plan sessions, look up laws, log
              reflections, and animate drills inside your AI assistant.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Developers
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Build on top of the AI Football API. Free tier gives you 10 calls/day.
              Developer tier ($29/month) gives you 1,000.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Entrepreneurs
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              The Builder Bootcamp ($497) gives you the FootballGPT codebase and
              teaches you to build your own football AI product.
            </p>
          </div>
        </div>

        {/* Guide cards */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Guides
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-10">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex items-start gap-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/30 hover:bg-[var(--card-hover)] transition-all"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                {guide.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1">
                  {guide.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">
            Quick links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link
              href="/"
              className="text-[var(--accent)] hover:underline"
            >
              Browse all tools
            </Link>
            <Link
              href="/developer"
              className="text-[var(--accent)] hover:underline"
            >
              Get an API key
            </Link>
            <Link
              href="/learn"
              className="text-[var(--accent)] hover:underline"
            >
              Courses and training
            </Link>
            <a
              href="https://www.skool.com/aifootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              AI Football Skool (free community)
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
