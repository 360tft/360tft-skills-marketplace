# SEO/GEO Remediation PRD

**Product:** AI Football Marketplace (aifootball.co)
**Current Score:** SEO 85/100, GEO 80/100
**Target Score:** SEO 95/100, GEO 95/100
**Date:** 2026-02-27

Good structured data foundation (Organization, WebSite, SoftwareApplication, BreadcrumbList schemas all present). The critical gap is that the most important pages on the site -- individual tool pages -- are entirely client-rendered, meaning search engines and social platforms see zero per-tool metadata. Fixing this alone should move both scores significantly.

---

## Summary Table

| # | Issue | Severity | Effort | File(s) | Status |
|---|-------|----------|--------|---------|--------|
| 1 | `/tools/[slug]` is `'use client'` -- no per-tool metadata | P0 | Large | `src/app/tools/[slug]/page.tsx`, new `layout.tsx` or refactor | [ ] |
| 2 | `/submit` is `'use client'` -- no page metadata | P0 | Small | `src/app/submit/page.tsx` | [ ] |
| 3 | No custom 404 page | P1 | Small | `src/app/not-found.tsx` (new) | [ ] |
| 4 | Missing `llms.txt` | P1 | Small | `public/llms.txt` (new) | [ ] |
| 5 | No AI bot rules in `robots.txt` | P1 | Small | `src/app/robots.ts` | [ ] |
| 6 | Tool pricing not shown inline on marketplace pages | P1 | Medium | `src/data/tools.ts`, `src/app/tools/[slug]/page.tsx` | [ ] |
| 7 | No comparison pages | P2 | Large | New route `src/app/compare/page.tsx` | [ ] |
| 8 | No explicit per-page canonical URLs | P2 | Small | `src/app/tools/[slug]/page.tsx` (in metadata) | [ ] |
| 9 | Large image files (logo-512.png 202KB, logo-square.png 205KB) | P2 | Small | `public/logo-512.png`, `public/logo-square.png` | [ ] |
| 10 | Tool emoji icons lack alt text | P3 | Small | `src/app/tools/[slug]/page.tsx`, `src/components/tool-card.tsx` | [ ] |
| 11 | VideoObject schema placeholder | P3 | Tiny | Future work | [ ] |
| 12 | Centralised pricing page | P3 | Medium | New route | [ ] |

---

## P0: Critical

### 1. `/tools/[slug]` pages are fully client-rendered

**Problem:**
The entire file at `src/app/tools/[slug]/page.tsx` starts with `'use client'`. This is the single most important page type on the marketplace. Every tool detail page:

- Has **no per-tool `<title>`** -- search engines see the generic layout title "AI Football | AI Skills, MCPs & Agents for Football Coaches" for every tool page.
- Has **no per-tool `<meta name="description">`** -- search engines have no tool-specific snippet to display.
- Has **no per-tool Open Graph tags** -- sharing any tool on Twitter/LinkedIn/Slack shows the generic site OG image instead of tool-specific information.
- JSON-LD structured data is injected client-side via `dangerouslySetInnerHTML` inside a `'use client'` component. Googlebot may or may not execute this JavaScript. It is unreliable for structured data.
- The canonical URL is not set per-page.

This is the single highest-impact SEO issue on the site. Every tool page is effectively invisible to search engines as a distinct page.

**Solution:**
Convert the page to a server component that exports `generateMetadata()`, and extract all interactive parts (TryItDemo, InstallModal, ReviewSection, FavouriteButton, StarRating) into a separate client component.

**Files to change:**
- `src/app/tools/[slug]/page.tsx` -- refactor to server component
- `src/app/tools/[slug]/tool-detail-client.tsx` -- new file for all client-side interactivity

**Code example:**

New `src/app/tools/[slug]/page.tsx` (server component):

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getRelatedTools, getPublishedTools } from "@/data/tools";
import { ToolDetailClient } from "./tool-detail-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

