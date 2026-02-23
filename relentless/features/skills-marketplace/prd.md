# PRD: 360TFT Skills Marketplace

## Introduction

A standalone marketplace at **skills.360tft.com** where football coaches discover, install, and use AI-powered tools (skills) for coaching, refereeing, player development, and club management. Kevin's existing products (FootballGPT, RefereeGPT, CoachReflect, game model, session libraries, cheat sheets) are the launch inventory. Builder Bootcamp students can submit their own tools built on Kevin's infrastructure. The marketplace supports installation to Claude Desktop, ChatGPT, and direct web usage.

**Football only.** No cruise, no generic AI. Every tool on this marketplace serves football coaches, referees, players, or club administrators.

This is the single destination where football meets AI tooling. Kevin owns the marketplace, the core inventory, and the infrastructure that third-party tools run on. First mover advantage in a space where nobody else is building.

## Goals

- Become the definitive directory of AI tools for football coaching
- Drive subscriptions to existing SaaS products (FootballGPT Pro, FCA, RefereeGPT Pro, CoachReflect Pro)
- Generate direct API revenue from developers via per-call pricing
- Enable Builder Bootcamp students to publish tools and earn revenue (Kevin takes commission)
- Capture email addresses from every tool installation for marketing pipeline
- Surface Kevin's Gumroad digital products (session libraries, game model) as searchable AI tools
- List on MCP registries, GPT Store, and other AI marketplaces to drive traffic back to skills.360tft.com

## User Stories

### US-001: Browse the marketplace
**Description:** As a football coach, I want to browse available AI tools so I can find ones that help my coaching.

**Acceptance Criteria:**
- [ ] Landing page at skills.360tft.com shows all published tools in a card grid
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

### US-007: Register as a developer
**Description:** As a Builder Bootcamp student, I want to get API keys so I can build my own football AI tool.

**Acceptance Criteria:**
- [ ] Developer registration page at `/developer`
- [ ] Registration requires: name, email, description of what they're building
- [ ] Kevin approves registrations (notification via Telegram or Hub)
- [ ] On approval, developer gets API key with prefix `dev_sk_`
- [ ] Developer dashboard shows: API keys, usage stats, rate limits
- [ ] Free tier: 100 calls/day. Paid tier: 1,000 calls/day ($29/month)
- [ ] Typecheck passes

### US-008: Submit a tool to the marketplace
**Description:** As a Builder Bootcamp developer, I want to submit my own AI tool so other coaches can use it.

**Acceptance Criteria:**
- [ ] Submit tool form at `/developer/submit`
- [ ] Fields: name, description, category, icon, example queries, pricing (free or % of subscription)
- [ ] Tool runs on Kevin's infrastructure (360tft-mcp) via a developer-defined system prompt + optional data source
- [ ] Submission goes to review queue (Kevin approves via Hub or Telegram)
- [ ] On approval, tool appears in marketplace with "Community" badge
- [ ] Kevin takes 30% commission on any paid tool revenue
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
- [ ] Every response includes "Learn more at skills.360tft.com"

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

