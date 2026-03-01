# MCP Access: Implementation Instructions

Two separate audiences, two separate places to buy.

**Individual users** (coaches, referees, players) buy a $4.99/month API bolt-on on the product they already use. This gives them personal MCP access — 100 calls/day to that one product.

**Developers and builders** who want to build apps go to AI Football (aifootball.co). They get one API key that unlocks all products at higher volume with developer tiers.

The product sites never mention developer tiers. AI Football never sells individual bolt-ons. Clean separation.

---

## Pricing Model

### On each product site (bolt-on for Pro subscribers)

| | Free | Pro | Pro + API bolt-on |
|---|---|---|---|
| **Price** | $0 | $10.99/mo (varies by product) | +$4.99/mo |
| **Web app** | Limited | Full | Full |
| **MCP access** | None | None | 100 calls/day |

The bolt-on requires an active Pro subscription. Free users must upgrade to Pro first. This keeps the value ladder clean and ensures every API subscriber is already a paying customer.

**Cost to Kevin per bolt-on subscriber (worst case, maxed out every day):**
- 100 calls/day x 30 days = 3,000 calls/month
- Gemini 2.5 Flash cost: ~$0.001/call = $3.00/month
- Stripe fee on $4.99: $0.44/month
- **Profit: $1.55/month (31% margin)**
- Realistic usage (20 calls/day avg): **$4.37 profit (88% margin)**
- Plus they're already paying Pro ($10.99+), so total revenue per user is $15.98+/month

### On AI Football (developer tiers)

| Tier | Calls/Day | Products | Price/Month | AI Cost (maxed) | Profit (maxed) | Margin |
|------|-----------|----------|-------------|-----------------|----------------|--------|
| Free | 10 | All | $0 | $0.30 | -$0.30 | — |
| Builder | 1,000 | All | $79 | $30 | $46.41 | 59% |
| Scale | 5,000 | All | $349 | $150 | $188.58 | 54% |
| Enterprise | Custom | All | Custom | — | — | — |

Builder and Scale access ALL products (FootballGPT, CoachReflect, RefereeGPT, PlayerReflection) through one API key from the marketplace.

---

## What Each Product Site Needs

Each product needs 5 things:

1. **MCP config page** — logged-in users copy their personal MCP config for any client (Claude Desktop, OpenClaw, Cursor, Windsurf, Cline, etc.)
2. **$4.99/month Stripe subscription** — new product in Stripe for the API bolt-on
3. **Auth-aware MCP endpoint** — updated to accept user API keys with bolt-on validation
4. **Rate limiting with upgrade message** — no bolt-on = no access, bolt-on = 100/day, over limit = upgrade message
5. **Pricing page update** — show the bolt-on, link to AI Football for developer access

---

## 1. FootballGPT (footballgpt.co)

**Repo:** `/home/kevin/FootballGPT`
**Pricing config:** `src/lib/pricing.ts`
**Existing MCP endpoint:** `src/app/api/mcp/[action]/route.ts`
**Auth:** Supabase Auth
**Rate limiting:** `src/lib/rate-limit.ts` (Upstash Redis)

### Stripe Setup

Create a new Stripe product: "FootballGPT API Access"
- Monthly price: $4.99
- Annual price: $47.99 (save $12)
- Store price IDs in env vars: `STRIPE_API_PRICE_ID`, `STRIPE_API_PRICE_ID_ANNUAL`

### MCP Access Rules

| User state | MCP access | Message shown |
|---|---|---|
| No account | None | "Sign up at footballgpt.co to get started" |
| Free, no bolt-on | None | "Upgrade to Pro ($10.99/mo) to unlock API access" |
| Pro, no bolt-on | None | "Add API access ($4.99/mo) to use FootballGPT in your AI agent" |
| Pro + bolt-on | 100 calls/day | Normal responses |
| Pro + bolt-on, over limit | Blocked until reset | "You've hit your 100 calls/day limit. Resets at midnight UTC." |
| Service key (marketplace) | Unlimited | Gateway handles its own limits |

The bolt-on requires Pro. Free users see the Pro upgrade message first — they can't skip straight to the bolt-on.

### Files to Create/Modify

**New page: `src/app/app/mcp/page.tsx`**
- Protected route (requires auth)
- If user doesn't have bolt-on: show what they get, $4.99/month CTA, checkout button
- If user has bolt-on: show API key management + install method split (see below)
- "Building an app? See developer API access on [AI Football](https://aifootball.co/developer)"

