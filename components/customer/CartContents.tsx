"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { useHasHydrated } from "@/lib/use-has-hydrated";
import { formatPeso } from "@/lib/format";

interface CartContentsProps {
  minOrderAmount: number;
  onNavigate?: () => void;
}

export default function CartContents({
  minOrderAmount,
  onNavigate,
}: CartContentsProps) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hydrated = useHasHydrated();
  const router = useRouter();

  if (!hydrated) {
    return <div className="p-4 text-muted text-sm font-body">Loading cart…</div>;
  }

  const subtotal = cartSubtotal(items);
  const belowMinimum = minOrderAmount > 0 && subtotal < minOrderAmount && items.length > 0;

  if (items.length === 0) {
    return (
      <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-cream font-heading text-lg">Your cart is empty</p>
        <p className="text-muted text-sm font-body mt-1">
          Add something crispy from the menu.
        </p>
        <Link
          href="/order#menu"
          onClick={onNavigate}
          className="mt-4 rounded-btn bg-red text-white font-body font-semibold px-5 py-2.5 hover:bg-red-deep"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 overflow-y-auto divide-y divide-line px-4">
        {items.map((item) => (
          <li key={item.key} className="py-4 flex gap-3">
            <div className="flex-1">
              <p className="font-heading normal-case text-cream text-base leading-tight">
                {item.name}
              </p>
              {item.variantLabel && (
                <p className="text-muted text-xs font-body mt-0.5">
                  {item.variantLabel}
                </p>
              )}
              {item.requiresAdvanceOrder && item.advanceDate && (
                <p className="text-gold text-xs font-body mt-0.5">
                  For: {item.advanceDate}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  className="w-8 h-8 rounded-btn border border-line text-cream flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-6 text-center text-cream font-body text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  className="w-8 h-8 rounded-btn border border-line text-cream flex items-center justify-center"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="ml-2 text-muted text-xs font-body underline underline-offset-2 hover:text-red min-h-8"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-gold text-lg">
                {formatPeso(item.unitPrice * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-4 py-4 bg-bg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cream font-body font-semibold">Subtotal</span>
          <span className="font-heading text-gold text-xl">
            {formatPeso(subtotal)}
          </span>
        </div>
        {belowMinimum && (
          <p className="text-red text-xs font-body mb-2">
            Minimum order is {formatPeso(minOrderAmount)}. Add{" "}
            {formatPeso(minOrderAmount - subtotal)} more to check out.
          </p>
        )}
        <button
          type="button"
          disabled={belowMinimum}
          onClick={() => {
            onNavigate?.();
            router.push("/checkout");
          }}
          className="w-full rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:bg-line disabled:text-muted disabled:cursor-not-allowed"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
