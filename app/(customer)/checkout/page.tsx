import type { Metadata } from "next";
import CheckoutForm from "@/components/customer/CheckoutForm";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Choose pickup or delivery and place your order.",
};

// Store hours, open/closed status, and delivery fee config must always
// be live — see app/(customer)/page.tsx.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { settings } = await getSettings();

  return <CheckoutForm settings={settings} />;
}
