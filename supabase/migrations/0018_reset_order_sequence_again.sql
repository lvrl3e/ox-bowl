-- Another one-off ops action: wipe test orders and reset order
-- numbering so the next real order placed is OB-1001.
delete from public.order_items;
delete from public.orders;
alter sequence public.order_number_seq restart with 1001;
