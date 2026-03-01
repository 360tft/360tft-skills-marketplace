# AI Football Marketplace -- Frontend Design Assessment

**Date:** 2026-02-28
**Assessed URL:** aifootball.co
**Repo:** `/home/kevin/360tft-skills-marketplace`
**Overall Score: 35/50**

---

## 1. Typography (3/5)

### Current State

The site uses `system-ui, -apple-system, sans-serif` defined in `/home/kevin/360tft-skills-marketplace/src/app/globals.css` (line 20). No custom web font is loaded. The type scale relies entirely on Tailwind utility classes applied ad hoc across components.

### Issues Found

**A. No custom typeface.** System fonts are functional but generic. Every other modern SaaS marketplace (Vercel, Linear, Raycast) uses a distinctive sans-serif (Inter, Geist, Plus Jakarta Sans) to signal quality. System UI on Windows renders as Segoe UI, which reads differently from SF Pro on macOS. The result is that the site looks slightly different per platform and lacks a consistent personality.

**B. Inconsistent heading sizes.** The homepage h1 is `text-3xl sm:text-4xl` (line 122 of `page.tsx`), secondary headings are `text-xl` (lines 284, 337, 358), and the tool detail page h1 is `text-2xl` (line 781 of `tools/[slug]/page.tsx`). There is no defined type scale. Heading levels jump unpredictably.

**C. Body text is too small in places.** Tool card descriptions use `text-sm` (14px) which is fine, but badge text uses `text-[10px]` which is below the WCAG minimum recommendation of 12px. This appears in `tool-card.tsx` lines 17, 70 and `sponsored-badge.tsx` line 3. The category labels, pricing tier labels, and status badges all sit at 10px.

**D. Line heights are inconsistent.** Some text blocks use `leading-relaxed` (1.625), others rely on the Tailwind default (1.5), and short labels have no explicit leading. The FAQ answers (`page.tsx` line 349) use `leading-relaxed`, while the "How it works" descriptions (line 155) do not.

### Recommendations

1. **Add a web font.** Inter or Geist Sans would suit the developer-marketplace aesthetic. Add via `next/font/google` in `layout.tsx` to avoid layout shift:

```typescript
// /home/kevin/360tft-skills-marketplace/src/app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
// Then apply className={inter.variable} to <html>
```

Update `globals.css` to reference the variable:
```css
body {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

2. **Define a type scale.** Create a set of reusable heading classes or CSS custom properties. Suggested scale: `--text-4xl: 2.25rem`, `--text-3xl: 1.875rem`, `--text-2xl: 1.5rem`, `--text-xl: 1.25rem`, `--text-lg: 1.125rem`, `--text-base: 1rem`, `--text-sm: 0.875rem`, `--text-xs: 0.75rem`. Apply consistently. Page-level h1 should always be `text-3xl` or `text-4xl`. Section h2 should always be `text-xl`.

3. **Increase minimum text size to 11px.** Replace all `text-[10px]` instances with `text-[11px]` at minimum. This affects `tool-card.tsx`, `sponsored-badge.tsx`, `dashboard/page.tsx`, and `dashboard/creator/page.tsx`.

---

## 2. Colour System (4/5)

### Current State

The colour palette is defined via CSS custom properties in `globals.css` (lines 3-15):

```css
--background: #0a0a0a;
--foreground: #e5e5e5;
--card: #141414;
--card-hover: #1a1a1a;
--border: #262626;
--accent: #e5a11c;
--accent-hover: #d4940f;
--muted: #737373;
--muted-foreground: #a3a3a3;
--success: #16a34a;
--destructive: #dc2626;
```

### Issues Found

**A. No light mode support.** The entire site is dark-mode only. There is no `prefers-color-scheme: light` media query and no light-mode variable set. This is a deliberate design choice that works for a developer-facing tool marketplace, but it limits accessibility for users who prefer light mode, particularly older coaches browsing in bright environments (outdoor pitches, for instance).

**B. The accent colour (#e5a11c, amber/gold) has borderline contrast against the dark card backgrounds.** Testing `#e5a11c` on `#141414` gives a contrast ratio of approximately 6.2:1 for normal text, which passes WCAG AA. However, the hover state `#d4940f` on `#141414` drops to approximately 5.3:1, which still passes AA but is on the lower end.

