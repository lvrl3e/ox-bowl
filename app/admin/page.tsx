import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentAdminProfile } from "@/lib/admin/profile";
import type { OrderRow } from "@/lib/types/database";
import { formatPeso } from "@/lib/format";
import { manilaDayKey, manilaDateBounds } from "@/lib/admin/orders-date";
import AdminHeader from "@/components/admin/AdminHeader";
import AutoRefresh from "@/components/AutoRefresh";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const RECENT_TIME_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

const STATUS_BADGE: Record<string, string> = {
  received: "bg-gold/15 text-gold",
  preparing: "bg-cream/15 text-cream",
  ready: "bg-gold/15 text-gold",
  completed: "bg-line text-muted",
  cancelled: "bg-red/15 text-red",
};

export default async function AdminHomePage() {
  const supabase = await createClient();
  const todayBounds = manilaDateBounds(manilaDayKey(new Date()));

  const [
    adminProfile,
    received,
    preparing,
    ready,
    needsReview,
    completedToday,
    recentResult,
  ] = await Promise.all([
    currentAdminProfile(supabase),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "received"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "preparing"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_method", "qr")
      .eq("payment_status", "awaiting_verification"),
    supabase
      .from("orders")
      .select("total")
      .eq("status", "completed")
      .gte("completed_at", todayBounds.startIso)
      .lte("completed_at", todayBounds.endIso),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!adminProfile) redirect("/admin/login");
  const todaySales = (completedToday.data ?? []).reduce(
    (sum, o: { total: number }) => sum + o.total,
    0,
  );
  const recentOrders =
    (recentResult.data as
      | Pick<
          OrderRow,
          | "id"
          | "order_number"
          | "customer_name"
          | "status"
          | "total"
          | "created_at"
        >[]
      | null) ?? [];

  const stats = [
    {
      label: "Received",
      value: received.count ?? 0,
      accent: "text-gold",
      icon: (
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ),
    },
    {
      label: "Preparing",
      value: preparing.count ?? 0,
      accent: "text-cream",
      icon: (
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 7v5l3.5 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ),
    },
    {
      label: "Ready",
      value: ready.count ?? 0,
      accent: "text-gold",
      icon: (
        <path
          d="M4 12.5 9 17.5 20 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      label: "Needs payment review",
      value: needsReview.count ?? 0,
      accent: needsReview.count ? "text-red" : "text-muted",
      icon: (
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 8v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16" r="0.9" fill="currentColor" />
        </>
      ),
    },
    {
      label: "Today's sales",
      value: formatPeso(todaySales),
      accent: "text-gold",
      icon: (
        <path
          d="M12 2v2M12 20v2M5 6.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 0 5h-5a2.5 2.5 0 0 0 0 5h7a2.5 2.5 0 0 1-2.5 2.5h-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <AutoRefresh />

      <div className="px-5 py-10 max-w-[900px] mx-auto">
        <div
          className="relative overflow-hidden rounded-card border border-line bg-bg2 px-6 py-5 mb-8 flex items-center justify-between gap-4 flex-wrap"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 100% at 0% 0%, rgba(200,16,46,0.18), transparent 70%)",
          }}
        >
          <div>
            <p className="font-heading text-cream text-xl">
              Welcome back, {adminProfile.name ?? adminProfile.email}
            </p>
            <span className="inline-block mt-2 rounded-pill bg-red/15 text-red text-[11px] font-body font-semibold tracking-wide px-2.5 py-1 uppercase">
              {adminProfile.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-line bg-bg2 p-4"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={stat.accent}
              >
                {stat.icon}
              </svg>
              <p className={`font-heading text-2xl mt-2 ${stat.accent}`}>
                {stat.value}
              </p>
              <p className="text-muted text-xs font-body mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-cream text-sm uppercase tracking-wide">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-muted text-xs font-body underline underline-offset-2 hover:text-gold"
            >
              View board
            </Link>
          </div>
          <div className="rounded-card border border-line bg-bg2 divide-y divide-line overflow-hidden">
            {recentOrders.length === 0 && (
              <p className="text-muted text-xs font-body p-4">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-cream font-body font-semibold text-sm truncate">
                    {order.order_number}{" "}
                    <span className="text-muted font-normal">
                      · {order.customer_name}
                    </span>
                  </p>
                  <p className="text-muted text-xs font-body">
                    {RECENT_TIME_FORMATTER.format(new Date(order.created_at))}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gold font-heading text-sm">
                    {formatPeso(order.total)}
                  </span>
                  <span
                    className={`rounded-pill text-[10px] font-body font-semibold uppercase tracking-wide px-2 py-0.5 ${
                      STATUS_BADGE[order.status] ?? "bg-line text-muted"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
