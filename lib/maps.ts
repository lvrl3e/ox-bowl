import type { Settings } from "@/lib/types/database";

/** Google Maps link for the pickup location — an address search. */
export function pickupMapUrl(settings: Pick<Settings, "pickup_address">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.pickup_address)}`;
}