**Install method split (Post Bridge pattern — applies to ALL products):**

When a user has the bolt-on active, present three entry point cards side by side:

| Card | Label | Description | Action |
|------|-------|-------------|--------|
| MCP | Claude Desktop, Cursor, Windsurf & more | Paste a JSON config, restart, done | Scrolls to #mcp-setup with config block + 3-step instructions |
| OpenClaw | Connect your OpenClaw agent | One-click install | Links to aifootball.co/openclaw |
| Web | Try on the web | No setup needed | Links to the product's main site |

Each card is a distinct path, not a tab. Users see all three options at once and pick their method. The MCP section expands below with the JSON config and copy button. OpenClaw and Web link out.

This pattern is already live on aifootball.co/mcp and must be replicated on every product's `/app/mcp` or `/dashboard/mcp` page.

**MCP config format (shown in the MCP section):**
```json
{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://footballgpt.co/api/mcp/stream",
      "headers": {
        "Authorization": "Bearer fgpt_abc123..."
      }
    }
  }
}
```

**New route: `src/app/api/stripe/api-checkout/route.ts`**
- Creates Stripe checkout session for the API bolt-on
- Same pattern as existing checkout but for the API product

**Modify: `src/app/api/mcp/[action]/route.ts`**

Currently accepts only `x-mcp-service-key`. Update logic:

```
1. Check x-mcp-service-key → if valid, allow (marketplace gateway)
2. Check Authorization: Bearer header → look up key in mcp_keys table
3. Get user from key → check subscription tier
4. If not Pro: return "upgrade to Pro" message (200 OK)
5. If Pro but no API bolt-on: return "add API access" message (200 OK)
6. If Pro + bolt-on: check rate limit (100/day)
7. If rate limited: return limit message (200 OK)
8. Process request normally
9. Track usage
```

**Free user message (returned as 200 OK tool result):**
```
FootballGPT API access is available to Pro subscribers.

Upgrade to Pro ($10.99/month) for 40 web chat messages/day, all 7 coaching advisors, 90-day history, and the ability to add API access.

Upgrade here: https://footballgpt.co/app/settings
```

**Pro user without bolt-on message:**
```
Add API access to use FootballGPT in your AI agent ($4.99/month).

This gives you 100 calls/day to all FootballGPT tools — coaching advice, session plans, drill search, and more.

Add API access: https://footballgpt.co/app/mcp

Building an app? Developer API access is available at https://aifootball.co/developer
```

**Rate limit message (Pro + bolt-on, over 100/day):**
```
You've hit your daily limit of 100 API calls.

Your limit resets at midnight UTC. If you need higher volume for app development, see developer tiers at https://aifootball.co/developer

Or try again tomorrow.
```

**Modify: `src/app/pricing/page.tsx`**
- Add "API access" row: "Connect to any AI agent — $4.99/month"
- Small text below: "Building an app? [Developer API access](https://aifootball.co/developer)"

### Navigation

Add "API Access" link to the app sidebar/settings navigation.

---

## 2. CoachReflect (coachreflection.com)

**Repo:** `/home/kevin/CoachReflect`
**Pricing config:** `lib/config.ts`
**Existing MCP endpoint:** May need creating
**Auth:** Supabase Auth

### Stripe Setup

New Stripe product: "CoachReflect API Access"
- Monthly: $4.99 / Annual: $47.99
- Env vars: `STRIPE_API_PRICE_ID`, `STRIPE_API_PRICE_ID_ANNUAL`

### MCP Tools

- `log_reflection` — Log a coaching reflection
- `get_patterns` — Get patterns from past reflections
- `coaching_chat` — Chat with the AI coaching assistant

### Files to Create/Modify

Same pattern as FootballGPT:
- **New page:** `app/dashboard/mcp/page.tsx` — config, usage, bolt-on purchase, install method split (MCP / OpenClaw / Web cards)
- **New route:** `app/api/stripe/api-checkout/route.ts` — bolt-on checkout
- **Create/modify:** `app/api/mcp/[action]/route.ts` — dual auth + bolt-on check + rate limiting
- **Modify:** pricing page — add API access row + link to AI Football for developers

**MCP config (shown in the MCP setup section of the install method split):**
```json
{
  "mcpServers": {
    "coachreflect": {
      "type": "streamable-http",
      "url": "https://coachreflection.com/api/mcp/stream",
      "headers": {
        "Authorization": "Bearer cr_abc123..."
      }
    }
  }
}
```

