import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types/database";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const sections = [
  {
    label: "Orders board",
    href: "/admin/orders",
    description: "View and manage live orders.",
  },
  {
    label: "Menu manager",
    href: "/admin/menu",
    description: "Coming soon.",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    description: "Hours, delivery fees, pickup location, QR payment.",
  },
];

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("name, role")
    .eq("id", userData.user.id)
    .single<{ name: string | null; role: AdminRole }>();

  return (
    <div className="min-h-screen px-5 py-10 max-w-[640px] mx-auto">
      <AdminHeader active="/admin" />
      <p className="text-muted text-sm font-body mb-6">
        Signed in as {adminUser?.name ?? userData.user.email}
        {adminUser?.role ? ` · ${adminUser.role}` : ""}
      </p>

      <div className="grid gap-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-card border border-line bg-bg2 px-4 py-4 hover:border-red transition-colors"
          >
            <p className="font-heading text-cream">{section.label}</p>
            <p className="text-muted text-sm font-body mt-1">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
