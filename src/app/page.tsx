"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { SearchFilter } from "@/components/search-filter";
import { SponsoredHero } from "@/components/sponsored-hero";
import { getPublishedTools } from "@/data/tools";
import type { Tool, ToolCategory } from "@/data/tools";

type SortOption = "popular" | "newest" | "rated";

const faqItems = [
  {
    question: "What is AI Football?",
    answer:
      "AI Football is the first AI agent marketplace for football. It provides MCP tools, APIs, and AI agents for coaching, refereeing, scouting, and club management. All tools are free to try on the web.",
  },
  {
    question: "What is an MCP?",
    answer:
      "MCP (Model Context Protocol) is an open standard that lets AI assistants like Claude discover and use external tools. When you add an MCP server, your AI assistant gains new capabilities — in this case, football coaching expertise.",
  },
  {
    question: "Can I use these tools in OpenClaw?",
    answer:
      "Yes. All AI Football tools are available as MCP skills that work with OpenClaw agents. Visit the OpenClaw page for setup instructions.",
  },
  {
    question: "Are these tools free?",
    answer:
      "Every tool has a free tier. You get 5 free tries per day on the web and 10 API calls per day with a free API key. For more usage, subscribe to the individual products (FootballGPT, RefereeGPT, or CoachReflect).",
  },
  {
    question: "Can I list my own tool?",
    answer:
      "Yes. If you have built a football AI tool, you can submit it for listing on the marketplace. Visit the Submit page to get started. Listings are free.",
  },
];

function FaqJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

export default function HomePage() {
  const allTools = getPublishedTools();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(
    "all"
  );
  const [activeSort, setActiveSort] = useState<SortOption>("popular");
  const [gridPromoted, setGridPromoted] = useState<Tool[]>([]);

  useEffect(() => {
    fetch("/api/sponsorship/active")
      .then((res) => (res.ok ? res.json() : { grid: [] }))
      .then((data) => setGridPromoted(data.grid || []))
      .catch(() => {});
  }, []);

  const filteredTools = useMemo(() => {
    let result = allTools;

    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.exampleQueries.some((eq) => eq.toLowerCase().includes(q))
      );
    }

    switch (activeSort) {
      case "popular":
        result = [...result].sort((a, b) => b.installCount - a.installCount);
        break;
      case "newest":
        result = [...result].reverse();
        break;
      case "rated":
        result = [...result].sort(
          (a, b) => (b.avgRating || 0) - (a.avgRating || 0)
        );
        break;
    }

    return result;
  }, [allTools, searchQuery, activeCategory, activeSort]);

  return (
    <>
      <FaqJsonLd />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
            AI Skills for Football Coaches
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
            {allTools.length} tools built for coaches, referees, and
            clubs. Install to Claude Desktop, use in ChatGPT, or try
            directly on the web.
          </p>
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
              Free to try
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              Claude Desktop + ChatGPT
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Built by AI Football
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
              <span className="text-[var(--accent)] font-bold">1</span>
            </div>
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Browse
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Find AI tools for coaching, refereeing, scouting, and more
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
              <span className="text-[var(--accent)] font-bold">2</span>
            </div>
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Install
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Add to Claude Desktop, OpenClaw, or ChatGPT in 2 minutes
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-3">
              <span className="text-[var(--accent)] font-bold">3</span>
            </div>
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Use
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Ask your AI assistant football questions, get expert answers
            </p>
          </div>
        </div>

        {/* New to AI? */}
        <div className="mb-10 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
          <h3 className="font-medium text-[var(--foreground)] mb-1">New to AI?</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            If none of this makes sense yet, start here. Learn what AI tools
            are and build your first one in under an hour.
          </p>
          <a
            href="https://360tft.co.uk/first-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Start the free course
          </a>
        </div>

        {/* Platform badges */}
        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <Link
            href="/docs/claude-desktop"
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
          >
            Claude Desktop
          </Link>
          <Link
            href="/openclaw"
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
          >
            OpenClaw
          </Link>
          <Link
            href="/docs/chatgpt"
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
          >
            ChatGPT
          </Link>
          <span className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">
            Web (try here)
          </span>
        </div>

        {/* Sponsored hero banner */}
        <SponsoredHero />

        {/* Search and filters */}
        <SearchFilter
          onSearch={setSearchQuery}
          onCategoryChange={setActiveCategory}
          onSortChange={setActiveSort}
          activeCategory={activeCategory}
          activeSort={activeSort}
          resultCount={filteredTools.length}
        />

        {/* Tool grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Show sponsored grid tools at the top when no filters active */}
            {!searchQuery.trim() &&
              activeCategory === "all" &&
              gridPromoted
                .filter(
                  (gp) => !filteredTools.some((ft) => ft.slug === gp.slug)
                )
                .map((tool) => (
                  <ToolCard key={`sp-${tool.id}`} tool={tool} isSponsored />
                ))}
            {filteredTools.map((tool) => {
              const isSponsored =
                !searchQuery.trim() &&
                activeCategory === "all" &&
                gridPromoted.some((gp) => gp.slug === tool.slug);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isSponsored={isSponsored}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[var(--muted-foreground)]">
              No tools match your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-3 text-sm text-[var(--accent)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Get Started */}
        <div className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 text-center">
            Get started
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/docs/claude-desktop"
              className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/50 transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1">
                Claude Desktop
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Add MCP config and restart. 2 min setup.
              </p>
            </Link>
            <Link
              href="/openclaw"
              className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/50 transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1">
                OpenClaw
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Install football skills into your agent.
              </p>
            </Link>
            <Link
              href="/docs/chatgpt"
              className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/50 transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1">
                ChatGPT
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Open a Custom GPT. No setup needed.
              </p>
            </Link>
            <Link
              href="/tools/coaching-advice"
              className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/50 transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-1">
                Try on the web
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                5 free tries per tool, per day.
              </p>
            </Link>
          </div>
        </div>

        {/* For Developers */}
        <div className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            For Developers
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Build apps on top of football AI. Access all products through one API key.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/developer"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              View Developer Plans
            </Link>
            <Link
              href="/docs/api"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              API Docs
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 text-center">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-2">
                  {item.question}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Build your own football AI tool
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
            Join the Builder Bootcamp to get the FootballGPT codebase, API
            keys to all products, and publish your own tools on this
            marketplace.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://www.skool.com/aifootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Join AI Football Skool (Free)
            </a>
            <Link
              href="/submit"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              List Your Tool
            </Link>
            <Link
              href="/developer"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Developer Portal
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
