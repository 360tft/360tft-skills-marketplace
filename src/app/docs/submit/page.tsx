import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Guidelines | AI Football",
  description:
    "Guidelines for listing your football AI tool on the AI Football marketplace. What we accept, how review works, and tips for a successful listing.",
};

export default function SubmitGuidelinesPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
          <Link
            href="/"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/docs"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            Docs
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Submission Guidelines</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Submission Guidelines
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8">
          AI Football is an open directory for football AI tools. Listing is
          free. Here&apos;s what we accept and how the review process works.
        </p>

        {/* What we accept */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            What we accept
          </h2>
          <div className="space-y-3">
            {[
              {
                type: "MCP Servers",
                desc: "Model Context Protocol servers that work with Claude Desktop. Provide the server URL and we'll verify the connection.",
              },
              {
                type: "APIs / Web Apps",
                desc: "REST APIs or web applications with football AI features. Provide the base URL and documentation link.",
              },
              {
                type: "Claude Skills",
                desc: "Claude Code skill files (.md) with prompts and instructions for football coaching tasks. Link to the GitHub repo or raw file.",
              },
              {
                type: "Custom GPTs",
                desc: "Custom GPTs built on OpenAI's GPT Store for football use cases. Provide the GPT Store link.",
              },
            ].map((item) => (
              <div
                key={item.type}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-1">
                  {item.type}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Requirements
          </h2>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5 shrink-0">1.</span>
              <span>
                <strong className="text-[var(--foreground)]">
                  Football related.
                </strong>{" "}
                The tool must be about football (soccer). Coaching, refereeing,
                player development, scouting, analytics, club management, or
                content creation for football.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5 shrink-0">2.</span>
              <span>
                <strong className="text-[var(--foreground)]">
                  Working connection.
                </strong>{" "}
                The URL you provide must be accessible. We&apos;ll test the
                connection as part of the review.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5 shrink-0">3.</span>
              <span>
                <strong className="text-[var(--foreground)]">
                  Clear description.
                </strong>{" "}
                Tell users what the tool does and who it&apos;s for. At least a
                couple of sentences.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5 shrink-0">4.</span>
              <span>
                <strong className="text-[var(--foreground)]">No spam.</strong>{" "}
                No misleading descriptions, no tools that exist solely to redirect
                traffic, no malware.
              </span>
            </li>
          </ul>
        </section>

        {/* Review process */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            How review works
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-sm text-[var(--muted-foreground)]">
            <p>
              Every submission goes through an automated quality check. Tools
              that clearly meet all four requirements above are approved
              automatically. Edge cases are reviewed manually within a few days.
            </p>
            <p>
              Once approved, your tool appears in the directory with a
              &quot;Community&quot; badge. You&apos;ll receive an email
              confirmation at the address you provided.
            </p>
            <p>
              If your submission is rejected, we&apos;ll email you with the
              reason and you&apos;re welcome to resubmit.
            </p>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Tips for a good listing
          </h2>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">+</span>
              Write a description that explains the value, not just the
              features. &quot;Helps grassroots coaches plan sessions in 30
              seconds&quot; beats &quot;AI session planner tool&quot;.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">+</span>
              Choose the most specific category. A tool for referee training
              goes in &quot;Refereeing&quot;, not &quot;Coaching&quot;.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">+</span>
              If your tool has documentation, include the link. It helps users
              get started faster.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">+</span>
              Make sure your tool is accessible before submitting. We test the
              connection during review.
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
          <h2 className="font-semibold text-[var(--foreground)] mb-2">
            Ready to list your tool?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            It takes less than a minute. Completely free.
          </p>
          <Link
            href="/submit"
            className="inline-block px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Submit your tool
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
