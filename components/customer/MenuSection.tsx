import type { CategoryWithItems } from "@/lib/types/database";
import MenuCard from "@/components/customer/MenuCard";

interface MenuSectionProps {
  category: CategoryWithItems;
}

export default function MenuSection({ category }: MenuSectionProps) {
  const items = [...category.menu_items].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <section id={`cat-${category.slug}`} className="py-8 scroll-mt-32">
      <div className="flex items-end gap-3">
        <div className="relative inline-block">
          <h2 className="relative z-10 -skew-x-6 bg-red text-cream font-heading text-2xl sm:text-[28px] px-5 py-1.5 rounded-sm shadow-[0_6px_16px_rgba(200,16,46,0.35)]">
            <span className="inline-block skew-x-6">{category.name}</span>
          </h2>
          <span
            aria-hidden="true"
            className="absolute left-1.5 -bottom-1.5 h-2 w-2/3 bg-gold/70 blur-[3px]"
          />
        </div>
        <span className="text-muted text-sm font-body pb-1">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div
        className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(270px,1fr))]"
      >
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
