import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";
import AdminHeader from "@/components/admin/AdminHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import type { AdminRole } from "@/lib/types/database";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const [adminUserResult, { settings }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("role")
      .eq("id", userData.user.id)
      .single<{ role: AdminRole }>(),
    getSettings(),
  ]);
  const adminUser = adminUserResult.data;
  if (!adminUser) redirect("/admin/login");

  return (
    <div className="min-h-screen px-5 py-10 max-w-[720px] mx-auto">
      <AdminHeader active="/admin/settings" />
      <h1 className="font-heading text-gold text-2xl mb-6">Settings</h1>
      <SettingsForm settings={settings} isOwner={adminUser.role === "owner"} />
    </div>
  );
}
