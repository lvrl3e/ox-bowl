-- menu_items writes are otherwise owner-only (see 0001_init.sql's
-- menu_items_owner_write policy), but marking something sold out is a
-- normal day-to-day shift task, not an owner-only decision — staff need
-- to be able to do this without being able to change prices/descriptions.
-- This runs as a security definer so it can bypass that owner-only RLS
-- policy, but only for the is_sold_out column, and only for whoever is
-- actually signed in as an admin (owner or staff).
create or replace function public.set_menu_item_sold_out(p_item_id uuid, p_sold_out boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users where id = auth.uid()) then
    return jsonb_build_object('success', false, 'error', 'Not signed in as an admin.');
  end if;

  update public.menu_items set is_sold_out = p_sold_out where id = p_item_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Item not found.');
  end if;

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.set_menu_item_sold_out(uuid, boolean) to authenticated;
