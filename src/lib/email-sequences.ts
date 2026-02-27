import { getSupabaseAdmin } from "./supabase/admin";

// Shared email wrapper
const WRAPPER_START = `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #aaa;">`;
const WRAPPER_END = `<p style="color: #555; font-size: 11px; margin-top: 40px; border-top: 1px solid #222; padding-top: 16px;">AI Football — aifootball.co<br/><a href="https://aifootball.co/unsubscribe?email={{email}}" style="color: #555;">Unsubscribe</a></p></div>`;

function wrap(email: string, body: string): string {
  return `${WRAPPER_START}${body}${WRAPPER_END}`.replace(/\{\{email\}\}/g, encodeURIComponent(email));
}

const CTA = (href: string, text: string) =>
  `<p style="margin-top: 24px;"><a href="${href}" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">${text}</a></p>`;

// ============================================================
// CONSUMER SEQUENCE
// Triggered when someone installs a tool (email capture flow)
// ============================================================

interface SequenceEmail {
  delayDays: number;
  subject: string;
  html: (email: string, sourceTool?: string) => string;
}

export const CONSUMER_SEQUENCE: SequenceEmail[] = [
  // Step 0: sent immediately by sendInstallNurtureEmail — skip in cron
  // Step 1: Day 2 — cross-sell other tools
  {
    delayDays: 2,
    subject: "3 more tools you should try",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">You've tried one tool. Here are three more.</h2>
      <p style="line-height: 1.6;">
        AI Football has 11 tools across coaching, refereeing, and analytics. Here are the ones coaches use most:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 12px; border: 1px solid #222; border-radius: 8px;">
            <strong style="color: #fff;">Session Plan Generator</strong><br/>
            <span style="font-size: 13px;">Generate a full training session in seconds. Just say the age group and topic.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #222; border-radius: 8px;">
            <strong style="color: #fff;">Animated Drill Creator</strong><br/>
            <span style="font-size: 13px;">Describe a drill in plain English and watch it come to life as an animation.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #222; border-radius: 8px;">
            <strong style="color: #fff;">Law of the Game Lookup</strong><br/>
            <span style="font-size: 13px;">Settle any rules argument with accurate IFAB law references.</span>
          </td>
        </tr>
      </table>
      ${CTA("https://aifootball.co", "Browse all tools")}
      `
      ),
  },
  // Step 2: Day 5 — developer pitch or Skool
  {
    delayDays: 5,
    subject: "Want to build with these tools?",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">Two ways to go deeper</h2>
      <p style="line-height: 1.6;">
        If you're a coach who wants to learn AI, or a developer who wants to build football tools, there's a path for you.
      </p>
      <div style="background: #111; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <strong style="color: #fff;">For coaches: AI Football Skool (free)</strong>
        <p style="font-size: 13px; margin-top: 4px;">
          A 30-day course teaching coaches how to use AI. Prompts, templates, and a community of coaches doing the same thing.
        </p>
        ${CTA("https://www.skool.com/aifootball", "Join for free")}
      </div>
      <div style="background: #111; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <strong style="color: #fff;">For developers: Get an API key</strong>
        <p style="font-size: 13px; margin-top: 4px;">
          10 free API calls per day. Build your own apps on top of our coaching, refereeing, and analytics tools.
        </p>
        ${CTA("https://aifootball.co/developer", "Get your API key")}
      </div>
      `
      ),
  },
  // Step 3: Day 14 — Builder Bootcamp pitch
  {
    delayDays: 14,
    subject: "Build your own football AI tool",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">What if you could build your own?</h2>
      <p style="line-height: 1.6;">
        Every tool on AI Football was built by one person. Coach Kevin built FootballGPT, RefereeGPT, and CoachReflect using Claude Code and the same stack you can learn.
      </p>
      <p style="line-height: 1.6;">
        The Builder Bootcamp gives you:
      </p>
      <ul style="line-height: 1.8;">
        <li><strong style="color: #fff;">The FootballGPT codebase</strong> — clone it, rebrand it, make it yours</li>
        <li><strong style="color: #fff;">API keys to all products</strong> — build on top of existing tools</li>
        <li><strong style="color: #fff;">30-day curriculum</strong> — from zero to deployed AI product</li>
        <li><strong style="color: #fff;">Weekly calls with Kevin</strong> — get unstuck, get feedback</li>
      </ul>
      <p style="line-height: 1.6;">
        It's not a course about AI. It's a course where you build something real.
      </p>
      ${CTA("https://www.skool.com/aifootball", "Learn more about Builder Bootcamp")}
      `
      ),
  },
];

// ============================================================
// CREATOR SEQUENCE
// Triggered when someone submits a tool
// ============================================================

export const CREATOR_SEQUENCE: SequenceEmail[] = [
  // Step 0: submission confirmation sent by notifyToolSubmission — skip in cron
  // Step 1: Day 3 — tips for getting more installs
  {
    delayDays: 3,
    subject: "How to get more installs for your tool",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">Your tool is listed. Here's how to get installs.</h2>
      <p style="line-height: 1.6;">
        Most tools on the marketplace get discovered through search and browsing. Here's how to make yours stand out:
      </p>
      <ol style="line-height: 1.8;">
        <li><strong style="color: #fff;">Write a clear description.</strong> Lead with what it does for the user, not how it works technically. "Helps grassroots coaches plan sessions in 30 seconds" beats "AI session planner API".</li>
        <li><strong style="color: #fff;">Pick the right category.</strong> A tool for referee training goes in Refereeing, not Coaching. Specific categories get more targeted traffic.</li>
        <li><strong style="color: #fff;">Share your listing link.</strong> Post it on Twitter, in coaching groups, or wherever your audience is. Direct links to your tool page work best.</li>
        <li><strong style="color: #fff;">Add documentation.</strong> Tools with a docs link get more installs because users trust them more.</li>
      </ol>
      ${CTA("https://aifootball.co/docs/submit", "Read the full guidelines")}
      `
      ),
  },
  // Step 2: Day 7 — community pitch
  {
    delayDays: 7,
    subject: "Join the AI Football community",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">You're building football AI tools. So are we.</h2>
      <p style="line-height: 1.6;">
        AI Football Skool is a free community of coaches, developers, and entrepreneurs building AI tools for football. It's where Kevin (the founder) shares what's working, what's not, and what's coming next.
      </p>
      <p style="line-height: 1.6;">
        Inside, you'll find:
      </p>
      <ul style="line-height: 1.8;">
        <li>A 30-day AI course designed for football people</li>
        <li>Ready-to-use prompts and templates</li>
        <li>Kevin's build-in-public updates</li>
        <li>Weekly community calls (Sundays)</li>
      </ul>
      <p style="line-height: 1.6;">
        It's free. No upsell on entry.
      </p>
      ${CTA("https://www.skool.com/aifootball", "Join AI Football Skool")}
      `
      ),
  },
  // Step 3: Day 14 — strategy call / bootcamp
  {
    delayDays: 14,
    subject: "Want help building your football AI business?",
    html: (email) =>
      wrap(
        email,
        `
      <h2 style="color: #fff;">From tool to business</h2>
      <p style="line-height: 1.6;">
        You've already built something and listed it on AI Football. That puts you ahead of most people in this space.
      </p>
      <p style="line-height: 1.6;">
        If you want to go further, there are two options:
      </p>
      <div style="background: #111; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <strong style="color: #fff;">Builder Bootcamp ($497)</strong>
        <p style="font-size: 13px; margin-top: 4px;">
          Get the FootballGPT codebase, API keys to all products, a 30-day build curriculum, and weekly calls with Kevin. You walk away with a deployed, monetisable AI product.
        </p>
      </div>
      <div style="background: #111; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <strong style="color: #fff;">1:1 Strategy Call (£297)</strong>
        <p style="font-size: 13px; margin-top: 4px;">
          90 minutes with Kevin. Bring your tool, your idea, or your business. Walk away with a clear plan, technical direction, and next steps.
        </p>
      </div>
      <p style="line-height: 1.6;">
        Both start with a conversation. Reply to this email if you want to chat about which fits.
      </p>
      ${CTA("https://www.skool.com/aifootball", "Learn more")}
      `
      ),
  },
];

// ============================================================
// SEQUENCE ENGINE
// ============================================================

/**
 * Start a sequence for an email address.
 * Called from email-capture (consumer) or submit-tool (creator).
 */
export async function startSequence(
  email: string,
  type: "consumer" | "creator",
  sourceTool?: string
) {
  const db = getSupabaseAdmin();
  if (!db) return;

  await db.from("email_sequences").upsert(
    {
      email: email.toLowerCase().trim(),
      sequence_type: type,
      current_step: 0,
      source_tool: sourceTool || null,
      started_at: new Date().toISOString(),
      completed: false,
      unsubscribed: false,
    },
    { onConflict: "email,sequence_type" }
  );
}

/**
 * Process pending sequence emails.
 * Called by the cron job. Finds sequences where enough time has passed
 * for the next step and sends the email.
 */
export async function processSequences(): Promise<{
  sent: number;
  errors: number;
}> {
  const db = getSupabaseAdmin();
  if (!db) return { sent: 0, errors: 0 };

  // Dynamic import to avoid circular dependency
  const { sendSequenceEmail } = await import("./email");

  let sent = 0;
  let errors = 0;

  const sequences = { consumer: CONSUMER_SEQUENCE, creator: CREATOR_SEQUENCE };

  for (const [type, steps] of Object.entries(sequences)) {
    // Get all active, non-completed sequences of this type
    const { data: active } = await db
      .from("email_sequences")
      .select("*")
      .eq("sequence_type", type)
      .eq("completed", false)
      .eq("unsubscribed", false);

    if (!active) continue;

    for (const seq of active) {
      const nextStep = seq.current_step;

      // Check if there are more steps
      if (nextStep >= steps.length) {
        await db
          .from("email_sequences")
          .update({ completed: true })
          .eq("id", seq.id);
        continue;
      }

      const step = steps[nextStep];
      const startedAt = new Date(seq.started_at).getTime();
      const now = Date.now();
      const daysSinceStart = (now - startedAt) / (1000 * 60 * 60 * 24);

      // Check if enough time has passed for this step
      if (daysSinceStart < step.delayDays) continue;

      // Check we haven't already sent today (prevent double-sends)
      if (seq.last_sent_at) {
        const lastSent = new Date(seq.last_sent_at).getTime();
        const hoursSinceLastSend = (now - lastSent) / (1000 * 60 * 60);
        if (hoursSinceLastSend < 20) continue;
      }

      try {
        await sendSequenceEmail(
          seq.email,
          step.subject,
          step.html(seq.email, seq.source_tool || undefined)
        );

        const isLastStep = nextStep >= steps.length - 1;

        await db
          .from("email_sequences")
          .update({
            current_step: nextStep + 1,
            last_sent_at: new Date().toISOString(),
            completed: isLastStep,
          })
          .eq("id", seq.id);

        sent++;
      } catch {
        errors++;
      }
    }
  }

  return { sent, errors };
}
