// Server-only Supabase client for the review collector.
//
// Uses the service_role key, which bypasses RLS and must NEVER reach the
// browser. The env vars are deliberately not NEXT_PUBLIC_*, so even if this
// module were imported into a client bundle by mistake, process.env would be
// empty there and getSupabaseAdmin() returns null rather than leaking a key.
// Only import this from route handlers and server components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const REVIEW_MEDIA_BUCKET = "review-media";

let cached: SupabaseClient | null = null;

/**
 * Returns the service-role client, or null when Supabase is not configured
 * (e.g. local dev without the env vars, or a build with no secrets). Callers
 * treat null as "storage unavailable" and degrade gracefully.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return cached;
}
