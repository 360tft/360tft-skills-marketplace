"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface ApiKeyData {
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

function KeyManagement() {
  const [email, setEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyProduct, setNewKeyProduct] = useState("all");
  const [newKeySecret, setNewKeySecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(
    async (emailAddr: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/keys?email=${encodeURIComponent(emailAddr)}`
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setKeys(data.keys || []);
          setAuthenticated(true);
        }
      } catch {
        setError("Failed to load keys. Database may not be configured yet.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      loadKeys(email.trim().toLowerCase());
    }
  };

  const handleCreateKey = async () => {
    setLoading(true);
    setError("");
    setNewKeySecret("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: newKeyName || "Default",
          product: newKeyProduct,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewKeySecret(data.key);
        setNewKeyName("");
        loadKeys(email);
      }
    } catch {
      setError("Failed to create key");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Revoke this key? Any apps using it will stop working.")) {
      return;
    }
    try {
      const res = await fetch(`/api/keys/${keyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        loadKeys(email);
      }
    } catch {
      setError("Failed to revoke key");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Your API Keys
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Enter your email to manage your API keys. New here? Enter any email to create your first key.
        </p>
        <form onSubmit={handleLogin} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Continue"}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New key created - show once */}
      {newKeySecret && (
        <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl p-5">
          <h3 className="font-semibold text-green-400 mb-2">
            Key created. Save it now.
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            This is the only time your full key will be shown. Copy it somewhere safe.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded px-3 py-2 text-sm font-mono text-[var(--foreground)] break-all">
              {newKeySecret}
            </code>
            <button
              onClick={() => handleCopy(newKeySecret)}
              className="shrink-0 px-3 py-2 rounded bg-white/10 text-sm text-[var(--foreground)] hover:bg-white/20 transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKeySecret("")}
            className="mt-3 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            I've saved it, dismiss this
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-3">
          Create New Key
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. My App)"
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
          />
          <select
            value={newKeyProduct}
            onChange={(e) => setNewKeyProduct(e.target.value)}
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]/50"
          >
            <option value="all">All Products</option>
            <option value="footballgpt">FootballGPT</option>
            <option value="refereegpt">RefereeGPT</option>
            <option value="coachreflect">CoachReflect</option>
          </select>
          <button
            onClick={handleCreateKey}
            disabled={loading}
            className="shrink-0 px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create Key"}
          </button>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Free tier: 10 calls/day. Upgrade to Developer ($29/month) for 1,000 calls/day.
        </p>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>

      {/* Key list */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--foreground)]">
            Your Keys
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {email}
          </span>
        </div>

        {keys.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No keys yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[var(--foreground)]">
                      {key.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        key.tier === "developer"
                          ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"
                          : key.tier === "pro"
                          ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                          : "bg-white/5 text-[var(--muted)] border-white/10"
                      }`}
                    >
                      {key.tier}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {key.product === "all" ? "All products" : key.product}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <code className="font-mono">{key.key_prefix}...</code>
                    <span>
                      {key.calls_today} calls today
                    </span>
                    <span>
                      {key.calls_this_month} this month
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="shrink-0 ml-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeveloperPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Developer Portal
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          Build AI tools for football coaches using 360TFT infrastructure.
          Get API access to FootballGPT, RefereeGPT, CoachReflect, and more.
          Publish your tools on this marketplace and earn revenue.
        </p>

        {/* Key management section */}
        <div className="mb-10">
          <KeyManagement />
        </div>

        {/* What you get */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          What You Get
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              API Access
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Call any 360TFT tool via REST API. Coaching advice, session
              plans, law lookups, drill animations, player stats, and more.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              MCP Server
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Connect to our MCP gateway at mcp.360tft.com. Works with
              Claude Desktop, ChatGPT, and any MCP-compatible AI assistant.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Publish Tools
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Submit your own AI tools to the marketplace. Reach thousands
              of football coaches. Earn 70% of revenue on paid tools.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Builder Bootcamp
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Get the FootballGPT codebase, weekly calls with Coach Kevin,
              and a 30-day curriculum to launch your own football AI product.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          API Pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--foreground)] mb-1">Free</h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $0
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>10 API calls per day</li>
              <li>All tools available</li>
              <li>Per-tool usage tracking</li>
              <li>Max 5 keys per email</li>
            </ul>
          </div>
          <div className="bg-[var(--card)] border-2 border-[var(--accent)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--accent)] mb-1">
              Developer
            </h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $29<span className="text-sm font-normal text-[var(--muted)]">/month</span>
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>1,000 API calls per day</li>
              <li>Per-tool analytics</li>
              <li>Priority support</li>
              <li>Publish tools to marketplace</li>
            </ul>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Builder Bootcamp
            </h3>
            <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
              $497<span className="text-sm font-normal text-[var(--muted)]"> one-time</span>
            </p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
              <li>Everything in Developer</li>
              <li>FootballGPT codebase</li>
              <li>30-day curriculum</li>
              <li>Weekly calls with Kevin</li>
            </ul>
          </div>
        </div>

        {/* Quick start */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Quick Start
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-10">
          <h3 className="font-medium text-[var(--foreground)] mb-3">
            1. Add to Claude Desktop
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Add this to your Claude Desktop MCP config:
          </p>
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto mb-5">
{`{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/footballgpt/mcp"
    },
    "refereegpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/refereegpt/mcp"
    },
    "coachreflect": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/coachreflect/mcp"
    }
  }
}`}
          </pre>

          <h3 className="font-medium text-[var(--foreground)] mb-3">
            2. Call via REST API
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Use your API key in the Authorization header:
          </p>
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
{`curl -X POST https://mcp.360tft.com/footballgpt/api/get_coaching_advice \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"message": "Best warm-up for U12s?"}'`}
          </pre>
        </div>

        {/* CTA */}
        <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Ready to build?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Join AI Football Skool to get started. Builder Bootcamp students
            get full access plus the FootballGPT codebase.
          </p>
          <a
            href="https://www.skool.com/aifootball"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
          >
            Join AI Football Skool (Free)
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
