import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import StaffForm from "@/components/admin/StaffForm";
import { removeStaffAction } from "./actions";
import type { AdminRole, AdminUser } from "@/lib/types/database";

export const metadata: Metadata = { title: "Staff — Admin" };

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", userData.user.id)
    .single<{ role: AdminRole }>();
  if (!adminUser) redirect("/admin/login");
  const isOwner = adminUser.role === "owner";

  const { data: staffRows } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });
  const staff = (staffRows as AdminUser[] | null) ?? [];

  // Supabase Auth emails aren't stored in admin_users, so look them up
  // via the service-role admin API and match by id.
  const adminClient = createAdminClient();
  const { data: authUsers } = await adminClient.auth.admin.listUsers();
  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email]) ?? []);

  return (
    <div className="min-h-screen px-5 py-10 max-w-[720px] mx-auto">
      <AdminHeader active="/admin/staff" />
      <h1 className="font-heading text-gold text-2xl mb-1">Staff</h1>
      <p className="text-muted text-sm font-body mb-6">
        {staff.length} account{staff.length === 1 ? "" : "s"} with admin access.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {staff.map((member) => {
          const memberIsOwner = member.role === "owner";
          const initial = (member.name ?? emailById.get(member.id) ?? "?")
            .trim()
            .charAt(0)
            .toUpperCase();
          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 bg-bg2 border border-line rounded-card px-4 py-3 hover:border-gold/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm shrink-0 ${
                    memberIsOwner ? "bg-gold/20 text-gold" : "bg-red/15 text-red"
                  }`}
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="text-cream font-body font-semibold text-sm truncate">
                    {member.name ?? "Unnamed"}
                  </p>
                  <p className="text-muted text-xs font-body truncate">
                    {emailById.get(member.id) ?? "unknown email"}
                  </p>
                  <span
                    className={`inline-block mt-1 rounded-pill text-[10px] font-body font-semibold tracking-wide px-2 py-0.5 uppercase ${
                      memberIsOwner ? "bg-gold/15 text-gold" : "bg-red/15 text-red"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              {isOwner && member.id !== userData.user.id && (
                <form action={removeStaffAction} className="shrink-0">
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="text-muted text-xs font-body underline underline-offset-2 hover:text-red"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <StaffForm isOwner={isOwner} />
    </div>
  );
}
