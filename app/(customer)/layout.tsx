import Header from "@/components/customer/Header";
import CartDrawer from "@/components/customer/CartDrawer";
import Analytics from "@/components/Analytics";
import { getSettings } from "@/lib/data/settings";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getSettings();

  return (
    <>
      <Analytics />
      <Header />
      {children}
      <CartDrawer minOrderAmount={settings.min_order_amount} />
    </>
  );
}
