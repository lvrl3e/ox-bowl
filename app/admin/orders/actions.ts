"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";

// Only these two transitions set a timestamp — "received_at" is already
// set by the orders table's own default.
const STATUS_TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  preparing: "preparing_at",
  ready: "ready_at",
  completed: "completed_at",
};

const VALID_STATUSES: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "awaiting_verification",
  "paid",
  "rejected",
];

// Confirms there's a signed-in Supabase user. The actual authorization
// boundary is RLS (orders_admin_update requires is_admin()) — a
// logged-in non-admin's update below simply affects zero rows.
async function requireSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = formData.get("orderId");
  const status = formData.get("status");
  if (typeof orderId !== "string" || typeof status !== "string") return;
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;

  const supabase = await requireSession();

  const timestampField = STATUS_TIMESTAMP_FIELD[status as OrderStatus];
  const update: Record<string, unknown> = { status };
  if (timestampField) update[timestampField] = new Date().toISOString();

  await supabase.from("orders").update(update).eq("id", orderId);
  revalidatePath("/admin/orders");
}

export async function updatePaymentStatusAction(formData: FormData) {
  const orderId = formData.get("orderId");
  const paymentStatus = formData.get("paymentStatus");
  if (typeof orderId !== "string" || typeof paymentStatus !== "string") return;
  if (!VALID_PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)) return;

  const supabase = await requireSession();
  await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);
  revalidatePath("/admin/orders");
}
