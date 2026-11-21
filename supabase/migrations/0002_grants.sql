-- Explicit role grants.
--
-- RLS policies (0001_init.sql) decide *which rows* a role can see/touch,
-- but Postgres also requires a table-level GRANT before a role can
-- touch a table at all — normally Supabase projects get this for free
-- via default privileges on the public schema, but this project's
-- categories/menu_items/etc. came back "permission denied for table
-- categories" for the anon key, so the default privileges didn't apply.
-- This migration grants explicitly instead of relying on that.

grant usage on schema public to anon, authenticated;

-- Public read-only tables
grant select on public.categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.item_variants to anon, authenticated;
grant select on public.settings to anon, authenticated;

-- Owner-managed tables: RLS (is_owner()) restricts writes to the
-- owner role; this grant just lets the request through to RLS at all.
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant insert, update, delete on public.item_variants to authenticated;
grant update on public.settings to authenticated;

-- Orders / order_items: no grant at all for anon — matches the "no
-- direct client writes" design in 0001_init.sql (service role only).
-- authenticated (admin) gets select/update per the is_admin() policies.
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- admin_users: authenticated can read their own row / owner can manage
grant select, insert, update, delete on public.admin_users to authenticated;

-- Sequence used by next_order_number()
grant usage on sequence public.order_number_seq to service_role;
