import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { logoutAction } from "@/app/admin/actions";
import type { AdminRole } from "@/lib/types/database";

export const metadata: Metadata = { title: "My Account — Admin" };

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("name, role")
    .eq("id", userData.user.id)
    .single<{ name: string | null; role: AdminRole }>();
  if (!adminUser) redirect("/admin/login");

  const displayName = adminUser.name ?? userData.user.email ?? "Admin";
  const initial = displayName.trim().charAt(0).toUpperCase();
  const isOwner = adminUser.role === "owner";

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[720px] mx-auto">
        <h1 className="font-heading text-gold text-2xl mb-6">My Account</h1>

        <div
          className="relative overflow-hidden rounded-card border border-line bg-bg2 px-6 py-5 mb-6 flex items-center gap-4"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 100% at 0% 0%, rgba(200,16,46,0.18), transparent 70%)",
          }}
        >
          <span
            className={`w-14 h-14 rounded-full flex items-center justify-center font-heading text-xl shrink-0 ${
              isOwner ? "bg-gold/20 text-gold" : "bg-red/15 text-red"
            }`}
          >
            {initial}
          </span>
          <div>
            <p className="font-heading text-cream text-xl">{displayName}</p>
            <span
              className={`inline-block mt-1 rounded-pill text-[11px] font-body font-semibold tracking-wide px-2.5 py-1 uppercase ${
                isOwner ? "bg-gold/15 text-gold" : "bg-red/15 text-red"
              }`}
            >
              {adminUser.role}
            </span>
          </div>
        </div>

        <ChangePasswordForm />

        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="rounded-btn border border-line text-cream font-body text-sm px-4 py-2.5 min-h-11 hover:bg-bg2 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
