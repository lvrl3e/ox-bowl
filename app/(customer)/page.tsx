import Hero from "@/components/customer/Hero";
import HowItWorks from "@/components/customer/HowItWorks";
import CrowdFavorites from "@/components/customer/CrowdFavorites";
import SectionDivider from "@/components/customer/SectionDivider";
import OrderCta from "@/components/customer/OrderCta";
import Footer from "@/components/customer/Footer";
import AutoRefresh from "@/components/AutoRefresh";
import { getSettings, currentDayKey } from "@/lib/data/settings";
import { getMenu } from "@/lib/data/menu";
import { formatTime12h } from "@/lib/format";

// Menu/settings data (prices, sold-out status, store hours) must always
// be live — without this, Next prerenders this page once at build time
// and Vercel's edge cache serves that snapshot indefinitely, regardless
// of revalidatePath() calls from admin actions.
export const dynamic = "force-dynamic";

const FAVORITE_SLUGS = [
  "giant-chicken-leg-quarter",
  "crispy-pata",
  "lechon-belly-1kg",
  "whole-chicken-inasal",
  "beef-pares-bar-sebi",
  "beer-batter-fish-fillet",
];

export default async function HomePage() {
  const { settings } = await getSettings();
  const { categories } = await getMenu();

  const todayHours = settings.operating_hours[currentDayKey(settings.timezone)];
  const todayHoursLabel = todayHours
    ? `${formatTime12h(todayHours.open)}–${formatTime12h(todayHours.close)}`
    : "Closed today";

  const allItems = categories.flatMap((c) => c.menu_items);
  const favorites = FAVORITE_SLUGS.map((slug) =>
    allItems.find((item) => item.slug === slug)
  ).filter((item) => item !== undefined);

  return (
    <main>
      <AutoRefresh intervalMs={10000} />
      <Hero todayHoursLabel={todayHoursLabel} />
      <CrowdFavorites items={favorites} />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <OrderCta phone={settings.store_phone} messengerUrl={settings.store_messenger_url} />
      <Footer settings={settings} />
    </main>
  );
}
