export const PAGE_SIZE = 10;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MANILA_DAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function manilaDayKey(date: Date): string {
  return MANILA_DAY_KEY.format(date);
}

/** Start/end UTC instants for a Y-M-D calendar day in Asia/Manila (fixed UTC+8, no DST). */
export function manilaDateBounds(dateStr: string): { startIso: string; endIso: string } {
  return {
    startIso: new Date(`${dateStr}T00:00:00+08:00`).toISOString(),
    endIso: new Date(`${dateStr}T23:59:59.999+08:00`).toISOString(),
  };
}

export function dateLabelFor(selectedDate: string, todayStr: string, yesterdayStr: string): string {
  if (selectedDate === todayStr) return "Today";
  if (selectedDate === yesterdayStr) return "Yesterday";
  return selectedDate;
}

export function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
