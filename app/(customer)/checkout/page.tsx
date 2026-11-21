import type { Metadata } from "next";
import CheckoutForm from "@/components/customer/CheckoutForm";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Choose pickup or delivery and place your order.",
};

export default async function CheckoutPage() {
  const { settings } = await getSettings();

  return <CheckoutForm settings={settings} />;
}
