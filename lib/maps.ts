import type { Settings } from "@/lib/types/database";

/** Google Maps link for the pickup location — a precise pin if lat/lng are set, else an address search. */
export function pickupMapUrl(
  settings: Pick<Settings, "pickup_lat" | "pickup_lng" | "pickup_address">
): string {
  return settings.pickup_lat && settings.pickup_lng
    ? `https://www.google.com/maps?q=${settings.pickup_lat},${settings.pickup_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.pickup_address)}`;
}
