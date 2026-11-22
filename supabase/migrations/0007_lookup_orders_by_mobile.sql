-- Lets a guest who forgot their order number find it again using the
-- mobile number they placed the order with. Mirrors track_order()'s
-- security-definer pattern (guests can't query public.orders directly —
-- see 0001_init.sql's orders RLS comment) but only returns enough to
-- identify and link to an order, not the full order detail.
create or replace function public.lookup_orders_by_mobile(p_mobile text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_digits text := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);
  v_results jsonb;
begin
  if length(v_digits) < 10 then
    return '[]'::jsonb;
  end if;

  with matches as (
    select order_number, status, total, received_at
    from public.orders
    where right(regexp_replace(customer_mobile, '\D', '', 'g'), 10) = v_digits
    order by received_at desc
    limit 10
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'order_number', order_number,
    'status', status,
    'total', total,
    'received_at', received_at
  ) order by received_at desc), '[]'::jsonb)
  into v_results
  from matches;

  return v_results;
end;
$$;

grant execute on function public.lookup_orders_by_mobile(text) to anon, authenticated;
