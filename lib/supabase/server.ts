import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server Component / Route Handler Supabase client bound to the current
 * user's session cookies. Uses the public anon key — RLS still applies,
 * so this is what admin pages use to read/write data as the signed-in
 * admin (is_admin()/is_owner() in RLS policies key off auth.uid()).
 *
 * This is NOT the service-role client — never use this for the public
 * order-creation flow or anything that must bypass RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable response —
            // middleware.ts refreshes the session instead, so this is safe
            // to ignore.
          }
        },
      },
    }
  );
}
