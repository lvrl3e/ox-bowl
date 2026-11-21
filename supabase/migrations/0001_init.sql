-- Ox Bowl Resto & Grill — initial schema
-- Postgres / Supabase

create extension if not exists pgcrypto;

-- =========================================================
-- ENUM-ish check constraints are used instead of real enums
-- so values can be extended later without a migration.
-- =========================================================

-- ---------------------------------------------------------
-- categories
-- ---------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  base_price numeric(10,2),              -- null when has_variants = true
  has_variants boolean not null default false,
  image_url text,
  is_new boolean not null default false,
  is_sold_out boolean not null default false,
  requires_advance_order boolean not null default false,
  advance_order_days int not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_or_variants check (
    (has_variants = false and base_price is not null) or
    (has_variants = true)
  )
);

create index menu_items_category_idx on public.menu_items(category_id);

-- ---------------------------------------------------------
-- item_variants (sizes / portions)
-- ---------------------------------------------------------
create table public.item_variants (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.menu_items(id) on delete cascade,
  label text not null,          -- "Small", "Large", "6 pcs", "Whole"...
  price numeric(10,2) not null,
  sort_order int not null default 0
);

create index item_variants_item_idx on public.item_variants(item_id);

-- ---------------------------------------------------------
-- settings (singleton row)
-- ---------------------------------------------------------
create table public.settings (
  id smallint primary key default 1,
  store_open boolean not null default true,
  -- operating_hours: {"mon": {"open":"10:00","close":"21:00"}, ..., "sun": null (closed)}
  operating_hours jsonb not null default '{
    "mon": {"open":"10:00","close":"21:00"},
    "tue": {"open":"10:00","close":"21:00"},
    "wed": {"open":"10:00","close":"21:00"},
    "thu": {"open":"10:00","close":"21:00"},
    "fri": {"open":"10:00","close":"21:00"},
    "sat": {"open":"10:00","close":"21:00"},
    "sun": {"open":"10:00","close":"21:00"}
  }'::jsonb,
  timezone text not null default 'Asia/Manila',
  delivery_fee_base numeric(10,2) not null default 49,
  delivery_fee_per_km numeric(10,2) not null default 15,
  delivery_max_km numeric(10,2) not null default 12,
  min_order_amount numeric(10,2) not null default 0,
  pickup_address text not null default '',
  pickup_lat double precision,
  pickup_lng double precision,
  store_phone text default '',
  store_messenger_url text default '',
  qr_image_path text,
  qr_account_name text default '',
  qr_account_number text default '',
  notify_telegram_chat_id text default '',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into public.settings (id) values (1);

-- ---------------------------------------------------------
-- order number sequence
-- ---------------------------------------------------------
create sequence public.order_number_seq start 1001 increment 1;

create or replace function public.next_order_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'OB-' || nextval('public.order_number_seq')::text;
$$;

-- ---------------------------------------------------------
-- orders
-- ---------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,

  fulfillment_type text not null check (fulfillment_type in ('pickup','delivery')),

  customer_name text not null,
  customer_mobile text not null,

  schedule_type text not null check (schedule_type in ('asap','scheduled')),
  scheduled_time timestamptz,

  delivery_address text,
  delivery_landmark text,
  delivery_lat double precision,
  delivery_lng double precision,
  delivery_distance_km numeric(6,2),

  notes text,

  payment_method text not null check (payment_method in ('cash','qr')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','awaiting_verification','paid','rejected')),
  payment_screenshot_path text,
  payment_reference_number text,
  payment_rejected_reason text,

  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,

  status text not null default 'received'
    check (status in ('received','preparing','ready','completed','cancelled')),

  received_at timestamptz not null default now(),
  preparing_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_order_number_idx on public.orders(order_number);

-- ---------------------------------------------------------
-- order_items
-- ---------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  variant_label text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null
);

create index order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'staff' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- updated_at triggers
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- =========================================================
-- helper functions for RLS
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid() and role = 'owner'
  );
$$;

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.item_variants enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

-- categories: public read, owner write
create policy "categories_public_read" on public.categories
  for select using (true);
create policy "categories_owner_write" on public.categories
  for all using (public.is_owner()) with check (public.is_owner());

-- menu_items: public read, owner write
create policy "menu_items_public_read" on public.menu_items
  for select using (true);
create policy "menu_items_owner_write" on public.menu_items
  for all using (public.is_owner()) with check (public.is_owner());

-- item_variants: public read, owner write
create policy "item_variants_public_read" on public.item_variants
  for select using (true);
create policy "item_variants_owner_write" on public.item_variants
  for all using (public.is_owner()) with check (public.is_owner());

-- settings: public read, owner write (no secrets stored here)
create policy "settings_public_read" on public.settings
  for select using (true);
create policy "settings_owner_write" on public.settings
  for update using (public.is_owner()) with check (public.is_owner());

-- orders: NO public access at all. All customer-facing writes and the
-- order-creation flow run through server routes using the service role
-- key (which bypasses RLS) after server-side validation. Guest order
-- tracking is exposed through the SECURITY DEFINER rpc track_order()
-- below instead of direct table access, so a guest can never list or
-- scan other people's orders.
create policy "orders_admin_read" on public.orders
  for select using (public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- order_items: admin read only (writes happen via service role)
create policy "order_items_admin_read" on public.order_items
  for select using (public.is_admin());

-- admin_users: an admin can read their own row; only an owner can manage rows
create policy "admin_users_self_read" on public.admin_users
  for select using (auth.uid() = id or public.is_owner());
create policy "admin_users_owner_write" on public.admin_users
  for all using (public.is_owner()) with check (public.is_owner());

-- =========================================================
-- Role grants
-- RLS policies above decide *which rows* a role can see/touch, but
-- Postgres still requires a table-level GRANT before a role can query
-- a table at all. Supabase projects normally get this for free via
-- default privileges on the public schema — this is here explicitly
-- so the schema is self-contained and doesn't depend on that.
-- =========================================================
grant usage on schema public to anon, authenticated;

grant select on public.categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.item_variants to anon, authenticated;
grant select on public.settings to anon, authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant insert, update, delete on public.item_variants to authenticated;
grant update on public.settings to authenticated;

-- No grant at all for anon on orders/order_items — matches the
-- "no direct client writes" design (service role only, see README).
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

grant select, insert, update, delete on public.admin_users to authenticated;

grant usage on sequence public.order_number_seq to service_role;

-- =========================================================
-- Guest order tracking RPC
-- Returns a limited, safe projection of a single order by its
-- order_number, plus its line items. Nothing else in `orders` is
-- reachable by anon/authenticated clients.
-- =========================================================
create or replace function public.track_order(p_order_number text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_items jsonb;
begin
  select
    order_number, fulfillment_type, schedule_type, scheduled_time,
    payment_method, payment_status, status,
    subtotal, delivery_fee, total,
    received_at, preparing_at, ready_at, completed_at, created_at
  into v_order
  from public.orders
  where order_number = p_order_number;

  if v_order is null then
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

grant execute on function public.track_order(text) to anon, authenticated;

-- =========================================================
-- Storage buckets
-- =========================================================
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

-- public read for the assets bucket (menu photos, qr code image);
-- all writes happen via server routes using the service role key.
create policy "assets_public_read" on storage.objects
  for select using (bucket_id = 'assets');

-- payment-screenshots: no anon/authenticated policies at all.
-- Uploads happen via a server route (service role) when an order is
-- placed; admins view screenshots via server-generated signed URLs
-- (also service role), so RLS never needs to grant direct access.
