"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPeso } from "@/lib/format";
import type { OrderLookupResult, OrderStatus } from "@/lib/types/database";

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();

  const [showMobileLookup, setShowMobileLookup] = useState(false);
  const [mobile, setMobile] = useState("");
  const [lookupState, setLookupState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "error" } | {
        status: "done";
        results: OrderLookupResult[];
      }
  >({ status: "idle" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  async function handleMobileLookup(e: FormEvent) {
    e.preventDefault();
    const trimmed = mobile.trim();
    if (!trimmed) return;

    setLookupState({ status: "loading" });
    const supabase = createClient();

    const { data, error } = await supabase.rpc("lookup_orders_by_mobile", {
      p_mobile: trimmed,
    });

    if (error) {
      setLookupState({ status: "error" });
      return;
    }

    setLookupState({ status: "done", results: (data ?? []) as OrderLookupResult[] });
  }

  return (
    <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
      <h1 className="font-heading text-gold text-[32px]">Track your order</h1>
      <p className="text-muted font-body mt-2">
        Enter the order number from your confirmation (e.g. OB-1001).
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="OB-1001"
          className="flex-1 bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-btn bg-red text-white font-body font-semibold px-5 py-2.5 hover:bg-red-deep"
        >
          Track
        </button>
      </form>

      <div className="mt-6">
        {!showMobileLookup ? (
          <button
            type="button"
            onClick={() => setShowMobileLookup(true)}
            className="text-muted text-sm font-body underline underline-offset-2 hover:text-gold"
          >
            Forgot your order number?
          </button>
        ) : (
          <div className="text-left bg-bg2 border border-line rounded-card p-4">
            <p className="text-cream text-sm font-body font-semibold">
              Find it with your mobile number
            </p>
            <p className="text-muted text-xs font-body mt-1">
              We&rsquo;ll show your recent orders placed with this number.
            </p>
            <form onSubmit={handleMobileLookup} className="mt-3 flex gap-2">
              <input
                required
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="09XXXXXXXXX"
                className="flex-1 bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={lookupState.status === "loading"}
                className="rounded-btn bg-red text-white font-body font-semibold px-4 py-2.5 hover:bg-red-deep disabled:opacity-60"
              >
                {lookupState.status === "loading" ? "..." : "Find"}
              </button>
            </form>

            {lookupState.status === "error" && (
              <p className="mt-3 text-red text-sm font-body">
                Couldn&rsquo;t look that up right now. Please try again.
              </p>
            )}

            {lookupState.status === "done" && lookupState.results.length === 0 && (
              <p className="mt-3 text-muted text-sm font-body">
                No orders found for that number. Double-check it matches
                what you entered at checkout.
              </p>
            )}

            {lookupState.status === "done" && lookupState.results.length > 0 && (
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {lookupState.results.map((o) => (
                  <li key={o.order_number} className="py-2">
                    <Link
                      href={`/track/${encodeURIComponent(o.order_number)}`}
                      className="flex items-center justify-between gap-3 hover:text-gold"
                    >
                      <span className="font-heading normal-case text-cream text-sm">
                        {o.order_number}
                      </span>
                      <span className="text-muted text-xs font-body">
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-gold text-sm font-body shrink-0">
                        {formatPeso(o.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