const categoryLabels: Record<string, string> = {
  coaching: "Coaching",
  refereeing: "Refereeing",
  player_dev: "Player Development",
  club_mgmt: "Club Management",
  analytics: "Analytics",
  content: "Content",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  const categoryLabel = categoryLabels[tool.category] || tool.category;
  const title = `${tool.name} - ${categoryLabel} AI Tool`;
  const description = tool.description;
  const url = `${baseUrl}/tools/${tool.slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${tool.name} | AI Football`,
      description,
      url,
      type: "website",
      siteName: "AI Football",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | AI Football`,
      description,
      creator: "@360_tft",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateStaticParams() {
  const tools = getPublishedTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);

  // Server-rendered JSON-LD (reliable for crawlers)
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "AI Tool",
    operatingSystem: "Web, Claude Desktop, ChatGPT",
    url: `${baseUrl}/tools/${tool.slug}`,
    author: {
      "@type": "Person",
      name: tool.authorName,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        tool.pricingType === "free"
          ? "Free"
          : "Free tier available, Pro features with subscription",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabels[tool.category] || tool.category,
        item: `${baseUrl}/?category=${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${baseUrl}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <ToolDetailClient tool={tool} relatedTools={relatedTools} />
    </>
  );
}
```

New `src/app/tools/[slug]/tool-detail-client.tsx` should contain the existing `'use client'` code (TryItDemo, InstallModal, StarRating, ReviewSection, FavouriteButton, the page layout JSX) but receive `tool` and `relatedTools` as props instead of resolving them from params. The key point is that `generateMetadata` and `generateStaticParams` run on the server, so crawlers see correct `<title>`, `<meta>`, and OG tags in the initial HTML.

**Verification:**
After implementing, run `curl -s https://aifootball.co/tools/coaching-advice | grep '<title>'` and confirm it shows "Coaching Advice - Coaching AI Tool | AI Football" (not the generic site title).

---

### 2. `/submit` page is `'use client'` with no metadata

**Problem:**
`src/app/submit/page.tsx` starts with `'use client'`. The page has no exported metadata. Search engines see the generic site title for this page too.

**Solution:**
Same pattern as above. Extract the form into a client component, make the page a server component that exports metadata.

**Files to change:**
- `src/app/submit/page.tsx` -- refactor to server component
- `src/app/submit/submit-form-client.tsx` -- new file for form interactivity

**Metadata to add:**

```tsx
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

export const metadata: Metadata = {
  title: "Submit Your Football AI Tool",
  description:
    "List your football AI tool on AI Football for free. We accept MCP servers, APIs, Claude skills, and Custom GPTs. Reach thousands of football coaches using AI.",
  openGraph: {
    title: "Submit Your Football AI Tool | AI Football",
    description:
      "List your football AI tool on the first AI marketplace for football. Free listing, reviewed within days.",
    url: `${baseUrl}/submit`,
  },
  alternates: {
    canonical: `${baseUrl}/submit`,
  },
};
```

---

## P1: High

### 3. No custom 404 page

**Problem:**
Visiting any invalid URL (e.g. `/tools/nonexistent-tool`, `/asdfasdf`) shows the default Next.js error page. This is a poor user experience and a missed SEO opportunity -- search engines that encounter 404s see no useful content or internal links.

**File to create:** `src/app/not-found.tsx`

**Implementation:**

```tsx
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
          Page not found
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse all tools
          </Link>
          <Link
            href="/submit"
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            Submit a tool
          </Link>
          <Link
            href="/docs"
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            Documentation
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

Note: The tool detail page currently handles "tool not found" inside its client component render. After the P0 refactor above, the server component should call `notFound()` from `next/navigation` when the tool does not exist, which will trigger this custom 404 page automatically.

---

### 4. Missing `llms.txt`

**Problem:**
`llms.txt` is an emerging convention (similar to `robots.txt`) that tells AI systems what a site is about, what content is available, and how to interact with it. AI Football is an AI marketplace -- it should absolutely have one. This helps with GEO (Generative Engine Optimisation) discoverability.

**File to create:** `public/llms.txt`

**Content:**

```
# AI Football
> The first AI agent marketplace for football. Discover and install MCP tools, agents, and APIs for coaching, refereeing, scouting, and club management.

## What is AI Football?
AI Football (aifootball.co) is a marketplace where football coaches, clubs, and developers can discover AI-powered tools built specifically for football. Tools are available as MCP (Model Context Protocol) servers for Claude Desktop, Custom GPTs for ChatGPT, and web-based APIs.

