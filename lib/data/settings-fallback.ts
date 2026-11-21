import type { Settings } from "@/lib/types/database";

/** Mirrors the default row inserted by supabase/migrations/0001_init.sql. */
export const FALLBACK_SETTINGS: Settings = {
  id: 1,
  store_open: true,
  operating_hours: {
    mon: { open: "10:00", close: "21:00" },
    tue: { open: "10:00", close: "21:00" },
    wed: { open: "10:00", close: "21:00" },
    thu: { open: "10:00", close: "21:00" },
    fri: { open: "10:00", close: "21:00" },
    sat: { open: "10:00", close: "21:00" },
    sun: { open: "10:00", close: "21:00" },
  },
  timezone: "Asia/Manila",
  delivery_fee_base: 49,
  delivery_fee_per_km: 15,
  delivery_max_km: 12,
  min_order_amount: 0,
  pickup_address: "Set your pickup address in /admin/settings",
  pickup_lat: null,
  pickup_lng: null,
  store_phone: "",
  store_messenger_url: "https://www.facebook.com/oxbowlfeedbackandconcern21",
  qr_image_path: null,
  qr_account_name: "",
  qr_account_number: "",
  notify_telegram_chat_id: "",
  updated_at: "",
};