**Free user message:**
```
CoachReflect API access is available to Pro subscribers.

Upgrade to Pro ($7.99/month) for voice notes, session plan uploads, theme extraction, 90-day analytics, and the ability to add API access.

Upgrade here: https://coachreflection.com/dashboard/settings
```

**Pro user without bolt-on message:**
```
Add API access to use CoachReflect in your AI agent ($4.99/month).

This gives you 100 calls/day — log reflections, spot patterns, and chat with your AI coaching assistant from any MCP-compatible tool.

Add API access: https://coachreflection.com/dashboard/mcp

Building an app? Developer API access is available at https://aifootball.co/developer
```

---

## 3. RefereeGPT (refereegpt.co)

**Repo:** `/home/kevin/RefereeGPT`
**Pricing config:** `src/lib/pricing.ts`
**Existing MCP endpoint:** `src/app/api/mcp/[action]/route.ts` (exists, service key only)
**Auth:** Supabase Auth

### Stripe Setup

New Stripe product: "RefereeGPT API Access"
- Monthly: $4.99 / Annual: $47.99
- Env vars: `STRIPE_API_PRICE_ID`, `STRIPE_API_PRICE_ID_ANNUAL`

### MCP Tools

- `check_law` — Query rules with country/level context
- `analyze_incident` — Analyse match incidents against laws
- `generate_quiz` — Generate quiz questions

### Files to Create/Modify

Same pattern:
- **New page:** `src/app/app/mcp/page.tsx` — config, usage, bolt-on purchase, install method split (MCP / OpenClaw / Web cards)
- **New route:** `src/app/api/stripe/api-checkout/route.ts`
- **Modify:** `src/app/api/mcp/[action]/route.ts` — add bolt-on auth + rate limiting
- **Modify:** pricing page + link to AI Football

**MCP config (shown in the MCP setup section of the install method split):**
```json
{
  "mcpServers": {
    "refereegpt": {
      "type": "streamable-http",
      "url": "https://refereegpt.co/api/mcp/stream",
      "headers": {
        "Authorization": "Bearer rgpt_abc123..."
      }
    }
  }
}
```

**Free user message:**
```
RefereeGPT API access is available to Assessor Pro subscribers.

Upgrade to Pro ($9.99/month) for unlimited questions, all country rule variations, quiz history, conversation memory, and the ability to add API access.

Start your 7-day free trial: https://refereegpt.co/billing
```

**Pro user without bolt-on message:**
```
Add API access to use RefereeGPT in your AI agent ($4.99/month).

This gives you 100 calls/day — check laws, analyse incidents, and generate quizzes from any MCP-compatible tool.

Add API access: https://refereegpt.co/app/mcp

Building an app? Developer API access is available at https://aifootball.co/developer
```

---

## 4. PlayerReflection (playerreflection.360tft.com)

**Repo:** `/home/kevin/PlayerReflection`
**Pricing config:** `lib/config.ts`
**Auth:** Supabase Auth
**Note:** Individual player tier is free forever. Revenue from Team/Club/Academy tiers.

### Stripe Setup

New Stripe product: "PlayerReflection API Access"
- Monthly: $4.99 / Annual: $47.99
- Env vars: `STRIPE_API_PRICE_ID`, `STRIPE_API_PRICE_ID_ANNUAL`

### MCP Tools

- `log_reflection` — Log a player reflection
- `get_patterns` — Get patterns from reflections
- `player_chat` — Chat with the AI coach

### Files to Create/Modify

Same pattern as above. The bolt-on is available to any user (players, parents, coaches). MCP config page includes the install method split (MCP / OpenClaw / Web cards).

**MCP config (shown in the MCP setup section of the install method split):**
```json
{
  "mcpServers": {
    "playerreflection": {
      "type": "streamable-http",
      "url": "https://playerreflection.360tft.com/api/mcp/stream",
      "headers": {
        "Authorization": "Bearer pr_abc123..."
      }
    }
  }
}
```

---

## Token Strategy (All Products)

Supabase tokens expire hourly. MCP configs need stable credentials. Each product generates long-lived API keys.

### How it works

1. User goes to the MCP/API page on the product
2. If they're not Pro: shown upgrade CTA
3. If they're Pro but no bolt-on: shown $4.99/month purchase button
4. If they're Pro + bolt-on: shown "Generate API Key" button
5. Product creates a key (e.g., `fgpt_` + 32 random chars), hashes it, stores in `mcp_keys` table
6. Key shown once — user copies it into their MCP config
7. MCP endpoint validates key → checks Pro → checks bolt-on → rate limits