## Available Tools
Tools are organised into categories: Coaching, Refereeing, Player Development, Club Management, Analytics, and Content. Each tool has a detail page at /tools/{slug} with descriptions, example queries, pricing, install instructions, and user reviews.

### Featured Tools
- Coaching Advice (/tools/coaching-advice) - 18 specialist AI advisors for football coaching guidance
- Session Plan Generator (/tools/session-plan) - Generate complete training session plans
- Player Stats Search (/tools/player-stats) - Search real player statistics from 100+ leagues
- Law Explainer (/tools/law-explainer) - Laws of the Game explained with real match examples
- Coaching Reflection (/tools/coaching-reflection) - AI-guided post-session reflection journal

## MCP Integration
All tools are available as MCP servers via the AI Football MCP Gateway at mcp.360tft.com. Developers can connect to any tool using the streamable-http transport. Configuration example:
{
  "mcpServers": {
    "footballgpt": {
      "type": "streamable-http",
      "url": "https://mcp.360tft.com/footballgpt/mcp"
    }
  }
}

## For Developers
- Submit a tool: /submit
- API documentation: /docs/api
- Claude Desktop setup: /docs/claude-desktop
- ChatGPT setup: /docs/chatgpt
- Developer portal: /developer

## Pricing
Most tools offer a free tier (2 messages/day). Pro subscriptions are available through each tool's parent product. Listings on the marketplace are free for developers.

## Who Built This
AI Football is built by 360TFT (360tft.co.uk), founded by Coach Kevin Middleton. Products include FootballGPT (footballgpt.co), RefereeGPT (refereegpt.co), CoachReflection (coachreflection.com), and CruiseGPT (360cruising.com).

