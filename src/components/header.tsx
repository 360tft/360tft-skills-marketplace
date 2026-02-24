import Link from "next/link";
import { AuthButton } from "./auth-button";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-black font-bold text-sm">AI</span>
          </div>
          <div>
            <span className="font-semibold text-[var(--foreground)] text-sm">
              AI Football
            </span>
            <span className="text-[var(--muted)] text-xs ml-1.5 hidden sm:inline">
              The AI agent marketplace
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/agents"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:inline"
          >
            Agents
          </Link>
          <Link
            href="/docs"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/learn"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:inline"
          >
            Learn
          </Link>
          <Link
            href="/developer"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:inline"
          >
            Developers
          </Link>
          <Link
            href="/submit"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:inline"
          >
            Submit
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
