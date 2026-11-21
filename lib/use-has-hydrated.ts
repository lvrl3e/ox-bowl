"use client";

import { useEffect, useState } from "react";

/**
 * The cart store is persisted to localStorage, which isn't available
 * during SSR. Components that render cart-derived numbers (e.g. the
 * header's cart count) should wait for this to flip to `true` before
 * trusting the store, to avoid a hydration mismatch.
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
