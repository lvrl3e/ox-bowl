-- Lets a guest cancel their own order from /track/[orderNumber], without
-- any login. Order numbers are sequential (OB-1001, OB-1002, ...) and not
-- a real secret, so this also requires the mobile number used at
-- checkout — same verification pattern as lookup_orders_by_mobile() —
-- before it'll touch anything. Only "received" orders can be cancelled;
-- once the kitchen has started, it's admin-only (see admin/orders).
create or replace function public.cancel_order(p_order_number text, p_mobile text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_digits text := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);
begin
  if length(v_digits) < 10 then
    return jsonb_build_object('success', false, 'error', 'Enter the mobile number used for this order.');
  end if;

  select id, status, customer_mobile into v_order
  from public.orders
  where order_number = p_order_number;

  if v_order is null then
    return jsonb_build_object('success', false, 'error', 'Order not found.');
  end if;

  if right(regexp_replace(v_order.customer_mobile, '\D', '', 'g'), 10) != v_digits then
    return jsonb_build_object('success', false, 'error', 'That mobile number doesn''t match this order.');
  end if;

  if v_order.status <> 'received' then
    return jsonb_build_object(
      'success', false,
      'error', 'This order can no longer be cancelled — it is already being prepared.'
    );
  end if;

  update public.orders set status = 'cancelled' where id = v_order.id;

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.cancel_order(text, text) to anon, authenticated;
