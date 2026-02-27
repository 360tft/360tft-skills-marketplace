"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/data/tools";
import { SponsoredBadge } from "./sponsored-badge";

export function SponsoredAlternatives({ toolSlug }: { toolSlug: string }) {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetch("/api/sponsorship/active")
      .then((res) => (res.ok ? res.json() : { detail: [] }))
      .then((data) => {
        const filtered = (data.detail || []).filter(
          (t: Tool) => t.slug !== toolSlug
        );
        setTools(filtered.slice(0, 3));
      })
      .catch(() => {});
  }, [toolSlug]);

  if (tools.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--card-hover)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg shrink-0">
                {tool.iconEmoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {tool.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {tool.authorName}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed mb-2">
              {tool.description}
            </p>
            <SponsoredBadge />
          </Link>
        ))}
      </div>
    </div>
  );
}