**C. Several supplementary colours are used inconsistently.** Purple (`purple-500`, `purple-400`) appears in badges for "Popular" and "Community", pink (`pink-500/15`) for "New", blue (`blue-500/15`) for activity badges, amber for sponsorship, and green for success. These are pulled from Tailwind defaults rather than the custom property system, creating a split between the defined palette and ad hoc Tailwind colours.

**D. No `--warning` colour defined.** The system has `--success` and `--destructive` but no warning/caution state. Yellow/amber badges borrow from Tailwind (`yellow-400`, `yellow-500/15`) rather than a defined variable.

### Recommendations

1. **Add remaining semantic colours to globals.css:**

```css
--warning: #eab308;
--info: #3b82f6;
```

2. **Consolidate supplementary colours.** Replace direct Tailwind colour references (e.g. `bg-purple-500/15`, `bg-pink-500/15`) with custom properties or at least document the colour assignments. Create a comment block in `globals.css` listing the badge colour assignments for consistency.

3. **Light mode is a P3 consideration.** Not urgent for the target audience, but worth noting for future expansion.

---

## 3. Spacing and Layout (4/5)

### Current State

The site uses `max-w-6xl` (72rem/1152px) for the homepage and `max-w-4xl` (56rem/896px) for interior pages, with `px-4` horizontal padding. Vertical spacing between sections uses `mb-10`, `mt-16`, `mb-8` etc. The tool grid uses Tailwind's grid system: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.

### Issues Found

**A. Spacing values are inconsistent across pages.** The homepage uses `mb-10` between sections (lines 121, 147, 200), then jumps to `mt-16` for the "Get Started" and FAQ sections (lines 283, 336, 357). Interior pages like the docs page use `mb-10` consistently. The agents page uses `mb-12`. There is no spacing system, just individual values per section.

**B. Card internal padding varies.** Tool cards use `p-5`, the "How it works" cards use `p-5`, the "Get started" links use `p-4`, the bottom CTA uses `p-8`, and the FAQ items use `p-5`. Most are close but the inconsistency creates a subtle visual unevenness.

**C. The mobile horizontal padding `px-4` (16px) is adequate but tight on very small screens.** The header uses the same `px-4`, which means the logo and nav items are close to the screen edge on 320px viewports.

**D. No spacing between the "New to AI?" card (line 184) and the platform badges section (line 201).** The "New to AI?" card has `mb-10` but it sits between the "How it works" section and the platform badges, creating a slightly disjointed flow on the homepage.

### Recommendations

1. **Define a section spacing convention.** Use `mt-12` or `mt-16` consistently between major page sections and `mb-6` or `mb-8` between subsections. Apply this across all pages.

2. **Standardise card padding.** Use `p-5` for all content cards and `p-6` or `p-8` for CTA/promotional sections.

3. **Consider `px-5` or `px-6` on mobile** for slightly more breathing room, particularly in the header.

---

## 4. Visual Hierarchy (3/5)

### Current State

The homepage flows: hero text, 3-step process, "New to AI?" callout, platform badges, sponsored hero, search/filter, tool grid, get-started section, FAQ, bottom CTA.

### Issues Found

**A. The hero section is weak.** The h1 "AI Skills for Football Coaches" is `text-3xl sm:text-4xl` (roughly 30-36px) in plain text with no gradient, no accent colour, and no supporting visual element. For a marketplace whose primary job is to immediately communicate "this is where you find football AI tools", the hero needs more visual weight. Compare with marketplaces like the Vercel template gallery or the Raycast extensions page, which use large type, accent gradients, or hero illustrations.

**B. Too many sections before the main content.** A user landing on the homepage must scroll past (1) the hero, (2) the 3-step "How it works" cards, (3) the "New to AI?" callout, and (4) platform badges before reaching the search bar and tool grid. The tool grid is the primary content and it is pushed below the fold on most screens. The "How it works" section is educational but secondary to browsing tools.

