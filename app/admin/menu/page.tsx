import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentAdminProfile } from "@/lib/admin/profile";
import { getMenu } from "@/lib/data/menu";
import AdminHeader from "@/components/admin/AdminHeader";
import MenuItemRow from "@/components/admin/MenuItemRow";
import AddMenuItemForm from "@/components/admin/AddMenuItemForm";

export const metadata: Metadata = { title: "Menu — Admin" };

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const [adminProfile, { categories }] = await Promise.all([
    currentAdminProfile(supabase),
    getMenu(),
  ]);
  if (!adminProfile) redirect("/admin/login");
  const isOwner = adminProfile.role === "owner";

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
            You&rsquo;re signed in as staff — you can mark items sold out, but
            only the owner can edit prices and descriptions.
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

        {isOwner && <AddMenuItemForm categories={categories} />}
      </div>
    </div>
  );
}
