"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import { isAdmin } from "@/lib/admin";
import {
  deleteCoupon, deleteFAQ, deleteFlashSale, deleteProductRecord, generateVerification,
  getCategories, getOrderById, getProductById, getProducts, getVerificationByCode, saveCoupon, saveFAQ,
  saveFlashSale, saveNotification, saveOrder, saveProduct, saveSettings, setReviewApproved, setVerificationStatus, updateReturnRequest,
} from "@/lib/db";
import type { Coupon, FAQ, FlashSale, Order, OrderStatus, OrderStatusEvent, PaymentStatus, Product, SiteSettings } from "@/lib/types";

function guard() {
  if (!isAdmin()) redirect("/admin/login");
}

function withStatusEvent(order: Order, status: OrderStatus, note?: string): Order {
  const event: OrderStatusEvent = { status, at: new Date().toISOString(), ...(note ? { note } : {}) };
  const history = [...(order.status_history ?? []), event];
  return { ...order, status_history: history.slice(-50) };
}

// ---------- Orders ----------

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingInfo?: string) {
  guard();
  const order = await getOrderById(orderId);
  if (!order) return { error: "Order not found" };
  await saveOrder({
    ...withStatusEvent(order, status, trackingInfo ? `Tracking: ${trackingInfo}` : undefined),
    tracking_info: trackingInfo ?? order.tracking_info,
    updated_at: new Date().toISOString(),
  });
  await saveNotification({
    id: crypto.randomUUID(), customer_phone: order.phone, type: "order_update",
    message: `Order ${order.id} status → ${ORDER_STATUS_LABELS[status]}${trackingInfo ? ` (tracking: ${trackingInfo})` : ""}`,
    created_at: new Date().toISOString(),
  }).catch(() => {});
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  guard();
  const order = await getOrderById(orderId);
  if (!order) return { error: "Order not found" };
  const newStatus: OrderStatus =
    paymentStatus === "verified" && order.status === "pending" ? "confirmed" : order.status;
  const nextStatus: OrderStatus =
    paymentStatus === "rejected" && order.status === "pending" ? "cancelled" : newStatus;
  await saveOrder({
    ...withStatusEvent(
      { ...order, status: nextStatus },
      nextStatus,
      `Payment ${paymentStatus}`,
    ),
    payment_status: paymentStatus,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  });
  await saveNotification({
    id: crypto.randomUUID(), customer_phone: order.phone, type: "payment_update",
    message: `Order ${order.id} payment → ${paymentStatus}`,
    created_at: new Date().toISOString(),
  }).catch(() => {});
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function toggleOrderFlag(orderId: string) {
  guard();
  const order = await getOrderById(orderId);
  if (!order) return { error: "Order not found" };
  await saveOrder({ ...order, is_flagged: !order.is_flagged, updated_at: new Date().toISOString() });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

// ---------- Products ----------

export async function saveProductAction(formData: FormData) {
  guard();
  const id = String(formData.get("id") || crypto.randomUUID());
  const existing = await getProductById(id);
  const slug = String(formData.get("slug") || "").trim() ||
    String(formData.get("name") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const product: Product = {
    id,
    slug,
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    price: Number(formData.get("price")),
    compare_at_price: formData.get("compare_at_price") ? Number(formData.get("compare_at_price")) : null,
    sku: String(formData.get("sku") || "") || undefined,
    category_id: String(formData.get("category_id") || "") || null,
    category_slug: String(formData.get("category_slug") || "") || undefined,
    brand: String(formData.get("brand") || "") || undefined,
    stock: Number(formData.get("stock") || 0),
    low_stock_threshold: Number(formData.get("low_stock_threshold") || 5),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    is_bestseller: formData.get("is_bestseller") === "on",
    is_new: formData.get("is_new") === "on",
    is_flash_sale: formData.get("is_flash_sale") === "on",
    colors: String(formData.get("colors") || "").split(",").map((s) => s.trim()).filter(Boolean),
    images: String(formData.get("images") || "").split("\n").map((s) => s.trim()).filter(Boolean),
    specifications: existing?.specifications,
    verification_enabled: formData.get("verification_enabled") === "on",
    rating: existing?.rating,
    review_count: existing?.review_count,
    created_at: existing?.created_at || new Date().toISOString(),
  };

  if (!product.name || !product.slug || !product.images.length || !Number.isFinite(product.price) || product.price <= 0) {
    return { error: "Name, slug, at least one image URL and a valid price are required." };
  }

  await saveProduct(product);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export interface ProductImportRow {
  name?: string;
  price?: string | number;
  compare_at_price?: string | number;
  stock?: string | number;
  category?: string;
  sku?: string;
  brand?: string;
  description?: string;
  image?: string;
  colors?: string;
}

export async function importProductsAction(rows: ProductImportRow[]) {
  guard();
  const categories = await getCategories();
  const catSlugs = new Set(categories.map((c) => c.slug));
  const existing = await getProducts();
  const usedSlugs = new Set(existing.map((p) => p.slug));

  let created = 0;
  const errors: string[] = [];

  for (const [i, r] of rows.entries()) {
    const label = r.name || `Row ${i + 1}`;
    const name = String(r.name || "").trim();
    const price = Number(r.price);
    const image = String(r.image || "").trim();
    const stock = Math.max(0, Math.floor(Number(r.stock ?? 0)) || 0);
    const cat = String(r.category || "").trim().toLowerCase();

    if (!name || !Number.isFinite(price) || price <= 0 || !image) {
      errors.push(`${label}: name, valid price and image URL required`);
      continue;
    }
    if (cat && !catSlugs.has(cat)) {
      errors.push(`${label}: unknown category "${cat}"`);
      continue;
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) { errors.push(`${label}: could not derive slug`); continue; }
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slug}-${n++}`;
    usedSlugs.add(slug);

    const product: Product = {
      id: `imp-${crypto.randomUUID().slice(0, 8)}`,
      slug,
      name,
      description: String(r.description || "").trim() || name,
      price,
      compare_at_price: r.compare_at_price ? Number(r.compare_at_price) || null : null,
      sku: String(r.sku || "") || undefined,
      category_slug: cat || undefined,
      brand: String(r.brand || "") || undefined,
      stock,
      low_stock_threshold: 5,
      is_active: true,
      colors: String(r.colors || "").split(",").map((s) => s.trim()).filter(Boolean),
      images: [image],
      created_at: new Date().toISOString(),
    };
    await saveProduct(product);
    created++;
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { created, errors };
}

export async function deleteProductAction(id: string) {
  guard();
  await deleteProductRecord(id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function adjustStockAction(productId: string, delta: number) {
  guard();
  const p = await getProductById(productId);
  if (!p) return { error: "Product not found" };
  const newStock = Math.max(0, p.stock + delta);
  await saveProduct({ ...p, stock: newStock });
  const threshold = p.low_stock_threshold ?? 5;
  if (newStock <= 0 || (newStock <= threshold && p.stock > threshold)) {
    await saveNotification({
      id: crypto.randomUUID(), type: newStock <= 0 ? "low_stock" : "low_stock",
      message: `${p.name} is now ${newStock <= 0 ? "OUT OF STOCK" : `low on stock (${newStock} left)`}`,
      created_at: new Date().toISOString(),
    }).catch(() => {});
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { ok: true };
}

// ---------- Flash sales ----------

export async function saveFlashSaleAction(formData: FormData) {
  guard();
  const id = String(formData.get("id") || crypto.randomUUID());
  const endsAt = String(formData.get("ends_at") || "");
  const name = String(formData.get("name") || "Flash Sale").trim();
  if (!endsAt || Number.isNaN(new Date(endsAt).getTime())) {
    return { error: "A valid end date/time is required." };
  }
  const sale: FlashSale = {
    id, name, ends_at: new Date(endsAt).toISOString(),
    is_active: formData.get("is_active") === "on",
  };
  await saveFlashSale(sale);
  revalidatePath("/admin/flash-sales");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFlashSaleAction(id: string) {
  guard();
  await deleteFlashSale(id);
  revalidatePath("/admin/flash-sales");
  revalidatePath("/");
}

export async function setFlashSaleProductAction(productId: string, on: boolean) {
  guard();
  const p = await getProductById(productId);
  if (!p) return { error: "Product not found" };
  await saveProduct({ ...p, is_flash_sale: on });
  revalidatePath("/admin/flash-sales");
  revalidatePath("/");
  revalidatePath("/shop");
  return { ok: true };
}

// ---------- Coupons ----------

export async function saveCouponAction(formData: FormData) {
  guard();
  const id = String(formData.get("id") || crypto.randomUUID());
  const coupon: Coupon = {
    id,
    code: String(formData.get("code") || "").trim().toUpperCase(),
    discount_type: formData.get("discount_type") === "fixed" ? "fixed" : "percent",
    discount_value: Number(formData.get("discount_value")),
    min_order_amount: formData.get("min_order_amount") ? Number(formData.get("min_order_amount")) : undefined,
    expires_at: formData.get("expires_at") ? new Date(String(formData.get("expires_at"))).toISOString() : null,
    usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
    used_count: Number(formData.get("used_count") || 0),
    is_active: formData.get("is_active") === "on",
  };
  if (!coupon.code || !Number.isFinite(coupon.discount_value) || coupon.discount_value <= 0) {
    return { error: "Code and a positive discount value are required." };
  }
  await saveCoupon(coupon);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(id: string) {
  guard();
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

// ---------- FAQs ----------

export async function saveFAQAction(formData: FormData) {
  guard();
  const id = String(formData.get("id") || crypto.randomUUID());
  const faq: FAQ = {
    id,
    question: String(formData.get("question") || "").trim(),
    answer: String(formData.get("answer") || "").trim(),
    category: String(formData.get("category") || "") || undefined,
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") === "on",
  };
  if (!faq.question || !faq.answer) return { error: "Question and answer are required." };
  await saveFAQ(faq);
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { ok: true };
}

export async function deleteFAQAction(id: string) {
  guard();
  await deleteFAQ(id);
  revalidatePath("/admin/faqs");
  return { ok: true };
}

// ---------- Settings ----------

export async function saveSettingsAction(formData: FormData) {
  guard();
  const settings: SiteSettings = {
    store_name: String(formData.get("store_name") || "Tekfinity"),
    tagline: String(formData.get("tagline") || ""),
    announcement: String(formData.get("announcement") || ""),
    whatsapp_number: String(formData.get("whatsapp_number") || ""),
    contact_email: String(formData.get("contact_email") || ""),
    contact_phone: String(formData.get("contact_phone") || ""),
    delivery_charge: Number(formData.get("delivery_charge") || 250),
    free_delivery_above: Number(formData.get("free_delivery_above") || 0),
    return_days: Number(formData.get("return_days") || 7),
    warranty_text: String(formData.get("warranty_text") || ""),
    jazzcash_number: String(formData.get("jazzcash_number") || ""),
    easypaisa_number: String(formData.get("easypaisa_number") || ""),
    bank_details: {
      bank_name: String(formData.get("bank_name") || ""),
      account_title: String(formData.get("account_title") || ""),
      iban: String(formData.get("iban") || ""),
      account_number: String(formData.get("account_number") || ""),
    },
  };
  await saveSettings(settings);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

// ---------- QR verifications ----------

export async function generateVerificationAction(productId: string) {
  guard();
  const p = await getProductById(productId);
  if (!p) return { error: "Product not found" };
  const v = await generateVerification(p.id, p.name);
  revalidatePath("/admin/verifications");
  return { ok: true, code: v.code, url: `/verify/${v.code}` };
}

export async function revokeVerificationAction(code: string) {
  guard();
  const v = await getVerificationByCode(code);
  if (!v) return { error: "Not found" };
  if (v.status === "verified") return { error: "Cannot revoke an already-claimed code" };
  await setVerificationStatus(code, "revoked");
  revalidatePath("/admin/verifications");
  return { ok: true };
}

// ---------- Reviews ----------

export async function moderateReviewAction(id: string, approve: boolean) {
  guard();
  await setReviewApproved(id, approve);
  revalidatePath("/admin/reviews");
  return { ok: true };
}

// ---------- Returns ----------

export async function reviewReturnAction(id: string, approve: boolean) {
  guard();
  await updateReturnRequest(id, approve ? "approved" : "rejected");
  revalidatePath("/admin/returns");
  return { ok: true };
}
