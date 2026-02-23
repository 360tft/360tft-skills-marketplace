export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span>Built by 360TFT</span>
          <a
            href="https://footballgpt.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            FootballGPT
          </a>
          <a
            href="https://refereegpt.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            RefereeGPT
          </a>
          <a
            href="https://coachreflection.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            CoachReflect
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.skool.com/aifootball"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            AI Football Skool
          </a>
          <a
            href="https://www.skool.com/coachingacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Football Coaching Academy
          </a>
        </div>
      </div>
    </footer>
  );
}