**C. Every tool card has a "New" badge** (visible in the live HTML). When every tool is labelled "New", the badge loses its meaning and adds visual noise. This happens because `installCount` is 0 for all tools (line 94-98 of `tool-card.tsx`: when `installCount` is not > 0, it shows the "New" badge).

**D. The "Frequently asked questions" section uses static cards rather than an accordion.** Five fully-expanded FAQ items take up significant vertical space and push the bottom CTA further down.

### Recommendations

1. **Strengthen the hero.** Add an accent colour to the heading or a subtle gradient. For example:

```tsx
// In /home/kevin/360tft-skills-marketplace/src/app/page.tsx, line 122
<h1 className="text-3xl sm:text-5xl font-bold text-[var(--foreground)] mb-3">
  AI Skills for{' '}
  <span className="text-[var(--accent)]">Football Coaches</span>
</h1>
```

Consider bumping to `text-5xl` on desktop for more impact.

2. **Move the search bar and tool grid higher.** Relocate the "How it works" cards and "New to AI?" callout below the tool grid, or collapse them into a single dismissible banner. The search bar and tool grid should be visible within the first viewport.

3. **Fix the "New" badge logic.** Only show "New" for tools added within the last 30 days, or remove the fallback in `tool-card.tsx` (lines 94-98):

```tsx
// Instead of showing "New" when installCount is 0:
{tool.installCount > 0 && <span>{tool.installCount} installs</span>}
// Just show nothing, or show the pricing type
```

4. **Convert FAQs to an accordion component.** Use a `<details>/<summary>` pattern or a simple useState toggle to collapse answers by default.

---

## 5. Component Consistency (4/5)

### Current State

Components are well-structured. Shared components live in `/home/kevin/360tft-skills-marketplace/src/components/`: `header.tsx`, `footer.tsx`, `tool-card.tsx`, `search-filter.tsx`, `auth-button.tsx`, `sponsored-badge.tsx`, `sponsored-hero.tsx`, `sponsored-alternatives.tsx`.

### Issues Found

**A. Button styles are not extracted to a shared component or utility.** Primary buttons appear as inline classes across many files:
- `bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-colors` (appears 15+ times)
- Secondary/outline buttons: `border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5 transition-colors` (appears 10+ times)
- Small buttons: `text-xs font-medium px-3 py-1.5 rounded-lg` (varies)

If the accent colour or border radius changes, every instance must be updated manually.

**B. No shared Input component.** Input fields are styled inline in `search-filter.tsx`, `tools/[slug]/page.tsx` (TryItDemo, InstallModal), `developer/page.tsx`, `submit/page.tsx`, `dashboard/page.tsx`, and `auth/login/page.tsx`. The styling is almost identical each time but copy-pasted:
```
bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50
```

**C. Card components are inline.** While `ToolCard` exists as a component, the "How it works" cards, "Get started" cards, FAQ cards, platform cards, and pricing cards are all individually styled `<div>` elements with the same `bg-[var(--card)] border border-[var(--border)] rounded-xl p-5` pattern. A `<Card>` wrapper component would reduce repetition.

**D. Badge styles are partially extracted.** The `Badge` function exists inside `tool-card.tsx` (lines 7-24) as a local function, and `SponsoredBadge` is its own component. But similar badge patterns are recreated inline in `dashboard/page.tsx` (line 414), `dashboard/creator/page.tsx` (line 296), and `tools/[slug]/page.tsx` (line 787). These should all use a shared Badge component.

### Recommendations

1. **Create shared UI primitives.** Add the following to `/home/kevin/360tft-skills-marketplace/src/components/ui/`:

   - `button.tsx` with variants: `primary`, `secondary`, `ghost`, `destructive`, and sizes: `sm`, `md`, `lg`
   - `input.tsx` wrapping the standard input styling
   - `card.tsx` wrapping the `bg-[var(--card)] border border-[var(--border)] rounded-xl` pattern
   - `badge.tsx` extracted from the current `tool-card.tsx` Badge function

2. **Move the Badge function** out of `tool-card.tsx` into its own `components/badge.tsx` and import it everywhere badges are used.

