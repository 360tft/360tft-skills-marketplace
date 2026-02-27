import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-center sm:text-left">
          <div>
            <h3 className="font-medium text-[var(--foreground)] text-sm mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  MCP
                </Link>
              </li>
              <li>
                <Link
                  href="/learn"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Learn
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)] text-sm mb-3">
              Developers
            </h3>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <Link
                  href="/developer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  API Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Submit a Tool
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)] text-sm mb-3">
              Products
            </h3>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <a
                  href="https://footballgpt.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  FootballGPT
                </a>
              </li>
              <li>
                <a
                  href="https://refereegpt.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  RefereeGPT
                </a>
              </li>
              <li>
                <a
                  href="https://coachreflection.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  CoachReflect
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)] text-sm mb-3">
              Community
            </h3>
            <ul className="space-y-2 text-xs text-[var(--muted)]">
              <li>
                <a
                  href="https://www.skool.com/aifootball"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  AI Football Skool
                </a>
              </li>
              <li>
                <a
                  href="https://www.skool.com/coachingacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Coaching Academy
                </a>
              </li>
              <li>
                <a
                  href="https://www.skool.com/the-2-drill-club-5017"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  $2 Drill Club
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--border)]">
          <p className="text-center text-xs text-[var(--muted)] mb-2">
            Part of the{" "}
            <a
              href="https://360tft.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--foreground)] underline"
            >
              360 TFT
            </a>{" "}
            ecosystem
          </p>
          <p className="text-center text-xs text-[var(--muted)]">
            AI Football{" "}
            <span className="font-normal">by 360TFT</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
