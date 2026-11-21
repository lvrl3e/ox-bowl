import { createClient } from "@supabase/supabase-js";

/**
 * Plain anon-key client for public, read-only data (menu, categories,
 * settings) fetched from Server Components. No cookie/session handling
 * needed since these reads don't depend on who's logged in — RLS's
 * public "select using (true)" policies cover it.
 *
 * Returns null if Supabase isn't configured yet, so callers can fall
 * back to local seed data (see lib/data/menu.ts).
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
