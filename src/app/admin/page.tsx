"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShareableStats } from "@/components/shareable-stats";
import { getPublishedTools } from "@/data/tools";

interface Submission {
  id: string;
  name: string;
  description: string;
  category: string;
  mcp_url: string | null;
  api_docs_url: string | null;
  email: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  rubric_score: number | null;
  rubric_flags: string[] | null;
  risk_score: number | null;
  risk_flags: string[] | null;
}

interface Stats {
  configured: boolean;
  message?: string;
  overview: {
    totalKeys: number;
    activeKeys: number;
    uniqueDevelopers: number;
    callsToday: number;
  };
  tierBreakdown: Record<string, number>;
  productBreakdown: Record<string, number>;
  topToolsToday: Record<string, number>;
  dailyUsage: Record<string, number>;
  recentKeys: Array<{
    id: string;
    email: string;
    key_prefix: string;
    name: string;
    product: string;
    tier: string;
    calls_today: number;
    calls_this_month: number;
    created_at: string;
  }>;
}

interface KeyRow {
  id: string;
  email: string;
  key_prefix: string;
  name: string;
  product: string;
  tier: string;
  calls_today: number;
  calls_this_month: number;
  is_active: boolean;
  created_at: string;
}

const RISK_COLOURS: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-green-900/30", text: "text-green-400" },
  medium: { bg: "bg-yellow-900/30", text: "text-yellow-400" },
  high: { bg: "bg-orange-900/30", text: "text-orange-400" },
  critical: { bg: "bg-red-900/30", text: "text-red-400" },
};

function getRiskLevel(score: number): string {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

function RiskBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null;
  const level = getRiskLevel(score);
  const colours = RISK_COLOURS[level];
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${colours.bg} ${colours.text}`}>
      Risk: {level.charAt(0).toUpperCase() + level.slice(1)} ({score})
    </span>
  );
}

function QualityBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null;
  const bg = score >= 70 ? "bg-green-900/30" : score >= 40 ? "bg-yellow-900/30" : "bg-red-900/30";
  const text = score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${bg} ${text}`}>
      Quality: {score}
    </span>
  );
}

