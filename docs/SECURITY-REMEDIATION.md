# Security Remediation PRD

**Product:** 360TFT Skills Marketplace (aifootball.co)
**Repo:** `/home/kevin/360tft-skills-marketplace`
**Date:** 2026-02-27
**Status:** Pending remediation

---

## Overview

A security audit of the 360TFT Skills Marketplace identified four vulnerabilities across three severity levels. The most critical finding is that Supabase RLS policies on the `api_keys` and `api_usage_daily` tables use `USING (true)`, exposing all rows to any user who can reach the Supabase API. Two high-severity findings affect the rate limiting system (in-memory, resets on deploy) and the admin dashboard (no server-side route protection). One medium-severity finding covers IP spoofing on the rate limiter.

All four findings are fixable without structural changes to the application. The patterns needed already exist in the ecosystem (Upstash Redis rate limiting in FootballGPT, Supabase middleware auth in the marketplace itself).

---

## Findings

### CRITICAL-1: RLS policies too permissive (`USING (true)` on api_keys table)

**Severity:** Critical
**Files:**
- `/home/kevin/360tft-skills-marketplace/supabase/migration-001-api-keys.sql` (lines 146-150)

**Description:**
The `api_keys` table has RLS enabled, but the SELECT policy uses `USING (true)`, meaning any authenticated or anonymous Supabase client can read every row. The same applies to `api_usage_daily`. While the actual API key values are stored as hashes (not plaintext), the following fields are exposed to anyone:

- `email` (developer email addresses)
- `key_prefix` (first characters of each key)
- `tier` (free/pro/developer/unlimited)
- `calls_today`, `calls_this_month` (usage data)
- `metadata` (arbitrary JSON)
- `is_active`, `created_at`, `expires_at`

An attacker with only the public Supabase anon key (which is exposed in the client bundle by design) can enumerate all developers, their email addresses, their usage patterns, and their subscription tiers.

**Current code (lines 146-150):**
```sql
CREATE POLICY "Users read own keys by email" ON api_keys
  FOR SELECT USING (true);

CREATE POLICY "Usage readable" ON api_usage_daily
  FOR SELECT USING (true);
```

**Impact:** Full data enumeration of all API key metadata and developer email addresses. Potential GDPR exposure (email addresses are personal data).

---

### HIGH-1: In-memory rate limiting resets on deploy

**Severity:** High
**Files:**
- `/home/kevin/360tft-skills-marketplace/src/app/api/try-tool/route.ts` (lines 43-61)

**Description:**
The try-tool endpoint (the public demo feature) uses a JavaScript `Map` for rate limiting. This has two problems:

1. **Resets on every deploy or container restart.** Every Coolify deploy wipes all rate limit state, giving every user a fresh allocation.
2. **Per-instance isolation.** If the application runs on multiple container instances (scaling), each instance maintains its own independent Map. A user hitting different instances gets separate rate limit counters.

**Current code (lines 43-61):**
```typescript
const tries = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = tries.get(ip);

  if (!entry || entry.resetAt < now) {
    tries.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return { allowed: true, remaining: 1 };
  }

  if (entry.count >= 2) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: 2 - entry.count };
}
```

**Impact:** Rate limits can be bypassed by waiting for a deploy (which happens frequently during active development). An attacker aware of the deploy schedule could script unlimited free API calls.

---

### HIGH-2: Admin page accessible without server-side auth

**Severity:** High
**Files:**
- `/home/kevin/360tft-skills-marketplace/src/app/admin/page.tsx` (entire file)
- `/home/kevin/360tft-skills-marketplace/src/middleware.ts` (lines 58-60)

**Description:**
The `/admin` route is a client-side component that renders a login form prompting for an admin secret. The middleware only protects `/dashboard` and `/developer` routes (line 58-60) but does not protect `/admin`. This means:

1. **Anyone can load the admin page.** The page HTML, JavaScript, and component structure are served to any visitor.
2. **Brute-force attack surface.** The admin secret is sent as a client header (`x-admin-secret`) on every API call. There is no rate limiting on admin login attempts.
3. **Secret visible in DevTools.** Once authenticated, the secret is stored in React state and sent as a plain header on every subsequent request. Anyone with DevTools open can read it from the Network tab.

**Current middleware protection (lines 58-60):**
```typescript
if (
  (pathname.startsWith("/dashboard") || pathname.startsWith("/developer")) &&
  !user
) {
```

The `/admin` path is not included in this check.

**Impact:** The admin dashboard is the control plane for the entire API key system. Compromise of the admin secret grants ability to revoke keys, change tiers, approve/reject tool submissions, and read all developer data.

