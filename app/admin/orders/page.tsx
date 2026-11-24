import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentAdminProfile } from "@/lib/admin/profile";
import AdminHeader from "@/components/admin/AdminHeader";
import OrdersTabs from "@/components/admin/OrdersTabs";
import OrderCard from "@/components/admin/OrderCard";
import type { OrderItemRow, OrderRow } from "@/lib/types/database";

export const metadata: Metadata = { title: "Orders — Admin" };

type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

const BOARD_STATUSES = ["received", "preparing", "ready"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchTerm = q?.trim() ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .in("status", BOARD_STATUSES)
    .order("created_at", { ascending: false });

  if (searchTerm) {
    // Escape ilike wildcards so a literal "%" or "_" in a search term
    // doesn't act as a wildcard.
    const escaped = searchTerm.replace(/[%_]/g, (m) => `\\${m}`);
    query = query.or(
      `order_number.ilike.%${escaped}%,customer_mobile.ilike.%${escaped}%`,
    );
  }

  // Defense-in-depth: the service-role client below bypasses RLS
  // entirely to generate screenshot signed URLs, so this page checks
  // admin_users membership itself rather than relying only on RLS. Run
  // it alongside the orders query (instead of before) since RLS already
  // gates the orders query on its own — we just discard the result
  // below if the admin check fails.
  const [adminProfile, { data, error }] = await Promise.all([
    currentAdminProfile(supabase),
    query,
  ]);
  if (!adminProfile) redirect("/admin/login");
  const activeOrders = (data as OrderWithItems[] | null) ?? [];

  const adminClient = createAdminClient();
  const screenshotUrls: Record<string, string> = {};
  await Promise.all(
    activeOrders
      .filter((o) => o.payment_screenshot_path)
      .map(async (o) => {
        const { data } = await adminClient.storage
          .from("payment-screenshots")
          .createSignedUrl(o.payment_screenshot_path as string, 60 * 30);
        if (data?.signedUrl) screenshotUrls[o.id] = data.signedUrl;
      }),
  );

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[1400px] mx-auto">
        <OrdersTabs active="/admin/orders" />
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h1 className="font-heading text-gold text-2xl">Orders</h1>

          <form method="GET" className="flex items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search order # or phone"
              className="bg-bg2 border border-line rounded-btn px-3 py-2 text-cream text-sm font-body placeholder:text-muted w-56"
            />
            <button
              type="submit"
              className="rounded-btn bg-red text-white font-body font-semibold text-sm px-4 py-2 hover:bg-red-deep"
            >
              Search
            </button>
            {searchTerm && (
              <Link
                href="/admin/orders"
                className="text-muted text-xs font-body underline underline-offset-2 hover:text-gold"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {error && (
          <p className="text-red font-body text-sm mb-4">
            Unable to load orders.
          </p>
        )}
        {searchTerm && (
          <p className="text-muted text-xs font-body mb-4">
            Showing Received/Preparing/Ready matching &ldquo;{searchTerm}
            &rdquo;. Completed and Cancelled orders are searched from{" "}
            <Link
              href="/admin/orders/history"
              className="underline underline-offset-2 hover:text-gold"
            >
              Order History
            </Link>
            .
          </p>
        )}

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {BOARD_STATUSES.map((status) => {
            const columnOrders = activeOrders.filter(
              (o) => o.status === status,
            );
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
                  <p className="text-muted text-xs font-body">
                    {searchTerm ? "No match in this column" : "No orders"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
