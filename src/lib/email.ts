import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) return;

  const from =
    process.env.RESEND_FROM_EMAIL || "AI Football <hello@send.aifootball.co>";

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch {
    // Non-critical — don't block flows
  }
}

function getAdminEmail(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || "kevin@360tft.com";
}

export async function sendWelcomeEmail(email: string, name: string) {
  await send(
    email,
    "Welcome to AI Football",
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Welcome, ${name}</h2>
      <p style="color: #aaa; line-height: 1.6;">
        You're in. AI Football is the marketplace for AI tools built for football coaches, referees, and scouts.
      </p>
      <p style="color: #aaa; line-height: 1.6;">Here's what you can do now:</p>
      <ul style="color: #aaa; line-height: 1.8;">
        <li><strong style="color: #fff;">Browse tools</strong> — Try coaching advice, session plans, law lookups, and more</li>
        <li><strong style="color: #fff;">Get API keys</strong> — Build your own apps on top of our tools</li>
        <li><strong style="color: #fff;">Save favourites</strong> — Bookmark tools you use often</li>
      </ul>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/dashboard" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Go to your dashboard
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function sendApiKeyCreatedEmail(
  email: string,
  keyPrefix: string,
  product: string
) {
  await send(
    email,
    "Your AI Football API key is ready",
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">API key created</h2>
      <p style="color: #aaa; line-height: 1.6;">
        Your new API key (<code style="background: #222; padding: 2px 6px; border-radius: 4px; color: #16a34a;">${keyPrefix}...</code>) for <strong style="color: #fff;">${product === "all" ? "All Products" : product}</strong> is active.
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        Free tier includes 10 API calls per day. Check the developer docs to get started.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/developer" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View API docs
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function sendToolApprovedEmail(email: string, toolName: string) {
  await send(
    email,
    `Your tool "${toolName}" has been approved`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Tool approved</h2>
      <p style="color: #aaa; line-height: 1.6;">
        <strong style="color: #fff;">${toolName}</strong> has been approved and is now live on AI Football.
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        Coaches can now discover and use your tool. You can track usage from your creator dashboard.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/dashboard/creator" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View your creator dashboard
        </a>
      </p>
    </div>
    `
  );
}

export async function sendToolRejectedEmail(email: string, toolName: string) {
  await send(
    email,
    `Update on your tool submission "${toolName}"`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Submission update</h2>
      <p style="color: #aaa; line-height: 1.6;">
        Unfortunately, <strong style="color: #fff;">${toolName}</strong> wasn't approved for the marketplace at this time.
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        This usually means the tool needs additional documentation, a more complete MCP implementation, or doesn't fit the current marketplace categories. You can resubmit after making changes.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/submit" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Resubmit
        </a>
      </p>
    </div>
    `
  );
}

export async function sendWeeklyUsageSummary(
  email: string,
  stats: {
    toolTries: number;
    apiCalls: number;
    topTools: string[];
    trendingTools: string[];
  }
) {
  const topToolsList = stats.topTools.length
    ? stats.topTools.map((t) => `<li style="color: #aaa;">${t}</li>`).join("")
    : '<li style="color: #666;">No tools used this week</li>';

  const trendingList = stats.trendingTools.length
    ? stats.trendingTools
        .map((t) => `<li style="color: #aaa;">${t}</li>`)
        .join("")
    : '<li style="color: #666;">No trending tools</li>';

  await send(
    email,
    "Your AI Football weekly summary",
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Your week on AI Football</h2>
      <div style="display: flex; gap: 16px; margin: 16px 0;">
        <div style="flex: 1; background: #111; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #fff;">${stats.toolTries}</div>
          <div style="font-size: 12px; color: #666;">Tool tries</div>
        </div>
        <div style="flex: 1; background: #111; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #fff;">${stats.apiCalls}</div>
          <div style="font-size: 12px; color: #666;">API calls</div>
        </div>
      </div>
      <h3 style="color: #fff; margin-top: 24px;">Your most-used tools</h3>
      <ul style="line-height: 1.8;">${topToolsList}</ul>
      <h3 style="color: #fff; margin-top: 24px;">Trending across all users</h3>
      <ul style="line-height: 1.8;">${trendingList}</ul>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/dashboard" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View your dashboard
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function sendRateLimitWarning(
  email: string,
  usage: number,
  limit: number
) {
  await send(
    email,
    "You're approaching your API limit",
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">API usage alert</h2>
      <p style="color: #aaa; line-height: 1.6;">
        You've used <strong style="color: #fff;">${usage}</strong> of your <strong style="color: #fff;">${limit}</strong> daily API calls (${Math.round((usage / limit) * 100)}%).
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        Upgrade to the Developer tier for 1,000 calls per day.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/developer" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Upgrade now
        </a>
      </p>
    </div>
    `
  );
}

// Product-specific install nurture emails
const PRODUCT_NURTURE: Record<
  string,
  { subject: string; productName: string; productUrl: string; tips: string[] }
> = {
  footballgpt: {
    subject: "Your FootballGPT tools are ready",
    productName: "FootballGPT",
    productUrl: "https://footballgpt.co",
    tips: [
      "Ask for session plans with specific age groups and topics for the best results",
      "Try the Animated Drill Creator to turn text into visual drill diagrams",
      "Use Player Stats Search to look up real stats from 100+ leagues",
      "The Drill Library has community-contributed exercises you can filter by topic",
    ],
  },
  refereegpt: {
    subject: "Your RefereeGPT tools are ready",
    productName: "RefereeGPT",
    productUrl: "https://refereegpt.co",
    tips: [
      "Ask about specific match situations for accurate law references",
      "Use the Quiz Generator to practise for referee exams",
      "The Incident Analyzer gives you specific IFAB law numbers and clauses",
      "Specify your country for local rule variations (9 countries supported)",
    ],
  },
  coachreflect: {
    subject: "Your CoachReflect tools are ready",
    productName: "CoachReflect",
    productUrl: "https://coachreflection.com",
    tips: [
      "Log a reflection after every session to build your coaching journal",
      "After 5+ reflections, use Pattern Finder to see themes in your coaching",
      "Try the Journal Chat to ask questions about your own development",
      "Include your mood and energy level for richer pattern analysis",
    ],
  },
};

export async function sendInstallNurtureEmail(
  email: string,
  toolSlug: string
) {
  // Map tool slugs to product keys
  const productMap: Record<string, string> = {
    "coaching-advice": "footballgpt",
    "session-plan-generator": "footballgpt",
    "animated-drill-creator": "footballgpt",
    "player-stats-search": "footballgpt",
    "drill-library-search": "footballgpt",
    "law-lookup": "refereegpt",
    "incident-analyzer": "refereegpt",
    "referee-quiz": "refereegpt",
    "coaching-reflection": "coachreflect",
    "coaching-patterns": "coachreflect",
    "coaching-journal-chat": "coachreflect",
  };

  const productKey = productMap[toolSlug];
  if (!productKey) return;

  const nurture = PRODUCT_NURTURE[productKey];
  if (!nurture) return;

  const tipsList = nurture.tips
    .map(
      (tip) =>
        `<li style="color: #aaa; margin-bottom: 8px; line-height: 1.5;">${tip}</li>`
    )
    .join("");

  await send(
    email,
    nurture.subject,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">You've installed ${nurture.productName}</h2>
      <p style="color: #aaa; line-height: 1.6;">
        Great choice. Here are some tips to get the most out of it:
      </p>
      <ul style="padding-left: 16px; margin: 16px 0;">
        ${tipsList}
      </ul>
      <p style="color: #aaa; line-height: 1.6;">
        These tools work best inside Claude Desktop. If you haven't set it up yet, follow the
        <a href="https://aifootball.co/docs/claude-desktop" style="color: #16a34a;">setup guide</a>.
      </p>
      <p style="margin-top: 24px;">
        <a href="${nurture.productUrl}" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Open ${nurture.productName}
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function sendSequenceEmail(
  to: string,
  subject: string,
  html: string
) {
  await send(to, subject, html);
}

export async function notifyNewSignup(email: string) {
  await send(
    getAdminEmail(),
    `New AI Football signup: ${email}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <h2 style="color: #fff;">New signup</h2>
      <p style="color: #aaa;">${email} just signed up to AI Football.</p>
      <p style="margin-top: 16px;">
        <a href="https://aifootball.co/admin" style="color: #16a34a;">View admin dashboard</a>
      </p>
    </div>
    `
  );
}

const TIER_LABELS: Record<string, { label: string; price: string }> = {
  hero: { label: "Hero Banner", price: "$99/month" },
  grid: { label: "Grid Promoted", price: "$49/month" },
  detail: { label: "Detail Page", price: "$29/month" },
};

export async function sendSponsorshipConfirmation(
  email: string,
  toolSlug: string,
  tier: string
) {
  const tierInfo = TIER_LABELS[tier] || {
    label: tier,
    price: "",
  };
  const toolName = toolSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  await send(
    email,
    `Your ${tierInfo.label} sponsorship is live`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Sponsorship active</h2>
      <p style="color: #aaa; line-height: 1.6;">
        <strong style="color: #fff;">${toolName}</strong> is now promoted with a <strong style="color: #f59e0b;">${tierInfo.label}</strong> placement (${tierInfo.price}).
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        Your tool will appear in the sponsored placement immediately. You can manage your subscription from Stripe.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/dashboard/creator" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View your dashboard
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function sendSponsorshipCancelled(
  email: string,
  toolSlug: string,
  tier: string
) {
  const tierInfo = TIER_LABELS[tier] || {
    label: tier,
    price: "",
  };
  const toolName = toolSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  await send(
    email,
    `Your ${tierInfo.label} sponsorship has ended`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #fff;">Sponsorship ended</h2>
      <p style="color: #aaa; line-height: 1.6;">
        The <strong style="color: #f59e0b;">${tierInfo.label}</strong> sponsorship for <strong style="color: #fff;">${toolName}</strong> has been cancelled.
      </p>
      <p style="color: #aaa; line-height: 1.6;">
        Your tool will no longer appear in sponsored placements. You can reactivate at any time from your creator dashboard.
      </p>
      <p style="margin-top: 24px;">
        <a href="https://aifootball.co/dashboard/creator" style="display: inline-block; background: #16a34a; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reactivate sponsorship
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">
        AI Football — The AI agent marketplace for football
      </p>
    </div>
    `
  );
}

export async function notifyToolSubmission(email: string, toolName: string) {
  await send(
    getAdminEmail(),
    `New tool submission: ${toolName}`,
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <h2 style="color: #fff;">New tool submitted</h2>
      <p style="color: #aaa;"><strong style="color: #fff;">${toolName}</strong> submitted by ${email}.</p>
      <p style="margin-top: 16px;">
        <a href="https://aifootball.co/admin" style="color: #16a34a;">Review in admin dashboard</a>
      </p>
    </div>
    `
  );
}
