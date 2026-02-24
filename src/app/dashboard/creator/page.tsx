"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { User } from "@supabase/supabase-js";

interface Submission {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

interface ToolStats {
  tool_slug: string;
  views: number;
  tries: number;
  installs: number;
}

interface RecentQuery {
  query_text: string;
  tool_slug: string;
  created_at: string;
}

export default function CreatorDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("user");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [toolStats, setToolStats] = useState<ToolStats[]>([]);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "creator" && profile.role !== "admin")) {
      setRole(profile?.role || "user");
      setLoading(false);
      return;
    }
    setRole(profile.role);

    // Load user's tool submissions
    const { data: subs } = await supabase
      .from("tool_submissions")
      .select("id, name, description, category, status, created_at")
      .eq("email", user.email!)
      .order("created_at", { ascending: false });
    setSubmissions(subs || []);

    // Load activity stats for tools where this user is the creator
    // We match by checking tool submissions that were approved
    const approvedTools = (subs || [])
      .filter((s) => s.status === "approved")
      .map((s) => s.name.toLowerCase().replace(/\s+/g, "-"));

    if (approvedTools.length > 0) {
      // Get aggregated stats from user_activity for these tools
      const { data: activityData } = await supabase
        .from("user_activity")
        .select("tool_slug, action")
        .in("tool_slug", approvedTools);

      // Aggregate
      const statsMap: Record<string, ToolStats> = {};
      for (const row of activityData || []) {
        if (!statsMap[row.tool_slug]) {
          statsMap[row.tool_slug] = {
            tool_slug: row.tool_slug,
            views: 0,
            tries: 0,
            installs: 0,
          };
        }
        if (row.action === "view") statsMap[row.tool_slug].views++;
        else if (row.action === "try") statsMap[row.tool_slug].tries++;
        else if (row.action === "install") statsMap[row.tool_slug].installs++;
      }
      setToolStats(Object.values(statsMap));

      // Get recent queries on their tools (anonymised)
      const { data: queries } = await supabase
        .from("user_activity")
        .select("query_text, tool_slug, created_at")
        .in("tool_slug", approvedTools)
        .eq("action", "try")
        .not("query_text", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);
      setRecentQueries(queries || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-[var(--muted)]">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (role !== "creator" && role !== "admin") {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            Creator Dashboard
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            This page is for tool creators. Submit a tool and get it approved to
            access the creator dashboard.
          </p>
          <Link
            href="/submit"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Submit a tool
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Creator Dashboard
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {user?.email}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        {/* Tool stats */}
        {toolStats.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Tool performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toolStats.map((ts) => (
                <div
                  key={ts.tool_slug}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
                >
                  <h3 className="font-medium text-[var(--foreground)] mb-3">
                    {ts.tool_slug
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xl font-bold text-[var(--foreground)]">
                        {ts.views}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Views</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[var(--foreground)]">
                        {ts.tries}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Tries</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[var(--foreground)]">
                        {ts.installs}
                      </p>
                      <p className="text-xs text-[var(--muted)]">Installs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Your submissions
            </h2>
            <Link
              href="/submit"
              className="text-sm px-3 py-1.5 rounded-lg bg-[var(--accent)] text-black font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Submit new tool
            </Link>
          </div>
          {submissions.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                No submissions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-[var(--foreground)]">
                      {sub.name}
                    </h3>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        sub.status === "approved"
                          ? "bg-green-500/15 text-green-400"
                          : sub.status === "rejected"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    {sub.description}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {sub.category} &middot;{" "}
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent queries */}
        {recentQueries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Recent queries on your tools
            </h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {recentQueries.map((q, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="text-sm text-[var(--foreground)]">
                      {q.query_text}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {q.tool_slug
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                      &middot; {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
