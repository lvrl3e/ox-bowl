"use client";

import { useActionState, useState } from "react";
import { addMenuItemAction, type MenuActionState } from "@/app/admin/menu/actions";
import type { Category } from "@/lib/types/database";

const initialState: MenuActionState = { error: null, success: false };

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted";

export default function AddMenuItemForm({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(
    addMenuItemAction,
    initialState,
  );
  const [hasVariants, setHasVariants] = useState(false);
  const [variantCount, setVariantCount] = useState(2);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 bg-bg2 border border-line rounded-card p-4 mt-8"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-btn bg-red/15 text-red flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="font-heading text-cream text-lg">Add item</h2>
      </div>

      <label className="text-muted text-xs font-body">
        Category
        <select name="categoryId" required className={inputClass}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-muted text-xs font-body">
        Name
        <input name="name" required maxLength={100} className={inputClass} />
      </label>

      <label className="text-muted text-xs font-body">
        Description (optional)
        <textarea name="description" rows={2} className={inputClass} />
      </label>

      <label className="text-muted text-xs font-body">
        Photo (optional)
        <input type="file" name="image" accept="image/*" className={inputClass} />
      </label>

      <label className="flex items-center gap-2 text-muted text-xs font-body cursor-pointer">
        <input
          type="checkbox"
          checked={hasVariants}
          onChange={(e) => setHasVariants(e.target.checked)}
          className="w-4 h-4 accent-red"
        />
        This item comes in multiple sizes
      </label>
      <input type="hidden" name="hasVariants" value={hasVariants.toString()} />

      {hasVariants ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: variantCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                name="variantLabel"
                placeholder="e.g. Small"
                required
                className={inputClass}
              />
              <input
                name="variantPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                required
                className={inputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setVariantCount((n) => n + 1)}
            className="self-start text-gold text-xs font-body underline underline-offset-2 hover:text-cream"
          >
            + Add another size
          </button>
        </div>
      ) : (
        <label className="text-muted text-xs font-body">
          Price
          <input
            name="basePrice"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
          />
        </label>
      )}

      {state.error && <p className="text-red text-sm font-body">{state.error}</p>}
      {state.success && (
        <p className="text-gold text-sm font-body">Item added.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-btn bg-red text-white font-body font-semibold text-sm px-4 py-2 hover:bg-red-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add item"}
      </button>
    </form>
  );
}
