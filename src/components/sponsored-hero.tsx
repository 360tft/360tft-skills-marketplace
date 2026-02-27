"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/data/tools";
import { SponsoredBadge } from "./sponsored-badge";

export function SponsoredHero() {
  const [hero, setHero] = useState<Tool | null>(null);

  useEffect(() => {
    fetch("/api/sponsorship/active")
      .then((res) => (res.ok ? res.json() : { hero: null }))
      .then((data) => setHero(data.hero || null))
      .catch(() => {});
  }, []);

  if (!hero) return null;

  return (
    <div className="mb-8">
      <Link
        href={`/tools/${hero.slug}`}
        className="block bg-gradient-to-r from-amber-500/10 via-[var(--card)] to-amber-500/10 border border-amber-500/20 rounded-xl p-6 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl w-14 h-14 flex items-center justify-center bg-white/5 rounded-xl shrink-0">
            {hero.iconEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-[var(--foreground)]">
                {hero.name}
              </h3>
              <SponsoredBadge />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
              {hero.description}
            </p>
          </div>
          <div className="hidden sm:flex items-center shrink-0">
            <span className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black">
              Try it free
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
