-- Flat-illustration dish icons (not photos), served from /public/menu.
-- Keyed by slug (stable) rather than name, which can be edited in the
-- admin UI. Items not covered by the icon set (the plain "Specials"
-- list) are left with image_url = null.
update public.menu_items set image_url = '/menu/crispy-pata.png' where slug = 'crispy-pata';
update public.menu_items set image_url = '/menu/beer-batter-fish-fillet.png' where slug = 'beer-batter-fish-fillet';
update public.menu_items set image_url = '/menu/beef-pares.png' where slug = 'beef-pares-bar-sebi';
update public.menu_items set image_url = '/menu/giant-chicken-leg-quarter.png' where slug = 'giant-chicken-leg-quarter';
update public.menu_items set image_url = '/menu/cheesy-beef-caldereta.png' where slug = 'cheesy-beef-caldereta';
update public.menu_items set image_url = '/menu/whole-chicken-inasal.png' where slug = 'whole-chicken-inasal';
update public.menu_items set image_url = '/menu/lechon-kawali.png' where slug = 'lechon-kawali';
update public.menu_items set image_url = '/menu/chicken-wing.png' where slug = 'chicken-wing';
update public.menu_items set image_url = '/menu/chicharon-bulaklak.png' where slug = 'chicharon-bulaklak';
update public.menu_items set image_url = '/menu/crispy-kare-kare.png' where slug = 'crispy-kare-kare';
update public.menu_items set image_url = '/menu/chicken-fillet.png' where slug = 'chicken-fillet';
update public.menu_items set image_url = '/menu/chicken-ala-max-fried.png' where slug = 'chicken-ala-max-fried';
update public.menu_items set image_url = '/menu/ox-tail-kare-kare.png' where slug = 'ox-tail-kare-kare';
update public.menu_items set image_url = '/menu/lechon-belly.png' where slug = 'lechon-belly-1kg';
update public.menu_items set image_url = '/menu/pork-rib-end.png' where slug = 'pork-rib-end';
update public.menu_items set image_url = '/menu/pata-tim.png' where slug = 'pata-tim';
