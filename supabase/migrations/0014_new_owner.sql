insert into public.admin_users (id, name, role)
values ('61e2957e-8214-403f-abda-c9b0e989447f', 'Owner', 'owner')
on conflict (id) do update set role = 'owner';
