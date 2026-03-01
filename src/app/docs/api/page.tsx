import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference | AI Football Docs",
  description:
    "REST API reference for AI Football tools. Authentication, rate limits, endpoints, and curl examples for all 11 tools.",
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div>
      {label && (
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function EndpointSection({
  product,
  tool,
  description,
  curl,
  params,
}: {
  product: string;
  tool: string;
  description: string;
  curl: string;
  params: { name: string; required: boolean; description: string }[];
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
          POST
        </span>
        <code className="text-sm font-mono text-[var(--foreground)]">
          /api/mcp/{tool}
        </code>
      </div>
      <p className="text-xs text-[var(--muted)] mb-1">{product}</p>
      <p className="text-sm text-[var(--muted-foreground)] mb-3">
        {description}
      </p>
      {params.length > 0 && (
        <div className="mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-1.5 text-[var(--muted)] font-medium">
                  Param
                </th>
                <th className="text-left py-1.5 text-[var(--muted)] font-medium">
                  Required
                </th>
                <th className="text-left py-1.5 text-[var(--muted)] font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr
                  key={p.name}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-1.5 font-mono text-[var(--accent)]">
                    {p.name}
                  </td>
                  <td className="py-1.5 text-[var(--muted)]">
                    {p.required ? "Yes" : "No"}
                  </td>
                  <td className="py-1.5 text-[var(--muted-foreground)]">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CodeBlock code={curl} label="Example" />
    </div>
  );
}

export default function ApiDocsPage() {
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
          <span className="text-[var(--foreground)]">API Reference</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          API Reference
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
          Call any AI Football tool via REST API. Get an API key from the{" "}
          <Link href="/developer" className="text-[var(--accent)] hover:underline">
            Developer Portal
          </Link>
          , then use the endpoints below.
        </p>

        {/* Authentication */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Authentication
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Pass your API key in the Authorization header:
          </p>
          <CodeBlock
            code={`Authorization: Bearer tft_sk_your_key_here`}
          />
          <p className="text-xs text-[var(--muted)] mt-2">
            Keys are created in the{" "}
            <Link href="/developer" className="text-[var(--accent)] hover:underline">
              Developer Portal
            </Link>
            . Product-specific keys use prefixes like fgpt_sk_, rgpt_sk_, cr_sk_.
          </p>
        </div>

        {/* Base URL */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Base URLs
          </h2>
          <div className="space-y-2">
            <CodeBlock
              code={`MCP Gateway:  https://mcp.360tft.com/{product}/mcp
REST API:     https://mcp.360tft.com/{product}/api/{tool_name}

Products: footballgpt, refereegpt, coachreflect, playerreflection`}
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            The MCP endpoint accepts JSON-RPC 2.0 requests (for Claude Desktop
            and MCP clients). The REST API accepts standard JSON POST requests.
          </p>
        </div>

        {/* Rate limits */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Rate limits
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Tier
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Calls/day
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 text-[var(--foreground)]">Free</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">10</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">$0</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 text-[var(--foreground)]">Personal (bolt-on)</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">100</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">$4.99/mo per product</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 text-[var(--foreground)]">Builder</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">1,000</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">$79/month</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 text-[var(--foreground)]">Scale</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">5,000</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">$349/month</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-[var(--foreground)]">Enterprise</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Custom</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Contact us</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            Rate limit resets at midnight UTC. The response includes an
            X-RateLimit-Remaining header.
          </p>
        </div>

        {/* Two access paths */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Two ways to get API access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                1. Personal bolt-on
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                $4.99/mo on each product site. 100 calls/day for that product. Best for personal projects using one product.
              </p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                2. Developer plan
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                $79+/mo on{" "}
                <Link href="/developer" className="text-[var(--accent)] hover:underline">
                  AI Football
                </Link>
                . 1,000+ calls/day across ALL products with one key. Best for apps, integrations, and multi-product builds.
              </p>
            </div>
          </div>
        </div>

        {/* Error codes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Error codes
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-[var(--muted)] font-medium">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--foreground)]">200</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Success</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--foreground)]">400</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Bad request (missing or invalid parameters)</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--foreground)]">401</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Invalid or missing API key</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--foreground)]">429</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--foreground)]">500</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">Internal server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FootballGPT endpoints */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            FootballGPT
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Base: <code className="text-xs font-mono text-[var(--accent)]">https://mcp.360tft.com/footballgpt/api/</code>
          </p>
          <div className="space-y-4">
            <EndpointSection
              product="FootballGPT"
              tool="get-coaching-advice"
              description="Ask 18 specialist AI advisors for coaching guidance across grassroots, academy, and professional levels."
              params={[
                { name: "message", required: true, description: "Your coaching question" },
                { name: "mode", required: false, description: "coach, player, fm, or goalkeeper" },
                { name: "advisor", required: false, description: "grassroots-guru, academy-mind, sunday-specialist, pros-pro, gk-coach, scout-advisor, general" },
                { name: "ageGroup", required: false, description: "e.g. u10, u14, senior" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/footballgpt/api/get_coaching_advice \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"message": "Best warm-up for U12s?"}'`}
            />
            <EndpointSection
              product="FootballGPT"
              tool="generate-session-plan"
              description="Generate complete training session plans with warm-up, main activity, progressions, and cool-down."
              params={[
                { name: "topic", required: true, description: "Session topic (e.g. defending, passing)" },
                { name: "ageGroup", required: true, description: "e.g. u10, u14, senior" },
                { name: "duration", required: false, description: "Minutes (default: 60)" },
                { name: "playerCount", required: false, description: "Number of players (default: 16)" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/footballgpt/api/generate_session_plan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"topic": "1v1 defending", "ageGroup": "u12", "duration": 60}'`}
            />
            <EndpointSection
              product="FootballGPT"
              tool="animate-drill"
              description="Turn text descriptions into animated football drill diagrams with player movements and passes."
              params={[
                { name: "description", required: true, description: "Drill description in plain English" },
                { name: "category", required: false, description: "technical, tactical, physical, set-piece" },
                { name: "ageGroup", required: false, description: "e.g. u10, u14, senior" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/footballgpt/api/animate_drill \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"description": "4v2 rondo with rotation on loss of possession"}'`}
            />
            <EndpointSection
              product="FootballGPT"
              tool="search-player-stats"
              description="Search real player statistics from 100+ football leagues worldwide."
              params={[
                { name: "name", required: false, description: "Player name" },
                { name: "league", required: false, description: "League name" },
                { name: "position", required: false, description: "Player position" },
                { name: "season", required: false, description: "e.g. 2024-2025" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/footballgpt/api/search_player_stats \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"name": "Saka", "league": "Premier League"}'`}
            />
            <EndpointSection
              product="FootballGPT"
              tool="search-drills"
              description="Search the community drill library by topic, age group, and category."
              params={[
                { name: "query", required: true, description: "Search query" },
                { name: "category", required: false, description: "passing, shooting, defending, etc." },
                { name: "ageGroup", required: false, description: "e.g. u10, u14, senior" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/footballgpt/api/search_drills \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"query": "1v1 defending drills"}'`}
            />
          </div>
        </div>

        {/* RefereeGPT endpoints */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            RefereeGPT
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Base: <code className="text-xs font-mono text-[var(--accent)]">https://mcp.360tft.com/refereegpt/api/</code>
          </p>
          <div className="space-y-4">
            <EndpointSection
              product="RefereeGPT"
              tool="check-law"
              description="Search IFAB Laws of the Game with RAG. 9 country-specific rule variations supported."
              params={[
                { name: "query", required: true, description: "Your rules question" },
                { name: "country", required: false, description: "england, scotland, usa, australia, canada, ireland, wales, northern-ireland, south-africa" },
                { name: "refereeLevel", required: false, description: "grassroots, youth, amateur, semi-professional, professional" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/refereegpt/api/check_law \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"query": "Can a goalkeeper pick up a throw-in?"}'`}
            />
            <EndpointSection
              product="RefereeGPT"
              tool="analyze-incident"
              description="Get AI analysis of match incidents with specific law references and the correct decision."
              params={[
                { name: "description", required: true, description: "Describe the incident" },
                { name: "country", required: false, description: "Country for local rules (default: england)" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/refereegpt/api/analyze_incident \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"description": "Player removes shirt after scoring"}'`}
            />
            <EndpointSection
              product="RefereeGPT"
              tool="generate-quiz"
              description="Generate referee training quizzes on any topic with multiple difficulty levels."
              params={[
                { name: "topic", required: true, description: "Law or topic to quiz on" },
                { name: "difficulty", required: false, description: "beginner, intermediate, advanced" },
                { name: "country", required: false, description: "Country for local rules" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/refereegpt/api/generate_quiz \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"topic": "offside", "difficulty": "intermediate"}'`}
            />
          </div>
        </div>

        {/* CoachReflect endpoints */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            CoachReflect
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Base: <code className="text-xs font-mono text-[var(--accent)]">https://mcp.360tft.com/coachreflect/api/</code>
          </p>
          <div className="space-y-4">
            <EndpointSection
              product="CoachReflect"
              tool="log-reflection"
              description="Log coaching session reflections and get AI-powered analysis of your coaching patterns."
              params={[
                { name: "reflection", required: true, description: "Your session reflection" },
                { name: "sessionType", required: false, description: "training, match, observation, cpd, general" },
                { name: "mood", required: false, description: "great, good, neutral, challenging, difficult" },
                { name: "energy", required: false, description: "high, medium, low" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/coachreflect/api/log_reflection \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"reflection": "Great session today. 1v1 defending clicked with the U14s."}'`}
            />
            <EndpointSection
              product="CoachReflect"
              tool="get-patterns"
              description="Analyse coaching reflections to find recurring patterns, strengths, and areas for development."
              params={[
                { name: "timeRange", required: false, description: "week, month, quarter, all" },
                { name: "focus", required: false, description: "communication, session planning, player engagement, behaviour management" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/coachreflect/api/get_patterns \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"timeRange": "month"}'`}
            />
            <EndpointSection
              product="CoachReflect"
              tool="coaching-chat"
              description="Chat with your coaching reflection history. Ask questions about your development."
              params={[
                { name: "message", required: true, description: "Your question" },
                { name: "context", required: false, description: "Additional context" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/coachreflect/api/coaching_chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"message": "What have I improved on most this season?"}'`}
            />
          </div>
        </div>

        {/* PlayerReflection endpoints */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            PlayerReflection
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Base: <code className="text-xs font-mono text-[var(--accent)]">https://mcp.360tft.com/playerreflection/api/</code>
          </p>
          <div className="space-y-4">
            <EndpointSection
              product="PlayerReflection"
              tool="log-reflection"
              description="Log player session reflections with mood, energy, and performance self-assessment."
              params={[
                { name: "reflection", required: true, description: "The player's session reflection" },
                { name: "sessionType", required: false, description: "training, match, individual, gym, recovery" },
                { name: "mood", required: false, description: "great, good, neutral, challenging, difficult" },
                { name: "energy", required: false, description: "high, medium, low" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/playerreflection/api/log_reflection \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"reflection": "Felt sharp today. First touch was much better than last week."}'`}
            />
            <EndpointSection
              product="PlayerReflection"
              tool="get-patterns"
              description="Analyse player reflections to find patterns in performance, mood, and development areas."
              params={[
                { name: "timeRange", required: false, description: "week, month, quarter, all" },
                { name: "focus", required: false, description: "technical, tactical, physical, mental" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/playerreflection/api/get_patterns \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"timeRange": "month"}'`}
            />
            <EndpointSection
              product="PlayerReflection"
              tool="player-chat"
              description="Chat with your reflection history. Ask questions about your development as a player."
              params={[
                { name: "message", required: true, description: "Your question" },
                { name: "context", required: false, description: "Additional context" },
              ]}
              curl={`curl -X POST https://mcp.360tft.com/playerreflection/api/player_chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tft_sk_your_key_here" \\
  -d '{"message": "What areas have I improved most this month?"}'`}
            />
          </div>
        </div>

        {/* Response format */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
            Response format
          </h2>
          <div className="space-y-4">
            <CodeBlock
              label="Success (200)"
              code={`{
  "text": "Here is the coaching advice...",
  "toolName": "get_coaching_advice"
}`}
            />
            <CodeBlock
              label="Rate limit exceeded (429)"
              code={`{
  "error": "Rate limit exceeded",
  "message": "You have used all 10 free calls today.",
  "upgrade_url": "https://footballgpt.co/pricing"
}`}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-2">
            Get started
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Create a free API key and start calling tools in minutes.
          </p>
          <Link
            href="/developer"
            className="inline-block text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors"
          >
            Go to Developer Portal
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
