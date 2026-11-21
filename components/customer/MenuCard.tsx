"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useCartStore } from "@/store/cart";
import type { MenuItemWithVariants } from "@/lib/types/database";
import { formatPeso } from "@/lib/format";

interface MenuCardProps {
  item: MenuItemWithVariants;
}

function minAdvanceDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MenuCard({ item }: MenuCardProps) {
  const sortedVariants = useMemo(
    () => [...(item.item_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [item.item_variants]
  );

  const [variantId, setVariantId] = useState<string | null>(
    sortedVariants[0]?.id ?? null
  );
  const minDate = useMemo(
    () => minAdvanceDate(item.advance_order_days),
    [item.advance_order_days]
  );
  const [advanceDate, setAdvanceDate] = useState(
    item.requires_advance_order ? minDate : ""
  );
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const selectId = useId();
  const dateId = useId();

  const selectedVariant = sortedVariants.find((v) => v.id === variantId);
  const price = item.has_variants ? selectedVariant?.price ?? 0 : item.base_price ?? 0;

  const canAdd =
    !item.is_sold_out &&
    (!item.requires_advance_order || (!!advanceDate && advanceDate >= minDate));

  function handleAdd() {
    if (!canAdd) return;
    addItem({
      key: `${item.id}:${variantId ?? "base"}`,
      itemId: item.id,
      variantId: variantId ?? null,
      name: item.name,
      variantLabel: selectedVariant?.label ?? null,
      unitPrice: price,
      imageUrl: item.image_url,
      requiresAdvanceOrder: item.requires_advance_order,
      advanceOrderDays: item.advance_order_days,
      advanceDate: item.requires_advance_order ? advanceDate : null,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div
      className={clsx(
        "bg-bg2 rounded-card border-t-[5px] border-red overflow-hidden flex flex-col transition-shadow hover:shadow-[0_0_0_1px_rgba(245,197,24,0.4),0_8px_20px_rgba(0,0,0,0.35)]",
        item.is_sold_out && "opacity-50"
      )}
    >
      {item.image_url && (
        <div className="h-[100px] sm:h-[150px] relative">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, 270px"
            className="object-contain p-1.5 sm:p-2"
          />
          {item.is_new && !item.is_sold_out && (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 -rotate-6 rounded-[3px] bg-red text-gold text-[9px] sm:text-[11px] font-extrabold uppercase font-heading px-1.5 sm:px-2.5 py-0.5 sm:py-1 shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
              New!
            </span>
          )}
          {item.is_sold_out && (
            <span className="absolute inset-0 flex items-center justify-center bg-bg/60 text-cream text-xs sm:text-sm font-body font-semibold uppercase tracking-wide">
              Sold out
            </span>
          )}
        </div>
      )}

      <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <h3 className="font-heading normal-case text-cream text-sm sm:text-[21px] leading-tight flex flex-wrap items-center gap-1.5 sm:gap-2">
          {item.name}
          {!item.image_url && item.is_new && !item.is_sold_out && (
            <span className="shrink-0 rounded-[3px] bg-red text-gold text-[10px] font-extrabold uppercase font-heading px-2 py-0.5">
              New!
            </span>
          )}
          {!item.image_url && item.is_sold_out && (
            <span className="shrink-0 text-muted text-[11px] font-body font-semibold uppercase tracking-wide normal-case">
              Sold out
            </span>
          )}
        </h3>
        {item.description && (
          <p className="text-muted text-xs sm:text-sm font-body -mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.has_variants && sortedVariants.length > 0 && (
          <div>
            <label htmlFor={selectId} className="sr-only">
              Size for {item.name}
            </label>
            <select
              id={selectId}
              value={variantId ?? ""}
              onChange={(e) => setVariantId(e.target.value)}
              disabled={item.is_sold_out}
              className="w-full bg-bg border border-line rounded-btn p-2 sm:p-2.5 text-cream text-xs sm:text-sm font-body"
            >
              {sortedVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {formatPeso(v.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        {item.requires_advance_order && !item.is_sold_out && (
          <div>
            <label
              htmlFor={dateId}
              className="text-muted text-[11px] sm:text-xs font-body block mb-1"
            >
              Advance order date (min. {item.advance_order_days} day
              {item.advance_order_days === 1 ? "" : "s"} ahead)
            </label>
            <input
              id={dateId}
              type="date"
              min={minDate}
              value={advanceDate}
              onChange={(e) => setAdvanceDate(e.target.value)}
              className="w-full bg-bg border border-line rounded-btn p-2 sm:p-2.5 text-cream text-xs sm:text-sm font-body"
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 sm:gap-3 pt-2">
          <span className="font-heading text-cream text-sm sm:text-xl bg-red rounded-pill px-2.5 sm:px-4 py-1 sm:py-1.5 shadow-[0_3px_10px_rgba(200,16,46,0.4)]">
            {formatPeso(price)}
          </span>
          {!item.is_sold_out && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className={clsx(
                "rounded-btn font-body font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 min-h-11 transition-colors",
                canAdd
                  ? "bg-red text-white hover:bg-red-deep active:bg-red-deep"
                  : "bg-line text-muted cursor-not-allowed"
              )}
            >
              {justAdded ? "Added ✓" : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
