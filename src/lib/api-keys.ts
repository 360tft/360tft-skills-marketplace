import { nanoid } from "nanoid";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase/admin";
import { sendRateLimitWarning } from "./email";

// Key prefixes per product
const PRODUCT_PREFIXES: Record<string, string> = {
  footballgpt: "fgpt",
  refereegpt: "rgpt",
  cruisegpt: "cgpt",
  coachreflect: "cr",
  playerreflection: "pr",
  all: "tft",
};

// Tier limits
export const TIER_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  builder: 1000,
  scale: 5000,
  enterprise: 999999,
  unlimited: 999999,
  developer: 1000, // backward compat alias until migration confirmed
};

export interface ApiKey {
  id: string;
  email: string;
  key_prefix: string;
  name: string;
  product: string;
  tier: string;
  calls_today: number;
  calls_this_month: number;
  is_active: boolean;
  created_at: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  full_key: string;
}

/**
 * Hash a key using Web Crypto API (SHA-256)
 */
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a new API key for a user
 */
export async function createApiKey(
  email: string,
  name: string = "Default",
  product: string = "all"
): Promise<ApiKeyWithSecret | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" };
  }

  const prefix = PRODUCT_PREFIXES[product] || "tft";
  const secret = nanoid(32);
  const fullKey = `${prefix}_sk_${secret}`;
  const keyHash = await hashKey(fullKey);
  const keyPrefix = `${prefix}_sk_${secret.slice(0, 8)}`;

  // Check how many active keys this email has
  const { count } = await getSupabaseAdmin()!
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("is_active", true);

  if (count && count >= 5) {
    return { error: "Maximum 5 active keys per email" };
  }

  const { data, error } = await getSupabaseAdmin()!
    .from("api_keys")
    .insert({
      email,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name,
      product,
      tier: "free",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { ...data, full_key: fullKey };
}

/**
 * List keys for an email (never returns hashes)
 */
export async function listApiKeys(
  email: string
): Promise<ApiKey[] | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" };
  }

  const { data, error } = await getSupabaseAdmin()!
    .from("api_keys")
    .select(
      "id, email, key_prefix, name, product, tier, calls_today, calls_this_month, is_active, created_at"
    )
    .eq("email", email)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return data || [];
}

/**
 * Revoke a key
 */
export async function revokeApiKey(
  keyId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured" };
  }

  const { error } = await getSupabaseAdmin()!
    .from("api_keys")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("email", email);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Validate a key and increment usage (called by MCP gateway)
 */
export async function validateAndIncrement(
  rawKey: string,
  toolSlug: string
): Promise<{
  valid: boolean;
  tier?: string;
  remaining?: number;
  email?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { valid: false, error: "Database not configured" };
  }

  const keyHash = await hashKey(rawKey);

  const { data, error } = await getSupabaseAdmin()!.rpc("increment_api_usage", {
    p_key_hash: keyHash,
    p_tool_slug: toolSlug,
  });

  if (error) {
    return { valid: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { valid: false, error: "Invalid API key" };
  }

  const result = data[0];
  const limit = TIER_LIMITS[result.key_tier] || 10;
  const used = limit - (result.remaining_today ?? 0);

  // Send warning at 80% usage (non-blocking)
  if (result.key_email && used >= limit * 0.8 && result.remaining_today > 0) {
    sendRateLimitWarning(result.key_email, used, limit).catch(() => {});
  }

  return {
    valid: result.allowed,
    tier: result.key_tier,
    remaining: result.remaining_today,
    email: result.key_email,
    error: result.allowed ? undefined : "Rate limit exceeded",
  };
}

/**
 * Get usage stats for a key
 */
export async function getKeyUsageStats(
  keyId: string,
  email: string
): Promise<
  | { daily: Record<string, number>; total_today: number; total_month: number }
  | { error: string }
> {
  if (!isSupabaseConfigured()) {
    return { error: "Database not configured" };
  }

  // Verify ownership
  const { data: key } = await getSupabaseAdmin()!
    .from("api_keys")
    .select("id, calls_today, calls_this_month")
    .eq("id", keyId)
    .eq("email", email)
    .single();

  if (!key) {
    return { error: "Key not found" };
  }

  // Get per-tool breakdown for today
  const { data: usage } = await getSupabaseAdmin()!
    .from("api_usage_daily")
    .select("tool_slug, call_count")
    .eq("api_key_id", keyId)
    .eq("date", new Date().toISOString().split("T")[0]);

  const daily: Record<string, number> = {};
  if (usage) {
    for (const row of usage) {
      daily[row.tool_slug] = row.call_count;
    }
  }

  return {
    daily,
    total_today: key.calls_today,
    total_month: key.calls_this_month,
  };
}
