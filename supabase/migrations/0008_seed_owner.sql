-- Bootstraps the first admin_users row. The table starts empty and RLS
-- only allows writes via is_owner(), which nobody can satisfy until one
-- row exists — so this one has to go in through a migration instead of
-- the app or the REST API.
insert into public.admin_users (id, name, role)
values ('a331cc28-ed2e-4055-a7e8-852edc2fb503', 'Owner', 'owner')
on conflict (id) do nothing;
