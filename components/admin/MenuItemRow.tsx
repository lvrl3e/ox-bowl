"use client";

import { useActionState, useRef, useState } from "react";
import {
  setSoldOutAction,
  updateMenuItemAction,
  type MenuActionState,
} from "@/app/admin/menu/actions";
import { formatPeso } from "@/lib/format";
import type { MenuItemWithVariants } from "@/lib/types/database";

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2 text-cream text-sm font-body placeholder:text-muted";

const initialState: MenuActionState = { error: null, success: false };

export default function MenuItemRow({
  item,
  isOwner,
}: {
  item: MenuItemWithVariants;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateMenuItemAction,
    initialState,
  );
  const soldOutFormRef = useRef<HTMLFormElement>(null);

  const priceLabel = item.has_variants
    ? item.item_variants.length > 0
      ? `${formatPeso(Math.min(...item.item_variants.map((v) => v.price)))}+`
      : "No variants set"
    : formatPeso(item.base_price ?? 0);

  return (
    <div className="bg-bg2 border border-line rounded-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-cream font-body font-semibold text-sm truncate">
            {item.name}
            {item.is_sold_out && (
              <span className="ml-2 rounded-pill bg-red/15 text-red text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                Sold out
              </span>
            )}
          </p>
          <p className="text-gold text-sm font-heading mt-0.5">{priceLabel}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <form ref={soldOutFormRef} action={setSoldOutAction}>
            <input type="hidden" name="itemId" value={item.id} />
            <input
              type="hidden"
              name="isSoldOut"
              value={(!item.is_sold_out).toString()}
            />
            <label className="flex items-center gap-1.5 text-muted text-xs font-body cursor-pointer">
              <input
                type="checkbox"
                disabled={!isOwner}
                defaultChecked={item.is_sold_out}
                onChange={() => soldOutFormRef.current?.requestSubmit()}
                className="w-4 h-4 accent-red"
              />
              Sold out
            </label>
          </form>

          {isOwner && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="text-muted text-xs font-body underline underline-offset-2 hover:text-gold"
            >
              {editing ? "Close" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form
          action={formAction}
          className="flex flex-col gap-3 border-t border-line px-4 py-3"
        >
          <input type="hidden" name="itemId" value={item.id} />

          <label className="text-muted text-xs font-body">
            Description
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              rows={2}
              className={inputClass}
            />
          </label>

          {item.has_variants ? (
            <div className="flex flex-col gap-2">
              {item.item_variants.map((variant) => (
                <label
                  key={variant.id}
                  className="text-muted text-xs font-body flex-1"
                >
                  {variant.label}
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input
                    type="number"
                    name="variantPrice"
                    step="0.01"
                    min="0"
                    defaultValue={variant.price}
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className="text-muted text-xs font-body">
              Price
              <input
                type="number"
                name="basePrice"
                step="0.01"
                min="0"
                defaultValue={item.base_price ?? 0}
                className={inputClass}
              />
            </label>
          )}

          {state.error && (
            <p className="text-red text-sm font-body">{state.error}</p>
          )}
          {state.success && (
            <p className="text-gold text-sm font-body">Saved.</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-btn bg-red text-white font-body font-semibold text-sm px-4 py-2 hover:bg-red-deep disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}
