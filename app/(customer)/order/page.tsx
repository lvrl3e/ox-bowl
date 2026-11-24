import CategoryTabs from "@/components/customer/CategoryTabs";
import MenuSection from "@/components/customer/MenuSection";
import SectionDivider from "@/components/customer/SectionDivider";
import BackToTop from "@/components/customer/BackToTop";
import Footer from "@/components/customer/Footer";
import AutoRefresh from "@/components/AutoRefresh";
import { getMenu } from "@/lib/data/menu";
import { getSettings } from "@/lib/data/settings";

// Prices and sold-out status must always be live — see app/(customer)/page.tsx.
export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const [{ categories }, { settings }] = await Promise.all([
    getMenu(),
    getSettings(),
  ]);

  return (
    <main>
      <AutoRefresh intervalMs={30000} />
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,16,46,0.22), transparent 70%)",
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 9px)",
          ].join(", "),
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
        />
        <div className="relative max-w-[1280px] mx-auto px-5 pt-8 pb-6 text-center">
          <span className="inline-flex items-center gap-2 text-gold text-xs font-body font-semibold tracking-[0.2em] uppercase">
            <span className="h-px w-6 bg-gold/60" />
            Full Menu
            <span className="h-px w-6 bg-gold/60" />
          </span>
          <h1 className="mt-2 font-heading font-bold text-cream text-[32px] sm:text-[42px] leading-tight">
            Paborito ng mga <span className="text-gold">Food Lovers</span>
          </h1>
          <p className="mt-2 text-muted text-sm max-w-md mx-auto">
            Crispy sa unang kagat, sulit hanggang huling subo — pick a
            category below to browse.
          </p>
        </div>
      </section>

      <CategoryTabs categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

      <div id="menu" className="max-w-[1280px] mx-auto px-5">
        {categories.map((category, i) => (
          <div key={category.id}>
            {i > 0 && <SectionDivider />}
            <MenuSection category={category} />
          </div>
        ))}
      </div>

      <Footer settings={settings} />
      <BackToTop />
    </main>
  );
}
