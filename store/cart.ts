"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  /** Unique key for this line: `${itemId}:${variantId ?? "base"}` */
  key: string;
  itemId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  requiresAdvanceOrder: boolean;
  advanceOrderDays: number;
  /** Set when an advance-order item's required date was chosen on the card. */
  advanceDate: string | null;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.key === item.key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === item.key
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
        set({ isOpen: true });
      },

      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),

      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity } : i
          ),
        });
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "ox-bowl-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
