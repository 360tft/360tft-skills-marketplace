import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | 360TFT Skills Marketplace",
  description:
    "Courses for football coaches who want to use AI tools. From installing MCP skills to building your own football AI product.",
};

const courses = [
  {
    title: "AI Skills for Football Coaches",
    price: "$14.99",
    foundingPrice: "$9.99",
    description:
      "A 45-minute course that walks you through installing AI coaching tools in Claude Desktop, building a weekly coaching workflow, and getting real value from day one.",
    who: "Coaches who want AI tools working for them this week.",
    pain: "You know AI could help your coaching, but you've never set up MCP tools and you're not sure where to start.",
    outcome:
      "By the end, you'll have FootballGPT, RefereeGPT, and CoachReflect installed and a weekly routine that saves you hours of session planning.",
    includes: [
      "5 structured lessons (video + text)",
      "Quick Reference Card (printable PDF)",
      "MCP config file (copy-paste setup)",
      "Weekly workflow template",
    ],
    cta: "Buy on Gumroad",
    ctaNote: "Founding price for the first 50 buyers",
    highlight: true,
  },
  {
    title: "Your First Football AI Agent",
    price: "$29",
    description:
      "Build a working Custom GPT for your specific coaching context. Covers prompt engineering, connecting to external data, and publishing to the GPT Store.",
    who: "Coaches or club staff who want a personalised AI assistant.",
    pain: "Generic AI tools don't understand your club's philosophy, your age groups, or your local league structure.",
    outcome:
      "You'll have a Custom GPT that knows your coaching approach and gives advice tailored to your exact context.",
    includes: [
      "Step-by-step build guide",
      "Prompt engineering for coaching",
      "OpenAPI schema templates",
      "Publishing to GPT Store",
    ],
    cta: "View on Skool",
    ctaUrl: "https://www.skool.com/aifootball",
  },
  {
    title: "Builder Bootcamp",
    price: "$497",
    description:
      "Get the FootballGPT codebase, API keys to all 360TFT products, and a 30-day curriculum to launch your own football AI product. Weekly calls with Coach Kevin.",
    who: "Entrepreneurs and developers who want to build and sell football AI tools.",
    pain: "Building an AI product from scratch takes months and costs thousands in development. You don't have the codebase, the infrastructure, or the distribution.",
    outcome:
      "In 30 days, you'll have a working football AI product deployed, Stripe payments connected, and your tools listed on this marketplace.",
    includes: [
      "FootballGPT full codebase (Next.js, Supabase, Stripe)",
      "API keys to all 360TFT products",
      "30-day build curriculum",
      "Weekly group calls with Kevin",
      "Publish tools on this marketplace",
    ],
    cta: "Join on Skool",
    ctaUrl: "https://www.skool.com/aifootball",
  },
];

export default function LearnPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Learn
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          Courses for coaches who want to use AI tools and entrepreneurs who
          want to build them. From first install to shipping your own product.
        </p>

        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.title}
              className={`bg-[var(--card)] border rounded-xl p-6 ${
                course.highlight
                  ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/5"
                  : "border-[var(--border)]"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {course.title}
                  </h2>
                  {course.highlight && (
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                      New
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {course.foundingPrice || course.price}
                  </div>
                  {course.foundingPrice && (
                    <div className="text-xs text-[var(--muted)] line-through">
                      {course.price}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
                {course.description}
              </p>

              {/* Who + Pain + Outcome */}
              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    Who it's for:{" "}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {course.who}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    The problem:{" "}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {course.pain}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    The outcome:{" "}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {course.outcome}
                  </span>
                </div>
              </div>

              {/* What's included */}
              <div className="mb-5">
                <span className="text-xs font-medium text-[var(--foreground)] block mb-2">
                  What's included:
                </span>
                <ul className="text-xs text-[var(--muted-foreground)] space-y-1">
                  {course.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-[var(--success)] shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                {course.ctaUrl ? (
                  <a
                    href={course.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-colors ${
                      course.highlight
                        ? "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]"
                        : "border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5"
                    }`}
                  >
                    {course.cta}
                  </a>
                ) : (
                  <span className="text-sm font-medium px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black">
                    {course.cta} (link coming soon)
                  </span>
                )}
                {course.ctaNote && (
                  <span className="text-xs text-[var(--muted)]">
                    {course.ctaNote}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Not sure which to pick?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Start with the free tools. Install them from the{" "}
            <Link href="/docs/claude-desktop" className="text-[var(--accent)] hover:underline">
              Claude Desktop setup guide
            </Link>{" "}
            and see if AI tools fit your coaching workflow before buying a course.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            Browse all tools (free)
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
