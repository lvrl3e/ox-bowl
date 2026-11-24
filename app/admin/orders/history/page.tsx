import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentAdminProfile } from "@/lib/admin/profile";
import AdminHeader from "@/components/admin/AdminHeader";
import OrdersTabs from "@/components/admin/OrdersTabs";
import OrderCard from "@/components/admin/OrderCard";
import DateNav from "@/components/admin/DateNav";
import PageNav from "@/components/admin/PageNav";
import {
  PAGE_SIZE,
  DATE_RE,
  manilaDayKey,
  manilaDateBounds,
  dateLabelFor,
  parsePage,
} from "@/lib/admin/orders-date";
import type { OrderItemRow, OrderRow } from "@/lib/types/database";

export const metadata: Metadata = { title: "Order History — Admin" };

type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

export default async function AdminOrdersHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    completedDate?: string;
    cancelledDate?: string;
    completedPage?: string;
    cancelledPage?: string;
    q?: string;
  }>;
}) {
  const { completedDate, cancelledDate, completedPage, cancelledPage, q } =
    await searchParams;
  const searchTerm = q?.trim() ?? "";
  const selectedCompletedPage = parsePage(completedPage);
  const selectedCancelledPage = parsePage(cancelledPage);

  const supabase = await createClient();

  const todayStr = manilaDayKey(new Date());
  const yesterdayStr = manilaDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const selectedCompletedDate =
    completedDate && DATE_RE.test(completedDate) ? completedDate : todayStr;
  const selectedCancelledDate =
    cancelledDate && DATE_RE.test(cancelledDate) ? cancelledDate : todayStr;

  const completedBounds = manilaDateBounds(selectedCompletedDate);
  const cancelledBounds = manilaDateBounds(selectedCancelledDate);
  // Escape ilike wildcards so a literal "%" or "_" in a search term
  // doesn't act as a wildcard.
  const escapedSearch = searchTerm.replace(/[%_]/g, (m) => `\\${m}`);

  let completedQuery = supabase
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .eq("status", "completed");
  let cancelledQuery = supabase
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .eq("status", "cancelled");

  if (searchTerm) {
    // Searching looks across all time for that status, not just the
    // selected day — the date pickers are irrelevant while searching.
    const orFilter = `order_number.ilike.%${escapedSearch}%,customer_mobile.ilike.%${escapedSearch}%`;
    completedQuery = completedQuery
      .or(orFilter)
      .order("completed_at", { ascending: false })
      .limit(50);
    cancelledQuery = cancelledQuery
      .or(orFilter)
      .order("updated_at", { ascending: false })
      .limit(50);
  } else {
    completedQuery = completedQuery
      .gte("completed_at", completedBounds.startIso)
      .lte("completed_at", completedBounds.endIso)
      .order("completed_at", { ascending: false })
      .range(
        (selectedCompletedPage - 1) * PAGE_SIZE,
        selectedCompletedPage * PAGE_SIZE - 1,
      );
    // Cancelled orders have no dedicated "cancelled_at" column, so
    // updated_at is the closest proxy — cancelling is a status update
    // like any other, and nothing else touches a cancelled order after.
    cancelledQuery = cancelledQuery
      .gte("updated_at", cancelledBounds.startIso)
      .lte("updated_at", cancelledBounds.endIso)
      .order("updated_at", { ascending: false })
      .range(
        (selectedCancelledPage - 1) * PAGE_SIZE,
        selectedCancelledPage * PAGE_SIZE - 1,
      );
  }

  // Defense-in-depth: the service-role client below bypasses RLS
  // entirely to generate screenshot signed URLs, so this page checks
  // admin_users membership itself rather than relying only on RLS. Run
  // it alongside the order queries (instead of before) since RLS already
  // gates those on their own — we just discard the results below if the
  // admin check fails.
  const [adminProfile, completedResult, cancelledResult] = await Promise.all([
    currentAdminProfile(supabase),
    completedQuery,
    cancelledQuery,
  ]);
  if (!adminProfile) redirect("/admin/login");

  const error = completedResult.error ?? cancelledResult.error;
  const completedOrders =
    (completedResult.data as OrderWithItems[] | null) ?? [];
  const completedTotal = completedResult.count ?? completedOrders.length;
  const cancelledOrders =
    (cancelledResult.data as OrderWithItems[] | null) ?? [];
  const cancelledTotal = cancelledResult.count ?? cancelledOrders.length;

  const adminClient = createAdminClient();
  const screenshotUrls: Record<string, string> = {};
  await Promise.all(
    [...completedOrders, ...cancelledOrders]
      .filter((o) => o.payment_screenshot_path)
      .map(async (o) => {
        const { data } = await adminClient.storage
          .from("payment-screenshots")
          .createSignedUrl(o.payment_screenshot_path as string, 60 * 30);
        if (data?.signedUrl) screenshotUrls[o.id] = data.signedUrl;
      }),
  );

  const completedTotalPages = Math.max(
    1,
    Math.ceil(completedTotal / PAGE_SIZE),
  );
  const cancelledTotalPages = Math.max(
    1,
    Math.ceil(cancelledTotal / PAGE_SIZE),
  );
  const completedRangeStart = (selectedCompletedPage - 1) * PAGE_SIZE + 1;
  const cancelledRangeStart = (selectedCancelledPage - 1) * PAGE_SIZE + 1;

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="px-5 py-10 max-w-[1400px] mx-auto">
        <OrdersTabs active="/admin/orders/history" />
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h1 className="font-heading text-gold text-2xl">Order History</h1>

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
                href="/admin/orders/history"
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

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-cream text-sm uppercase tracking-wide border-b border-line pb-2">
              Completed · {completedTotal}
            </h2>
            {searchTerm ? (
              <p className="text-muted text-[11px] font-body">
                Matching &ldquo;{searchTerm}&rdquo;
              </p>
            ) : (
              <>
                <DateNav
                  paramName="completedDate"
                  selectedDate={selectedCompletedDate}
                  todayStr={todayStr}
                />
                <p className="text-muted text-[11px] font-body">
                  {dateLabelFor(selectedCompletedDate, todayStr, yesterdayStr)}
                  {completedTotal > PAGE_SIZE &&
                    ` — showing ${completedRangeStart}–${completedRangeStart + completedOrders.length - 1} of ${completedTotal}`}
                </p>
                <PageNav
                  basePath="/admin/orders/history"
                  dateParamName="completedDate"
                  selectedDate={selectedCompletedDate}
                  todayStr={todayStr}
                  pageParamName="completedPage"
                  page={selectedCompletedPage}
                  totalPages={completedTotalPages}
                />
              </>
            )}
            {completedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                screenshotUrl={screenshotUrls[order.id]}
              />
            ))}
            {completedOrders.length === 0 && (
              <p className="text-muted text-xs font-body">
                {searchTerm ? "No match" : "No orders"}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-cream text-sm uppercase tracking-wide border-b border-line pb-2">
              Cancelled · {cancelledTotal}
            </h2>
            {searchTerm ? (
              <p className="text-muted text-[11px] font-body">
                Matching &ldquo;{searchTerm}&rdquo;
              </p>
            ) : (
              <>
                <DateNav
                  paramName="cancelledDate"
                  selectedDate={selectedCancelledDate}
                  todayStr={todayStr}
                />
                <p className="text-muted text-[11px] font-body">
                  {dateLabelFor(selectedCancelledDate, todayStr, yesterdayStr)}
                  {cancelledTotal > PAGE_SIZE &&
                    ` — showing ${cancelledRangeStart}–${cancelledRangeStart + cancelledOrders.length - 1} of ${cancelledTotal}`}
                </p>
                <PageNav
                  basePath="/admin/orders/history"
                  dateParamName="cancelledDate"
                  selectedDate={selectedCancelledDate}
                  todayStr={todayStr}
                  pageParamName="cancelledPage"
                  page={selectedCancelledPage}
                  totalPages={cancelledTotalPages}
                />
              </>
            )}
            {cancelledOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                screenshotUrl={screenshotUrls[order.id]}
              />
            ))}
            {cancelledOrders.length === 0 && (
              <p className="text-muted text-xs font-body">
                {searchTerm ? "No match" : "No cancelled orders"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