### Database migration (same for all products)

```sql
CREATE TABLE IF NOT EXISTS mcp_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mcp_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own keys"
  ON mcp_keys FOR ALL
  USING (auth.uid() = user_id);
```

### Key prefixes

| Product | Prefix |
|---------|--------|
| FootballGPT | `fgpt_` |
| CoachReflect | `cr_` |
| RefereeGPT | `rgpt_` |
| PlayerReflection | `pr_` |

### Key validation flow

```
1. Extract key from Authorization: Bearer header
2. Hash the key
3. Look up hash in mcp_keys table → get user_id
4. Check user's subscription tier (free/pro/pro+)
5. If not Pro → return "upgrade to Pro" message
6. Check user has active API bolt-on subscription
7. If no bolt-on → return "add API access" message
8. Rate limit: check `mcp:{user_id}` key in Redis (100/day)
9. If over limit → return limit message
10. Process request
11. Update last_used_at on the key
```

Key stays valid indefinitely. If Pro subscription lapses, requests are rejected with the "upgrade to Pro" message. If they resubscribe to Pro, the key works again (assuming bolt-on is still active). If bolt-on lapses but Pro is active, they get the "add API access" message.

---

## MCP Streaming Endpoint (All Products)

Each product needs a single `/api/mcp/stream` endpoint that implements the MCP JSON-RPC protocol:

1. `initialize` — handshake
2. `tools/list` — returns available tools
3. `tools/call` — routes to the correct handler

This wraps the existing `/api/mcp/[action]` routes internally. Auth and rate limiting happen once at the stream level.

If the full MCP protocol wrapper is too much work initially, the existing action routes work — just add auth and rate limiting to each one.

---

## Marketplace Gateway (mcp.360tft.com)

The marketplace gateway continues to work alongside direct product access:

- Gateway uses `x-mcp-service-key` header (existing pattern)
- Products allow service key requests through without per-user rate limiting
- The gateway handles its own rate limiting via AI Football API keys
- Both paths (direct product + marketplace gateway) work independently

No changes to the existing service key pattern.

---

## AI Football Developer Tiers (aifootball.co)

The marketplace already has API key infrastructure. Update the developer page to reflect the final tiers:

| Tier | Calls/Day | Products | Price |
|------|-----------|----------|-------|
| Free | 10 | All | $0 |
| Builder | 1,000 | All | $79/month |
| Scale | 5,000 | All | $349/month |
| Enterprise | Custom | All | Contact |

One API key, all products, higher volume. This is where product sites link when someone asks about building an app.

Update `src/app/developer/page.tsx` and `src/data/tools.ts` (or wherever tiers are defined) on the marketplace.

---

## Cross-linking

### On each product site

Pricing page should include:
- API access bolt-on: $4.99/month, 100 calls/day
- Small text: "Building an app? [Developer API access with all products](https://aifootball.co/developer)"

### On AI Football

Developer page should include:
- Builder/Scale/Enterprise tiers
- Small text: "Just want personal access to one product? Get the $4.99/month API bolt-on directly on [FootballGPT](https://footballgpt.co), [CoachReflect](https://coachreflection.com), or [RefereeGPT](https://refereegpt.co)"

---

## Implementation Order

1. **FootballGPT** — reference implementation, most mature product
2. **RefereeGPT** — already has MCP endpoints, just needs auth + bolt-on
3. **CoachReflect** — may need MCP endpoints created
4. **PlayerReflection** — lowest priority

Per product:
1. Create Stripe product + prices for API bolt-on
2. Add `mcp_keys` table (migration)
3. Create MCP config/API page (new page)
4. Add API bolt-on checkout route
5. Update MCP endpoint: dual auth + bolt-on check + rate limiting
6. Update pricing page: add bolt-on row + link to AI Football
7. Update webhook: handle API bolt-on subscription events
8. Test: buy bolt-on, generate key, use in MCP client, hit limit, see messages

---

## Upgrade Message Guidelines

Every message must:
- State clearly what happened (no access / limit reached)
- Name the price ($4.99/month for bolt-on, or link to AI Football for developers)
- List 2-3 benefits beyond just "API access"
- Include a direct link to buy or upgrade
- Be returned as a **200 OK** with text in the tool result — never an HTTP error
- End with "Or try again tomorrow" for rate limits

The message appears in the user's conversation. It's a sales touchpoint.
