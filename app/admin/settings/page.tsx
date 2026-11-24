import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentAdminProfile } from "@/lib/admin/profile";
import { getSettings } from "@/lib/data/settings";
import AdminHeader from "@/components/admin/AdminHeader";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [adminProfile, { settings }] = await Promise.all([
    currentAdminProfile(supabase),
    getSettings(),
  ]);
  if (!adminProfile) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[720px] mx-auto">
        <h1 className="font-heading text-gold text-2xl mb-6">Settings</h1>
        <SettingsForm
          settings={settings}
          isOwner={adminProfile.role === "owner"}
        />
      </div>
    </div>
  );
}
