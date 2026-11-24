import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validations/checkout";
import { isStoreOpenNow } from "@/lib/data/settings";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { formatPeso } from "@/lib/format";
import type { Settings } from "@/lib/types/database";

const SCHEDULED_TIME_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

interface MenuItemForPricing {
  id: string;
  name: string;
  base_price: number | null;
  has_variants: boolean;
  is_sold_out: boolean;
  item_variants: { id: string; label: string; price: number }[];
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid request", 400);
  }

  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return errorResponse("Invalid request", 400);
  }

  let payloadJson: unknown;
  try {
    payloadJson = JSON.parse(payloadRaw);
  } catch {
    return errorResponse("Invalid request", 400);
  }

  const parsed = checkoutSchema.safeParse(payloadJson);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  const input = parsed.data;

  const supabase = createAdminClient();

  const { data: settingsRow, error: settingsError } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (settingsError || !settingsRow) {
    return errorResponse("Unable to load store settings", 500);
  }
  const settings = settingsRow as Settings;

  if (!settings.store_open) {
    return errorResponse("The store is not accepting orders right now", 400);
  }

  if (input.scheduleType === "asap") {
    const { open } = isStoreOpenNow(settings);
    if (!open) {
      return errorResponse("The store is currently closed for ASAP orders", 400);
    }
  }

  const itemIds = [...new Set(input.items.map((i) => i.itemId))];
  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, base_price, has_variants, is_sold_out, item_variants(id, label, price)")
    .in("id", itemIds);

  if (menuError || !menuItems) {
    return errorResponse("Unable to verify menu items", 500);
  }

  const lineItems: {
    item_id: string;
    item_name: string;
    variant_label: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const line of input.items) {
    const menuItem = (menuItems as MenuItemForPricing[]).find((m) => m.id === line.itemId);
    if (!menuItem) {
      return errorResponse("One of the items in your cart is no longer available", 400);
    }
    if (menuItem.is_sold_out) {
      return errorResponse(`${menuItem.name} is sold out`, 400);
    }

    let unitPrice: number;
    let variantLabel: string | null = null;
    if (menuItem.has_variants) {
      const variant = menuItem.item_variants.find((v) => v.id === line.variantId);
      if (!variant) {
        return errorResponse(`Choose a valid option for ${menuItem.name}`, 400);
      }
      unitPrice = variant.price;
      variantLabel = variant.label;
    } else {
      unitPrice = menuItem.base_price ?? 0;
    }

    lineItems.push({
      item_id: menuItem.id,
      item_name: menuItem.name,
      variant_label: variantLabel,
      unit_price: unitPrice,
      quantity: line.quantity,
      line_total: unitPrice * line.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, l) => sum + l.line_total, 0);

  if (settings.min_order_amount > 0 && subtotal < settings.min_order_amount) {
    return errorResponse(
      `Minimum order amount is ${settings.min_order_amount}`,
      400
    );
  }

  // Flat delivery fee for now — no geocoding is configured to compute
  // a real distance, so every delivery order is charged delivery_fee_base.
  const deliveryFee = input.fulfillmentType === "delivery" ? settings.delivery_fee_base : 0;
  const total = subtotal + deliveryFee;

  let paymentScreenshotPath: string | null = null;
  const screenshotFile = formData.get("screenshot");
  if (input.paymentMethod === "qr" && screenshotFile instanceof File && screenshotFile.size > 0) {
    const ext = screenshotFile.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, screenshotFile, { contentType: screenshotFile.type });
    if (uploadError) {
      return errorResponse("Failed to upload payment screenshot", 500);
    }
    paymentScreenshotPath = path;
  }

  const { data: orderNumber, error: orderNumberError } = await supabase.rpc(
    "next_order_number"
  );
  if (orderNumberError || !orderNumber) {
    return errorResponse("Unable to create order number", 500);
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      fulfillment_type: input.fulfillmentType,
      customer_name: input.customerName,
      customer_mobile: input.customerMobile,
      schedule_type: input.scheduleType,
      scheduled_time: input.scheduleType === "scheduled" ? input.scheduledTime : null,
      delivery_address: input.fulfillmentType === "delivery" ? input.deliveryAddress : null,
      delivery_landmark:
        input.fulfillmentType === "delivery" ? input.deliveryLandmark ?? null : null,
      notes: input.notes ?? null,
      payment_method: input.paymentMethod,
      payment_status: input.paymentMethod === "qr" ? "awaiting_verification" : "unpaid",
      payment_screenshot_path: paymentScreenshotPath,
      payment_reference_number: input.paymentReferenceNumber ?? null,
      subtotal,
      delivery_fee: deliveryFee,
      total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    return errorResponse("Unable to place order", 500);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lineItems.map((l) => ({
      order_id: orderRow.id,
      item_id: l.item_id,
      item_name: l.item_name,
      variant_label: l.variant_label,
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.line_total,
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderRow.id);
    return errorResponse("Unable to place order", 500);
  }

  if (settings.notify_telegram_chat_id) {
    const fulfillmentLine =
      input.fulfillmentType === "delivery"
        ? `🚚 Delivery — ${escapeHtml(input.deliveryAddress ?? "")}${
            input.deliveryLandmark
              ? ` (${escapeHtml(input.deliveryLandmark)})`
              : ""
          }`
        : "🏃 Pickup";
    const scheduleLine =
      input.scheduleType === "scheduled" && input.scheduledTime
        ? `🕑 Scheduled for ${SCHEDULED_TIME_FORMATTER.format(new Date(input.scheduledTime))}`
        : "⚡ ASAP";
    const itemLines = lineItems
      .map(
        (l) =>
          `• ${l.quantity}x ${escapeHtml(l.item_name)}${
            l.variant_label ? ` (${escapeHtml(l.variant_label)})` : ""
          } — ${formatPeso(l.line_total)}`,
      )
      .join("\n");
    const paymentLine =
      input.paymentMethod === "qr"
        ? "💳 GCash — awaiting verification"
        : "💵 Cash";

    const message = [
      `🔔 <b>New order ${escapeHtml(orderRow.order_number)}</b>`,
      "",
      fulfillmentLine,
      scheduleLine,
      `👤 ${escapeHtml(input.customerName)} — ${escapeHtml(input.customerMobile)}`,
      "",
      "<b>Items:</b>",
      itemLines,
      "",
      `💰 Total: ${formatPeso(total)}`,
      paymentLine,
      ...(input.notes ? [`📝 ${escapeHtml(input.notes)}`] : []),
    ].join("\n");

    await sendTelegramMessage(settings.notify_telegram_chat_id, message);
  }

  return NextResponse.json({ orderNumber: orderRow.order_number });
}
