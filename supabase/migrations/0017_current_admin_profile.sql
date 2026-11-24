-- Every admin page was doing two sequential round trips before it could
-- render anything: auth.getUser() (to get the caller's id), then a
-- separate admin_users query filtered by that id. This collapses both
-- into one function that reads auth.uid() directly server-side, so
-- pages can fetch their admin profile in the same Promise.all as their
-- main query instead of awaiting it first. Also returns the auth email
-- (via a security-definer join to auth.users) since several pages used
-- to fall back to userData.user.email for display.
create or replace function public.current_admin_profile()
returns table (id uuid, name text, role text, email text)
language sql
security definer
set search_path = public
stable
as $$
  select au.id, au.name, au.role, u.email
  from public.admin_users au
  join auth.users u on u.id = au.id
  where au.id = auth.uid();
$$;

grant execute on function public.current_admin_profile() to authenticated;
