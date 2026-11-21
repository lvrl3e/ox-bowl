import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Settings } from "@/lib/types/database";
import { FALLBACK_SETTINGS } from "@/lib/data/settings-fallback";

export const getSettings = cache(async (): Promise<{
  settings: Settings;
  isLive: boolean;
}> => {
  const supabase = createPublicClient();
  if (!supabase) {
    return { settings: FALLBACK_SETTINGS, isLive: false };
  }

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("[getSettings] Supabase query failed, using fallback:", error);
    return { settings: FALLBACK_SETTINGS, isLive: false };
  }

  return { settings: data as Settings, isLive: true };
});

/** "mon".."sun" for the current day, in the store's timezone. */
export function currentDayKey(timezone: string): keyof Settings["operating_hours"] {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const weekdayName = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(new Date());
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekdayName
  );
  return days[idx === -1 ? 0 : idx];
}

export function currentTimeHHMM(timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * Whether the store is currently accepting orders: the admin "open"
 * switch must be on AND the current time must fall inside today's
 * operating hours (or today must not be marked closed).
 */
export function isStoreOpenNow(settings: Settings): {
  open: boolean;
  todayHours: { open: string; close: string } | null;
} {
  const dayKey = currentDayKey(settings.timezone);
  const todayHours = settings.operating_hours[dayKey] ?? null;

  if (!settings.store_open || !todayHours) {
    return { open: false, todayHours };
  }

  const now = currentTimeHHMM(settings.timezone);
  const open = now >= todayHours.open && now < todayHours.close;
  return { open, todayHours };
}
