import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMenu } from "@/lib/data/menu";
import AdminHeader from "@/components/admin/AdminHeader";
import MenuItemRow from "@/components/admin/MenuItemRow";
import type { AdminRole } from "@/lib/types/database";

export const metadata: Metadata = { title: "Menu — Admin" };

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const [adminUserResult, { categories }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("role")
      .eq("id", userData.user.id)
      .single<{ role: AdminRole }>(),
    getMenu(),
  ]);
  const adminUser = adminUserResult.data;
  if (!adminUser) redirect("/admin/login");
  const isOwner = adminUser.role === "owner";

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[720px] mx-auto">
        <h1 className="font-heading text-gold text-2xl mb-1">Menu manager</h1>
        <p className="text-muted text-sm font-body mb-6">
          Toggle sold-out status, and edit prices or descriptions.
        </p>

        {!isOwner && (
          <p className="text-gold text-sm font-body bg-bg2 border border-line rounded-btn p-3 mb-6">
            You&rsquo;re signed in as staff — the menu is read-only. Ask an
            owner to change prices, descriptions, or sold-out status.
          </p>
        )}

        <div className="flex flex-col gap-8">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="font-heading text-cream text-sm uppercase tracking-wide border-b border-line pb-2 mb-3">
                {category.name} · {category.menu_items.length}
              </h2>
              <div className="flex flex-col gap-2">
                {category.menu_items.map((item) => (
                  <MenuItemRow key={item.id} item={item} isOwner={isOwner} />
                ))}
                {category.menu_items.length === 0 && (
                  <p className="text-muted text-xs font-body">
                    No items in this category.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
