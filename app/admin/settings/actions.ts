"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole, OperatingHours } from "@/lib/types/database";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export interface SettingsActionState {
  error: string | null;
  success: boolean;
}

async function requireOwnerSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: AdminRole }>();

  return { supabase, isOwner: adminUser?.role === "owner" };
}

function parseOperatingHours(formData: FormData): OperatingHours {
  const hours: OperatingHours = {};
  for (const day of DAYS) {
    if (formData.get(`closed_${day}`) === "on") {
      hours[day] = null;
      continue;
    }
    const open = formData.get(`open_${day}`);
    const close = formData.get(`close_${day}`);
    hours[day] =
      typeof open === "string" && typeof close === "string" && open && close
        ? { open, close }
        : null;
  }
  return hours;
}

function numberOrZero(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function nullableNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function stringOrEmpty(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { supabase, isOwner } = await requireOwnerSession();
  if (!isOwner) {
    return { error: "Only the owner can edit settings.", success: false };
  }

  const update: Record<string, unknown> = {
    store_open: formData.get("storeOpen") === "on",
    operating_hours: parseOperatingHours(formData),
    delivery_fee_base: numberOrZero(formData.get("deliveryFeeBase")),
    delivery_fee_per_km: numberOrZero(formData.get("deliveryFeePerKm")),
    delivery_max_km: numberOrZero(formData.get("deliveryMaxKm")),
    min_order_amount: numberOrZero(formData.get("minOrderAmount")),
    pickup_address: stringOrEmpty(formData.get("pickupAddress")),
    pickup_lat: nullableNumber(formData.get("pickupLat")),
    pickup_lng: nullableNumber(formData.get("pickupLng")),
    store_phone: stringOrEmpty(formData.get("storePhone")),
    store_messenger_url: stringOrEmpty(formData.get("storeMessengerUrl")),
    qr_account_name: stringOrEmpty(formData.get("qrAccountName")),
    qr_account_number: stringOrEmpty(formData.get("qrAccountNumber")),
    notify_telegram_chat_id: stringOrEmpty(formData.get("notifyTelegramChatId")),
  };

  // The "assets" storage bucket has no write policy for any role except
  // service_role (see 0001_init.sql) — we've already verified is_owner()
  // above, so this is the one escape hatch to the service-role client.
  const qrFile = formData.get("qrImage");
  if (qrFile instanceof File && qrFile.size > 0) {
    const ext = qrFile.name.split(".").pop() || "png";
    const path = `qr-${Date.now()}.${ext}`;
    const adminClient = createAdminClient();
    const { error: uploadError } = await adminClient.storage
      .from("assets")
      .upload(path, qrFile, { contentType: qrFile.type, upsert: true });
    if (uploadError) {
      return { error: "Failed to upload QR image.", success: false };
    }
    update.qr_image_path = path;
  }

  const { error } = await supabase.from("settings").update(update).eq("id", 1);
  if (error) {
    return { error: "Failed to save settings.", success: false };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/checkout");

  return { error: null, success: true };
}
