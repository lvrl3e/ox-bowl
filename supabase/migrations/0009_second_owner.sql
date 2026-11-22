insert into public.admin_users (id, name, role)
values ('b3f20317-9677-4c61-9ed3-593877edf932', 'Owner', 'owner')
on conflict (id) do nothing;