---

### MEDIUM-1: IP spoofing on rate limiter

**Severity:** Medium
**Files:**
- `/home/kevin/360tft-skills-marketplace/src/app/api/try-tool/route.ts` (lines 91-92, 113)

**Description:**
The rate limiter and activity logger both derive the client IP from `x-forwarded-for`:

```typescript
const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
```

The `x-forwarded-for` header can be spoofed by the client. Behind Coolify's Traefik proxy, the rightmost value in the chain is the one Traefik appended (the real client IP), but the code reads the leftmost value (index 0), which is the one the client controls.

**Impact:** An attacker can rotate the `x-forwarded-for` value on each request to get unlimited free tries, bypassing rate limiting entirely without waiting for a deploy.

---

## Remediation Steps

### CRITICAL-1: Fix RLS policies

- [ ] **Write a new migration file** at `supabase/migration-002-fix-rls-policies.sql`
- [ ] **Drop the existing permissive policies:**
  ```sql
  DROP POLICY IF EXISTS "Users read own keys by email" ON api_keys;
  DROP POLICY IF EXISTS "Usage readable" ON api_usage_daily;
  ```
- [ ] **Create restrictive SELECT policy on `api_keys`** that only allows users to read their own keys:
  ```sql
  CREATE POLICY "Users read own keys" ON api_keys
    FOR SELECT USING (
      email = auth.jwt()->>'email'
      OR auth.role() = 'service_role'
    );
  ```
- [ ] **Create restrictive SELECT policy on `api_usage_daily`** that only allows users to read usage for their own keys:
  ```sql
  CREATE POLICY "Users read own usage" ON api_usage_daily
    FOR SELECT USING (
      api_key_id IN (
        SELECT id FROM api_keys WHERE email = auth.jwt()->>'email'
      )
      OR auth.role() = 'service_role'
    );
  ```
- [ ] **Add INSERT/UPDATE/DELETE policies** that restrict writes to service_role only (no client-side mutations):
  ```sql
  CREATE POLICY "Service role manages keys" ON api_keys
    FOR ALL USING (auth.role() = 'service_role');

  CREATE POLICY "Service role manages usage" ON api_usage_daily
    FOR ALL USING (auth.role() = 'service_role');
  ```
- [ ] **Run the migration** in the Supabase SQL editor
- [ ] **Test** by attempting to query `api_keys` with the anon key from a browser console and confirming zero rows are returned for unauthenticated requests

---

### HIGH-1: Switch to Upstash Redis rate limiting

- [ ] **Add Upstash dependencies** (if not already present):
  ```bash
  npm install @upstash/redis @upstash/ratelimit
  ```
- [ ] **Create `src/lib/rate-limit.ts`** following the FootballGPT pattern at `/home/kevin/FootballGPT/src/lib/rate-limit.ts`. Key elements:
  - Lazy-load Redis client from `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars
  - Use `Ratelimit.slidingWindow()` from `@upstash/ratelimit`
  - Fall back to in-memory store only when Redis env vars are missing (local dev)
  - Log a warning in production if falling back to in-memory
  - Use prefix `marketplace_ratelimit` to namespace keys
- [ ] **Define rate limit presets** in the same file:
  ```typescript
  export const RATE_LIMITS = {
    TRY_TOOL: { maxRequests: 2, windowSeconds: 86400 },       // 2/day for anonymous
    ADMIN_LOGIN: { maxRequests: 5, windowSeconds: 300 },       // 5 attempts per 5 min
    API_GENERAL: { maxRequests: 100, windowSeconds: 60 },      // 100/min general
  } as const;
  ```
- [ ] **Refactor `src/app/api/try-tool/route.ts`** to replace the in-memory Map (lines 43-61) with a call to the new `checkRateLimit()` function
- [ ] **Remove the `tries` Map** and `getRateLimit` function from the try-tool route
- [ ] **Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`** in Coolify environment variables (these are shared across the ecosystem, values available in other products)
- [ ] **Redeploy** and verify rate limits persist across deploys

---

### HIGH-2: Protect admin route with server-side auth

- [ ] **Add `/admin` to the middleware protected routes** in `src/middleware.ts`. Replace the current check (lines 58-60):
  ```typescript
  // Before (line 58-60):
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/developer")) &&
    !user
  ) {

  // After:
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/developer") || pathname.startsWith("/admin")) &&
    !user
  ) {
  ```
- [ ] **Add admin role check in middleware** after confirming the user is authenticated. Query the `profiles` table for the user's role and redirect non-admin users:
  ```typescript
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", appUrl));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", appUrl));
    }
  }
  ```
