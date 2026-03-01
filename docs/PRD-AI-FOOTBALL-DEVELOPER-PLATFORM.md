# PRD: AI Football Developer Platform

**Product:** AI Football (aifootball.co)
**Repo:** `/home/kevin/360tft-skills-marketplace`
**Status:** Draft
**Date:** 2026-02-28

---

## Problem

AI Football is currently a browse-and-try marketplace. Users discover tools, try them twice, and either install via MCP config or leave. Developers who want to build apps on top of Kevin's football AI products have no clear path. The developer page exists but the tiers, gateway, and cross-linking are incomplete.

Meanwhile, each product (FootballGPT, CoachReflect, RefereeGPT, PlayerReflection) is adding a $4.99/month API bolt-on for individual Pro subscribers. AI Football needs to:

1. Serve as the developer platform for builders who want ALL products through one key
2. Link to each product's personal bolt-on for individual users who just want one product
3. Deploy the MCP gateway so marketplace API keys actually work

---

## Audience

| Who | What they want | Where they go |
|-----|---------------|---------------|
| Coach wanting MCP access to FootballGPT | Personal bolt-on, 100 calls/day | footballgpt.co (bolt-on) |
| Developer building a coaching app | High-volume API access to all products | aifootball.co (developer tiers) |
| Entrepreneur (Builder Bootcamp) | Source code + API access + mentorship | aifootball.co → AI Football Skool |

AI Football serves the second and third audience. The first audience is served by each product directly, but AI Football should acknowledge them and link through.

---

## Developer Tiers (Final)

| Tier | Calls/Day | Products | Price | Stripe Product |
|------|-----------|----------|-------|----------------|
| Free | 10 | All | $0 | — |
| Builder | 1,000 | All | $79/month | New |
| Scale | 5,000 | All | $349/month | New |
| Enterprise | Custom | All | Contact | — |

**Cost analysis (Gemini 2.5 Flash, ~$0.001/call):**

| Tier | Max calls/month | AI cost | Stripe fee | Revenue | Profit | Margin |
|------|----------------|---------|------------|---------|--------|--------|
| Free | 300 | $0.30 | — | $0 | -$0.30 | — |
| Builder | 30,000 | $30 | $2.59 | $79 | $46.41 | 59% |
| Scale | 150,000 | $150 | $10.42 | $349 | $188.58 | 54% |

---

## Changes Required

### 1. Update developer page (`src/app/developer/page.tsx`)

**Current state:** Shows Free ($0, 10/day), Developer ($29/mo, 1,000/day), Builder Bootcamp ($497).

**New state:**

Replace the pricing section with:

| Tier | Price | Calls/Day | What's included |
|------|-------|-----------|-----------------|
| Free | $0 | 10 | All products, per-tool tracking, max 5 keys |
| Builder | $79/month | 1,000 | All products, analytics, priority support, publish tools |
| Scale | $349/month | 5,000 | All products, dedicated support, SLA |
| Enterprise | Contact | Custom | Volume discounts, custom onboarding |

Add a section below the tiers:

> **Just want personal access to one product?**
> Each product offers a $4.99/month API bolt-on for Pro subscribers:
> - [FootballGPT](https://footballgpt.co) — coaching advice, session plans, drill search
> - [CoachReflect](https://coachreflection.com) — coaching reflections, patterns, AI assistant
> - [RefereeGPT](https://refereegpt.co) — law checks, incident analysis, quizzes
> - [PlayerReflection](https://playerreflection.360tft.com) — player reflections, patterns, AI coach

### 2. Create Stripe products for Builder and Scale tiers

- Product: "AI Football Builder" — $79/month
- Product: "AI Football Scale" — $349/month
- Store price IDs in env vars: `STRIPE_BUILDER_PRICE_ID`, `STRIPE_SCALE_PRICE_ID`
- Create checkout route: `src/app/api/stripe/developer-checkout/route.ts`
- Handle via webhook: update the API key's tier when subscription activates

### 3. Update API key tiers

**Current tiers in code:** free, pro, developer, unlimited

**New tiers:** free, builder, scale, enterprise

Update:
- `src/app/api/keys/route.ts` — key creation, tier assignment
- `src/app/api/keys/validate/route.ts` — rate limiting per tier
- `src/lib/rate-limit.ts` — add Builder (1,000/day) and Scale (5,000/day) limits
- `src/app/developer/page.tsx` — tier display and management

### 4. Deploy MCP gateway

The MCP gateway (`mcp.360tft.com`) needs to be live for marketplace API keys to work. This is in the `360tft-mcp` repo.

The gateway:
- Accepts MCP JSON-RPC protocol calls
- Validates the AI Football API key from the Authorization header
- Rate limits based on the key's tier
- Proxies requests to the correct product using the `x-mcp-service-key`
- Returns responses (including rate limit messages) to the MCP client

### 5. Update tool detail pages (`src/app/tools/[slug]/page.tsx`)

Each tool's detail page should show two paths:

**For personal use:**
> Use this tool in your AI agent with a $4.99/month API bolt-on on [ProductName].
> Requires a Pro subscription on [ProductName].
> [Get started on ProductName →]

**For developers:**
> Build with this tool using the AI Football developer API.
> One key, all products, starting at $79/month.
> [Get an API key →]

### 6. Update the install modal

Currently the install modal shows an MCP config pointing to `mcp.360tft.com` (the marketplace gateway). This should still work for users who have an AI Football API key.

But add a note:
> This config uses the AI Football gateway. For personal access with your [ProductName] subscription, get your config directly from [ProductName].

### 7. Update homepage / browse page (`src/app/page.tsx`)

Add a "For Developers" section near the bottom:
- "Build football AI into your app"
- Brief description of the developer API
- Link to /developer
- Show the 4 products available

### 8. Update docs (`src/app/docs/api/page.tsx`)

The API docs should reflect the new tiers and explain both paths:
- Personal bolt-on (per product, $4.99/month, 100 calls/day)
- Developer API (AI Football, $79-349/month, 1,000-5,000 calls/day, all products)

---

## Cross-Linking Matrix

| From | To | Link text |
|------|-----|-----------|
| AI Football /developer | Each product site | "Just want personal access? Get the bolt-on on [Product]" |
| AI Football /tools/[slug] | Product pricing page | "Get personal access on [Product]" |
| AI Football /tools/[slug] | AI Football /developer | "Build with this tool — developer API" |
| Each product /pricing | AI Football /developer | "Building an app? Developer API access" |
| Each product /app/mcp | AI Football /developer | "Need higher volume? Developer tiers" |
| AI Football /developer | AI Football Skool | "Want the source code? Builder Bootcamp" |

---

## Verification

1. `npm run build` passes
2. Developer page shows correct tiers (Free, Builder $79, Scale $349, Enterprise)
3. Developer page links to each product's bolt-on
4. Tool detail pages show both personal and developer paths
5. API key creation works for all tiers
6. Rate limiting enforced per tier (10, 1,000, 5,000 calls/day)
7. Stripe checkout works for Builder and Scale
8. MCP gateway deployed and accepting requests
9. Docs reflect both paths clearly
