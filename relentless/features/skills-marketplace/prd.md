# PRD: AI Football Skills Marketplace

## Introduction

A free, open directory at **aifootball.co** where football coaches discover, install, and use AI-powered tools (MCP servers, APIs, Claude skills, Custom GPTs) for coaching, refereeing, player development, and club management. Kevin's existing products (FootballGPT, RefereeGPT, CoachReflect) are the flagship listings. Anyone can submit their football AI tool for free.

**Football only.** No cruise, no generic AI. Every tool on this marketplace serves football coaches, referees, players, or club administrators.

**The first football AI tool marketplace.** Kevin owns the discovery layer. The marketplace is free to list, free to use. Kevin monetises through his own products, courses, API access, Builder Bootcamp, and by listing his tools on external platforms (GPT Store, MCP registries, MCPize, Apify) where they earn directly.

## Goals

- Become the definitive directory of AI tools for football coaching
- Drive subscriptions to existing SaaS products (FootballGPT Pro, RefereeGPT Pro, CoachReflect Pro)
- Capture email addresses from every tool interaction for marketing pipeline
- Enable anyone to list their football AI tool for free (build ecosystem, build traffic)
- Surface Kevin's Gumroad digital products (session libraries, game model) as searchable AI tools
- List Kevin's tools on GPT Store, MCP registries, MCPize, and Apify to earn on those platforms
- Sell Builder Bootcamp ($497) to developers who want to build their own tools
- Generate API revenue from Kevin's own tools via per-call pricing (Developer Platform, PRD 58)

## User Stories

### US-001: Browse the marketplace
**Description:** As a football coach, I want to browse available AI tools so I can find ones that help my coaching.

**Acceptance Criteria:**
- [ ] Landing page at aifootball.co shows all published tools in a card grid
- [ ] Each card shows: tool name, description, category, rating, install count, price (free/pro), author
- [ ] Filter by category: Coaching, Refereeing, Player Development, Club Management, Analytics, Content
- [ ] Search by keyword
- [ ] Tools sorted by popularity (install count) by default, with options for newest and highest rated
- [ ] Mobile responsive (coaches browse on phones)
- [ ] Typecheck passes

### US-002: View tool detail page
**Description:** As a coach, I want to see full details about a tool before installing it so I know what it does.

**Acceptance Criteria:**
- [ ] Detail page at `/tools/[slug]` shows: full description, screenshots/demos, input parameters, example outputs, ratings and reviews, author info, pricing, install instructions
- [ ] "Try it" section where user can enter a sample query and see a live response (uses free tier)
- [ ] Install buttons for Claude Desktop (copy JSON config), ChatGPT (link to Custom GPT), and Web (link to product)
- [ ] Related tools shown at bottom
- [ ] Typecheck passes

### US-003: Install a tool to Claude Desktop
**Description:** As a coach who uses Claude Desktop, I want to add a football AI tool with one click so I can use it in my conversations.

**Acceptance Criteria:**
- [ ] "Add to Claude Desktop" button shows a modal with the MCP JSON config snippet
- [ ] Copy button copies config to clipboard
- [ ] Step-by-step instructions with screenshots (3 steps max)
- [ ] Tracks installation count
- [ ] Requires email capture before showing config (grows email list)
- [ ] Typecheck passes

### US-004: Use a tool via ChatGPT
**Description:** As a coach who uses ChatGPT, I want to access football AI tools through the GPT Store.

**Acceptance Criteria:**
- [ ] "Use in ChatGPT" button links to the corresponding Custom GPT
- [ ] Custom GPTs created for: FootballGPT (5 tools), RefereeGPT (3 tools), CoachReflect (3 tools)
- [ ] Each Custom GPT calls the same `/api/mcp/[action]` endpoints via OpenAI Actions
- [ ] Branded with correct product names and descriptions
- [ ] Typecheck passes