- FR-1: Marketplace web app at skills.360tft.com (Next.js on Coolify)
- FR-2: Tool cards with name, description, category, rating, installs, price, author
- FR-3: Tool detail pages with live "Try it" demo, install instructions, reviews
- FR-4: Category filter: Coaching, Refereeing, Player Development, Club Management, Analytics, Content
- FR-5: Search by keyword across tool names and descriptions
- FR-6: User accounts (Supabase Auth) for reviews, developer access, and install tracking
- FR-7: Email capture gate on tool installation
- FR-8: Developer registration with approval workflow
- FR-9: API key management (create, revoke, view usage)
- FR-10: Tool submission form for Builder Bootcamp developers
- FR-11: Tool review queue in admin (Kevin approves/rejects)
- FR-12: Rating and review system (1-5 stars + text)
- FR-13: Game Model RAG tool: chunk 750-page PDF, embed with Gemini text-embedding-004, pgvector search
- FR-14: Session Library search tool: index Notion course content, return previews with Gumroad purchase links
- FR-15: Free Content search tool: full access to free Gumroad products via Notion API
- FR-16: Custom GPT configs (OpenAI Actions schemas) for FootballGPT and RefereeGPT
- FR-17: Telegram bot for Herald content approval (inline buttons, Kevin's user ID only)
- FR-18: Admin analytics dashboard (installs, calls, users, revenue, conversions)
- FR-19: Email nurture sequence triggered by tool installation
- FR-20: MCP registry submission configs (Smithery, mcp.so, official registry)
- FR-21: 30% commission tracking on third-party paid tool usage
- FR-22: Usage-based billing for developer API access ($29/month for 1,000 calls/day)
- FR-23: "Powered by 360TFT" branding on all tool responses
- FR-24: All content must be football-related. Submission review enforces this.

## Non-Goals (Out of Scope)

- No cruise, travel, or non-football tools on this marketplace
- No building a payments system from scratch (use existing Stripe infrastructure)
- No mobile app for the marketplace (responsive web is sufficient)
- No real-time collaboration features between developers
- No AI-generated tool creation (developers build tools, not an AI builder)
- No white-labelling of the marketplace for other sports (football only, for now)
- No auto-approval of third-party tool submissions (Kevin reviews all)
- No Telegram bot for marketplace admin (Telegram is Herald approval only)

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
skills.360tft.com (Next.js on Coolify)
    |
    ├── /tools/[slug]         → Tool detail + "Try it" demo
    ├── /developer            → Developer portal + API keys
    ├── /developer/submit     → Tool submission form
    ├── /admin                → Analytics + review queue
    |
    ├── Supabase              → Users, tools, reviews, API keys, installs, analytics
    ├── Upstash Redis         → Rate limiting, usage tracking
    ├── 360tft-mcp gateway    → Serves all tool API calls
    └── Stripe                → Developer billing, commission tracking
```

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

-- Tool submissions for review
tool_submissions (
  id UUID PRIMARY KEY,
  developer_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  example_queries JSONB,
  pricing_type TEXT DEFAULT 'free',
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
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
| Marketplace web app | Coolify | skills.360tft.com |
| MCP gateway | Coolify | mcp.360tft.com (already deployed) |
| Herald + Telegram bot | Coolify | (no public domain) |
| Supabase | Cloud | (new project or extend existing) |
| Game Model RAG | Supabase pgvector | (same project) |

## Monetisation Phases

### Phase 1 (Launch): Free discovery, funnel to existing products
- All Kevin's tools free with rate limits
- Every response brands to product website
- Email capture on every installation
- Email nurture drives subscriptions to FootballGPT Pro ($10.99/mo), FCA ($29/mo), etc.

### Phase 2 (Month 2-3): Developer API access
- Builder Bootcamp students get free API keys (100 calls/day)
- Developer tier: $29/month for 1,000 calls/day
- Developers build tools for their own coaching businesses

### Phase 3 (Month 3-6): Third-party tools + commission
- Community tools go live in marketplace
- Free tools: no commission (drives ecosystem growth)
- Paid tools: Kevin takes 30% commission
- Tool authors earn 70% of subscription or per-call revenue attributed to their tool

### Phase 4 (Month 6+): Premium marketplace features
- Featured tool placement (paid by tool authors)
- "Verified" badge for tools that pass quality review
- Bulk/enterprise API access for clubs and academies
- White-label API for coaching platforms

## Success Metrics

- 100 tool installs in first month
- 500 email captures in first month
- 10% conversion from marketplace email to product trial
- 5 Builder Bootcamp students submit tools in first 3 months
- $500/month additional MRR attributed to marketplace within 6 months
- 3 Custom GPTs published to GPT Store with 100+ conversations each
- Game Model RAG tool gets 50+ daily queries within 3 months

## Implementation Phases

### Phase 1: Marketplace MVP + Game Model RAG (Week 1-2)
- [ ] Set up Next.js app at skills.360tft.com on Coolify
- [ ] Seed database with Kevin's 14 existing MCP tools + 15 Gumroad products
- [ ] Tool browse page (card grid, categories, search)
- [ ] Tool detail page with "Try it" demo
- [ ] Claude Desktop install flow (email capture + JSON config copy)
- [ ] Game Model: chunk PDF, embed, pgvector search, add to MCP gateway
- [ ] Session Library: index Notion content, keyword search, add to MCP gateway

### Phase 2: Custom GPTs + Reviews (Week 2-3)
- [ ] Create OpenAI Actions schemas for FootballGPT and RefereeGPT
- [ ] Build and publish Custom GPTs to GPT Store
- [ ] Add "Use in ChatGPT" buttons to tool detail pages
- [ ] Rating and review system
- [ ] Admin analytics dashboard

### Phase 3: Developer Portal (Week 3-4)
- [ ] Developer registration + approval workflow
- [ ] API key management (create, revoke, usage stats)
- [ ] Developer documentation page
- [ ] Tool submission form
- [ ] Tool review queue in admin

### Phase 4: Telegram Bot + Email Nurture (Week 4-5)
- [ ] Telegram bot for Herald content approval
- [ ] Email capture nurture sequence (4 emails over 14 days)
- [ ] Conversion tracking (marketplace -> install -> signup -> subscription)

### Phase 5: Commission + Billing (Week 6-8)
- [ ] Stripe billing for developer API access ($29/month)
- [ ] Commission tracking for third-party paid tools
- [ ] Revenue dashboard for tool authors
- [ ] MCP registry submissions (Smithery, mcp.so, official)

## Open Questions

1. Should the marketplace have its own Supabase project or share with FootballGPT?
2. Should game model RAG be free (lead magnet) or freemium (10 searches/day free, unlimited with purchase)?
3. What commission percentage feels right for Builder Bootcamp tools — 30% (App Store standard) or lower to encourage submissions?
4. Should the email nurture sequence be product-specific (based on which tool they installed) or generic?
5. Does Kevin want to review all marketplace tool submissions personally, or delegate to a quality rubric that could be semi-automated?
6. Should the Telegram bot be a standalone service or bundled into Herald?