---

## 6. Branding (3/5)

### Current State

The logo is a plain coloured square (`w-8 h-8 rounded-lg bg-[var(--accent)]`) with the text "AI" in black (`header.tsx` lines 9-11). The brand name "AI Football" appears next to it in `font-semibold text-sm`. The subtitle "by 360TFT" appears in muted text on larger screens.

### Issues Found

**A. The logo is a CSS-only placeholder.** It is literally a gold square with two letters. This does not project credibility for a marketplace that wants developers and organisations to trust it with their tools. Every competing AI marketplace (Hugging Face, Replicate, OpenRouter) has a distinctive mark.

**B. Brand identity is minimal.** The gold/amber accent on dark grey is clean but unremarkable. There is no distinctive visual motif, no football-related visual element, and no illustration or graphic anywhere on the site. It reads as a developer tool rather than a football product. The target audience includes grassroots coaches who may not identify with a purely developer aesthetic.

**C. The "by 360TFT" attribution is hidden on mobile** (line 16: `hidden sm:inline`). On mobile, the brand shows only "AI Football" next to a small gold square, which is generic.

**D. No favicon or app icons that reflect the football domain.** The manifest references `logo-32.png`, `logo-180.png`, and `logo-512.png`, but these appear to be generated programmatically from `icon.tsx` and `apple-icon.tsx` which likely output the same gold square.

### Recommendations

1. **Commission or create a proper logo.** Even a simple mark (a football within a circuit board pattern, an "AI" ligature with a football motif) would differentiate the brand. Use the existing 360TFT brand assets repo as a starting point.

2. **Add at least one football-themed visual element to the homepage hero.** This could be a subtle background pattern (football pitch lines), an illustration, or an isometric diagram showing tools connecting to a football coaching workflow.

3. **Consider making the "by 360TFT" visible on all viewports** since it provides credibility linkage.

---

## 7. Modern Design Trends (3/5)

### Current State

The site uses a dark theme, `backdrop-blur-sm` on the sticky header, `rounded-xl` corners on cards, subtle hover transitions (`transition-colors`, `transition-all`), and `hover:shadow-lg hover:shadow-[var(--accent)]/5` on tool cards.

### Issues Found

**A. No gradient usage anywhere.** The only gradient is on the `SponsoredHero` component (`bg-gradient-to-r from-amber-500/10 via-[var(--card)] to-amber-500/10`). Modern marketplace and SaaS sites make heavy use of subtle gradients on heroes, CTAs, and section backgrounds to add depth.

**B. No micro-interactions or animations.** There are no entry animations, no skeleton loading states, no animated transitions between filter states, and no hover micro-animations beyond colour changes. The loading state is literally `<p className="text-[var(--muted)]">Loading...</p>` (multiple files). A spinner or skeleton would feel more polished.

**C. No glassmorphism or depth effects beyond the header blur.** The cards all sit at the same visual plane. There is no use of `backdrop-blur`, layered shadows, or `bg-gradient-*` on card backgrounds to create a sense of depth.

**D. No dark mode grid lines or subtle patterns.** Modern dark-themed marketplaces (Linear, Vercel) often use very faint grid lines, dot patterns, or noise textures as background to prevent the UI from feeling flat.

### Recommendations

1. **Add a gradient accent to the hero section.** A subtle radial gradient behind the h1 text adds visual interest:

```css
/* In globals.css or as an inline style on the hero wrapper */
.hero-glow {
  background: radial-gradient(ellipse at center top, rgba(229, 161, 28, 0.08) 0%, transparent 60%);
}
```

2. **Add skeleton loading states.** Create a `<Skeleton>` component (a pulsing grey rectangle) and use it in the dashboard, developer portal, and any page that fetches data on mount.

3. **Add entry animations.** Use CSS `@keyframes` or Tailwind's `animate-` utilities for cards to fade-in and slide-up slightly on page load. Framer Motion is an option if you want more control, but CSS animations are lighter.

4. **Add a subtle grid or dot pattern to the page background.** This is a small CSS addition:

