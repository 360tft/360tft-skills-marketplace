"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface TopicData {
  topic: string;
  count: number;
  exampleQueries: string[];
}

interface QueryData {
  query: string;
  count: number;
}

interface ToolRank {
  slug: string;
  tries: number;
}

interface PeakHour {
  hour: number;
  count: number;
}

interface ContentOpp {
  topic: string;
  queryCount: number;
  suggestion: string;
}

interface InsightsData {
  topTopics: TopicData[];
  topQueries: QueryData[];
  toolRanking: ToolRank[];
  peakHours: PeakHour[];
  retention: {
    prevWeekUsers: number;
    thisWeekUsers: number;
    retained: number;
    rate: number | null;
  };
  contentOpportunities: ContentOpp[];
}

export default function InsightsPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInsights = async (adminSecret: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/insights", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (!res.ok) {
        setError("Failed to load insights");
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) loadInsights(secret.trim());
  };

  const handleExport = (type: string) => {
    window.open(
      `/api/admin/export?type=${type}&days=30`,
      "_blank"
    );
  };

  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Insights Dashboard
            </h1>
            <form onSubmit={handleLogin} className="flex gap-2">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Admin secret"
                className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Insights
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Last 7 days of user activity and query analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Admin dashboard
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport("activity")}
                className="text-xs px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-white/5"
              >
                Export activity
              </button>
              <button
                onClick={() => handleExport("queries")}
                className="text-xs px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-white/5"
              >
                Export queries
              </button>
              <button
                onClick={() => handleExport("tools")}
                className="text-xs px-2.5 py-1.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-white/5"
              >
                Export tools
              </button>
            </div>
          </div>
        </div>

        {data && (
          <div className="space-y-8">
            {/* Retention */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.retention.prevWeekUsers}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Users last week
                </p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.retention.thisWeekUsers}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Users this week
                </p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.retention.retained}
                </p>
                <p className="text-xs text-[var(--muted)]">Retained</p>
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.retention.rate !== null
                    ? `${data.retention.rate}%`
                    : "—"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Retention rate
                </p>
              </div>
            </div>

            {/* Topic trends */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                Topic trends
              </h2>
              {data.topTopics.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No data yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.topTopics.map((t) => (
                    <div
                      key={t.topic}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-[var(--foreground)] capitalize">
                          {t.topic}
                        </h3>
                        <span className="text-sm font-bold text-[var(--accent)]">
                          {t.count}
                        </span>
                      </div>
                      {t.exampleQueries.length > 0 && (
                        <div className="space-y-1">
                          {t.exampleQueries.slice(0, 3).map((q, i) => (
                            <p
                              key={i}
                              className="text-xs text-[var(--muted)] truncate"
                            >
                              &ldquo;{q}&rdquo;
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tool ranking */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                Tool popularity (by tries)
              </h2>
              {data.toolRanking.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No data yet.
                </p>
              ) : (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                          #
                        </th>
                        <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                          Tool
                        </th>
                        <th className="text-right px-4 py-2.5 text-[var(--muted)] font-medium">
                          Tries
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.toolRanking.map((t, i) => (
                        <tr
                          key={t.slug}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="px-4 py-2.5 text-[var(--muted)]">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 text-[var(--foreground)]">
                            {t.slug
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[var(--accent)]">
                            {t.tries}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top queries */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                Popular queries
              </h2>
              {data.topQueries.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No data yet.
                </p>
              ) : (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
                  {data.topQueries.slice(0, 20).map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <p className="text-sm text-[var(--foreground)] truncate flex-1">
                        {q.query}
                      </p>
                      <span className="text-xs font-mono text-[var(--muted)] shrink-0">
                        {q.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peak hours */}
            {data.peakHours.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                  Peak usage hours (UTC)
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.peakHours.map((h) => (
                    <div
                      key={h.hour}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-3 text-center"
                    >
                      <p className="text-lg font-bold text-[var(--foreground)]">
                        {h.hour.toString().padStart(2, "0")}:00
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {h.count} queries
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content opportunities */}
            {data.contentOpportunities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                  Content opportunities
                </h2>
                <div className="space-y-3">
                  {data.contentOpportunities.map((opp) => (
                    <div
                      key={opp.topic}
                      className="bg-[var(--card)] border border-[var(--accent)]/20 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[var(--foreground)] capitalize">
                          {opp.topic}
                        </h3>
                        <span className="text-xs text-[var(--accent)]">
                          {opp.queryCount} queries
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {opp.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
