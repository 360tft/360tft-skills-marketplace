import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Desktop Setup | AI Football Docs",
  description:
    "Install FootballGPT, RefereeGPT, and CoachReflect in Claude Desktop. Step-by-step guide with config and troubleshooting.",
};

const fullConfig = `{
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
}`;

const singleConfigs: Record<string, string> = {
  footballgpt: `{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/footballgpt/mcp"
    }
  }
}`,
  refereegpt: `{
  "mcpServers": {
    "refereegpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/refereegpt/mcp"
    }
  }
}`,
  coachreflect: `{
  "mcpServers": {
    "coachreflect": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/coachreflect/mcp"
    }
  }
}`,
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative">
      {label && (
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

export default function ClaudeDesktopDocsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link href="/docs" className="hover:text-[var(--foreground)] transition-colors">
            Docs
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Claude Desktop Setup</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Add Football AI Tools to Claude Desktop
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
          This gives Claude the ability to plan sessions, look up laws of the
          game, log coaching reflections, and create animated drills — all
          inside your normal Claude conversations.
        </p>
        <p className="text-sm text-[var(--muted)] mb-8">
          Takes about 2 minutes. No coding knowledge needed — just copy, paste,
          and save.
        </p>

        {/* Prerequisites */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-[var(--foreground)] mb-2">
            Before you start
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            You need the Claude Desktop app installed on your computer. If you
            don&apos;t have it yet,{" "}
            <a
              href="https://claude.ai/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              download it here
            </a>{" "}
            (available for Mac, Windows, and Linux). It&apos;s free.
          </p>
        </div>

        {/* Step 1 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              1
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Copy this text
            </h2>
          </div>
          <div className="ml-10 space-y-3">
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              This block of text tells Claude where to find the football tools.
              You don&apos;t need to understand what it means. Just click{" "}
              <strong>Copy</strong> and move on to step 2.
            </p>
            <CodeBlock code={fullConfig} />
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              That gives you all 3 products (FootballGPT, RefereeGPT, and
              CoachReflect). If you only want one, click below:
            </p>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                FootballGPT only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.footballgpt} />
              </div>
            </details>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                RefereeGPT only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.refereegpt} />
              </div>
            </details>
            <details className="group">
              <summary className="text-sm text-[var(--accent)] cursor-pointer hover:underline">
                CoachReflect only
              </summary>
              <div className="mt-2">
                <CodeBlock code={singleConfigs.coachreflect} />
              </div>
            </details>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              2
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Open Claude Desktop settings
            </h2>
          </div>
          <div className="ml-10 space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <p>
              Open the Claude Desktop app on your computer. In the{" "}
              <strong>bottom-left corner</strong> of the window, you&apos;ll see
              a small settings icon. Click it.
            </p>
            <p>
              A settings window will appear. On the left side, look for{" "}
              <strong>Developer</strong> and click it.
            </p>
            <p>
              Then click the <strong>Edit Config</strong> button. This will
              open a text file on your computer — it might look blank, and
              that&apos;s fine.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              3
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Paste and save
            </h2>
          </div>
          <div className="ml-10 space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <p>
              In the text file that just opened:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>
                If there&apos;s any existing text, select it all and delete it
              </li>
              <li>
                Paste the text you copied in step 1 (Ctrl+V on Windows, Cmd+V
                on Mac)
              </li>
              <li>
                Save the file (Ctrl+S on Windows, Cmd+S on Mac)
              </li>
              <li>Close the text file</li>
            </ol>
          </div>
        </div>

        {/* Step 4 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              4
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Restart Claude Desktop
            </h2>
          </div>
          <div className="ml-10 space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <p>
              Close Claude Desktop completely and open it again. When it
              reopens, look at the bottom of the chat box — you should see a
              small hammer icon. That means the football tools are connected
              and ready to use.
            </p>
            <p>
              If you don&apos;t see the hammer, try closing and reopening
              Claude Desktop one more time.
            </p>
          </div>
        </div>

        {/* Step 5 - Try it */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-sm font-bold shrink-0">
              5
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Try it out
            </h2>
          </div>
          <div className="ml-10 space-y-3">
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Start a new conversation in Claude Desktop and type any of these.
              Claude will automatically use the football tools to answer:
            </p>
            <div className="space-y-2">
              {[
                "Plan a 60-minute U12 session on 1v1 defending",
                "Can a goalkeeper pick up a throw-in from their own player?",
                "Log a reflection: today's session went well, the pressing drill clicked",
                "Animate a 4v2 rondo with rotation on turnover",
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)]"
                >
                  {prompt}
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              You get 10 free tool calls per day. Upgrade to a product
              subscription for unlimited use.
            </p>
          </div>
        </div>

        {/* What's included */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            What each product gives you
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                FootballGPT (5 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Coaching Advice (18 specialist advisors)</li>
                <li>Session Plan Generator</li>
                <li>Animated Drill Creator</li>
                <li>Player Stats Search (100+ leagues)</li>
                <li>Drill Library Search</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                RefereeGPT (3 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Law of the Game Lookup (IFAB, 9 countries)</li>
                <li>Match Incident Analyzer</li>
                <li>Referee Knowledge Quiz</li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                CoachReflect (3 tools)
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Coaching Reflection Logger</li>
                <li>Coaching Pattern Finder</li>
                <li>Coaching Journal Chat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Something not working?
          </h2>
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                I don&apos;t see the hammer icon after restarting
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
                <li>
                  Make sure you saved the text file before closing it. Go back
                  to step 2, click <strong>Edit Config</strong> again, and
                  check the text is there. If it&apos;s blank, paste it again
                  and save.
                </li>
                <li>
                  Make sure you copied the entire block of text from step 1,
                  including the very first and very last curly brackets.
                </li>
                <li>
                  Try closing Claude Desktop completely (not just minimising)
                  and opening it again.
                </li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                The tools aren&apos;t responding
              </h3>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
                <li>
                  Check you&apos;re connected to the internet.
                </li>
                <li>
                  The free tier gives you 10 tool uses per day. If you&apos;ve
                  used them all, they&apos;ll work again tomorrow, or you can
                  upgrade for unlimited use.
                </li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                I can&apos;t find the Developer option in settings
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Make sure you&apos;re using the Claude Desktop app (not the
                website claude.ai). The Developer option is only in the desktop
                app. If you still can&apos;t find it, your version might need
                updating — download the latest version from{" "}
                <a
                  href="https://claude.ai/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  claude.ai/download
                </a>
                .
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                Still stuck?
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Ask in{" "}
                <a
                  href="https://www.skool.com/aifootball"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  AI Football Skool
                </a>{" "}
                and we&apos;ll help you get set up.
              </p>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">
            Next steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link
              href="/learn"
              className="text-[var(--accent)] hover:underline"
            >
              Take the 45-minute skills course
            </Link>
            <Link
              href="/docs/api"
              className="text-[var(--accent)] hover:underline"
            >
              Explore the REST API
            </Link>
            <Link
              href="/"
              className="text-[var(--accent)] hover:underline"
            >
              Browse all tools
            </Link>
            <a
              href="https://www.skool.com/aifootball"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Join AI Football Skool
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
