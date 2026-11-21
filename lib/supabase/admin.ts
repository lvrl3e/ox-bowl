import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY.
 *
 * Server-only (the `server-only` import makes it a build error to pull
 * this into any client bundle). Use this exclusively inside Route
 * Handlers / Server Actions that have already done their own
 * authorization + validation, e.g.:
 *   - creating an order (server recomputes prices, checks store hours)
 *   - uploading a payment screenshot to the private bucket
 *   - generating a signed URL for an admin to view a screenshot
 *
 * Never import this into a Client Component or expose
 * SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
