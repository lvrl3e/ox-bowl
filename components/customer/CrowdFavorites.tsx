import Image from "next/image";
import Link from "next/link";
import type { MenuItemWithVariants } from "@/lib/types/database";
import { formatPeso } from "@/lib/format";

interface CrowdFavoritesProps {
  items: MenuItemWithVariants[];
}

function startingPrice(item: MenuItemWithVariants): number {
  if (!item.has_variants) return item.base_price ?? 0;
  const prices = item.item_variants.map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}

export default function CrowdFavorites({ items }: CrowdFavoritesProps) {
  if (items.length === 0) return null;

  return (
    <section className="max-w-[1000px] mx-auto px-5 py-10">
      <div className="relative inline-block">
        <h2 className="relative z-10 -skew-x-6 bg-red text-cream font-heading text-2xl sm:text-[28px] px-5 py-1.5 rounded-sm shadow-[0_6px_16px_rgba(200,16,46,0.35)]">
          <span className="inline-block skew-x-6">Crowd Favorites</span>
        </h2>
        <span
          aria-hidden="true"
          className="absolute left-1.5 -bottom-1.5 h-2 w-2/3 bg-gold/70 blur-[3px]"
        />
      </div>
      <p className="mt-3 text-muted text-sm font-body">
        The dishes our regulars keep coming back for.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
        {items.map((item) => (
          <Link
            key={item.id}
            href="/order"
            className="group relative bg-bg2 rounded-card border-t-[5px] border-red overflow-hidden transition-shadow hover:shadow-[0_0_0_1px_rgba(245,197,24,0.4),0_8px_20px_rgba(0,0,0,0.35)]"
          >
            <div className="h-[100px] sm:h-[150px] relative">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 220px"
                  className="object-contain p-1.5 sm:p-2 transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
              <p className="font-heading normal-case text-cream text-xs sm:text-sm leading-tight">
                {item.name}
              </p>
              <span className="shrink-0 font-heading text-cream text-[10px] sm:text-xs bg-red rounded-pill px-2 sm:px-2.5 py-0.5 sm:py-1">
                {item.has_variants && "from "}
                {formatPeso(startingPrice(item))}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
