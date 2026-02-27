/**
 * Quality rubric for tool submissions.
 * Auto-scores submissions and flags issues.
 * Score >= 70 with no critical flags = auto-approve candidate.
 */

interface RubricResult {
  score: number;
  flags: string[];
  autoApprove: boolean;
}

const FOOTBALL_KEYWORDS = [
  "football",
  "soccer",
  "coaching",
  "coach",
  "drill",
  "session",
  "training",
  "tactic",
  "formation",
  "referee",
  "offside",
  "goal",
  "player",
  "pitch",
  "match",
  "league",
  "club",
  "academy",
  "grassroots",
  "scouting",
  "scout",
  "goalkeeper",
  "striker",
  "defender",
  "midfielder",
  "fitness",
  "sport",
];

const SPAM_PATTERNS = [
  /buy\s+now/i,
  /click\s+here/i,
  /free\s+money/i,
  /casino/i,
  /crypto\s+trading/i,
  /make\s+\$?\d+/i,
  /limited\s+time\s+offer/i,
];

export function scoreSubmission(submission: {
  name: string;
  description: string;
  category: string;
  toolType?: string;
  connectionUrl?: string;
  email: string;
}): RubricResult {
  let score = 0;
  const flags: string[] = [];

  // 1. Name quality (0-15 points)
  if (submission.name.length >= 3) score += 5;
  if (submission.name.length >= 5 && submission.name.length <= 50) score += 10;
  if (submission.name.length > 100) flags.push("name_too_long");

  // 2. Description quality (0-25 points)
  const descLen = submission.description.length;
  if (descLen >= 20) score += 5;
  if (descLen >= 50) score += 10;
  if (descLen >= 100) score += 10;
  if (descLen < 20) flags.push("description_too_short");

  // 3. Football relevance (0-30 points)
  const combined = `${submission.name} ${submission.description}`.toLowerCase();
  const matchedKeywords = FOOTBALL_KEYWORDS.filter((kw) =>
    combined.includes(kw)
  );
  if (matchedKeywords.length >= 1) score += 10;
  if (matchedKeywords.length >= 2) score += 10;
  if (matchedKeywords.length >= 3) score += 10;
  if (matchedKeywords.length === 0) flags.push("not_football_related");

  // 4. Tool type provided (0-10 points)
  if (submission.toolType) score += 10;

  // 5. Connection URL provided (0-10 points)
  if (submission.connectionUrl) {
    score += 10;
    try {
      new URL(submission.connectionUrl);
    } catch {
      score -= 5;
      flags.push("invalid_connection_url");
    }
  }

  // 6. Valid email (0-10 points)
  if (submission.email.includes("@") && submission.email.includes(".")) {
    score += 10;
  }

  // 7. Spam check (critical flag)
  const isSpam = SPAM_PATTERNS.some((p) => p.test(combined));
  if (isSpam) {
    flags.push("spam_detected");
    score = Math.max(0, score - 50);
  }

  // Determine auto-approve eligibility
  const criticalFlags = ["spam_detected", "not_football_related"];
  const hasCriticalFlag = flags.some((f) => criticalFlags.includes(f));
  const autoApprove = score >= 70 && !hasCriticalFlag;

  return {
    score: Math.min(100, Math.max(0, score)),
    flags,
    autoApprove,
  };
}
