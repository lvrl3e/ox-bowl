import type { Metadata } from "next";
import CartContents from "@/components/customer/CartContents";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your order before checking out.",
};

/**
 * Full-page cart — the desktop alternative to the slide-in drawer. On
 * mobile, customers mostly use the drawer (tap the header's Cart
 * button); this page is handy as a direct link or on wider screens.
 */
export default async function CartPage() {
  const { settings } = await getSettings();

  return (
    <div className="max-w-[600px] mx-auto px-5 py-8">
      <h1 className="font-heading text-gold text-[32px] border-l-4 border-red pl-3 leading-none mb-6">
        Your Cart
      </h1>
      <div className="bg-bg2 rounded-card border-t-[5px] border-red" style={{ minHeight: 300 }}>
        <CartContents minOrderAmount={settings.min_order_amount} />
      </div>
    </div>
  );
}
