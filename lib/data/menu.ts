import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { CategoryWithItems } from "@/lib/types/database";
import { FALLBACK_MENU } from "@/lib/data/menu-fallback";

/**
 * Fetches categories with their menu items and variants, ordered the
 * same way the printed menu board and admin "sort_order" expect.
 * Falls back to a local static copy if Supabase isn't configured yet
 * (see lib/data/menu-fallback.ts) so the site is always viewable.
 */
export const getMenu = cache(async (): Promise<{
  categories: CategoryWithItems[];
  isLive: boolean;
}> => {
  const supabase = createPublicClient();
  if (!supabase) {
    return { categories: FALLBACK_MENU, isLive: false };
  }

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, slug, name, sort_order, created_at,
      menu_items (
        id, category_id, slug, name, description, base_price, has_variants,
        image_url, is_new, is_sold_out, requires_advance_order,
        advance_order_days, sort_order, created_at, updated_at,
        item_variants ( id, item_id, label, price, sort_order )
      )
    `
    )
    .order("sort_order", { ascending: true })
    .order("sort_order", { foreignTable: "menu_items", ascending: true })
    .order("sort_order", {
      foreignTable: "menu_items.item_variants",
      ascending: true,
    });

  if (error || !data) {
    console.error("[getMenu] Supabase query failed, using fallback:", error);
    return { categories: FALLBACK_MENU, isLive: false };
  }

  return { categories: data as unknown as CategoryWithItems[], isLive: true };
});
