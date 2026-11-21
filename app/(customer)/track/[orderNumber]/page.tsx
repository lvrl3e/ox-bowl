import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { formatPeso } from "@/lib/format";
import type { TrackOrderResult } from "@/lib/types/database";

const STEPS = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
] as const;

export default async function TrackOrderResultPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const supabase = createPublicClient();
  if (!supabase) {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
        <p className="text-muted font-body">
          Order tracking isn&rsquo;t available right now.
        </p>
      </div>
    );
  }

  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: orderNumber,
  });

  if (error || !data) {
    notFound();
  }

  const order = data as TrackOrderResult;
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