### US-005: Try a tool on the web
**Description:** As a coach who doesn't use Claude or ChatGPT, I want to try a tool directly on the marketplace website.

**Acceptance Criteria:**
- [ ] Each tool detail page has a "Try it" input field
- [ ] Coach enters a query, gets a response from the tool (calls MCP gateway)
- [ ] Response includes "Powered by [Product]" branding
- [ ] Free tier: 5 tries per tool per day (tracked by IP, then by email after capture)
- [ ] Over limit: shows upgrade CTA to product subscription
- [ ] Typecheck passes

### US-006: Rate and review a tool
**Description:** As a coach who has used a tool, I want to leave a rating and review so other coaches know if it's good.

**Acceptance Criteria:**
- [ ] Star rating (1-5) plus optional text review
- [ ] Must have an account and at least 1 tool usage to review
- [ ] Reviews displayed on tool detail page with author name and date
- [ ] Average rating shown on card in browse view
- [ ] Tool author can respond to reviews
- [ ] Typecheck passes

### US-007: Get API access to Kevin's tools
**Description:** As a developer, I want API keys to use FootballGPT, RefereeGPT, or CoachReflect tools programmatically.

**Acceptance Criteria:**
- [ ] Developer portal at `/developer`
- [ ] Create API key with email (self-service, no approval needed for free tier)
- [ ] Developer dashboard shows: API keys, usage stats, rate limits
- [ ] Free tier: 10 calls/day. Paid tiers via Developer Platform (PRD 58, July onwards)
- [ ] API keys only grant access to Kevin's official tools, not third-party listings
- [ ] Typecheck passes

### US-008: Submit a tool to the marketplace
**Description:** As a developer, I want to submit my football AI tool so other coaches can discover and use it.

**Acceptance Criteria:**
- [ ] Submit tool form at `/submit`
- [ ] Fields: name, description, category, tool type (MCP server, API, Claude skill, Custom GPT), connection URL, example queries
- [ ] Developer hosts their own tool (marketplace is a directory, not a host)
- [ ] Quality rubric auto-checks: football-related, URL responds, description is real
- [ ] Passes rubric: auto-approved with "Community" badge. Fails: flagged for Kevin to review
- [ ] Free to list, no commission, no fees
- [ ] Typecheck passes

### US-009: Search the game model
**Description:** As a coach, I want to search Kevin's 750-page game model so I can find age-appropriate coaching guidance.

**Acceptance Criteria:**
- [ ] MCP tool `search_game_model` available in marketplace
- [ ] RAG search over chunked and embedded game model content
- [ ] Query like "What should U10s focus on in possession?" returns relevant paragraphs
- [ ] Response includes section reference and age group context
- [ ] Free tier: 10 searches/day. Full document available at 360tft.com/l/360TFTGM ($40)
- [ ] Branded "From the 360TFT Game Model by Coach Kevin Middleton"
- [ ] Typecheck passes

### US-010: Search session libraries
**Description:** As a coach, I want to search Kevin's 328+ training sessions so I can find session ideas by topic and age group.

**Acceptance Criteria:**
- [ ] MCP tool `search_sessions` available in marketplace
- [ ] Searches across all Gumroad session products (finishing, 1v1, ball mastery, tactical, SSG, technical, match-based)
- [ ] Returns: session name, age group, topic, brief description (first 2-3 lines)
- [ ] Full session requires Gumroad purchase (link provided in response)
- [ ] Free tier: 10 searches/day
- [ ] Typecheck passes

### US-011: Search cheat sheets and free content
**Description:** As a coach, I want to search Kevin's free coaching cheat sheets and guides.

