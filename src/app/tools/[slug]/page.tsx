"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { SponsoredAlternatives } from "@/components/sponsored-alternatives";
import { getToolBySlug, getRelatedTools } from "@/data/tools";
import type { Tool } from "@/data/tools";

function ToolJsonLd({ tool }: { tool: Tool }) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://aifootball.co";

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "AI Tool",
    operatingSystem: "Web, Claude Desktop, ChatGPT",
    url: `${baseUrl}/tools/${tool.slug}`,
    author: {
      "@type": "Person",
      name: tool.authorName,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        tool.pricingType === "free"
          ? "Free"
          : "Free tier available, Pro features with subscription",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabels[tool.category] || tool.category,
        item: `${baseUrl}/?category=${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${baseUrl}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

function TryItDemo({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [poweredBy, setPoweredBy] = useState<{ name: string; url: string } | null>(null);
  const [rateLimitProduct, setRateLimitProduct] = useState<{ name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [triesLeft, setTriesLeft] = useState(2);

  const handleTry = async () => {
    if (!query.trim() || triesLeft <= 0) return;
    setLoading(true);
    setResponse("");
    setPoweredBy(null);

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
        if (data.poweredBy) setPoweredBy(data.poweredBy);
        setTriesLeft((prev) => prev - 1);
      } else if (res.status === 429) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.product) {
          setRateLimitProduct(errorData.product);
        }
        setTriesLeft(0);
        setResponse(
          errorData?.message || "You've used your free tries today."
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
            {rateLimitProduct?.url && triesLeft <= 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <a
                  href={rateLimitProduct.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-black text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Get full access on {rateLimitProduct.name}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            {poweredBy && triesLeft > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--muted)]">
                Powered by{" "}
                <a
                  href={poweredBy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  {poweredBy.name}
                </a>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-[var(--muted)]">
          {triesLeft > 0 ? (
            `${triesLeft} free tries remaining today`
          ) : rateLimitProduct?.url ? (
            <>
              Free tries used up.{" "}
              <a
                href={rateLimitProduct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Get full access on {rateLimitProduct.name}
              </a>
            </>
          ) : tool.productUrl ? (
            <>
              Free tries used up.{" "}
              <a
                href={tool.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Get full access
              </a>
            </>
          ) : (
            "Free tries used up. Check back tomorrow."
          )}
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
              Enter your email to get the install instructions and tool updates.
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
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-medium">Copy this text</p>
                <p className="text-[var(--muted-foreground)] mt-1">
                  Click the button below. It looks like code but you don&apos;t
                  need to understand it. Just copy it.
                </p>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
                {mcpConfig}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-xs px-2.5 py-1.5 rounded-md bg-[var(--accent)] text-black font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-medium">
                  Open Claude Desktop settings
                </p>
                <p className="text-[var(--muted-foreground)] mt-1">
                  Open the Claude Desktop app. In the bottom-left corner,
                  you&apos;ll see a small settings icon. Click it.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-medium">
                  Click &quot;Developer&quot;, then &quot;Edit Config&quot;
                </p>
                <p className="text-[var(--muted-foreground)] mt-1">
                  In the settings window, look for{" "}
                  <strong>Developer</strong> on the left side. Click it. Then
                  click the <strong>Edit Config</strong> button. A text file
                  will open.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </span>
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-medium">
                  Paste and save
                </p>
                <p className="text-[var(--muted-foreground)] mt-1">
                  If the file is empty, just paste what you copied in step 1
                  and save the file. If there&apos;s already text in the file,{" "}
                  <strong>select all the existing text</strong>, delete it,
                  then paste.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                5
              </span>
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-medium">Restart Claude Desktop</p>
                <p className="text-[var(--muted-foreground)] mt-1">
                  Close Claude Desktop completely and open it again. You
                  should see a small hammer icon at the bottom of the chat
                  box. That means it worked.
                </p>
              </div>
            </div>

            <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 mt-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                <strong className="text-[var(--foreground)]">
                  Stuck?
                </strong>{" "}
                Follow the{" "}
                <a
                  href="/docs/claude-desktop"
                  className="text-[var(--accent)] hover:underline"
                >
                  full guide with screenshots
                </a>{" "}
                or ask in{" "}
                <a
                  href="https://www.skool.com/aifootball"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  AI Football Skool
                </a>
                .
              </p>
            </div>

            {tool.productUrl && (
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 mt-2">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <strong className="text-[var(--foreground)]">
                    Want API access?
                  </strong>{" "}
                  Personal bolt-on ($4.99/mo) at{" "}
                  <a
                    href={tool.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    {tool.productUrl.replace("https://", "").replace(/\/$/, "")}
                  </a>{" "}
                  or developer access at{" "}
                  <a
                    href="https://aifootball.co/developer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    aifootball.co/developer
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
        >
          <svg
            className={`w-4 h-4 ${
              star <= (hover || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-[var(--muted)] fill-none"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ toolSlug }: { toolSlug: string }) {
  const [reviews, setReviews] = useState<
    { id: string; rating: number; review_text: string | null; author_response: string | null; author_response_at: string | null; created_at: string }[]
  >([]);
  const [averageRating, setAverageRating] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?toolSlug=${toolSlug}`)
      .then((res) => (res.ok ? res.json() : { reviews: [], averageRating: 0, count: 0 }))
      .then((data) => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setCount(data.count || 0);
      })
      .catch(() => {});
  }, [toolSlug]);

  const handleSubmit = async () => {
    if (myRating === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          rating: myRating,
          reviewText: myText,
        }),
      });

      if (res.status === 401) {
        window.location.href = `/auth/login?redirectTo=/tools/${toolSlug}`;
        return;
      }

      if (res.ok) {
        setSubmitted(true);
        // Refresh reviews
        const refreshRes = await fetch(`/api/reviews?toolSlug=${toolSlug}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setCount(data.count || 0);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">Reviews</h3>
        {count > 0 && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <StarRating rating={Math.round(averageRating)} />
            <span>
              {averageRating} ({count} {count === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Submit review */}
      {!submitted ? (
        <div className="mb-4 pb-4 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] mb-2">Rate this tool</p>
          <div className="flex items-center gap-3 mb-2">
            <StarRating
              rating={myRating}
              onRate={setMyRating}
              interactive
            />
            {myRating > 0 && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {myRating}/5
              </span>
            )}
          </div>
          {myRating > 0 && (
            <div className="space-y-2">
              <textarea
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                placeholder="Write a short review (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 pb-4 border-b border-[var(--border)]">
          <p className="text-sm text-green-400">Thanks for your review.</p>
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} />
                <span className="text-xs text-[var(--muted)]">
                  {new Date(review.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {review.review_text && (
                <p className="text-[var(--muted-foreground)]">
                  {review.review_text}
                </p>
              )}
              {review.author_response && (
                <div className="mt-2 ml-4 pl-3 border-l-2 border-[var(--accent)]/30">
                  <p className="text-xs text-[var(--accent)] font-medium mb-0.5">
                    Developer response
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {review.author_response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No reviews yet. Be the first to rate this tool.
        </p>
      )}
    </div>
  );
}

function FavouriteButton({ toolSlug }: { toolSlug: string }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favourites")
      .then((res) => (res.ok ? res.json() : { favourites: [] }))
      .then((data) => {
        const found = (data.favourites || []).some(
          (f: { tool_slug: string }) => f.tool_slug === toolSlug
        );
        setIsFav(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [toolSlug]);

  const toggle = async () => {
    const method = isFav ? "DELETE" : "POST";
    const res = await fetch("/api/favourites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug }),
    });

    if (res.status === 401) {
      window.location.href = `/auth/login?redirectTo=/tools/${toolSlug}`;
      return;
    }

    if (res.ok) setIsFav(!isFav);
  };

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
        isFav
          ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-white/5"
      }`}
      title={isFav ? "Remove from favourites" : "Add to favourites"}
    >
      <svg
        className="w-4 h-4"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isFav ? "Saved" : "Save"}
    </button>
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
      <ToolJsonLd tool={tool} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            {categoryLabels[tool.category]}
          </Link>
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
              Get on AI Football Store
            </a>
          )}
          <FavouriteButton toolSlug={tool.slug} />
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

        {/* Reviews */}
        <div className="mb-8">
          <ReviewSection toolSlug={tool.slug} />
        </div>

        {/* Sponsored alternatives */}
        <SponsoredAlternatives toolSlug={tool.slug} />

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