```css
body {
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## 8. Conversion Design (3/5)

### Current State

The site's conversion goals are: (1) try a tool on the web, (2) install an MCP, (3) sign up for an API key, (4) join AI Football Skool, (5) buy the Builder Bootcamp. The primary CTAs are the tool cards (each links to a detail page with a "Try it now" demo), the "Join AI Football Skool (Free)" button, and the developer portal API key creation.

### Issues Found

**A. No social proof anywhere on the homepage.** There are no testimonials, no "X coaches using these tools", no user counts, no ratings displayed in aggregate. The tool cards all show 0 installs (which triggers the "New" badge instead). For a marketplace, social proof is the primary conversion driver.

**B. The "Try it now" demo on tool detail pages starts with 2 free tries** (line 86 of `tools/[slug]/page.tsx`: `const [triesLeft, setTriesLeft] = useState(2)`). The description text says "5 free tries per day" (homepage, line 329: "5 free tries per tool, per day"). This is a mismatch that could confuse users or feel stingy.

**C. The upgrade/paywall experience is basic.** When tries run out, the message is "Free tries used up" with a text link to the parent product (lines 191-217 of `tools/[slug]/page.tsx`). There is no CLOSER framework applied. No dream outcome. No social proof. No urgency. Just a plain text link.

**D. The email capture in the InstallModal (lines 264-278) sends the email silently with `.catch(() => {})` and then shows the install instructions regardless. There is no confirmation, no promise of value for the email, and no follow-up context. The prompt is "Enter your email to get the install instructions and tool updates" but the install instructions are shown immediately after anyway, making the email feel unnecessary.

**E. The bottom CTA section (lines 357-388 of `page.tsx`) has three buttons at equal visual weight: "Join AI Football Skool (Free)", "List Your Tool", and "Developer Portal". Three equal CTAs dilute focus. The primary conversion action should be dominant.

### Recommendations

1. **Add social proof to the homepage.** Even a single stat like "11 tools used by coaches in X countries" or "Built on the same AI that powers FootballGPT (used by 1,500+ coaches)" would help. This could sit below the hero text.

2. **Fix the tries mismatch.** Either update the homepage copy to say "2 free tries" or update the `TryItDemo` component to start with 5 tries. Consistency matters.

3. **Improve the paywall/rate-limit experience.** When tries hit zero, show a proper upgrade prompt:
   - Name the pain ("You've used your free tries. To keep getting coaching advice...")
   - Show the outcome ("FootballGPT Pro gives you 40 messages per day, conversation history, and all 18 advisors")
   - Include a social proof snippet
   - Make the CTA a prominent button, not a text link

4. **Make the email capture more valuable or remove it.** If the install instructions are shown regardless, the email capture feels dishonest. Either gate the instructions behind the email (justified) or remove the email step and capture emails through a different mechanism (e.g. "Get notified when new tools launch").

5. **Simplify the bottom CTA to one primary action.** Make "Join AI Football Skool (Free)" the single prominent button, with the others as secondary links below.

---

## 9. Mobile Responsiveness (4/5)

### Current State

The site uses Tailwind's responsive prefixes (`sm:`, `lg:`) throughout. The tool grid collapses from 3 columns to 2 to 1. Nav items are hidden on mobile via `hidden sm:inline`. The header is sticky with `backdrop-blur-sm`.

### Issues Found

**A. Navigation overflow on mobile.** On viewports below 640px, only "Browse" and "Docs" are visible in the nav (plus the auth button loading state, which shows "..."). "Agents", "Learn", "Developers", and "Submit" are hidden (`hidden sm:inline`). There is no hamburger menu, no mobile nav drawer, and no way to reach these pages from the mobile nav. Users must find them in the footer.

**B. Category filter pills overflow horizontally** (`overflow-x-auto` on line 64 of `search-filter.tsx`) which is functional but the scrollbar is visible (`pb-1` adds padding for it). On mobile, horizontal scrolling for filter pills is acceptable but there is no visual indicator (fade edges, arrows) that more options exist off-screen.

**C. The dashboard coach/developer mode toggle and the creator dashboard link (dashboard page lines 211-241) could overflow on narrow screens** since they are placed side-by-side with `flex items-center gap-3`.

**D. Touch targets for badge elements** (`text-[10px]` with `px-1.5 py-0.5`) are very small. These are not interactive on tool cards (they are purely informational), so this is not a functional issue, but the sort buttons (`text-xs px-2.5 py-1` in search-filter.tsx line 102) are interactive and at 24-28px height, borderline for the recommended 44px minimum touch target.

### Recommendations

1. **Add a mobile navigation menu.** Implement a hamburger icon that opens a slide-out drawer or dropdown containing all nav links. This is the most impactful mobile improvement. Modify `/home/kevin/360tft-skills-marketplace/src/components/header.tsx` to include a mobile menu toggle.

2. **Add scroll fade indicators** on the category filter pills. A CSS gradient overlay on the right edge when content overflows would signal scrollability:

```css
.filter-scroll::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, var(--background));
  pointer-events: none;
}
```

3. **Increase sort button touch targets** to at least `py-2 px-3` for mobile.

---

## 10. Accessibility Basics (4/5)

### Current State

The site uses semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<h1>`-`<h3>`, `<table>`, `<thead>`, `<tbody>`). The `<html>` tag has `lang="en"`. Form inputs have associated labels (though implemented as separate elements, not `<label htmlFor>`). Colour contrast for the primary text (#e5e5e5 on #0a0a0a) is approximately 15.3:1, well above AA requirements.

### Issues Found

**A. No visible focus states defined.** The site uses `focus:outline-none` on all inputs (e.g. search-filter.tsx line 58, submit/page.tsx lines 208, 224, 236, etc.), replacing the browser default with `focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20`. However, interactive elements like nav links, buttons, and cards have no defined `:focus-visible` styling. Keyboard users cannot see where focus is. This is a significant accessibility gap.

**B. No `aria-label` on icon-only buttons.** The close button in the InstallModal (line 291 of `tools/[slug]/page.tsx`) is an SVG-only button with no text or aria-label. The favourite button uses a `title` attribute (line 699) which is an improvement but not sufficient for screen readers. The search icon SVG (search-filter.tsx line 40) is decorative and correctly ignored, but the pattern is not consistent.

**C. Form labels are implemented as sibling elements rather than using `htmlFor` binding.** In `submit/page.tsx`, labels and inputs are siblings within the same parent div, but the `<label>` elements lack `htmlFor` attributes and the inputs lack `id` attributes. Screen readers may not associate them.

**D. Missing alt text on the OpenGraph/Twitter card images.** The meta tags include `og:image:alt` which is good, but there are no actual `<img>` elements on the page to audit (all icons are emoji or SVG).

**E. The colour contrast for `--muted` (#737373) on `--background` (#0a0a0a) is approximately 4.8:1.** This passes WCAG AA for normal text but fails for small text (below 14px bold or 18px regular). Since muted text often appears at `text-xs` (12px), this is a borderline issue.

### Recommendations

1. **Add `:focus-visible` styles globally.** Add to `globals.css`:

```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

This gives keyboard users a visible gold focus ring without affecting mouse/touch interactions.

2. **Add `aria-label` to icon-only buttons.** The InstallModal close button should have `aria-label="Close"`. The FavouriteButton should have `aria-label` instead of (or in addition to) `title`.

3. **Bind labels to inputs with `htmlFor`/`id` pairs** in `submit/page.tsx`, `developer/page.tsx`, and the InstallModal.

4. **Consider lightening `--muted` to #808080 or #8a8a8a** to improve contrast for small text. Test the change visually, as it will make muted elements slightly more prominent.

---

## Prioritised Action List

### P1 -- High Impact, Quick Win

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | **Add mobile navigation menu** (hamburger + drawer) | `src/components/header.tsx` | 1-2 hours |
| 2 | **Move tool grid higher on homepage** (swap "How it works" and search/grid order, or collapse "How it works" into a single-line banner) | `src/app/page.tsx` | 30 min |
| 3 | **Add focus-visible styles globally** | `src/app/globals.css` | 5 min |
| 4 | **Fix the free tries mismatch** (2 in code vs 5 in copy) | `src/app/tools/[slug]/page.tsx` line 86, or homepage copy line 329 | 5 min |
| 5 | **Fix "New" badge showing on all tools** (remove the installCount=0 fallback, or add date-based "new" logic) | `src/components/tool-card.tsx` lines 94-98 | 15 min |
| 6 | **Add social proof line to homepage hero** ("Built by the team behind FootballGPT, used by 1,500+ coaches") | `src/app/page.tsx` line 125 area | 10 min |
| 7 | **Increase badge/label minimum size from 10px to 11px** | `src/components/tool-card.tsx`, `src/components/sponsored-badge.tsx`, dashboard files | 20 min |

### P2 -- Important, More Effort

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 8 | **Add a custom web font** (Inter or Geist Sans via next/font) | `src/app/layout.tsx`, `src/app/globals.css` | 30 min |
| 9 | **Create shared Button, Input, Card, Badge components** | New files in `src/components/ui/` | 2-3 hours |
| 10 | **Strengthen hero visual** (accent colour on key words, increase desktop size to text-5xl, add subtle gradient glow behind heading) | `src/app/page.tsx`, `src/app/globals.css` | 1 hour |
| 11 | **Add skeleton loading states** to replace "Loading..." text | New `src/components/skeleton.tsx`, then update dashboard, developer, auth pages | 1-2 hours |
| 12 | **Improve rate-limit/paywall UX** (proper upgrade prompt with outcome, social proof, prominent CTA button) | `src/app/tools/[slug]/page.tsx` TryItDemo component | 1-2 hours |
| 13 | **Convert FAQs to accordion** | `src/app/page.tsx` FAQ section | 30 min |
| 14 | **Bind form labels to inputs** with htmlFor/id | `src/app/submit/page.tsx`, `src/app/developer/page.tsx`, `src/app/tools/[slug]/page.tsx` | 30 min |
| 15 | **Add aria-labels to icon-only buttons** | `src/app/tools/[slug]/page.tsx` (close, favourite), header if hamburger is added | 20 min |
| 16 | **Standardise section spacing** across all pages (define convention, apply consistently) | All page.tsx files | 1 hour |

### P3 -- Nice to Have

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 17 | **Add subtle dot/grid background pattern** to body | `src/app/globals.css` | 10 min |
| 18 | **Add entry animations** (fade-in, slide-up on cards) | `src/app/globals.css` or individual components | 1 hour |
| 19 | **Create a proper logo/mark** | Brand assets, `src/components/header.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx` | 3+ hours (design work) |
| 20 | **Add scroll-fade indicators** on category filter pills for mobile | `src/components/search-filter.tsx` | 30 min |
| 21 | **Lighten --muted colour** from #737373 to #808080 for better small-text contrast | `src/app/globals.css` | 5 min |
| 22 | **Simplify bottom CTA** to one primary action | `src/app/page.tsx` lines 357-388 | 15 min |
| 23 | **Add light mode support** | `src/app/globals.css` (duplicate variables under `@media (prefers-color-scheme: light)`) | 2-3 hours |
| 24 | **Rethink email gate on InstallModal** (either provide genuine gated value or remove the step) | `src/app/tools/[slug]/page.tsx` InstallModal component | 30 min |

---

## Summary

The AI Football Marketplace is a well-structured, functional site with clean code organisation and a consistent (if minimal) visual language. The dark theme, amber accent, and rounded card system work well together. The component architecture is sound, with shared header/footer/tool-card components reducing duplication.

The main weaknesses are: (1) the homepage buries the primary content (the tool grid) beneath several secondary sections, (2) there is no social proof or conversion-optimised upgrade flow, (3) mobile navigation is incomplete with no way to reach several pages, and (4) the visual identity is generic, lacking a distinctive logo or football-themed visual elements.

The P1 actions (mobile nav, grid positioning, focus states, badge fixes, social proof) would make the biggest immediate difference and could be completed in a single focused session. The P2 actions (shared components, hero strengthening, loading states, paywall improvement) represent the next round of work that would move the site from "functional" to "polished".
