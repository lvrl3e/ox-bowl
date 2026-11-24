"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * These pages are server-rendered per request with no push/realtime
 * channel, so a change made elsewhere (a new order, a sold-out toggle,
 * a status update) never shows up until something re-requests the
 * page. This polls router.refresh() (a server-component re-fetch, not
 * a full page reload) in the background so the page picks up changes
 * on its own.
 */
export default function AutoRefresh({
  intervalMs = 15000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
