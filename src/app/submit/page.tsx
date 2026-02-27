"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CATEGORIES } from "@/data/tools";

type ToolType = "mcp_server" | "api" | "claude_skill" | "custom_gpt";

const TOOL_TYPES: { value: ToolType; label: string; description: string }[] = [
  {
    value: "mcp_server",
    label: "MCP Server",
    description: "A Model Context Protocol server that works with Claude Desktop",
  },
  {
    value: "api",
    label: "API / Web App",
    description: "A REST API or web application with football AI features",
  },
  {
    value: "claude_skill",
    label: "Claude Skill",
    description: "A Claude Code skill file (.md) with prompts and instructions",
  },
  {
    value: "custom_gpt",
    label: "Custom GPT",
    description: "A Custom GPT built on OpenAI's GPT Store",
  },
];

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    toolType: "" as ToolType | "",
    connectionUrl: "",
    mcpUrl: "",
    apiDocsUrl: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const connectionPlaceholder = (): string => {
    switch (form.toolType) {
      case "mcp_server":
        return "https://your-server.com/mcp";
      case "api":
        return "https://your-api.com";
      case "claude_skill":
        return "https://github.com/you/skill-repo";
      case "custom_gpt":
        return "https://chatgpt.com/g/g-xxxxx";
      default:
        return "https://...";
    }
  };

  const connectionLabel = (): string => {
    switch (form.toolType) {
      case "mcp_server":
        return "MCP server URL";
      case "api":
        return "API base URL or website";
      case "claude_skill":
        return "Skill file URL (GitHub or direct link)";
      case "custom_gpt":
        return "GPT Store URL";
      default:
        return "Connection URL";
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link
            href="/"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Submit</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          List Your Football AI Tool
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
          Built a football AI tool? List it on AI Football for free. We accept
          MCP servers, APIs, Claude skills, and Custom GPTs. We review every
          submission and add approved tools to the directory.
        </p>

        {submitted ? (
          <div className="bg-[var(--card)] border border-[var(--success)]/30 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--success)]/15 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Submission received
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              We&apos;ll review your tool and get back to you at {form.email}.
              Most submissions are reviewed within a few days.
            </p>
            <Link
              href="/"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Browse existing tools
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tool type selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Tool type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TOOL_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, toolType: t.value })
                    }
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      form.toolType === t.value
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--border)] hover:border-[var(--accent)]/30"
                    }`}
                  >
                    <span
                      className={`font-medium block ${
                        form.toolType === t.value
                          ? "text-[var(--accent)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-xs text-[var(--muted)] mt-0.5 block">
                      {t.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Tool name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Tactical Board AI"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does your tool do? Who is it for?"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Category *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]/50"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Connection URL - shown when tool type is selected */}
            {form.toolType && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {connectionLabel()} *
                </label>
                <input
                  type="url"
                  required
                  value={form.connectionUrl}
                  onChange={(e) =>
                    setForm({ ...form, connectionUrl: e.target.value })
                  }
                  placeholder={connectionPlaceholder()}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            )}

            {/* API docs URL - only for API type */}
            {form.toolType === "api" && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  API documentation URL
                </label>
                <input
                  type="url"
                  value={form.apiDocsUrl}
                  onChange={(e) =>
                    setForm({ ...form, apiDocsUrl: e.target.value })
                  }
                  placeholder="https://your-tool.com/docs"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Contact email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                We&apos;ll use this to contact you about your submission.
              </p>
            </div>

            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !form.toolType}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-black font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for review"}
            </button>

            <p className="text-xs text-[var(--muted)] text-center">
              Listings are free. We review submissions and aim to respond within
              a few days. Want to build a tool from scratch?{" "}
              <a
                href="https://www.skool.com/aifootball"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Join Builder Bootcamp
              </a>
              .
            </p>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
