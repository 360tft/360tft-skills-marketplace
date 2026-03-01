"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

interface Activity {
  id: string;
  tool_slug: string;
  action: string;
  query_text: string | null;
  created_at: string;
}

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  product: string;
  tier: string;
  calls_today: number;
  calls_this_month: number;
  is_active: boolean;
  created_at: string;
}

interface Favourite {
  tool_slug: string;
  created_at: string;
}

type DashboardMode = "coach" | "developer";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [mode, setMode] = useState<DashboardMode>("coach");

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-mode");
    if (stored === "coach" || stored === "developer") {
      setMode(stored);
    }
  }, []);

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode);
    localStorage.setItem("dashboard-mode", newMode);
  };

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) {
      setProfile(profileData);
      setNewName(profileData.display_name || "");
    }

    // Load recent activity
    const { data: activityData } = await supabase
      .from("user_activity")
      .select("id, tool_slug, action, query_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setActivity(activityData || []);

    // Load favourites
    const favRes = await fetch("/api/favourites");
    if (favRes.ok) {
      const favData = await favRes.json();
      setFavourites(favData.favourites || []);
    }

    // Load API keys
    const keysRes = await fetch(`/api/keys?email=${encodeURIComponent(user.email!)}`);
    if (keysRes.ok) {
      const keysData = await keysRes.json();
      setApiKeys(keysData.keys || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: newName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      setProfile((p) => (p ? { ...p, display_name: newName.trim() } : p));
      setEditingName(false);
    }
  };

  const stats = {
    toolsTried: new Set(
      activity.filter((a) => a.action === "try").map((a) => a.tool_slug)
    ).size,
    totalTries: activity.filter((a) => a.action === "try").length,
    apiCallsMonth: apiKeys.reduce((sum, k) => sum + k.calls_this_month, 0),
    favouriteCount: favourites.length,
  };

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

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-lg font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]/50"
                  />
                  <button
                    onClick={handleUpdateName}
                    className="text-sm px-3 py-1.5 rounded-lg bg-[var(--accent)] text-black font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Welcome, {profile?.display_name || "there"}
                  <button
                    onClick={() => setEditingName(true)}
                    className="ml-2 text-[var(--muted)] hover:text-[var(--foreground)] text-sm font-normal"
                    title="Edit name"
                  >
                    (edit)
                  </button>
                </h1>
              )}
              <p className="text-sm text-[var(--muted-foreground)]">
                {user?.email}
                {profile?.role === "creator" && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    Creator
                  </span>
                )}
                {profile?.role === "admin" && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 bg-[var(--card)] border border-[var(--border)] rounded-lg p-0.5">
                <button
                  onClick={() => handleModeChange("coach")}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    mode === "coach"
                      ? "bg-[var(--accent)] text-black font-medium"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Coach
                </button>
                <button
                  onClick={() => handleModeChange("developer")}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    mode === "developer"
                      ? "bg-[var(--accent)] text-black font-medium"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Developer
                </button>
              </div>
              {(profile?.role === "creator" || profile?.role === "admin") && (
                <Link
                  href="/dashboard/creator"
                  className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors"
                >
                  Creator dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className={`grid gap-4 mb-8 ${mode === "developer" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats.toolsTried}
            </p>
            <p className="text-xs text-[var(--muted)]">Tools tried</p>
          </div>
          {mode === "developer" && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stats.apiCallsMonth}
              </p>
              <p className="text-xs text-[var(--muted)]">API calls this month</p>
            </div>
          )}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats.favouriteCount}
            </p>
            <p className="text-xs text-[var(--muted)]">Favourites</p>
          </div>
          {mode === "developer" && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {apiKeys.length}
              </p>
              <p className="text-xs text-[var(--muted)]">API keys</p>
            </div>
          )}
        </div>

        {/* Favourites */}
        {favourites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Favourite tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favourites.map((fav) => (
                <Link
                  key={fav.tool_slug}
                  href={`/tools/${fav.tool_slug}`}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 hover:border-[var(--accent)]/30 transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {fav.tool_slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* API Keys (developer mode only) */}
        {mode === "developer" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                API keys
              </h2>
              <Link
                href="/developer"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Manage keys
              </Link>
            </div>
            {apiKeys.length === 0 ? (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  No API keys yet.
                </p>
                <Link
                  href="/developer"
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Create your first API key
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                        Name
                      </th>
                      <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                        Key
                      </th>
                      <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium hidden sm:table-cell">
                        Tier
                      </th>
                      <th className="text-right px-4 py-2.5 text-[var(--muted)] font-medium">
                        Today
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr
                        key={key.id}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="px-4 py-2.5 text-[var(--foreground)]">
                          {key.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-[var(--muted-foreground)]">
                          {key.key_prefix}...
                        </td>
                        <td className="px-4 py-2.5 text-[var(--muted-foreground)] hidden sm:table-cell capitalize">
                          {key.tier}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--foreground)]">
                          {key.calls_today}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Browse more tools (coach mode) */}
        {mode === "coach" && favourites.length === 0 && activity.length === 0 && (
          <div className="mb-8 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              Start by browsing the tools and trying a few out.
            </p>
            <Link
              href="/"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Browse tools
            </Link>
          </div>
        )}

        {/* Recent activity */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                No activity yet. Try some tools to get started.
              </p>
              <Link
                href="/"
                className="text-sm text-[var(--accent)] hover:underline mt-2 inline-block"
              >
                Browse tools
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          a.action === "try"
                            ? "bg-blue-500/15 text-blue-400"
                            : a.action === "install"
                            ? "bg-green-500/15 text-green-400"
                            : a.action === "view"
                            ? "bg-gray-500/15 text-gray-400"
                            : "bg-purple-500/15 text-purple-400"
                        }`}
                      >
                        {a.action}
                      </span>
                      <Link
                        href={`/tools/${a.tool_slug}`}
                        className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors truncate"
                      >
                        {a.tool_slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Link>
                    </div>
                    {a.query_text && (
                      <p className="text-xs text-[var(--muted)] mt-1 truncate">
                        {a.query_text}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
