"use client";

import Link from "next/link";
import type { Tool } from "@/data/tools";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating) ? "text-[var(--accent)]" : "text-[var(--border)]"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-[var(--muted-foreground)] ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Official: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30",
    Community: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Popular: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    Free: "bg-[var(--success)]/15 text-green-400 border-[var(--success)]/30",
    New: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  };
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
        colors[label] || "bg-white/5 text-[var(--muted-foreground)] border-white/10"
      }`}
    >
      {label}
    </span>
  );
}

const categoryLabels: Record<string, string> = {
  coaching: "Coaching",
  refereeing: "Refereeing",
  player_dev: "Player Dev",
  club_mgmt: "Club Mgmt",
  analytics: "Analytics",
  content: "Content",
};

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 transition-all hover:bg-[var(--card-hover)] hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg">
          {tool.iconEmoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
            {tool.name}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            by {tool.authorName}
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {tool.badges.map((b) => (
          <Badge key={b} label={b} />
        ))}
        <span className="text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-white/5">
          {categoryLabels[tool.category] || tool.category}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <StarRating rating={tool.avgRating} />
        <div className="flex items-center gap-3">
          <span>{tool.installCount} installs</span>
          <span className="capitalize">
            {tool.pricingType === "freemium"
              ? "Free + Pro"
              : tool.pricingType}
          </span>
        </div>
      </div>
    </Link>
  );
}
