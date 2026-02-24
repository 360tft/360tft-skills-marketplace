"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { getToolBySlug, getRelatedTools } from "@/data/tools";
import type { Tool } from "@/data/tools";

function TryItDemo({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [triesLeft, setTriesLeft] = useState(5);

  const handleTry = async () => {
    if (!query.trim() || triesLeft <= 0) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/try-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          mcpServerPath: tool.mcpServerPath,
          mcpToolName: tool.mcpToolName,
          query: query.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.result || "No response received.");
        setTriesLeft((prev) => prev - 1);
      } else if (res.status === 429) {
        setResponse(
          "You've reached the free trial limit. Sign up or subscribe for unlimited access."
        );
      } else {
        setResponse("Something went wrong. Please try again.");
      }
    } catch {
      setResponse("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="font-semibold text-[var(--foreground)] mb-3">
        Try it now
      </h3>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTry()}
            placeholder={tool.exampleQueries[0] || "Ask a question..."}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
          />
          <button
            onClick={handleTry}
            disabled={loading || !query.trim() || triesLeft <= 0}
            className="shrink-0 px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Thinking..." : "Try"}
          </button>
        </div>

        {response && (
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {response}
          </div>
        )}

        <p className="text-xs text-[var(--muted)]">
          {triesLeft > 0
            ? `${triesLeft} free tries remaining today`
            : "Free tries used up. Install this tool for unlimited access."}
        </p>
      </div>

      {/* Example queries */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted)] mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {tool.exampleQueries.map((eq, i) => (
            <button
              key={i}
              onClick={() => setQuery(eq)}
              className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)] transition-colors"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstallModal({
  tool,
  onClose,
}: {
  tool: Tool;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        [tool.mcpServerPath]: {
          type: "streamable-http",
          url: `https://mcp.360tft.com/${tool.mcpServerPath}/mcp`,
        },
      },
    },
    null,
    2
  );

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Store email in Supabase (non-blocking on failure)
    fetch("/api/email-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        sourceTool: tool.slug,
      }),
    }).catch(() => {});

    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-semibold text-lg text-[var(--foreground)] mb-1">
          Add to Claude Desktop
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          {tool.name} will be available as a tool in your Claude Desktop conversations.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmitEmail} className="space-y-3">
            <p className="text-xs text-[var(--muted)]">
              Enter your email to get the install config and tool updates.
            </p>
            <div className="flex gap-2">
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
                className="shrink-0 px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Open Claude Desktop Settings (gear icon)
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Go to &quot;MCP Servers&quot; and click &quot;Edit Config&quot;
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Add this to your config file:
              </div>
            </div>

            <div className="relative">
              <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
                {mcpConfig}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/10 text-[var(--foreground)] hover:bg-white/20 transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Restart Claude Desktop after saving. The {tool.name} tool will appear automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  coaching: "Coaching",
  refereeing: "Refereeing",
  player_dev: "Player Development",
  club_mgmt: "Club Management",
  analytics: "Analytics",
  content: "Content",
};

export default function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = getToolBySlug(slug);
  const [showInstallModal, setShowInstallModal] = useState(false);

  if (!tool) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            Tool not found
          </h1>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Browse all tools
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const relatedTools = getRelatedTools(tool);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Skills
          </Link>
          <span>/</span>
          <span className="text-[var(--muted-foreground)]">
            {categoryLabels[tool.category]}
          </span>
          <span>/</span>
          <span className="text-[var(--foreground)]">{tool.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl w-16 h-16 flex items-center justify-center bg-white/5 rounded-xl shrink-0">
            {tool.iconEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {tool.name}
              </h1>
              {tool.badges.map((b) => (
                <span
                  key={b}
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                    b === "Official"
                      ? "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"
                      : b === "Free"
                      ? "bg-[var(--success)]/15 text-green-400 border-[var(--success)]/30"
                      : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              by {tool.authorName} &middot;{" "}
              {categoryLabels[tool.category]} &middot;{" "}
              {tool.pricingType === "freemium"
                ? "Free + Pro"
                : tool.pricingType === "free"
                ? "Free"
                : "Paid"}
            </p>
          </div>
        </div>

        {/* Install buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tool.installMethods.includes("claude_desktop") && (
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Add to Claude Desktop
            </button>
          )}
          {tool.chatgptUrl && (
            <a
              href={tool.chatgptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Use in ChatGPT
            </a>
          )}
          {tool.productUrl && (
            <a
              href={tool.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Open {tool.authorName === "Coach Kevin" ? "full app" : "website"}
            </a>
          )}
          {tool.gumroadUrl && (
            <a
              href={tool.gumroadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-white/5 transition-colors"
            >
              Get on 360TFT Store
            </a>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
            About
          </h2>
          <div className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
            {tool.longDescription}
          </div>
        </div>

        {/* Try it demo */}
        <div className="mb-8">
          <TryItDemo tool={tool} />
        </div>

        {/* Parameters */}
        {tool.inputParams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Parameters
            </h2>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                      Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                      Description
                    </th>
                    <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                      Required
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tool.inputParams.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--accent)]">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                        {p.description}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted)]">
                        {p.required ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Related tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTools.map((rt) => (
                <ToolCard key={rt.id} tool={rt} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {showInstallModal && (
        <InstallModal tool={tool} onClose={() => setShowInstallModal(false)} />
      )}
    </>
  );
}
