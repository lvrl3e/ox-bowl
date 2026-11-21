-- Ox Bowl Resto & Grill — seed data (menu board as of 2026)
-- Safe to re-run: clears existing menu rows first.

delete from public.item_variants;
delete from public.menu_items;
delete from public.categories;

-- ---------------------------------------------------------
-- categories (tab order: Chicken, Pork, Beef, Fish, Specials)
-- ---------------------------------------------------------
insert into public.categories (slug, name, sort_order) values
  ('chicken', 'Chicken Favorites', 1),
  ('pork',    'Pork Classics',     2),
  ('beef',    'Beef Selections',   3),
  ('fish',    'Fish Special',      4),
  ('specials','Specials',          5);

-- ---------------------------------------------------------
-- Chicken Favorites
-- ---------------------------------------------------------
insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, sort_order)
select id, 'giant-chicken-leg-quarter', 'Giant Chicken Leg Quarter', 119, false, false, 1 from public.categories where slug = 'chicken';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, sort_order)
select id, 'whole-chicken-inasal', 'Whole Chicken Inasal', 369, false, false, 2 from public.categories where slug = 'chicken';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, sort_order)
select id, 'chicken-wing', 'Chicken Wing', null, true, false, 3 from public.categories where slug = 'chicken';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, sort_order)
select id, 'chicken-fillet', 'Chicken Fillet', 189, false, false, 4 from public.categories where slug = 'chicken';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, sort_order)
select id, 'chicken-ala-max-fried', 'Chicken ala Max (Fried)', 329, false, true, 5 from public.categories where slug = 'chicken';

insert into public.item_variants (item_id, label, price, sort_order)
select id, '6 pcs', 399, 1 from public.menu_items where slug = 'chicken-wing'
union all
select id, '12 pcs', 499, 2 from public.menu_items where slug = 'chicken-wing';

-- ---------------------------------------------------------
-- Pork Classics
-- ---------------------------------------------------------
insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'crispy-pata', 'Crispy Pata', null, true, false, false, 1, 1 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'lechon-kawali', 'Lechon Kawali', null, true, false, false, 1, 2 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'chicharon-bulaklak', 'Chicharon Bulaklak', null, true, false, false, 1, 3 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'crispy-kare-kare', 'Crispy Kare-Kare', 189, false, false, false, 1, 4 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'ox-tail-kare-kare', 'Ox Tail Kare-Kare', 199, false, false, false, 1, 5 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'lechon-belly-1kg', 'Lechon Belly (1 kg)', 699, false, true, true, 1, 6 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'pork-rib-end', 'Pork Rib End', 150, false, false, false, 1, 7 from public.categories where slug = 'pork';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, is_new, requires_advance_order, advance_order_days, sort_order)
select id, 'pata-tim', 'Pata Tim', 290, false, false, false, 1, 8 from public.categories where slug = 'pork';

insert into public.item_variants (item_id, label, price, sort_order)
select id, 'Medium', 350, 1 from public.menu_items where slug = 'crispy-pata'
union all
select id, 'Large', 390, 2 from public.menu_items where slug = 'crispy-pata'
union all
select id, 'Small', 145, 1 from public.menu_items where slug = 'lechon-kawali'
union all
select id, 'Large', 225, 2 from public.menu_items where slug = 'lechon-kawali'
union all
select id, 'Small', 145, 1 from public.menu_items where slug = 'chicharon-bulaklak'
union all
select id, 'Large', 225, 2 from public.menu_items where slug = 'chicharon-bulaklak';

-- ---------------------------------------------------------
-- Beef Selections
-- ---------------------------------------------------------
insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'beef-pares-bar-sebi', 'Beef Pares', 150, false, 1 from public.categories where slug = 'beef';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'cheesy-beef-caldereta', 'Cheesy Beef Caldereta', 190, false, 2 from public.categories where slug = 'beef';

-- ---------------------------------------------------------
-- Fish Special
-- ---------------------------------------------------------
insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'beer-batter-fish-fillet', 'Beer Batter Fish Fillet', 180, false, 1 from public.categories where slug = 'fish';

-- ---------------------------------------------------------
-- Specials
-- ---------------------------------------------------------
insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'crispy-dinugaan', 'Crispy Dinugaan', 150, false, 1 from public.categories where slug = 'specials';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'crispy-ulo', 'Crispy Ulo', null, true, 2 from public.categories where slug = 'specials';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'dinakdakan', 'Dinakdakan', 149, false, 3 from public.categories where slug = 'specials';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'crispy-sisig', 'Crispy Sisig', 149, false, 4 from public.categories where slug = 'specials';

insert into public.menu_items (category_id, slug, name, base_price, has_variants, sort_order)
select id, 'smokey-sisig', 'Smokey Sisig', 149, false, 5 from public.categories where slug = 'specials';

insert into public.item_variants (item_id, label, price, sort_order)
select id, 'Half', 799, 1 from public.menu_items where slug = 'crispy-ulo'
union all
select id, 'Whole', 1650, 2 from public.menu_items where slug = 'crispy-ulo';
