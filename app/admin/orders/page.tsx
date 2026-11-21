import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import OrderCard from "@/components/admin/OrderCard";
import type { AdminRole, OrderItemRow, OrderRow } from "@/lib/types/database";

export const metadata: Metadata = { title: "Orders — Admin" };

type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

const BOARD_STATUSES = ["received", "preparing", "ready", "completed"] as const;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  // Defense-in-depth: the service-role client below bypasses RLS
  // entirely to generate screenshot signed URLs, so this page checks
  // admin_users membership itself rather than relying only on RLS.
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", userData.user.id)
    .single<{ role: AdminRole }>();
  if (!adminUser) redirect("/admin/login");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  const allOrders = (orders as OrderWithItems[] | null) ?? [];

  const adminClient = createAdminClient();
  const screenshotUrls: Record<string, string> = {};
  await Promise.all(
    allOrders
      .filter((o) => o.payment_screenshot_path)
      .map(async (o) => {
        const { data } = await adminClient.storage
          .from("payment-screenshots")
          .createSignedUrl(o.payment_screenshot_path as string, 60 * 30);
        if (data?.signedUrl) screenshotUrls[o.id] = data.signedUrl;
      })
  );

  const cancelled = allOrders.filter((o) => o.status === "cancelled");

  return (
    <div className="min-h-screen px-5 py-10 max-w-[1400px] mx-auto">
      <AdminHeader active="/admin/orders" />
      <h1 className="font-heading text-gold text-2xl mb-6">Orders</h1>

      {error && (
        <p className="text-red font-body text-sm mb-4">Unable to load orders.</p>
      )}

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {BOARD_STATUSES.map((status) => {
          const columnOrders = allOrders.filter((o) => o.status === status);
          return (
            <div key={status} className="flex flex-col gap-3">
              <h2 className="font-heading text-cream text-sm uppercase tracking-wide border-b border-line pb-2">
                {status} · {columnOrders.length}
              </h2>
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  screenshotUrl={screenshotUrls[order.id]}
                />
              ))}
              {columnOrders.length === 0 && (
                <p className="text-muted text-xs font-body">No orders</p>
              )}
            </div>
          );
        })}
      </div>

      {cancelled.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-cream text-sm uppercase tracking-wide border-b border-line pb-2 mb-3">
            Cancelled · {cancelled.length}
          </h2>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            {cancelled.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                screenshotUrl={screenshotUrls[order.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
