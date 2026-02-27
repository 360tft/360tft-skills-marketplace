"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleUnsubscribe() {
    setStatus("loading");

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
          <span className="text-black font-bold text-sm">AI</span>
        </div>
        <h1 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Unsubscribe
        </h1>

        {status === "idle" && (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Click below to unsubscribe from AI Football emails.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="text-sm font-medium px-6 py-2.5 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Unsubscribe
            </button>
          </>
        )}

        {status === "loading" && (
          <p className="text-sm text-[var(--muted-foreground)]">
            Processing...
          </p>
        )}

        {status === "done" && (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              You have been unsubscribed. You will no longer receive emails from
              AI Football.
            </p>
            <Link
              href="/"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Back to AI Football
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Something went wrong. Please try again or email{" "}
              <a
                href="mailto:kevin@360tft.com"
                className="text-[var(--accent)] hover:underline"
              >
                kevin@360tft.com
              </a>{" "}
              to be removed.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
