export type ToolCategory =
  | "coaching"
  | "refereeing"
  | "player_dev"
  | "club_mgmt"
  | "analytics"
  | "content";

export type PricingType = "free" | "freemium" | "paid";
export type AuthorType = "official" | "community";
export type InstallMethod = "claude_desktop" | "chatgpt" | "web";

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  iconEmoji: string;
  authorName: string;
  authorType: AuthorType;
  mcpServerPath: string;
  mcpToolName: string;
  pricingType: PricingType;
  productUrl?: string;
  gumroadUrl?: string;
  chatgptUrl?: string;
  isPublished: boolean;
  installCount: number;
  avgRating: number;
  reviewCount: number;
  exampleQueries: string[];
  inputParams: { name: string; description: string; required: boolean }[];
  badges: string[];
  installMethods: InstallMethod[];
}

export const CATEGORIES: { value: ToolCategory; label: string }[] = [
  { value: "coaching", label: "Coaching" },
  { value: "refereeing", label: "Refereeing" },
  { value: "player_dev", label: "Player Development" },
  { value: "club_mgmt", label: "Club Management" },
  { value: "analytics", label: "Analytics" },
  { value: "content", label: "Content" },
];

export const tools: Tool[] = [
  // ===== FootballGPT (5 tools) =====
  {
    id: "fgpt-coaching-advice",
    slug: "coaching-advice",
    name: "Coaching Advice",
    description:
      "Ask 18 specialist AI advisors for football coaching guidance. Grassroots, academy, pro level, goalkeeping, scouting, and more.",
    longDescription:
      "Access 18 specialist AI advisors covering every aspect of football coaching. Whether you need grassroots session ideas, academy development frameworks, professional tactical analysis, goalkeeper training, or scouting insights, each advisor brings deep domain expertise. Powered by FootballGPT's coaching intelligence built on real coaching experience.\n\nAdvisors include: Grassroots Guru, Academy Mind, Sunday Specialist, Pro's Pro, GK Coach, Scout Advisor, and more across Coach Mode, Player Mode, and FM Mode.",
    category: "coaching",
    iconEmoji: "\u26BD",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "footballgpt",
    mcpToolName: "get_coaching_advice",
    pricingType: "freemium",
    productUrl: "https://footballgpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.8,
    reviewCount: 0,
    exampleQueries: [
      "What are good warm-up activities for U10s?",
      "How do I teach a 4-3-3 pressing system?",
      "My striker has lost confidence. How do I help?",
      "What should I focus on in pre-season for grassroots?",
    ],
    inputParams: [
      {
        name: "message",
        description: "Your coaching question",
        required: true,
      },
      {
        name: "mode",
        description: "coach, player, or fm",
        required: false,
      },
      {
        name: "advisor",
        description: "Specific advisor (e.g. grassroots, academy, pro)",
        required: false,
      },
      {
        name: "ageGroup",
        description: "e.g. U10, U14, Senior",
        required: false,
      },
    ],
    badges: ["Official", "Popular"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },
  {
    id: "fgpt-session-plan",
    slug: "session-plan-generator",
    name: "Session Plan Generator",
    description:
      "Generate complete training session plans with warm-up, main activity, and cool-down. Tailored to age group, topic, and player count.",
    longDescription:
      "Generate professional, structured training session plans in seconds. Each plan includes warm-up activities, main coaching points, progressions, and cool-down. Tailored to your specific age group, session duration, number of players, and coaching topic. Based on real coaching methodology, not generic templates.",
    category: "coaching",
    iconEmoji: "\uD83D\uDCCB",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "footballgpt",
    mcpToolName: "generate_session_plan",
    pricingType: "freemium",
    productUrl: "https://footballgpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.9,
    reviewCount: 0,
    exampleQueries: [
      "Create a 60-minute U12 session on 1v1 defending",
      "Plan a warm-up focused on ball mastery for U8s",
      "Design a session on building from the back for U16",
      "Create a 90-minute session on pressing triggers for adults",
    ],
    inputParams: [
      {
        name: "topic",
        description: "What the session covers (e.g. defending, passing)",
        required: true,
      },
      { name: "ageGroup", description: "e.g. U10, U14, Senior", required: true },
      {
        name: "duration",
        description: "Session length in minutes",
        required: false,
      },
      {
        name: "playerCount",
        description: "Number of players expected",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },
  {
    id: "fgpt-animate-drill",
    slug: "animated-drill-creator",
    name: "Animated Drill Creator",
    description:
      "Turn text descriptions into animated football drill diagrams with player movements, passes, and runs.",
    longDescription:
      "Describe any football drill and get an animated diagram showing player positions, movement patterns, passing sequences, and runs. The animation includes play/pause controls, speed adjustment, and step navigation. Share drills with your coaching staff or use them in session planning.\n\nThis is a killer feature that no other coaching tool offers. Describe a drill in plain English and watch it come to life.",
    category: "coaching",
    iconEmoji: "\uD83C\uDFA8",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "footballgpt",
    mcpToolName: "animate_drill",
    pricingType: "freemium",
    productUrl: "https://footballgpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 5.0,
    reviewCount: 0,
    exampleQueries: [
      "Create a 4v2 rondo with rotation on loss of possession",
      "Animate a corner kick routine with near post run and far post cross",
      "Show a 3v1 overload drill progressing to 3v2",
      "Design a passing diamond with overlap runs",
    ],
    inputParams: [
      {
        name: "description",
        description: "Describe the drill in plain English",
        required: true,
      },
      {
        name: "category",
        description: "e.g. passing, defending, set-piece",
        required: false,
      },
      {
        name: "ageGroup",
        description: "e.g. U10, U14, Senior",
        required: false,
      },
    ],
    badges: ["Official", "Popular"],
    installMethods: ["claude_desktop", "web"],
  },
  {
    id: "fgpt-player-stats",
    slug: "player-stats-search",
    name: "Player Stats Search",
    description:
      "Search real player statistics from 100+ football leagues. Goals, assists, xG, per-90 metrics, and more.",
    longDescription:
      "Access real-time player statistics from over 100 football leagues worldwide. Search by player name, league, position, or season. Data includes goals, assists, expected goals (xG), per-90 metrics, age, nationality, and more. Powered by API-Football and soccerdata integration.\n\nPerfect for scouts, coaches doing opposition research, or anyone who wants quick access to verified stats without trawling through multiple websites.",
    category: "analytics",
    iconEmoji: "\uD83D\uDCCA",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "footballgpt",
    mcpToolName: "search_player_stats",
    pricingType: "freemium",
    productUrl: "https://footballgpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.7,
    reviewCount: 0,
    exampleQueries: [
      "What are Bukayo Saka's stats this season?",
      "Compare Kane and Haaland's goals per 90",
      "Top 5 Championship scorers this season",
      "Find players under 21 with 5+ goals in League One",
    ],
    inputParams: [
      { name: "name", description: "Player name to search", required: false },
      { name: "league", description: "League name", required: false },
      { name: "position", description: "Player position", required: false },
      { name: "season", description: "e.g. 2024-2025", required: false },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },
  {
    id: "fgpt-search-drills",
    slug: "drill-library-search",
    name: "Drill Library Search",
    description:
      "Search the community drill library for training exercises by topic, age group, and category.",
    longDescription:
      "Browse and search a growing library of football training drills contributed by coaches. Filter by category (passing, shooting, defending, etc.), age group, and difficulty. Each drill includes setup instructions, coaching points, and progressions. Save your favourites and share with your coaching team.",
    category: "coaching",
    iconEmoji: "\uD83D\uDD0D",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "footballgpt",
    mcpToolName: "search_drills",
    pricingType: "free",
    productUrl: "https://footballgpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.5,
    reviewCount: 0,
    exampleQueries: [
      "Find U12 passing drills",
      "Show me 1v1 defending exercises",
      "Warm-up activities for U8s",
      "Shooting drills for small groups",
    ],
    inputParams: [
      { name: "query", description: "What kind of drill", required: true },
      {
        name: "category",
        description: "e.g. passing, shooting, defending",
        required: false,
      },
      {
        name: "ageGroup",
        description: "e.g. U10, U14, Senior",
        required: false,
      },
    ],
    badges: ["Official", "Free"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },

  // ===== RefereeGPT (3 tools) =====
  {
    id: "rgpt-check-law",
    slug: "law-lookup",
    name: "Law of the Game Lookup",
    description:
      "Search IFAB Laws of the Game with RAG. Get accurate law references for any match situation. 9 countries supported.",
    longDescription:
      "Instantly look up any Law of the Game from the IFAB rulebook. Uses RAG (Retrieval Augmented Generation) to search the complete IFAB documentation and return accurate, referenced answers. Supports 9 country-specific rule variations including England, Scotland, USA, Australia, and more.\n\nBuilt for referees studying for exams, coaches who want to understand the rules, and anyone who's had a touchline argument about offside.",
    category: "refereeing",
    iconEmoji: "\uD83D\uDCD6",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "refereegpt",
    mcpToolName: "check_law",
    pricingType: "freemium",
    productUrl: "https://refereegpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.9,
    reviewCount: 0,
    exampleQueries: [
      "Can a goalkeeper pick up a throw-in from their own player?",
      "What is the offside rule for deflections?",
      "When should a referee show a red card for serious foul play?",
      "What are the rules for substitutions in extra time?",
    ],
    inputParams: [
      { name: "query", description: "Your rules question", required: true },
      {
        name: "country",
        description: "Country for local rule variations",
        required: false,
      },
      {
        name: "refereeLevel",
        description: "Your referee level for appropriate detail",
        required: false,
      },
    ],
    badges: ["Official", "Popular"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },
  {
    id: "rgpt-analyze-incident",
    slug: "incident-analyzer",
    name: "Match Incident Analyzer",
    description:
      "Describe a match incident and get AI analysis with specific law references and the correct decision.",
    longDescription:
      "Describe any match incident in plain language and get a detailed analysis explaining which laws apply, what the correct decision should be, and why. Perfect for referee training, post-match discussions, or settling arguments.\n\nThe AI cross-references the full IFAB Laws of the Game and provides specific law numbers, clauses, and interpretations for every answer.",
    category: "refereeing",
    iconEmoji: "\uD83D\uDEA8",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "refereegpt",
    mcpToolName: "analyze_incident",
    pricingType: "freemium",
    productUrl: "https://refereegpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.8,
    reviewCount: 0,
    exampleQueries: [
      "A player takes off their shirt after scoring. What's the call?",
      "Defender handles the ball in the penalty area but it was hit from close range",
      "Goalkeeper holds the ball for 8 seconds. What happens?",
      "Player uses offensive language towards an opponent",
    ],
    inputParams: [
      {
        name: "description",
        description: "Describe the incident",
        required: true,
      },
      { name: "country", description: "Country for local rules", required: false },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },
  {
    id: "rgpt-quiz",
    slug: "referee-quiz",
    name: "Referee Knowledge Quiz",
    description:
      "Generate referee training quizzes on any topic. Multiple difficulty levels. Great for exam preparation.",
    longDescription:
      "Generate referee knowledge quizzes tailored to your level and topic. Choose from easy, medium, or hard difficulty. Topics cover all 17 Laws of the Game plus practical match scenarios. Each question includes the correct answer with full law references and explanations.\n\nPerfect for referees preparing for qualification exams or experienced officials wanting to stay sharp.",
    category: "refereeing",
    iconEmoji: "\u2753",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "refereegpt",
    mcpToolName: "generate_quiz",
    pricingType: "freemium",
    productUrl: "https://refereegpt.co",
    isPublished: true,
    installCount: 0,
    avgRating: 4.6,
    reviewCount: 0,
    exampleQueries: [
      "Quiz me on offside rules, medium difficulty",
      "5 questions on handball law for beginner referees",
      "Hard quiz on advantage and free kick decisions",
      "Test me on penalty area procedures",
    ],
    inputParams: [
      { name: "topic", description: "Law or topic to quiz on", required: true },
      {
        name: "difficulty",
        description: "easy, medium, or hard",
        required: false,
      },
      {
        name: "country",
        description: "Country for local rule variations",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "chatgpt", "web"],
  },

  // ===== CoachReflect (3 tools) =====
  {
    id: "cr-log-reflection",
    slug: "coaching-reflection",
    name: "Coaching Reflection Logger",
    description:
      "Log your coaching session reflections and get AI-powered analysis of your coaching patterns.",
    longDescription:
      "After each coaching session, log a quick reflection and get instant AI analysis. The tool identifies patterns in your coaching, highlights growth areas, and suggests improvements based on coaching frameworks. Over time, it builds a picture of your coaching development journey.\n\nTracks mood, energy levels, session type, and free-form reflection text. The AI connects dots between sessions you might miss yourself.",
    category: "coaching",
    iconEmoji: "\uD83D\uDCDD",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "coachreflect",
    mcpToolName: "log_reflection",
    pricingType: "freemium",
    productUrl: "https://coachreflection.com",
    isPublished: true,
    installCount: 0,
    avgRating: 4.7,
    reviewCount: 0,
    exampleQueries: [
      "Today's session went well. The 1v1 defending activity clicked with the U14s. I kept my instructions short and they responded much better.",
      "Struggled with engagement today. The U10s were distracted. I think the session was too complex for them.",
      "Great session on building from the back. The goalkeeper got involved naturally. Energy was high.",
    ],
    inputParams: [
      {
        name: "reflection",
        description: "Your session reflection",
        required: true,
      },
      {
        name: "sessionType",
        description: "e.g. training, match, meeting",
        required: false,
      },
      {
        name: "mood",
        description: "How you feel (1-5)",
        required: false,
      },
      {
        name: "energy",
        description: "Energy level (1-5)",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "web"],
  },
  {
    id: "cr-patterns",
    slug: "coaching-patterns",
    name: "Coaching Pattern Finder",
    description:
      "Analyse your coaching reflections to find recurring patterns, strengths, and areas for development.",
    longDescription:
      "Look across all your logged coaching reflections and discover patterns you might not see yourself. The AI identifies recurring themes, highlights your coaching strengths, flags potential blind spots, and suggests targeted development areas.\n\nRequires at least 5 logged reflections for meaningful analysis. The more reflections, the richer the patterns.",
    category: "coaching",
    iconEmoji: "\uD83D\uDD0E",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "coachreflect",
    mcpToolName: "get_patterns",
    pricingType: "freemium",
    productUrl: "https://coachreflection.com",
    isPublished: true,
    installCount: 0,
    avgRating: 4.6,
    reviewCount: 0,
    exampleQueries: [
      "What patterns do you see in my last 10 reflections?",
      "What are my coaching strengths based on my logs?",
      "Where am I struggling most consistently?",
    ],
    inputParams: [
      {
        name: "timeRange",
        description: "e.g. last week, last month, all time",
        required: false,
      },
      {
        name: "focus",
        description: "e.g. strengths, weaknesses, trends",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "web"],
  },
  {
    id: "cr-chat",
    slug: "coaching-journal-chat",
    name: "Coaching Journal Chat",
    description:
      "Chat with your coaching reflection history. Ask questions about your development, revisit old insights, get personalised advice.",
    longDescription:
      "Have a conversation with your coaching reflection journal. Ask questions like 'When was the last time I felt really confident after a session?' or 'What do I tend to struggle with on match days?' The AI uses your full reflection history to give personalised, contextual answers.\n\nIt's like having a coaching mentor who knows your entire journey.",
    category: "coaching",
    iconEmoji: "\uD83D\uDCAC",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "coachreflect",
    mcpToolName: "coaching_chat",
    pricingType: "freemium",
    productUrl: "https://coachreflection.com",
    isPublished: true,
    installCount: 0,
    avgRating: 4.5,
    reviewCount: 0,
    exampleQueries: [
      "What have I improved on most this season?",
      "When was my best session this month and why?",
      "What should I focus on improving next?",
    ],
    inputParams: [
      { name: "message", description: "Your question", required: true },
      {
        name: "context",
        description: "Additional context",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "web"],
  },

  // ===== Gumroad Content Tools =====
  {
    id: "gm-game-model",
    slug: "game-model-search",
    name: "360TFT Game Model Search",
    description:
      "Search Kevin's 750-page game model for age-appropriate coaching guidance, phase-of-play breakdowns, and development frameworks.",
    longDescription:
      "The 360TFT Game Model is a comprehensive 750+ page document covering every aspect of youth football development from U5 to Senior. It includes phase-of-play breakdowns, age-stage development guides, coaching principles, session frameworks, and more.\n\nThis tool lets you search the entire game model using natural language. Ask about any age group, phase of play, or coaching topic and get relevant paragraphs with section references.\n\nFree tier gives you 10 searches per day. The full document is available at 360tft.com.",
    category: "coaching",
    iconEmoji: "\uD83D\uDCD5",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "marketplace",
    mcpToolName: "search_game_model",
    pricingType: "freemium",
    gumroadUrl: "https://360tft.gumroad.com/l/360TFTGM",
    isPublished: true,
    installCount: 0,
    avgRating: 4.9,
    reviewCount: 0,
    exampleQueries: [
      "What should U10s focus on in possession?",
      "How should I develop goalkeepers at U12?",
      "What are the key principles for defending at U14?",
      "Transition play for U16 academy players",
    ],
    inputParams: [
      {
        name: "query",
        description: "What you want to find in the game model",
        required: true,
      },
      {
        name: "ageGroup",
        description: "e.g. U8, U12, U16, Senior",
        required: false,
      },
    ],
    badges: ["Official", "Popular"],
    installMethods: ["claude_desktop", "web"],
  },
  {
    id: "gm-sessions",
    slug: "session-library-search",
    name: "Session Library Search",
    description:
      "Search 328+ training sessions across finishing, 1v1, ball mastery, tactical play, SSGs, and more.",
    longDescription:
      "Search across Kevin's complete library of 328+ training sessions spanning seven specialist collections: Finishing & Goalscoring, 1v1 Play, Ball Mastery, Tactical Play, Small-Sided Games, Technical Development, and Match-Based Sessions.\n\nEach search returns session name, age group, topic, and a brief preview. Full sessions are available via the 360TFT store. Perfect for finding the right session when you're planning your week.",
    category: "coaching",
    iconEmoji: "\uD83D\uDCDA",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "marketplace",
    mcpToolName: "search_sessions",
    pricingType: "freemium",
    gumroadUrl: "https://360tft.gumroad.com",
    isPublished: true,
    installCount: 0,
    avgRating: 4.8,
    reviewCount: 0,
    exampleQueries: [
      "Find finishing drills for U14",
      "Ball mastery sessions for U8",
      "Tactical sessions on pressing",
      "Small-sided games for defending",
    ],
    inputParams: [
      {
        name: "query",
        description: "What kind of session you're looking for",
        required: true,
      },
      {
        name: "category",
        description:
          "finishing, 1v1, ball_mastery, tactical, ssg, technical, match_based",
        required: false,
      },
      {
        name: "ageGroup",
        description: "e.g. U8, U12, U16",
        required: false,
      },
    ],
    badges: ["Official"],
    installMethods: ["claude_desktop", "web"],
  },
  {
    id: "gm-cheat-sheets",
    slug: "coaching-guides-search",
    name: "Free Coaching Guides",
    description:
      "Search free coaching cheat sheets and guides: Defending, Technical Exercises, SSGs, UEFA C prep, AI for coaching, and more.",
    longDescription:
      "Access Kevin's collection of free coaching guides and cheat sheets covering defending principles, technical exercises, small-sided games, UEFA C preparation, AI for coaching, individual development plans (IDP), and coach reflection frameworks.\n\nThis content is completely free with no rate limits. Every response includes links to related products and communities for coaches who want to go deeper.",
    category: "content",
    iconEmoji: "\uD83D\uDCC4",
    authorName: "Coach Kevin",
    authorType: "official",
    mcpServerPath: "marketplace",
    mcpToolName: "search_coaching_guides",
    pricingType: "free",
    gumroadUrl: "https://360tft.gumroad.com",
    isPublished: true,
    installCount: 0,
    avgRating: 4.7,
    reviewCount: 0,
    exampleQueries: [
      "Defending principles cheat sheet",
      "UEFA C exam preparation guide",
      "How to use AI in coaching",
      "Individual development plan template",
    ],
    inputParams: [
      {
        name: "query",
        description: "What guide or cheat sheet you're looking for",
        required: true,
      },
    ],
    badges: ["Official", "Free"],
    installMethods: ["claude_desktop", "web"],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category && t.isPublished);
}

export function getPublishedTools(): Tool[] {
  return tools.filter((t) => t.isPublished);
}

export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  return tools
    .filter((t) => t.id !== tool.id && t.isPublished && t.category === tool.category)
    .slice(0, limit);
}
