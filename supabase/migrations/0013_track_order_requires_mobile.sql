-- track_order(order_number) alone let anyone who guessed/enumerated a
-- sequential order number (OB-1001, OB-1002, ...) view someone else's
-- order contents, total, and payment status. Now also requires the
-- mobile number the order was placed with, the same shared secret
-- lookup_orders_by_mobile() already relies on.
--
-- Also expires trackability: once an order has been completed or
-- cancelled for more than a day, it's no longer worth exposing even to
-- someone who has both pieces, so this returns null for those too.
-- Still-active orders stay trackable regardless of age.
drop function if exists public.track_order(text);

create or replace function public.track_order(p_order_number text, p_mobile text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_items jsonb;
  v_digits text := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);
begin
  if length(v_digits) < 10 then
    return null;
  end if;

  select
    order_number, fulfillment_type, schedule_type, scheduled_time,
    payment_method, payment_status, status,
    subtotal, delivery_fee, total,
    received_at, preparing_at, ready_at, completed_at, created_at,
    updated_at
  into v_order
  from public.orders
  where order_number = p_order_number
    and right(regexp_replace(customer_mobile, '\D', '', 'g'), 10) = v_digits;

  if v_order is null then
    return null;
  end if;

  if v_order.status in ('completed', 'cancelled')
     and coalesce(v_order.completed_at, v_order.updated_at) < now() - interval '24 hours' then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_name', oi.item_name,
    'variant_label', oi.variant_label,
    'unit_price', oi.unit_price,
    'quantity', oi.quantity,
    'line_total', oi.line_total
  ) order by oi.id), '[]'::jsonb)
  into v_items
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.order_number = p_order_number;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'fulfillment_type', v_order.fulfillment_type,
    'schedule_type', v_order.schedule_type,
    'scheduled_time', v_order.scheduled_time,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'status', v_order.status,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'total', v_order.total,
    'received_at', v_order.received_at,
    'preparing_at', v_order.preparing_at,
    'ready_at', v_order.ready_at,
    'completed_at', v_order.completed_at,
    'created_at', v_order.created_at,
    'items', v_items
  );
end;
$$;

grant execute on function public.track_order(text, text) to anon, authenticated;

-- Same expiry rule for the "forgot your order number" mobile lookup,
-- so it stops surfacing orders that are no longer trackable anyway.
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
      and not (
        status in ('completed', 'cancelled')
        and coalesce(completed_at, updated_at) < now() - interval '24 hours'
      )
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
