"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin pages are server-rendered per request with no push/realtime
 * channel, so a new order placed by a customer never appears until
 * something re-requests the page. This polls router.refresh() (a
 * server-component re-fetch, not a full page reload) so the live
 * orders board and dashboard counts pick up new/updated orders
 * without the admin having to manually refresh.
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