function FlagsList({ flags }: { flags: string[] | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!flags || flags.length === 0) return null;

  // Parse flag format: "prefix:+N description"
  const parsed = flags.map((f) => {
    const colonIdx = f.indexOf(":");
    if (colonIdx === -1) return { label: f, detail: "" };
    const prefix = f.slice(0, colonIdx);
    const rest = f.slice(colonIdx + 1).replace(/^[+-]\d+\s*/, "");
    return { label: prefix.replace(/_/g, " "), detail: rest };
  });

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] text-[var(--muted)] hover:text-[var(--muted-foreground)] transition-colors"
      >
        {expanded ? "Hide" : "Show"} {flags.length} flag{flags.length !== 1 ? "s" : ""}
      </button>
      {expanded && (
        <ul className="mt-1 space-y-0.5">
          {parsed.map((f, i) => (
            <li key={i} className="text-[11px] text-[var(--muted-foreground)]">
              <span className="text-[var(--foreground)] font-medium">{f.label}</span>
              {f.detail && <span className="ml-1">{f.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TIER_COLOURS: Record<string, string> = {
  free: "#737373",
  pro: "#16a34a",
  builder: "#e5a11c",
  scale: "#3b82f6",
  enterprise: "#f59e0b",
  unlimited: "#a855f7",
  developer: "#e5a11c",
};

const PRODUCT_LABELS: Record<string, string> = {
  all: "All Products",
  footballgpt: "FootballGPT",
  refereegpt: "RefereeGPT",
  cruisegpt: "CruiseGPT",
  coachreflect: "CoachReflect",
  playerreflection: "PlayerReflection",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {sub && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{sub}</p>
      )}
    </div>
  );
}

function MiniBar({
  data,
  colours,
}: {
  data: Record<string, number>;
  colours?: Record<string, string>;
}) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return <p className="text-xs text-[var(--muted)]">No data</p>;

  return (
    <div className="space-y-2">
      {Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-[var(--muted-foreground)]">
                {PRODUCT_LABELS[key] || key}
              </span>
              <span className="text-[var(--foreground)] font-medium">
                {val}
              </span>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(val / total) * 100}%`,
                  backgroundColor:
                    colours?.[key] || "var(--accent)",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}

function UsageChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) {
    return <p className="text-xs text-[var(--muted)]">No usage data yet</p>;
  }

  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {entries.map(([date, count]) => (
        <div key={date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[var(--accent)] rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
            style={{ height: `${(count / max) * 100}%` }}
            title={`${date}: ${count} calls`}
          />
          <span className="text-[8px] text-[var(--muted)]">
            {date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [keysTotal, setKeysTotal] = useState(0);
  const [keysPage, setKeysPage] = useState(1);
  const [keySearch, setKeySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsFilter, setSubmissionsFilter] = useState("pending");
  const [updatingSubmission, setUpdatingSubmission] = useState<string | null>(null);
  const [sponsoredListings, setSponsoredListings] = useState<
    {
      id: string;
      tool_slug: string;
      tier: string;
      status: string;
      starts_at: string;
      stripe_subscription_id: string | null;
    }[]
  >([]);

  const allTools = getPublishedTools();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) {
        setError("Authentication failed");
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
    } catch {
      setError("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const fetchKeys = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: keysPage.toString(),
        limit: "20",
      });
      if (keySearch) params.set("search", keySearch);

      const res = await fetch(`/api/admin/keys?${params}`, {
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
        setKeysTotal(data.total);
      }
    } catch {
      // Silent fail for keys list
    }
  }, [secret, keysPage, keySearch]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/submissions?status=${submissionsFilter}`,
        { headers: { "x-admin-secret": secret } }
      );
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch {
      // Silent fail
    }
  }, [secret, submissionsFilter]);

  const fetchSponsoredListings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sponsorships", {
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        const data = await res.json();
        setSponsoredListings(data.listings || []);
      }
    } catch {
      // Silent fail
    }
  }, [secret]);

  const updateSubmission = async (id: string, status: string) => {
    setUpdatingSubmission(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchSubmissions();
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingSubmission(null);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchKeys();
      fetchSubmissions();
      fetchSponsoredListings();
    }
  }, [authenticated, fetchKeys, fetchSubmissions, fetchSponsoredListings]);

  const updateKey = async (
    keyId: string,
    updates: { tier?: string; is_active?: boolean }
  ) => {
    setUpdatingKey(keyId);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ keyId, ...updates }),
      });
      if (res.ok) {
        await fetchKeys();
        await fetchStats();
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingKey(null);
    }
  };

  // Login form
  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="max-w-md mx-auto px-4 py-20">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Enter admin secret to access the dashboard.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchStats();
              }}
            >
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Admin secret"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] mb-3"
              />
              <button
                type="submit"
                disabled={loading || !secret}
                className="w-full py-2 rounded-lg bg-[var(--accent)] text-black font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {loading ? "Checking..." : "Access Dashboard"}
              </button>
            </form>
            {error && (
              <p className="text-sm text-[var(--destructive)] mt-3">{error}</p>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Not configured state
  if (stats && !stats.configured) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Admin Dashboard
          </h1>
          <div className="bg-[var(--card)] border border-[var(--accent)]/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--accent)] mb-2">
              Database Not Connected
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {stats.message}
            </p>
            <div className="text-sm text-[var(--muted-foreground)] space-y-2">
              <p>To connect:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create a Supabase project</li>
                <li>Run the migration at <code className="text-[var(--accent)]">supabase/migration-001-api-keys.sql</code></li>
                <li>Set <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[var(--accent)]">SUPABASE_SERVICE_ROLE_KEY</code> env vars</li>
                <li>Redeploy</li>
              </ol>
            </div>
          </div>

          {/* Tool inventory (always available, no DB needed) */}
          <h2 className="text-lg font-semibold text-[var(--foreground)] mt-8 mb-4">
            Tool Inventory ({allTools.length} tools)
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">Tool</th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">Product</th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">MCP Path</th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">Pricing</th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">Install Methods</th>
                </tr>
              </thead>
              <tbody>
                {allTools.map((tool) => (
                  <tr key={tool.id} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-4 py-2.5 text-[var(--foreground)]">
                      <span className="mr-1.5">{tool.iconEmoji}</span>
                      {tool.name}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted-foreground)]">{tool.mcpServerPath}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--muted)]">{tool.mcpToolName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        tool.pricingType === "free"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {tool.pricingType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--muted)]">
                      {tool.installMethods.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Full dashboard
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Active API Keys"
            value={stats?.overview.activeKeys ?? 0}
            sub={`${stats?.overview.totalKeys ?? 0} total`}
          />
          <StatCard
            label="Developers"
            value={stats?.overview.uniqueDevelopers ?? 0}
            sub="Unique emails"
          />
          <StatCard
            label="Calls Today"
            value={stats?.overview.callsToday ?? 0}
          />
          <StatCard
            label="Tools Live"
            value={allTools.length}
            sub="4 products"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Usage Chart */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
              API Calls (7 days)
            </h3>
            <UsageChart data={stats?.dailyUsage ?? {}} />
          </div>

          {/* Tier Breakdown */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
              Keys by Tier
            </h3>
            <MiniBar
              data={stats?.tierBreakdown ?? {}}
              colours={TIER_COLOURS}
            />
          </div>

          {/* Product Breakdown */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
              Keys by Product
            </h3>
            <MiniBar data={stats?.productBreakdown ?? {}} />
          </div>
        </div>

        {/* Top Tools Today */}
        {stats?.topToolsToday &&
          Object.keys(stats.topToolsToday).length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                Top Tools Today
              </h3>
              <MiniBar data={stats.topToolsToday} />
            </div>
          )}

        {/* Tool Inventory */}
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Tool Inventory ({allTools.length})
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Tool
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Product
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    MCP Tool
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Channels
                  </th>
                </tr>
              </thead>
              <tbody>
                {allTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2 text-[var(--foreground)]">
                      <span className="mr-1.5">{tool.iconEmoji}</span>
                      {tool.name}
                    </td>
                    <td className="px-4 py-2 text-[var(--muted-foreground)]">
                      {tool.mcpServerPath}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-[var(--muted)]">
                      {tool.mcpToolName}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          tool.pricingType === "free"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {tool.pricingType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--muted)]">
                      {tool.installMethods.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sponsored Listings */}
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Sponsored Listings ({sponsoredListings.length})
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-8">
          {sponsoredListings.length === 0 ? (
            <p className="px-4 py-8 text-center text-[var(--muted)]">
              No sponsorships yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                      Tool
                    </th>
                    <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                      Tier
                    </th>
                    <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                      Start Date
                    </th>
                    <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                      Stripe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sponsoredListings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2 text-[var(--foreground)]">
                        {listing.tool_slug
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            listing.tier === "hero"
                              ? "bg-amber-900/30 text-amber-400"
                              : listing.tier === "grid"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-purple-900/30 text-purple-400"
                          }`}
                        >
                          {listing.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                            listing.status === "active"
                              ? "bg-[var(--success)]"
                              : listing.status === "past_due"
                                ? "bg-yellow-400"
                                : "bg-[var(--destructive)]"
                          }`}
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-[var(--muted)]">
                        {new Date(listing.starts_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {listing.stripe_subscription_id ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${listing.stripe_subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--accent)] hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* API Keys Management */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            API Keys ({keysTotal})
          </h2>
          <input
            type="text"
            value={keySearch}
            onChange={(e) => {
              setKeySearch(e.target.value);
              setKeysPage(1);
            }}
            placeholder="Search by email..."
            className="px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] w-60"
          />
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Key
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Product
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Tier
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Today
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Month
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-xs text-[var(--muted)] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-[var(--muted)]"
                    >
                      {keySearch
                        ? "No keys match that search"
                        : "No API keys yet"}
                    </td>
                  </tr>
                ) : (
                  keys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2 text-[var(--foreground)] truncate max-w-[200px]">
                        {key.email}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-[var(--muted)]">
                        {key.key_prefix}...
                      </td>
                      <td className="px-4 py-2 text-[var(--muted-foreground)]">
                        {PRODUCT_LABELS[key.product] || key.product}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={key.tier}
                          onChange={(e) =>
                            updateKey(key.id, { tier: e.target.value })
                          }
                          disabled={updatingKey === key.id}
                          className="bg-[var(--background)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs"
                          style={{
                            color:
                              TIER_COLOURS[key.tier] || "var(--foreground)",
                          }}
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="developer">developer</option>
                          <option value="unlimited">unlimited</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-[var(--foreground)] tabular-nums">
                        {key.calls_today}
                      </td>
                      <td className="px-4 py-2 text-[var(--foreground)] tabular-nums">
                        {key.calls_this_month}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            key.is_active
                              ? "bg-[var(--success)]"
                              : "bg-[var(--destructive)]"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            updateKey(key.id, {
                              is_active: !key.is_active,
                            })
                          }
                          disabled={updatingKey === key.id}
                          className={`text-xs px-2 py-0.5 rounded ${
                            key.is_active
                              ? "text-[var(--destructive)] hover:bg-red-900/20"
                              : "text-[var(--success)] hover:bg-green-900/20"
                          } transition-colors disabled:opacity-50`}
                        >
                          {updatingKey === key.id
                            ? "..."
                            : key.is_active
                              ? "Revoke"
                              : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {keysTotal > 20 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setKeysPage((p) => Math.max(1, p - 1))}
              disabled={keysPage === 1}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-[var(--muted)]">
              Page {keysPage} of {Math.ceil(keysTotal / 20)}
            </span>
            <button
              onClick={() =>
                setKeysPage((p) =>
                  Math.min(Math.ceil(keysTotal / 20), p + 1)
                )
              }
              disabled={keysPage >= Math.ceil(keysTotal / 20)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}

        {/* Recent Keys (from stats) */}
        {stats?.recentKeys && stats.recentKeys.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Latest Signups
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {stats.recentKeys.slice(0, 6).map((key) => (
                <div
                  key={key.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {key.email}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {PRODUCT_LABELS[key.product] || key.product} &middot;{" "}
                        {key.tier} &middot; {key.key_prefix}...
                      </p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(key.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tool Submissions */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Tool Submissions
          </h2>
          <div className="flex gap-2">
            {["pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setSubmissionsFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  submissionsFilter === s
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-8">
          {submissions.length === 0 ? (
            <p className="px-4 py-8 text-center text-[var(--muted)]">
              No {submissionsFilter} submissions
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-[var(--foreground)]">
                          {sub.name}
                        </p>
                        <RiskBadge score={sub.risk_score} />
                        <QualityBadge score={sub.rubric_score} />
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                        {sub.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)]">
                        <span>{sub.category}</span>
                        <span>{sub.email}</span>
                        {sub.mcp_url && (
                          <a
                            href={sub.mcp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline"
                          >
                            MCP URL
                          </a>
                        )}
                        {sub.api_docs_url && (
                          <a
                            href={sub.api_docs_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline"
                          >
                            Docs
                          </a>
                        )}
                        <span>
                          {new Date(sub.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {(sub.risk_flags?.length || sub.rubric_flags?.length) ? (
                        <FlagsList
                          flags={[
                            ...(sub.risk_flags || []),
                            ...(sub.rubric_flags || []).map((f: string) => `rubric:+0 ${f.replace(/_/g, " ")}`),
                          ]}
                        />
                      ) : null}
                    </div>
                    {sub.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateSubmission(sub.id, "approved")}
                          disabled={updatingSubmission === sub.id}
                          className="text-xs px-2.5 py-1 rounded bg-green-900/20 text-green-400 hover:bg-green-900/40 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateSubmission(sub.id, "rejected")}
                          disabled={updatingSubmission === sub.id}
                          className="text-xs px-2.5 py-1 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom GPT Status */}
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Custom GPT Schemas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            {
              name: "FootballGPT",
              tools: 5,
              path: "custom-gpts/footballgpt/",
            },
            { name: "RefereeGPT", tools: 3, path: "custom-gpts/refereegpt/" },
            { name: "CruiseGPT", tools: 3, path: "custom-gpts/cruisegpt/" },
            {
              name: "CoachReflect",
              tools: 3,
              path: "custom-gpts/coachreflect/",
            },
          ].map((gpt) => (
            <div
              key={gpt.name}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {gpt.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/30 text-green-400">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {gpt.tools} tools &middot; openapi.yaml + instructions.md
              </p>
              <p className="text-xs text-[var(--muted)] font-mono mt-1">
                {gpt.path}
              </p>
            </div>
          ))}
        </div>

        {/* Infrastructure Status */}
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Infrastructure Checklist
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
          <div className="space-y-2.5">
            {[
              { label: "Skills Marketplace deployed", done: true, note: "aifootball.co on Coolify" },
              { label: "Custom GPT schemas written", done: true, note: "4 products, 14 tools" },
              { label: "API key system built", done: true, note: "CRUD + rate limiting + validation" },
              { label: "Admin dashboard built", done: true, note: "You're looking at it" },
              { label: "New Hetzner VPS provisioned", done: false, note: "Kevin task" },
              { label: "New Supabase project created", done: false, note: "Kevin task" },
              { label: "Migration run on Supabase", done: false, note: "After Supabase project" },
              { label: "MCP gateway deployed", done: false, note: "360tft-mcp repo" },
              { label: "MCP_SERVICE_SECRET on 4 products", done: false, note: "Kevin task" },
              { label: "Registry published (Smithery, mcp.so)", done: false, note: "After MCP gateway" },
              { label: "Twitter Developer account", done: false, note: "Kevin task, $100/mo" },
              { label: "Herald service deployed", done: false, note: "Auto-publisher" },
              { label: "Telegram approval bot", done: false, note: "Pending bot token" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0 ${
                    item.done
                      ? "bg-green-900/30 text-green-400"
                      : "bg-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {item.done ? "\u2713" : ""}
                </span>
                <div>
                  <span
                    className={`text-sm ${
                      item.done
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-[var(--muted)] ml-2">
                    {item.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable Stats Cards */}
        {stats && (
          <ShareableStats stats={stats} toolCount={allTools.length} />
        )}
      </main>
      <Footer />
    </>
  );
}
