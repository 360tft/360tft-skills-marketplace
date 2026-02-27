"use client";

import { useState, useCallback } from "react";
import type { ToolCategory } from "@/data/tools";
import { CATEGORIES } from "@/data/tools";

type SortOption = "popular" | "newest" | "rated";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: ToolCategory | "all") => void;
  onSortChange: (sort: SortOption) => void;
  activeCategory: ToolCategory | "all";
  activeSort: SortOption;
  resultCount: number;
}

export function SearchFilter({
  onSearch,
  onCategoryChange,
  onSortChange,
  activeCategory,
  activeSort,
  resultCount,
}: SearchFilterProps) {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tools... (e.g. session plan, offside rule, drill)"
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20"
        />
      </div>

      {/* Categories + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onCategoryChange("all")}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === "all"
                ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--accent)]/50"
            }`}
          >
            All ({resultCount})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.value
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--accent)]/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--muted)]">Sort:</span>
          {(
            [
              { value: "popular", label: "Popular" },
              { value: "newest", label: "Newest" },
              { value: "rated", label: "Highest Rated" },
            ] as { value: SortOption; label: string }[]
          ).map((sort) => (
            <button
              key={sort.value}
              onClick={() => onSortChange(sort.value)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                activeSort === sort.value
                  ? "bg-white/10 text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
