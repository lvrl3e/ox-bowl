import type { CategoryWithItems } from "@/lib/types/database";

/**
 * Local copy of supabase/seed.sql, used only when Supabase env vars
 * aren't configured yet (first run, local dev before the project is
 * linked). Once Supabase is connected, lib/data/menu.ts fetches the
 * real thing and this file is never read. IDs here are just slugs —
 * they are never sent to a real database.
 */
export const FALLBACK_MENU: CategoryWithItems[] = [
  {
    id: "cat-chicken",
    slug: "chicken",
    name: "Chicken Favorites",
    sort_order: 1,
    created_at: "",
    menu_items: [
      item("chicken", "giant-chicken-leg-quarter", "Giant Chicken Leg Quarter", 119),
      item("chicken", "whole-chicken-inasal", "Whole Chicken Inasal", 369),
      item("chicken", "chicken-wing", "Chicken Wing", null, [
        variant("6 pcs", 399),
        variant("12 pcs", 499),
      ]),
      item("chicken", "chicken-fillet", "Chicken Fillet", 189),
      item("chicken", "chicken-ala-max-fried", "Chicken ala Max (Fried)", 329, [], { isNew: true }),
    ],
  },
  {
    id: "cat-pork",
    slug: "pork",
    name: "Pork Classics",
    sort_order: 2,
    created_at: "",
    menu_items: [
      item("pork", "crispy-pata", "Crispy Pata", null, [
        variant("Medium", 350),
        variant("Large", 390),
      ]),
      item("pork", "lechon-kawali", "Lechon Kawali", null, [
        variant("Small", 145),
        variant("Large", 225),
      ]),
      item("pork", "chicharon-bulaklak", "Chicharon Bulaklak", null, [
        variant("Small", 145),
        variant("Large", 225),
      ]),
      item("pork", "crispy-kare-kare", "Crispy Kare-Kare", 189),
      item("pork", "ox-tail-kare-kare", "Ox Tail Kare-Kare", 199),
      item("pork", "lechon-belly-1kg", "Lechon Belly (1 kg)", 699, [], {
        isNew: true,
        advanceOrder: true,
      }),
      item("pork", "pork-rib-end", "Pork Rib End", 150),
      item("pork", "pata-tim", "Pata Tim", 290),
    ],
  },
  {
    id: "cat-beef",
    slug: "beef",
    name: "Beef Selections",
    sort_order: 3,
    created_at: "",
    menu_items: [
      item("beef", "beef-pares-bar-sebi", "Beef Pares", 150),
      item("beef", "cheesy-beef-caldereta", "Cheesy Beef Caldereta", 190),
    ],
  },
  {
    id: "cat-fish",
    slug: "fish",
    name: "Fish Special",
    sort_order: 4,
    created_at: "",
    menu_items: [
      item("fish", "beer-batter-fish-fillet", "Beer Batter Fish Fillet", 180),
    ],
  },
  {
    id: "cat-specials",
    slug: "specials",
    name: "Specials",
    sort_order: 5,
    created_at: "",
    menu_items: [
      item("specials", "crispy-dinugaan", "Crispy Dinugaan", 150),
      item("specials", "crispy-ulo", "Crispy Ulo", null, [
        variant("Half", 799),
        variant("Whole", 1650),
      ]),
      item("specials", "dinakdakan", "Dinakdakan", 149),
      item("specials", "crispy-sisig", "Crispy Sisig", 149),
      item("specials", "smokey-sisig", "Smokey Sisig", 149),
    ],
  },
];

function variant(label: string, price: number, sortOrder = 0) {
  return { id: `${label}-${price}`, item_id: "", label, price, sort_order: sortOrder };
}

function item(
  categorySlug: string,
  slug: string,
  name: string,
  basePrice: number | null,
  variants: ReturnType<typeof variant>[] = [],
  opts: { isNew?: boolean; advanceOrder?: boolean; soldOut?: boolean } = {}
) {
  return {
    id: slug,
    category_id: `cat-${categorySlug}`,
    slug,
    name,
    description: null,
    base_price: basePrice,
    has_variants: variants.length > 0,
    image_url: null,
    is_new: opts.isNew ?? false,
    is_sold_out: opts.soldOut ?? false,
    requires_advance_order: opts.advanceOrder ?? false,
    advance_order_days: 1,
    sort_order: 0,
    created_at: "",
    updated_at: "",
    item_variants: variants.map((v) => ({ ...v, item_id: slug })),
  };
}
