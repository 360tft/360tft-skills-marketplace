"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { SearchFilter } from "@/components/search-filter";
import { getPublishedTools } from "@/data/tools";
import type { ToolCategory } from "@/data/tools";

type SortOption = "popular" | "newest" | "rating";

export default function HomePage() {
  const allTools = getPublishedTools();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(
    "all"
  );
  const [activeSort, setActiveSort] = useState<SortOption>("popular");

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
      case "rating":
        result = [...result].sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "newest":
        result = [...result].reverse();
        break;
    }

    return result;
  }, [allTools, searchQuery, activeCategory, activeSort]);

  return (
    <>
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
              Built by 360TFT
            </div>
          </div>
        </div>

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
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
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
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://www.skool.com/aifootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Join AI Football Skool (Free)
            </a>
            <a
              href="/developer"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Developer Portal
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
