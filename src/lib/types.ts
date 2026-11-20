export type ID = string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string | null;
  sort_order?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // PKR
  compare_at_price?: number | null;
  sku?: string;
  category_id?: string | null;
  category_slug?: string;
  brand?: string;
  stock: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  is_flash_sale?: boolean;
  colors?: string[];
  specifications?: Record<string, string> | { key: string; value: string }[];
  images: string[];
  rating?: number;
  review_count?: number;
  created_at?: string;
  verification_enabled?: boolean;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title?: string;
  body?: string;
  is_approved?: boolean;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image: string;
  color?: string;
  quantity: number;
  stock: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  expires_at?: string | null;
  usage_limit?: number | null;
  used_count?: number;
  is_active?: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested";

export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank_transfer";
export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected";

export interface OrderItem {
  product_id: string;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string; // human friendly e.g. TF-XXXXXX
  customer_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  province?: string;
  postal_code?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  coupon_code?: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  receipt_url?: string | null;
  tracking_info?: string;
  status_history?: OrderStatusEvent[];
  is_flagged?: boolean;
  flag_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  customer_id?: string;
  label?: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  created_at?: string;
  total_orders?: number;
  total_spent?: number;
  is_active?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_published?: boolean;
}

export interface SiteSettings {
  store_name?: string;
  tagline?: string;
  announcement?: string;
  whatsapp_number?: string;
  contact_email?: string;
  contact_phone?: string;
  delivery_charge?: number;
  free_delivery_above?: number;
  return_days?: number;
  warranty_text?: string;
  bank_details?: { bank_name?: string; account_title?: string; iban?: string; account_number?: string };
  jazzcash_number?: string;
  easypaisa_number?: string;
  social?: { instagram?: string; facebook?: string; tiktok?: string };
  seo?: { title?: string; description?: string };
  [key: string]: unknown;
}

export interface ProductVerification {
  id: string;
  code: string;
  product_id?: string | null;
  product_name?: string;
  status: "active" | "verified" | "revoked";
  verified_at?: string | null;
  verified_by?: string | null;
  created_at?: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  customer_phone: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
}

export interface FlashSale {
  id: string;
  name: string;
  ends_at: string;
  product_ids?: string[];
  is_active?: boolean;
}

export interface Notification {
  id: string;
  customer_phone?: string;
  type: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Pending",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];
