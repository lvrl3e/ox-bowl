import type { OrderItemRow, OrderRow, OrderStatus } from "@/lib/types/database";
import { formatPeso } from "@/lib/format";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
} from "@/app/admin/orders/actions";

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  received: { next: "preparing", label: "Start preparing" },
  preparing: { next: "ready", label: "Mark ready" },
  ready: { next: "completed", label: "Mark completed" },
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

interface OrderCardProps {
  order: OrderRow & { order_items: OrderItemRow[] };
  screenshotUrl?: string;
}

export default function OrderCard({ order, screenshotUrl }: OrderCardProps) {
  const advance = NEXT_STATUS[order.status];
  const canCancel = order.status !== "completed" && order.status !== "cancelled";
  const needsPaymentReview =
    order.payment_method === "qr" && order.payment_status === "awaiting_verification";

  return (
    <details className="group bg-bg2 rounded-card border border-line overflow-hidden [&::-webkit-details-marker]:hidden">
      <summary className="list-none cursor-pointer select-none p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-heading text-cream text-base truncate">
              {order.order_number}
            </p>
            {needsPaymentReview && (
              <span className="shrink-0 rounded-pill bg-gold/20 text-gold text-[10px] font-body font-semibold px-2 py-0.5">
                Review
              </span>
            )}
          </div>
          <p className="text-muted text-xs font-body truncate">
            {order.customer_name} · {order.order_items.length} item
            {order.order_items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-heading text-gold text-sm">
            {formatPeso(order.total)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-muted transition-transform group-open:rotate-180"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </summary>

      <div className="px-3 pb-3 pt-1 border-t border-line flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-muted text-xs font-body">
            {formatDateTime(order.created_at)}
          </p>
        </div>

        <p className="text-muted text-xs font-body">
          {order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"} ·{" "}
          {order.schedule_type === "asap"
            ? "ASAP"
            : `Scheduled: ${order.scheduled_time ? formatDateTime(order.scheduled_time) : "—"}`}
        </p>

        <div>
          <p className="text-cream text-sm font-body font-semibold">
            {order.customer_name}
          </p>
          <a
            href={`tel:${order.customer_mobile}`}
            className="text-muted text-xs font-body hover:text-gold"
          >
            {order.customer_mobile}
          </a>
        </div>

        {order.fulfillment_type === "delivery" && order.delivery_address && (
          <p className="text-muted text-xs font-body">
            {order.delivery_address}
            {order.delivery_landmark ? ` (${order.delivery_landmark})` : ""}
          </p>
        )}

        <ul className="text-sm font-body border-t border-line pt-2 mt-1 flex flex-col gap-1">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2 text-cream">
              <span>
                {item.quantity}× {item.item_name}
                {item.variant_label ? ` (${item.variant_label})` : ""}
              </span>
              <span className="text-gold shrink-0">{formatPeso(item.line_total)}</span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="text-muted text-xs font-body italic">&ldquo;{order.notes}&rdquo;</p>
        )}

        <div className="flex justify-between text-sm font-body font-semibold pt-2 border-t border-line">
          <span className="text-cream">Total</span>
          <span className="text-gold">{formatPeso(order.total)}</span>
        </div>

        <p className="text-xs font-body text-muted">
          Payment: {order.payment_method === "cash" ? "Cash" : "QR"}
          {order.payment_method !== "cash" &&
            ` · ${order.payment_status.replace("_", " ")}`}
        </p>

        {needsPaymentReview && (
        <div className="flex flex-col gap-2 border border-gold rounded-btn p-2">
          {screenshotUrl ? (
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-xs font-body underline underline-offset-2"
            >
              View payment screenshot
            </a>
          ) : (
            <p className="text-muted text-xs font-body">No screenshot uploaded</p>
          )}
          {order.payment_reference_number && (
            <p className="text-muted text-xs font-body">
              Ref: {order.payment_reference_number}
            </p>
          )}
          <div className="flex gap-2">
            <form action={updatePaymentStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="paymentStatus" value="paid" />
              <button
                type="submit"
                className="rounded-btn bg-red text-white text-xs font-body font-semibold px-3 py-2 min-h-9 hover:bg-red-deep"
              >
                Mark paid
              </button>
            </form>
            <form action={updatePaymentStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="paymentStatus" value="rejected" />
              <button
                type="submit"
                className="rounded-btn border border-line text-cream text-xs font-body font-semibold px-3 py-2 min-h-9 hover:bg-bg"
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        {advance && (
          <form action={updateOrderStatusAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="status" value={advance.next} />
            <button
              type="submit"
              className="rounded-btn bg-red text-white text-xs font-body font-semibold px-3 py-2 min-h-9 hover:bg-red-deep"
            >
              {advance.label}
            </button>
          </form>
        )}
        {canCancel && (
          <form action={updateOrderStatusAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="status" value="cancelled" />
            <button
              type="submit"
              className="rounded-btn border border-line text-muted text-xs font-body font-semibold px-3 py-2 min-h-9 hover:text-red hover:border-red"
            >
              Cancel
            </button>
          </form>
        )}
        </div>
      </div>
    </details>
  );
}
