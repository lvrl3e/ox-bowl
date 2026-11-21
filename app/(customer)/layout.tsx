import Header from "@/components/customer/Header";
import CartDrawer from "@/components/customer/CartDrawer";
import { getSettings } from "@/lib/data/settings";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getSettings();

  return (
    <>
      <Header />
      {children}
      <CartDrawer minOrderAmount={settings.min_order_amount} />
    </>
  );
}
