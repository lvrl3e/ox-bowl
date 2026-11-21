-- service_role grants.
--
-- Same root cause as 0002_grants.sql: this project doesn't get default
-- privileges on the public schema for free, and that gap also applies
-- to service_role (used server-side by app/api/orders and other admin
-- routes to bypass RLS). Confirmed missing: selecting menu_items/orders
-- and updating settings all came back "permission denied" for
-- service_role before this migration.

grant usage on schema public to service_role;

grant select on public.categories to service_role;
grant select on public.menu_items to service_role;
grant select on public.item_variants to service_role;
grant select, update on public.settings to service_role;

grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_items to service_role;

grant select on public.admin_users to service_role;
