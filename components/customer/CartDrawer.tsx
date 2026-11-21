"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { useCartStore } from "@/store/cart";
import CartContents from "@/components/customer/CartContents";

interface CartDrawerProps {
  minOrderAmount: number;
}

export default function CartDrawer({ minOrderAmount }: CartDrawerProps) {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);

  // lock body scroll while the drawer is open, and allow Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={clsx(
          "fixed inset-0 bg-black/60 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={clsx(
          "fixed top-0 right-0 h-full w-full sm:max-w-[440px] bg-bg2 z-50 shadow-2xl transition-transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b-[3px] border-red shrink-0">
          <h2 className="font-heading text-cream text-xl">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="w-10 h-10 flex items-center justify-center text-cream text-2xl"
          >
            ×
          </button>
        </div>
        <CartContents minOrderAmount={minOrderAmount} onNavigate={closeCart} />
      </aside>
    </>
  );
}