- [ ] **Add rate limiting to admin API routes.** Apply the `ADMIN_LOGIN` rate limit (5 attempts per 5 minutes) to `/api/admin/stats` when authentication fails. This prevents brute-forcing the admin secret while the secret-based auth is still in use.
- [ ] **Move admin secret validation server-side (longer term).** The current pattern of sending the secret in `x-admin-secret` headers from the client is acceptable as a secondary check behind Supabase auth, but should not be the sole protection. With middleware auth in place, the secret becomes a defence-in-depth measure rather than the only barrier.
- [ ] **Remove the client-side login form** from `src/app/admin/page.tsx` (the secret input at lines 292-332). Replace it with a server-side redirect handled by middleware. The page should assume the user is authenticated and authorised if they reach it.

---

### MEDIUM-1: Fix IP extraction for rate limiting

- [ ] **Read the rightmost `x-forwarded-for` value** instead of the leftmost. Behind Traefik, the proxy appends the real client IP as the last entry in the chain. Change the IP extraction in `src/app/api/try-tool/route.ts` (lines 91-92 and 113):
  ```typescript
  // Before:
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // After:
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",").map(s => s.trim()).pop() || "unknown"
    : "unknown";
  ```
- [ ] **Apply the same fix in `logActivity()`** (line 92) which uses the same pattern
- [ ] **Consider combining IP with User-Agent** for a more robust fingerprint (defence in depth, not a replacement for Redis rate limiting):
  ```typescript
  const ua = req.headers.get("user-agent") || "";
  const fingerprint = crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 16);
  ```
  Use this fingerprint as the rate limit key instead of raw IP.

---

## Priority Order

| Order | Finding | Severity | Effort | Reason |
|-------|---------|----------|--------|--------|
| 1 | CRITICAL-1: RLS policies | Critical | 30 min | Data is exposed right now. Single SQL migration fixes it. |
| 2 | HIGH-2: Admin route protection | High | 1-2 hours | Admin dashboard is the highest-value target. Middleware change is straightforward. |
| 3 | HIGH-1: Redis rate limiting | High | 2-3 hours | Requires npm install, new file, refactor, and env var configuration. |
| 4 | MEDIUM-1: IP spoofing | Medium | 30 min | Low effort but lower impact since Redis rate limiting (HIGH-1) is the primary fix. |

**Total estimated effort:** 4-6 hours

---

## Estimated Effort

| Task | Time | Dependencies |
|------|------|-------------|
| Write and run RLS migration | 30 min | Supabase SQL editor access |
| Add middleware admin protection | 1-2 hours | `profiles` table must have `role` column |
| Create rate-limit.ts and refactor try-tool | 2-3 hours | `@upstash/redis` and `@upstash/ratelimit` packages, Upstash env vars in Coolify |
| Fix IP extraction | 30 min | None |
| Testing and verification | 1 hour | All fixes deployed |

---

## Verification

After all remediations are applied, verify each fix:

### CRITICAL-1 Verification
- [ ] Open browser DevTools console on aifootball.co
- [ ] Attempt to query `api_keys` using the public anon key:
  ```javascript
  const { data, error } = await supabase.from('api_keys').select('*');
  ```
- [ ] Confirm `data` is empty or returns only the current user's keys (if authenticated)
- [ ] Confirm unauthenticated requests return zero rows

### HIGH-1 Verification
- [ ] Deploy the application to Coolify
- [ ] Use 2 free tries on the try-tool feature
- [ ] Confirm the rate limit is hit (429 response)
- [ ] Trigger a redeploy on Coolify
- [ ] After redeploy, attempt another try-tool request
- [ ] Confirm the rate limit is still enforced (429 response, not reset)

### HIGH-2 Verification
- [ ] Navigate to `/admin` while logged out
- [ ] Confirm redirect to `/auth/login`
- [ ] Log in as a non-admin user
- [ ] Navigate to `/admin`
- [ ] Confirm redirect to `/` (home page)
- [ ] Log in as an admin user
- [ ] Confirm `/admin` loads the dashboard
- [ ] Attempt 6 rapid failed authentication calls to `/api/admin/stats` with wrong secrets
- [ ] Confirm rate limiting kicks in after 5 attempts

### MEDIUM-1 Verification
- [ ] Send a request to `/api/try-tool` with a spoofed `x-forwarded-for: 1.2.3.4` header
- [ ] Check server logs to confirm the extracted IP is NOT `1.2.3.4` but the real client IP (the rightmost value appended by Traefik)
