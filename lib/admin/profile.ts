import type { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types/database";

export interface AdminProfile {
  id: string;
  name: string | null;
  role: AdminRole;
  email: string | null;
}

/**
 * Reads the signed-in admin's own profile (role, name, email) in a
 * single round trip via the current_admin_profile() RPC, which reads
 * auth.uid() server-side — unlike the old auth.getUser() +
 * admin_users-by-id pattern, this has no dependency on a prior
 * getUser() call, so it can run inside the same Promise.all as a
 * page's main query instead of blocking it.
 */
export async function currentAdminProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AdminProfile | null> {
  const { data } = await supabase
    .rpc("current_admin_profile")
    .maybeSingle<AdminProfile>();
  return data;
}
