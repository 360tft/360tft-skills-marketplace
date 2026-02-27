// Redis-based rate limiter for marketplace API endpoints
// Uses Upstash Redis for persistent rate limiting across deploys
// Falls back to in-memory for local development

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export const RATE_LIMITS = {
  // Try-tool: 2 per day for anonymous users
  TRY_TOOL: { maxRequests: 2, windowSeconds: 86400 },
  // Admin login: 5 attempts per 5 minutes
  ADMIN_LOGIN: { maxRequests: 5, windowSeconds: 300 },
  // General API: 100 per minute
  API_GENERAL: { maxRequests: 100, windowSeconds: 60 },
} as const;

// Lazy-loaded Redis client
let redis: Redis | null = null;
const rateLimiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const configKey = `${config.maxRequests}:${config.windowSeconds}`;

  if (!rateLimiters.has(configKey)) {
    rateLimiters.set(
      configKey,
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(
          config.maxRequests,
          `${config.windowSeconds} s`
        ),
        analytics: true,
        prefix: "marketplace_ratelimit",
      })
    );
  }

  return rateLimiters.get(configKey)!;
}

// In-memory fallback for local dev
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of inMemoryStore) {
    if (now > entry.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}

function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupOldEntries();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = inMemoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs };
    inMemoryStore.set(identifier, entry);
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  entry.count++;
  return { allowed: true, remaining: remaining - 1, resetInSeconds };
}

/**
 * Check if a request should be rate limited.
 * Uses Redis in production, falls back to in-memory for local dev.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const rateLimiter = getRateLimiter(config);

  if (!rateLimiter) {
    return checkRateLimitInMemory(identifier, config);
  }

  try {
    const result = await rateLimiter.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetInSeconds: Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch {
    // Redis failure — fall back to in-memory
    return checkRateLimitInMemory(identifier, config);
  }
}
