// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If you change the schema, update this file (or regenerate with
// `npx supabase gen types typescript --project-id <id> > lib/types/database.ts`
// once the project is linked).

export type FulfillmentType = "pickup" | "delivery";
export type ScheduleType = "asap" | "scheduled";
export type PaymentMethod = "cash" | "qr";
export type PaymentStatus =
  | "unpaid"
  | "awaiting_verification"
  | "paid"
  | "rejected";
export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type AdminRole = "owner" | "staff";

export interface DayHours {
  open: string; // "10:00"
  close: string; // "21:00"
}
export type OperatingHours = Partial<
  Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayHours | null>
>;

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number | null;
  has_variants: boolean;
  image_url: string | null;
  is_new: boolean;
  is_sold_out: boolean;
  requires_advance_order: boolean;
  advance_order_days: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ItemVariant {
  id: string;
  item_id: string;
  label: string;
  price: number;
  sort_order: number;
}

export type MenuItemWithVariants = MenuItem & { item_variants: ItemVariant[] };
export type CategoryWithItems = Category & { menu_items: MenuItemWithVariants[] };

export interface Settings {
  id: 1;
  store_open: boolean;
  operating_hours: OperatingHours;
  timezone: string;
  delivery_fee_base: number;
  delivery_fee_per_km: number;
  delivery_max_km: number;
  min_order_amount: number;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  store_phone: string;
  store_messenger_url: string;
  qr_image_path: string | null;
  qr_account_name: string;
  qr_account_number: string;
  notify_telegram_chat_id: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  fulfillment_type: FulfillmentType;
  customer_name: string;
  customer_mobile: string;
  schedule_type: ScheduleType;
  scheduled_time: string | null;
  delivery_address: string | null;
  delivery_landmark: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_distance_km: number | null;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_screenshot_path: string | null;
  payment_reference_number: string | null;
  payment_rejected_reason: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  received_at: string;
  preparing_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string | null;
  role: AdminRole;
  created_at: string;
}

export interface OrderLookupResult {
  order_number: string;
  status: OrderStatus;
  total: number;
  received_at: string;
}

export interface TrackOrderResult {
  order_number: string;
  fulfillment_type: FulfillmentType;
  schedule_type: ScheduleType;
  scheduled_time: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  received_at: string;
  preparing_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  created_at: string;
  items: Array<{
    item_name: string;
    variant_label: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
}
