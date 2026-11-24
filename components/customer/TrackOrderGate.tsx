"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPeso } from "@/lib/format";
import CancelOrderForm from "@/components/customer/CancelOrderForm";
import type { TrackOrderResult } from "@/lib/types/database";

const STEPS = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
] as const;

interface TrackOrderGateProps {
  orderNumber: string;
}

export default function TrackOrderGate({ orderNumber }: TrackOrderGateProps) {
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState<
    | { status: "gate" }
    | { status: "loading" }
    | { status: "not_found" }
    | { status: "found"; order: TrackOrderResult }
  >({ status: "gate" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });

    const supabase = createClient();
    const { data, error } = await supabase.rpc("track_order", {
      p_order_number: orderNumber,
      p_mobile: mobile,
    });

    if (error || !data) {
      setState({ status: "not_found" });
      return;
    }

    setState({ status: "found", order: data as TrackOrderResult });
  }

  // This page has no push/realtime channel, so once unlocked, poll
  // quietly in the background to pick up status changes (e.g. the
  // kitchen marking the order "ready") without the customer having to
  // re-enter their mobile number or manually refresh. A failed poll
  // is ignored rather than kicking the customer back to the gate —
  // it just tries again next interval.
  useEffect(() => {
    if (state.status !== "found") return;

    const supabase = createClient();
    const id = setInterval(async () => {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_number: orderNumber,
        p_mobile: mobile,
      });
      if (!error && data) {
        setState({ status: "found", order: data as TrackOrderResult });
      }
    }, 15000);

    return () => clearInterval(id);
  }, [state.status, orderNumber, mobile]);

  if (state.status !== "found") {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
        <h1 className="font-heading text-gold text-[32px]">
          Order {orderNumber}
        </h1>
        <p className="text-muted font-body mt-2">
          Confirm the mobile number used at checkout to view this order.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
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
            disabled={state.status === "loading"}
            className="rounded-btn bg-red text-white font-body font-semibold px-5 py-2.5 hover:bg-red-deep disabled:opacity-60"
          >
            {state.status === "loading" ? "..." : "View"}
          </button>
        </form>

        {state.status === "not_found" && (
          <p className="mt-4 text-red text-sm font-body">
            That order number and mobile number don&rsquo;t match, or this
            order is no longer trackable.
          </p>
        )}

        <div className="mt-8">
          <Link
            href="/track"
            className="text-muted text-sm font-body underline underline-offset-2 hover:text-gold"
          >
            Back to order lookup
          </Link>
        </div>
      </div>
    );
  }

  const order = state.order;
  const stepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-[560px] mx-auto px-5 py-10">
      <h1 className="font-heading text-gold text-[32px] border-l-4 border-red pl-3 leading-none">
        Order {order.order_number}
      </h1>

      {order.status === "cancelled" ? (
        <p className="mt-6 text-red font-body font-semibold">
          This order was cancelled.
        </p>
      ) : (
        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1.5 rounded-pill ${
                  i <= stepIndex ? "bg-red" : "bg-line"
                }`}
              />
              <span
                className={`text-[11px] font-body ${
                  i <= stepIndex ? "text-cream" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {order.status === "received" && (
        <CancelOrderForm orderNumber={order.order_number} />
      )}

      <section className="mt-8 bg-bg2 rounded-card border border-line p-4">
        <h2 className="font-heading text-cream text-lg mb-2">Items</h2>
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="py-2 flex justify-between gap-3 text-sm font-body"
            >
              <span className="text-cream">
                {item.quantity}× {item.item_name}
                {item.variant_label && (
                  <span className="text-muted"> ({item.variant_label})</span>
                )}
              </span>
              <span className="text-gold shrink-0">
                {formatPeso(item.line_total)}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 mt-2 border-t border-line flex flex-col gap-1 text-sm font-body">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatPeso(order.subtotal)}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-muted">
              <span>Delivery fee</span>
              <span>{formatPeso(order.delivery_fee)}</span>
            </div>
          )}
          <div className="flex justify-between text-cream font-semibold text-base pt-1">
            <span>Total</span>
            <span className="text-gold">{formatPeso(order.total)}</span>
          </div>
        </div>
      </section>

      <p className="mt-4 text-muted text-sm font-body text-center">
        Payment: {order.payment_method === "cash" ? "Cash" : "QR"} ·{" "}
        {order.payment_status.replace("_", " ")}
      </p>

      <div className="mt-8 text-center">
        <Link
          href="/order"
          className="text-muted text-sm font-body underline underline-offset-2 hover:text-gold"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}