**Acceptance Criteria:**
- [ ] MCP tool `search_coaching_guides` available in marketplace
- [ ] Searches: Defending Cheat Sheet, Technical Exercises, SSG Cheat Sheet, UEFA C Cheatsheet, AI cheat sheets, IDP Cheatsheet, Coach Reflection Cheatsheet, game model extracts
- [ ] Returns full content (these are already free products)
- [ ] Every response includes CTA to relevant paid product or community
- [ ] No rate limit on free content (it's a lead magnet)
- [ ] Typecheck passes

### US-012: Telegram bot for Herald approval
**Description:** As Kevin, I want to approve or reject pending social media posts from my phone via Telegram.

**Acceptance Criteria:**
- [ ] Telegram bot sends Kevin a message for each new pending post in the review queue
- [ ] Message shows: brand, content preview (first 280 chars), scheduled time, image thumbnails
- [ ] Inline buttons: Approve, Reject, Edit (opens Hub queue page)
- [ ] On Approve: updates Redis queue item status to `approved`
- [ ] On Reject: updates status to `rejected`
- [ ] Confirmation message after each action
- [ ] Only responds to Kevin's Telegram user ID (security)
- [ ] Typecheck passes

### US-013: Custom GPTs for GPT Store
**Description:** As the marketplace operator, I want Custom GPTs listed in the ChatGPT GPT Store to drive discovery.

**Acceptance Criteria:**
- [ ] FootballGPT Custom GPT: 5 actions (coaching advice, session plan, animate drill, search stats, search drills)
- [ ] RefereeGPT Custom GPT: 3 actions (check law, analyze incident, generate quiz)
- [ ] Each GPT has: name, description, conversation starters, branded icon
- [ ] Actions call the existing `/api/mcp/[action]` endpoints on each product
- [ ] OpenAI Actions schema (openapi.yaml) generated for each product
- [ ] Published to GPT Store with Kevin's OpenAI account
- [ ] Every response includes "Learn more at aifootball.co"

### US-014: Analytics dashboard
**Description:** As the marketplace operator, I want to see how tools are performing.

**Acceptance Criteria:**
- [ ] Dashboard at `/admin/analytics` in marketplace
- [ ] Metrics per tool: installs, API calls, unique users, ratings, revenue
- [ ] Metrics overall: total installs, total API calls, total users, MRR from marketplace
- [ ] Conversion tracking: marketplace visit -> tool install -> product signup -> subscription
- [ ] Top tools by usage and by rating
- [ ] Daily/weekly/monthly views
- [ ] Typecheck passes

### US-015: Email capture and nurture
**Description:** As the marketplace operator, I want to capture emails from tool installations to nurture coaches toward paid products.

**Acceptance Criteria:**
- [ ] Email required before installing any tool (Claude config, ChatGPT link, or API key)
- [ ] "Try it" on web allows 2 free queries before requiring email
- [ ] Email stored in Supabase with: source tool, install method, date
- [ ] Triggers welcome email sequence: tool tips (day 1), related tools (day 3), product intro (day 7), upgrade pitch (day 14)
- [ ] Emails sent via Resend from `hello@send.360tft.com`
- [ ] Unsubscribe link in every email
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Marketplace web app at aifootball.co (Next.js on Coolify)
- FR-2: Tool cards with name, description, category, rating, installs, price, author
- FR-3: Tool detail pages with live "Try it" demo, install instructions, reviews
- FR-4: Category filter: Coaching, Refereeing, Player Development, Club Management, Analytics, Content
- FR-5: Search by keyword across tool names and descriptions
- FR-6: User accounts (Supabase Auth) for reviews, developer access, and install tracking
- FR-7: Email capture gate on tool installation
- FR-8: Open tool submission form (MCP server, API, Claude skill, Custom GPT — any football AI tool)
- FR-9: Quality rubric auto-check on submissions (football-related, URL responds, description real)
- FR-10: Tool review queue in admin (edge cases flagged by rubric)
- FR-11: Rating and review system (1-5 stars + text)
- FR-12: Game Model RAG tool: chunk 750-page PDF, embed with Gemini text-embedding-004, pgvector search
- FR-13: Session Library search tool: index Notion course content, return previews with Gumroad purchase links
- FR-14: Free Content search tool: full access to free Gumroad products via Notion API
- FR-15: Custom GPT configs (OpenAI Actions schemas) for FootballGPT and RefereeGPT
- FR-16: Telegram bot for Herald content approval (inline buttons, Kevin's user ID only)
- FR-17: Admin analytics dashboard (installs, views, users, conversions to Kevin's products)
- FR-18: Email nurture sequence triggered by tool installation (product-specific)
- FR-19: MCP registry submission configs (Smithery, mcp.so, official registry) for SEO/backlinks
- FR-20: API key management for Kevin's own tools only (create, revoke, view usage)
- FR-21: All content must be football-related. Submission rubric enforces this.

## Non-Goals (Out of Scope)

- No cruise, travel, or non-football tools on this marketplace
- No building a payments system from scratch (use existing Stripe infrastructure)
- No mobile app for the marketplace (responsive web is sufficient)
- No real-time collaboration features between developers
- No AI-generated tool creation (developers build tools, not an AI builder)
- No white-labelling of the marketplace for other sports (football only, for now)
- No Telegram bot for marketplace admin (Telegram is Herald approval only)
- No commission or listing fees (marketplace is free, Kevin monetises through his own products)
- No proxying third-party tools (directory only, developers host their own infrastructure)
- No hosting tools for others (marketplace lists tools, doesn't run them)

## Design Considerations

- Dark theme matching existing 360TFT products (dark background, gold accents)
- Card-based grid layout for tool browsing (similar to Smithery.ai or GPT Store)
- Mobile-first (coaches browse on phones between sessions)
- Tool detail page should feel like an app store listing
- "Try it" demo should be prominent (not hidden behind tabs)
- Install instructions must be dead simple (3 steps max, with screenshots)
- Use shadcn/ui components for consistency with other 360TFT products
- Badge system: "Official" (Kevin's tools), "Community" (Builder Bootcamp), "New", "Popular"

## Technical Considerations

### Architecture

```
aifootball.co (Next.js on dedicated Hetzner server)
    |
    ├── /tools/[slug]         → Tool detail + "Try it" demo (Kevin's tools only)
    ├── /submit               → Open tool submission form (anyone)
    ├── /developer            → Developer portal + API keys (Kevin's tools only)
    ├── /admin                → Analytics + review queue
    |
    ├── Supabase              → Users, tools, reviews, API keys, installs, analytics (own project)
    ├── Upstash Redis         → Rate limiting for "Try it" demo
    └── Resend                → Email capture + product-specific nurture sequences
```

Third-party tools link directly to the developer's infrastructure. The marketplace is a directory, not a proxy or gateway. Only Kevin's own tools have "Try it" demos and API key access through the marketplace.

### Database Tables (new Supabase project or extend FootballGPT)

```sql
-- Tools listed in the marketplace
tools (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,  -- coaching, refereeing, player_dev, club_mgmt, analytics, content
  icon_url TEXT,
  author_id UUID REFERENCES profiles(id),
  author_type TEXT DEFAULT 'official',  -- official, community
  mcp_server_path TEXT,  -- e.g. 'footballgpt' for routing in 360tft-mcp
  mcp_tool_name TEXT,    -- e.g. 'get_coaching_advice'
  pricing_type TEXT DEFAULT 'free',  -- free, freemium, paid
  product_url TEXT,       -- link to full product if applicable
  gumroad_url TEXT,       -- link to Gumroad product if applicable
  chatgpt_url TEXT,       -- link to Custom GPT if available
  is_published BOOLEAN DEFAULT false,
  install_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tool reviews
tool_reviews (
  id UUID PRIMARY KEY,
  tool_id UUID REFERENCES tools(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  author_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tool installations tracked
tool_installs (
  id UUID PRIMARY KEY,
  tool_id UUID REFERENCES tools(id),
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  install_method TEXT NOT NULL,  -- claude_desktop, chatgpt, web, api_key
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Developer applications
developer_applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tool submissions (open directory model)
tool_submissions (
  id UUID PRIMARY KEY,
  developer_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tool_type TEXT NOT NULL,  -- mcp_server, api, claude_skill, custom_gpt
  connection_url TEXT,      -- MCP server URL, API endpoint, GPT Store link
  example_queries JSONB,
  rubric_score INTEGER,     -- auto-check score (0-100)
  rubric_flags JSONB,       -- auto-check details (football_related, url_responds, description_quality)
  status TEXT DEFAULT 'pending',  -- pending, auto_approved, flagged, approved, rejected
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API usage tracking (extends existing api_keys table)
api_usage_daily (
  id UUID PRIMARY KEY,
  api_key_id UUID,
  tool_id UUID REFERENCES tools(id),
  date DATE NOT NULL,
  call_count INTEGER DEFAULT 0,
  UNIQUE(api_key_id, tool_id, date)
);

-- Email captures from marketplace
marketplace_emails (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  source_tool_id UUID REFERENCES tools(id),
  install_method TEXT,
  nurture_stage TEXT DEFAULT 'captured',  -- captured, welcome_sent, tips_sent, product_intro, upgrade_pitch
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Game Model RAG

- Export 750-page game model PDF
- Chunk into ~500 token segments with overlap
- Embed with Gemini `text-embedding-004` (same as RefereeGPT RAG)
- Store in pgvector table in Supabase
- Search endpoint returns top 5 chunks with metadata (age group, phase, section title)
- Add as new tool in 360tft-mcp: `search_game_model`

### Session Library Index

- Pull Notion page content via Notion API for each Gumroad product
- Index: session name, age group, topic, duration, first 100 words of description
- Store in Supabase table (not vector — keyword search is sufficient)
- Search returns previews; full content behind Gumroad paywall
- Add as new tool in 360tft-mcp: `search_sessions`

### Custom GPTs (OpenAI)

For each product, create:
1. `openapi.yaml` — OpenAI Actions schema defining available endpoints
2. GPT instructions — system prompt with product context
3. Conversation starters — 4 example prompts
4. Icon — product brand icon

The Actions call the same `/api/mcp/[action]` routes. Authentication via API key header.

### Telegram Bot

- Node.js service using `node-telegram-bot-api`
- Polls Redis for new `pending` items in `hub:queue:{date}`
- Sends formatted message to Kevin's Telegram chat
- Inline keyboard buttons: Approve | Reject | View in Hub
- On button press: PATCH `/api/queue` to update status
- Runs as separate Docker container on Coolify (or integrated into Herald)

### Infrastructure

| Component | Where | Domain |
|-----------|-------|--------|
| Marketplace web app | Dedicated Hetzner server | aifootball.co |
| Supabase | Cloud (own project) | — |
| Telegram bot | Coolify (standalone Docker) | — |
| Game Model RAG | Supabase pgvector (same project) | — |

## Monetisation Strategy

**The marketplace is a traffic play, not a transaction play.** Free to list, free to use. Kevin monetises through his own products, not by taking a cut of other people's tools.

### How it makes money
- **Kevin's tools are the flagship listings.** FootballGPT, RefereeGPT, CoachReflect prominently featured with "Official" badges. Free tier drives upgrades to paid subscriptions.
- **Email capture on every interaction.** Product-specific nurture sequences drive subscription conversions.
- **Builder Bootcamp sales.** Developers who want to build their own tools buy the $497 Bootcamp.
- **API access to Kevin's tools.** Developers pay for higher-tier API access to FootballGPT, RefereeGPT, CoachReflect APIs.
- **Courses.** AI Football Skool, Custom GPT course ($29), linked from marketplace.
- **Strategy calls.** £297 calls linked from marketplace for clubs/orgs wanting custom solutions.

### What the marketplace is NOT
- NOT a transaction platform. No commission on third-party tools.
- NOT a proxy/gateway. Third-party tools connect directly to the developer's infrastructure.
- NOT a hosting platform. Developers host their own MCP servers, APIs, skills.

### The marketplace is a directory
- Anyone can submit their football AI tool (MCP server, API, Claude skill, Custom GPT)
- Free to list, no commission, no fees
- Kevin owns the discovery layer and the traffic
- First mover advantage: the only football-specific AI tool directory

## Success Metrics

- 50+ tools listed (Kevin's + community submissions) within 3 months
- 500 email captures in first month
- 10% conversion from marketplace email to product trial/signup
- 3 Custom GPTs published to GPT Store with 100+ conversations each
- Kevin's MCP tools listed on 3+ external registries (MCP Registry, Smithery, MCPize)
- Game Model RAG tool gets 50+ daily queries within 3 months
- $500/month additional MRR attributed to marketplace traffic within 6 months

## Task List

### What's Done
- [x] Next.js app set up and running
- [x] Tool browse page (card grid, categories, search)
- [x] Tool detail pages with "Try it" demo
- [x] Claude Desktop install flow (email capture + JSON config copy)
- [x] ChatGPT install flow
- [x] Custom GPT schemas for FootballGPT, RefereeGPT, CoachReflect (in `/custom-gpts/`)
- [x] Supabase auth + user profiles
- [x] Developer portal + API key system (create, revoke, validate, usage tracking)
- [x] Tool submission form (basic)
- [x] Admin analytics dashboard
- [x] Email capture on install
- [x] Activity tracking + user favourites
- [x] Documentation pages (Claude Desktop, ChatGPT, API, MCP, OpenClaw)
- [x] SEO foundation (sitemap, robots, OG images)
- [x] Rebrand to AI Football (aifootball.co)
- [x] 11 official tools seeded (5 FootballGPT, 3 RefereeGPT, 3 CoachReflect)

### Phase 1: Polish + Commit (Now)

| # | Task | Status |
|---|------|--------|
| 1 | Commit Claude Desktop docs UX improvements (uncommitted) | TODO |
| 2 | Commit tool detail page install modal improvements (uncommitted) | TODO |
| 3 | Add sort options to browse page (popularity, newest, highest rated) | TODO |
| 4 | Add related tools section to tool detail pages | TODO |
| 5 | Add "Powered by [Product]" branding to all "Try it" responses | TODO |

### Phase 2: Open Submissions (Directory Model)

| # | Task | Status |
|---|------|--------|
| 6 | Rewrite submission form to accept any tool type (MCP server URL, API endpoint, Claude skill, Custom GPT link) | TODO |
| 7 | Build quality rubric auto-check (football-related keyword match, URL responds, description length/quality) | TODO |
| 8 | Update admin review queue for edge cases only (auto-approved tools skip queue) | TODO |
| 9 | Add "Community" badge for third-party tools vs "Official" for Kevin's | TODO |
| 10 | Write submission guidelines page (/docs/submit — what's accepted, how it works, what tool types) | TODO |

### Phase 3: Reviews + Content Tools

| # | Task | Status |
|---|------|--------|
| 11 | Rating and review system (1-5 stars + text, display on cards and detail pages) | TODO |
| 12 | Migration: `tool_reviews` table + RLS policies | TODO |
| 13 | Game Model RAG tool (chunk 750-page PDF, embed with Gemini, pgvector search, 10/day free) | TODO |
| 14 | Session Library search tool (index Notion content, keyword search, Gumroad purchase links) | TODO |
| 15 | Cheat sheets / free content search tool (full content, no rate limit, CTA to paid products) | TODO |

### Phase 4: External Platform Distribution

| # | Task | Status |
|---|------|--------|
| 16 | Package Kevin's MCP tools as standalone npm packages (prerequisite for all registries) | TODO |
| 17 | Publish Custom GPTs to ChatGPT GPT Store (verify domains, add privacy policies, submit via OpenAI editor) | TODO — Kevin must do this manually in ChatGPT UI |
| 18 | Submit MCP servers to official MCP Registry (registry.modelcontextprotocol.io) | TODO |
| 19 | Submit MCP servers to Smithery (`smithery mcp publish`) | TODO |
| 20 | Submit to MCPize for paid per-call monetisation (85% revenue share) | TODO |
| 21 | Evaluate Apify Actors for additional distribution (130k monthly signups) | TODO |
| 22 | Submit to AI tool directories (mcp.so, awesome-mcp-servers, etc.) for SEO backlinks | TODO |

### Phase 5: Email Nurture + Conversion

| # | Task | Status |
|---|------|--------|
| 23 | Build product-specific email nurture sequences (4 emails over 14 days per product) | TODO |
| 24 | FootballGPT nurture: tool tips → related tools → FootballGPT Pro intro → upgrade pitch | TODO |
| 25 | RefereeGPT nurture: tool tips → related tools → RefereeGPT Pro intro → upgrade pitch | TODO |
| 26 | CoachReflect nurture: tool tips → related tools → CoachReflect Pro intro → upgrade pitch | TODO |
| 27 | Generic nurture (for non-product-specific tools): marketplace tips → AI Football Skool → Bootcamp pitch | TODO |
| 28 | Conversion tracking (marketplace visit → tool install → product signup → subscription) | TODO |

### Phase 6: Infrastructure

| # | Task | Status |
|---|------|--------|
| 29 | Provision dedicated Hetzner server for marketplace | DONE (49.13.85.185) |
| 30 | Set up Docker/deployment pipeline on Hetzner server | DONE (Coolify UUID: fs4ow08w4sgssog88sckggs0) |
| 31 | Deploy marketplace to dedicated Hetzner server | DONE (serving at aifootball.co) |
| 32 | DNS cutover for aifootball.co to Hetzner server | DONE |
| 33 | Verify SSL, builds, and routing on new server | DONE |
| 34 | Set up Supabase project (own project, separate from FootballGPT) | DONE (urgaadsrsvjszlsdmfgc) |
| 35 | Run all migrations (api_keys, tool_submissions, auth_profiles, user_activity) on new Supabase | DONE (7 tables confirmed) |

### Backlog (Later)

| # | Task | Status |
|---|------|--------|
| 36 | Telegram bot for Herald content approval (standalone Docker container) | TODO |
| 37 | Featured/verified placement tiers (introduce once there's traffic — potential future revenue) | TODO |
| 38 | Stripe per-call billing for Kevin's tools via Developer Platform (PRD 58, July onwards) | TODO |

## Decisions (Resolved 2026-02-26)

1. **Supabase:** Own project (separate from FootballGPT). Clean isolation, independent scaling.
2. **Game Model RAG:** Freemium. 10 searches/day free, unlimited with Gumroad purchase ($40).
3. **Monetisation model:** Free to list, free to use. No commission, no listing fees. Build audience first, introduce featured/verified placements later once there's traffic. Kevin monetises through his own products, courses, API access, and Bootcamp sales. Also earns from tools listed on external platforms (GPT Store revenue share, paid MCP servers via Stripe per-call, MCPize/Apify).
4. **Email nurture:** Product-specific. If they installed a RefereeGPT tool, nurture toward RefereeGPT Pro. Higher conversion.
5. **Tool submissions:** Semi-automated with quality rubric. Auto-approve if football-related, working demo, no spam. Kevin reviews edge cases.
6. **Telegram bot:** Standalone Docker container on Coolify. Independent lifecycle, easy to remove if not needed.
7. **Architecture:** Marketplace is a directory, not a proxy. Third-party tools connect directly to developer infrastructure. Only Kevin's own tools have API key access through the marketplace.
8. **Tool types accepted:** MCP servers, APIs, Claude skills, Custom GPTs. Any football AI tool.
