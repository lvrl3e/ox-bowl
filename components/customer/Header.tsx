"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartCount } from "@/store/cart";
import { useHasHydrated } from "@/lib/use-has-hydrated";

export default function Header() {
  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const hydrated = useHasHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-30 min-h-14 sm:min-h-16 border-b-[3px] border-red bg-bg px-3 sm:px-5 flex items-center justify-between gap-2">
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2 leading-tight shrink-0" aria-label="Ox Bowl Resto & Grill home">
        <Image
          src="/icon-mark-64.png"
          alt=""
          aria-hidden="true"
          width={75}
          height={64}
          priority
          className="h-7 sm:h-9 w-auto shrink-0"
        />
        <div>
          <p className="font-heading text-base sm:text-xl whitespace-nowrap">
            <span className="text-cream">OX</span>{" "}
            <span className="text-red">BOWL</span>
          </p>
          <p className="hidden sm:block text-[10px] text-muted tracking-widest -mt-1 font-body">
            RESTO &amp; GRILL
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <Link
          href="/track"
          aria-label="Track your order"
          className="rounded-pill border border-line text-cream text-xs sm:text-sm font-body font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-10 sm:min-h-11 flex items-center gap-1.5 whitespace-nowrap hover:bg-bg2 hover:border-gold hover:text-gold transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect x="6" y="4" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 13.5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Track order</span>
        </Link>

        <Link
          href="/order"
          className="rounded-pill border border-line text-cream text-xs sm:text-sm font-body font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-10 sm:min-h-11 flex items-center whitespace-nowrap hover:bg-red hover:border-red hover:text-white transition-colors"
        >
          Order now
        </Link>

        <button
          type="button"
          onClick={toggleCart}
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          className="rounded-pill bg-gold text-bg font-body font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 min-h-10 sm:min-h-11 whitespace-nowrap active:scale-95 transition-transform"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M6 7h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path d="M9 7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="hidden sm:inline">Cart ·</span> {count}
        </button>
      </div>
    </header>
  );
}