## Contact
- AI Football Skool: skool.com/aifootball
- Twitter: @360_tft
```

Also add `/llms.txt` to the sitemap in `src/app/sitemap.ts` with priority 0.3 and changeFrequency "monthly".

---

### 5. No AI bot rules in `robots.txt`

**Problem:**
The current `robots.ts` only specifies rules for `userAgent: "*"`. It does not explicitly allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.). While `*` technically covers them, explicit rules signal intent and some AI crawlers check for their own user-agent entry before crawling.

**File to change:** `src/app/robots.ts`

**Updated implementation:**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifootball.co";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/dashboard"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/dashboard"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/dashboard"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/dashboard"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

Note: Also added `/auth` and `/dashboard` to the disallow list. These were previously crawlable but contain no public content.

---

### 6. Tool pricing not shown inline

**Problem:**
Individual tool pages do not display pricing information inline. Users must click through to the parent product (e.g. footballgpt.co) to find out what Pro costs. This is bad for both SEO (pricing keywords are missing from the page) and conversion (users leave the marketplace to check pricing).

**Solution:**
Add a `pricing` field to the `Tool` type in `src/data/tools.ts`, and render a pricing section on the tool detail page.

**File to change:** `src/data/tools.ts`

Add to the `Tool` interface:

```ts
export interface Tool {
  // ... existing fields ...
  pricing?: {
    free: string;        // e.g. "2 messages/day"
    pro?: string;        // e.g. "$10.99/month or $99/year"
    proFeatures?: string[]; // e.g. ["40 messages/day", "Conversation history", "All advisors"]
  };
}
```

**File to change:** Tool detail page (after P0 refactor, this will be `src/app/tools/[slug]/tool-detail-client.tsx`)

Add a pricing section between the "About" section and the "Try it" demo:

```tsx
{tool.pricing && (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
      Pricing
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="font-medium text-[var(--foreground)] mb-1">Free</h3>
        <p className="text-sm text-[var(--muted-foreground)]">{tool.pricing.free}</p>
      </div>
      {tool.pricing.pro && (
        <div className="bg-[var(--card)] border border-[var(--accent)]/30 rounded-xl p-4">
          <h3 className="font-medium text-[var(--accent)] mb-1">Pro</h3>
          <p className="text-sm text-[var(--foreground)] font-medium mb-2">{tool.pricing.pro}</p>
          {tool.pricing.proFeatures && (
            <ul className="text-xs text-[var(--muted-foreground)] space-y-1">
              {tool.pricing.proFeatures.map((f, i) => (
                <li key={i}>- {f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  </div>
)}
```

Also update the JSON-LD `offers` to include the actual Pro price when available:

```ts
offers: tool.pricing?.pro
  ? [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: `Free: ${tool.pricing.free}`,
      },
      {
        "@type": "Offer",
        price: tool.pricing.pro.match(/\$(\d+\.?\d*)/)?.[1] || "0",
        priceCurrency: "USD",
        description: `Pro: ${tool.pricing.pro}`,
      },
    ]
  : {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free",
    },
```

---

## P2: Medium

### 7. No comparison pages

**Problem:**
There are no pages that compare tools across categories or features. Comparison pages rank well for "X vs Y" and "best football AI tools" queries, which are high-intent searches.

**Solution:**
Create a comparison page at `/compare` that shows tools grouped by category with feature/pricing comparison tables.

**File to create:** `src/app/compare/page.tsx`

This should be a server component that:
1. Exports metadata: title "Compare Football AI Tools", description about comparing tools by category
2. Groups all published tools by category
3. Renders a table per category with columns: Tool Name, Pricing Type, Free Tier, Pro Price, Install Methods, Rating
4. Includes internal links to each tool detail page
5. Has JSON-LD `ItemList` schema for each category grouping

**Add to sitemap:** `/compare` with priority 0.7 and changeFrequency "weekly".

**Estimated page structure:**

```
/compare
  - H1: "Compare Football AI Tools"
  - Brief intro paragraph
  - For each category:
    - H2: Category name
    - Comparison table (tools in that category)
    - "View all {category} tools" link
```

---

### 8. No explicit per-page canonical URLs

**Problem:**
While Next.js handles canonical URLs automatically via `metadataBase`, it is better practice to set them explicitly per page. This is especially important for tool pages which may be accessible via multiple URL patterns in the future.

**Solution:**
This is handled as part of the P0 fix (issue #1). The `generateMetadata` function shown above already includes:

```ts
alternates: {
  canonical: `${baseUrl}/tools/${tool.slug}`,
},
```

Apply the same pattern to all other pages that lack explicit canonical URLs. Check these files:
- `src/app/page.tsx` (homepage -- already has canonical in layout)
- `src/app/learn/page.tsx`
- `src/app/developer/page.tsx`
- `src/app/mcp/page.tsx`
- `src/app/agents/page.tsx`
- `src/app/openclaw/page.tsx`
- `src/app/docs/page.tsx` (and sub-pages)

---

### 9. Large image files

**Problem:**
Two images in `/public` are significantly oversized:
- `logo-512.png` -- 202KB (a 512x512 icon should be under 50KB)
- `logo-square.png` -- 205KB (similar)

These slow down page loads and affect Core Web Vitals (LCP if used above the fold).

**Solution:**
Optimise both images. Options:
1. Re-export as optimised PNG using `pngquant` or `optipng`
2. Convert to WebP format (better compression, 90%+ browser support)
3. Use Next.js `<Image>` component where these are referenced in page code (it handles optimisation automatically)

**Commands:**

```bash
# Option 1: Optimise PNG in place
pngquant --quality=65-80 --ext .png --force public/logo-512.png
pngquant --quality=65-80 --ext .png --force public/logo-square.png

# Option 2: Also create WebP versions
cwebp -q 80 public/logo-512.png -o public/logo-512.webp
cwebp -q 80 public/logo-square.png -o public/logo-square.webp
```

Target: Both files under 50KB after optimisation.

Note: `logo-512.png` is referenced in the `manifest.ts` and Organization JSON-LD, so the filename should not change. The `logo-square.png` file should be checked for references before renaming.

---

## P3: Nice to Have

### 10. Tool emoji icons lack alt text

**Problem:**
Tool icons are rendered as emoji characters in a `<div>` with no accessibility attributes:

```tsx
<div className="text-4xl w-16 h-16 flex items-center justify-center bg-white/5 rounded-xl shrink-0">
  {tool.iconEmoji}
</div>
```

Screen readers will attempt to read the emoji, which may or may not produce a meaningful label. More importantly, search engines cannot interpret the emoji as a tool identifier.

**Solution:**
Add `role="img"` and `aria-label` to the emoji container:

```tsx
<div
  className="text-4xl w-16 h-16 flex items-center justify-center bg-white/5 rounded-xl shrink-0"
  role="img"
  aria-label={`${tool.name} icon`}
>
  {tool.iconEmoji}
</div>
```

Apply the same fix in `src/components/tool-card.tsx` wherever emoji icons are rendered.

---

### 11. VideoObject schema (future)

**Problem:**
If tutorial videos are added to tool pages in the future, they should include `VideoObject` structured data for Google Video search results.

**Action:** No action now. When video content is added to tool pages, add JSON-LD like:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "How to use Coaching Advice in Claude Desktop",
  "description": "...",
  "thumbnailUrl": "...",
  "uploadDate": "2026-02-27",
  "contentUrl": "...",
  "duration": "PT2M30S"
}
```

---

### 12. Centralised pricing page

**Problem:**
Pricing for different tools/products is scattered. A dedicated `/pricing` page would rank for "AI football tools pricing" queries and give users a single place to compare costs.

**Solution:**
Create `/pricing` page that pulls pricing data from all tools and presents it in a comparison grid. Lower priority than the inline pricing on tool pages (issue #6) since that covers the same information in context.

---

## Implementation Order

Execute in this order. Each step is independently deployable.

### Phase 1: Fix crawlability (P0) -- Do first
1. **Issue #1** -- Refactor `/tools/[slug]` to server component with `generateMetadata`. This is the single biggest improvement. Extract `TryItDemo`, `InstallModal`, `ReviewSection`, `FavouriteButton`, and `StarRating` into `tool-detail-client.tsx`.
2. **Issue #2** -- Refactor `/submit` to server component with metadata. Same pattern, smaller file.

### Phase 2: Quick wins (P1) -- Do next
3. **Issue #5** -- Update `robots.ts` with AI bot rules. One-file change, deploy immediately.
4. **Issue #4** -- Create `public/llms.txt`. Static file, no build required.
5. **Issue #3** -- Create `src/app/not-found.tsx`. Small standalone file.
6. **Issue #9** -- Optimise large images. Run compression commands, commit.

### Phase 3: Content enrichment (P1-P2)
7. **Issue #6** -- Add pricing data to tools and render inline. Requires updating `src/data/tools.ts` with pricing for each tool and updating the detail page template.
8. **Issue #8** -- Add explicit canonical URLs to all remaining pages. Quick pass through each page file.

### Phase 4: New content (P2-P3)
9. **Issue #7** -- Build comparison page. Largest remaining effort.
10. **Issue #10** -- Fix emoji accessibility. Small change across two files.
11. **Issues #11, #12** -- Future work, no action now.

---

## Verification Checklist

After all changes are deployed, verify:

- [ ] `curl -s https://aifootball.co/tools/coaching-advice | grep '<title>'` shows tool-specific title
- [ ] `curl -s https://aifootball.co/tools/coaching-advice | grep 'og:title'` shows tool-specific OG title
- [ ] `curl -s https://aifootball.co/tools/coaching-advice | grep 'og:description'` shows tool description
- [ ] `curl -s https://aifootball.co/tools/coaching-advice | grep 'canonical'` shows correct URL
- [ ] `curl -s https://aifootball.co/tools/coaching-advice | grep 'SoftwareApplication'` shows JSON-LD in HTML (not requiring JS execution)
- [ ] `curl -s https://aifootball.co/submit | grep '<title>'` shows "Submit Your Football AI Tool"
- [ ] `curl -s https://aifootball.co/nonexistent-page` returns 404 with custom page content
- [ ] `curl -s https://aifootball.co/robots.txt` shows GPTBot, ClaudeBot, PerplexityBot rules
- [ ] `curl -s https://aifootball.co/llms.txt` returns the AI-readable site description
- [ ] Google Rich Results Test passes for `/tools/coaching-advice`
- [ ] `logo-512.png` is under 50KB
- [ ] `logo-square.png` is under 50KB
- [ ] Google Search Console shows no new crawl errors after deploy
