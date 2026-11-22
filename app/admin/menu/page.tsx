import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = { title: "Menu — Admin" };

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userData.user.id)
    .single();
  if (!adminUser) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[720px] mx-auto">
        <h1 className="font-heading text-gold text-2xl mb-2">Menu manager</h1>
        <p className="text-muted font-body text-sm">
          Editing items, prices, and sold-out status from here is coming soon.
          For now, menu changes go through the Supabase dashboard directly.
        </p>
      </div>
    </div>
  );
}
