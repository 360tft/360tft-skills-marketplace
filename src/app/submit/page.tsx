"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CATEGORIES } from "@/data/tools";

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
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
          Built a football AI tool? List it on AI Football for free. We review
          every submission and add approved tools to the marketplace. No fees,
          no catch.
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

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                MCP server URL
              </label>
              <input
                type="url"
                value={form.mcpUrl}
                onChange={(e) => setForm({ ...form, mcpUrl: e.target.value })}
                placeholder="https://your-server.com/mcp"
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                If your tool uses MCP, provide the server URL. Otherwise leave
                blank.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                API docs or website URL
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
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-black font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for review"}
            </button>

            <p className="text-xs text-[var(--muted)] text-center">
              Listings are free. We review submissions manually and aim to
              respond within a few days. Want to build a tool from scratch?{" "}
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
