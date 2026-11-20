import "server-only";
import { createServiceClient, isSupabaseConfigured } from "./supabase";
import { readCollection, writeCollection, upsertItem, deleteItem } from "./jsondb";
import { CATEGORIES, COUPONS, DEFAULT_SETTINGS, FAQS, PRODUCTS } from "@/data/catalog";
import type {
  Category, Coupon, Customer, FAQ, Order, Product, ProductReview,
  ReturnRequest, SiteSettings, ProductVerification, Address, FlashSale, Notification,
} from "./types";

export const usingSupabase = isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function svc() {
  return createServiceClient();
}

async function sbSelect<T>(table: string, fallback: T[]): Promise<T[]> {
  const client = svc();
  if (client) {
    const { data, error } = await client.from(table).select("*");
    if (!error && data && data.length) return data as T[];
  }
  return fallback;
}

async function sbSelectOne<T>(table: string, match: Record<string, string>, fallback: T | null): Promise<T | null> {
  const client = svc();
  if (client) {
    let q = client.from(table).select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { data, error } = await q.maybeSingle();
    if (!error && data) return data as T;
  }
  return fallback;
}

// ---------- Catalog ----------

async function localOrConst<T>(collection: string, fallback: T[]): Promise<T[]> {
  const local = await readCollection<T>(collection);
  return local.length ? local : fallback;
}

export async function getCategories(): Promise<Category[]> {
  const rows = await sbSelect<Category>("categories", []);
  const list = rows.length ? rows : await localOrConst("categories", CATEGORIES);
  const removedSlugs = new Set(["cases", "straps", "electronics"]);
  return list
    .filter((category) => !removedSlugs.has(category.slug))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function getProducts(): Promise<Product[]> {
  const rows = await sbSelect<Product>("products", []);
  return rows.length ? rows : await localOrConst("products", PRODUCTS);
}

async function allLocalProducts(): Promise<Product[]> {
  return localOrConst("products", PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = svc();
  if (client) {
    const { data } = await client.from("products").select("*").eq("slug", slug).maybeSingle();
    if (data) return data as Product;
  }
  const all = await allLocalProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = svc();
  if (client) {
    const { data } = await client.from("products").select("*").eq("id", id).maybeSingle();
    if (data) return data as Product;
  }
  const all = await allLocalProducts();
  return all.find((p) => p.id === id) ?? null;
}

export async function getReviews(productId: string): Promise<ProductReview[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("product_reviews").select("*").eq("product_id", productId).eq("is_approved", true);
    if (data) return data as ProductReview[];
  }
  const all = await readCollection<ProductReview>("reviews");
  return all.filter((r) => r.product_id === productId && r.is_approved !== false);
}

export async function getAllReviews(): Promise<ProductReview[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("product_reviews").select("*").order("created_at", { ascending: false });
    if (data) return data as ProductReview[];
  }
  const all = await readCollection<ProductReview>("reviews");
  return all.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function setReviewApproved(id: string, approved: boolean) {
  const client = svc();
  if (client) {
    const { error } = await client.from("product_reviews").update({ is_approved: approved } as never).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const all = await readCollection<ProductReview>("reviews");
  const r = all.find((x) => x.id === id);
  if (r) { r.is_approved = approved; await writeCollection("reviews", all); }
}

export async function getCoupons(): Promise<Coupon[]> {
  const rows = await sbSelect<Coupon>("coupons", []);
  return rows.length ? rows : await localOrConst("coupons", COUPONS);
}

export async function getFAQs(): Promise<FAQ[]> {
  const rows = await sbSelect<FAQ>("faqs", []);
  const all = rows.length ? rows : await localOrConst("faqs", FAQS);
  return all
    .filter((f) => f.is_published !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function getSettings(): Promise<SiteSettings> {
  const client = svc();
  if (client) {
    const { data } = await client.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) return { ...DEFAULT_SETTINGS, ...(data as object), settings: undefined } as SiteSettings;
  }
  const local = await readCollection<SiteSettings>("settings");
  return { ...DEFAULT_SETTINGS, ...local[0] };
}

export async function getFlashSales(): Promise<FlashSale[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("flash_sales").select("*");
    if (data?.length) return data as FlashSale[];
  }
  const local = await readCollection<FlashSale>("flash_sales");
  if (local.length) return local;
  // Demo mode: seed a default 72-hour flash sale so the homepage countdown works.
  const seeded: FlashSale[] = [{
    id: "flash-default", name: "Weekend Flash Sale",
    ends_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    is_active: true,
  }];
  if (!client) await writeCollection("flash_sales", seeded);
  return seeded;
}

export async function saveFlashSale(f: FlashSale) {
  await writeRow("flash_sales", "flash_sales", f as unknown as Record<string, unknown>);
}

export async function deleteFlashSale(id: string) {
  const client = svc();
  if (client) {
    await client.from("flash_sales").delete().eq("id", id);
    return;
  }
  const all = await readCollection<FlashSale>("flash_sales");
  await writeCollection("flash_sales", all.filter((f) => f.id !== id));
}

// ---------- Writes (products/categories/etc — admin) ----------

async function writeRow(table: string, collection: string, row: Record<string, unknown>) {
  const client = svc();
  if (client) {
    const { error } = await client.from(table).upsert(row as never);
    if (error) throw new Error(error.message);
    return;
  }
  const items = await readCollection<Record<string, unknown>>(collection);
  const idx = items.findIndex((i) => i.id === row.id);
  if (idx >= 0) items[idx] = { ...items[idx], ...row };
  else items.push(row);
  await writeCollection(collection, items);
}

export async function saveProduct(p: Product) {
  if (!svc()) {
    // Seed the local store with the full demo catalog so single-product
    // updates don't shrink the catalog to just the edited item.
    const local = await readCollection<Product>("products");
    const seeded = [
      ...PRODUCTS,
      ...local.filter((l) => !PRODUCTS.some((x) => x.id === l.id)),
    ];
    await writeCollection("products", seeded);
  }
  await writeRow("products", "products", p as unknown as Record<string, unknown>);
}
export async function deleteProductRecord(id: string) {
  const client = svc();
  if (client) {
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await seedLocal("products", PRODUCTS);
  await deleteItem("products", id);
}
export async function saveCategory(c: Category) { await writeRow("categories", "categories", c as unknown as Record<string, unknown>); }

async function seedLocal<T extends { id: string }>(collection: string, defaults: T[]) {
  const local = await readCollection<T>(collection);
  const merged = [...defaults, ...local.filter((l) => !defaults.some((d) => d.id === l.id))];
  await writeCollection(collection, merged);
}

export async function saveCoupon(c: Coupon) {
  if (!svc()) await seedLocal("coupons", COUPONS);
  await writeRow("coupons", "coupons", c as unknown as Record<string, unknown>);
}
export async function deleteCoupon(id: string) {
  const client = svc();
  if (client) { await client.from("coupons").delete().eq("id", id); return; }
  await seedLocal("coupons", COUPONS);
  await deleteItem("coupons", id);
}
export async function saveFAQ(f: FAQ) {
  if (!svc()) await seedLocal("faqs", FAQS);
  await writeRow("faqs", "faqs", f as unknown as Record<string, unknown>);
}
export async function deleteFAQ(id: string) {
  const client = svc();
  if (client) { await client.from("faqs").delete().eq("id", id); return; }
  await seedLocal("faqs", FAQS);
  await deleteItem("faqs", id);
}
export async function saveSettings(s: SiteSettings) {
  const client = svc();
  if (client) {
    const { error } = await client.from("site_settings").upsert({ id: "default", ...s } as never);
    if (error) throw new Error(error.message);
    return;
  }
  await writeCollection("settings", [s]);
}

// ---------- Orders / customers / commerce ----------

export async function getOrders(): Promise<Order[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (data) return data as Order[];
  }
  return readCollection<Order>("orders");
}

export async function getOrderById(id: string): Promise<Order | null> {
  const client = svc();
  if (client) {
    const { data } = await client.from("orders").select("*").eq("id", id).maybeSingle();
    if (data) return data as Order;
  }
  const orders = await readCollection<Order>("orders");
  return orders.find((o) => o.id === id) ?? null;
}

export async function saveOrder(order: Order) {
  const client = svc();
  if (client) {
    const { error } = await client.from("orders").upsert(order as never);
    if (error) throw new Error(error.message);
    return;
  }
  await upsertItem("orders", order);
}

export async function getCustomers(): Promise<Customer[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("profiles").select("*");
    if (data) return data as Customer[];
  }
  return readCollection<Customer>("customers");
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const client = svc();
  if (client) {
    const { data } = await client.from("profiles").select("*").eq("phone", phone).maybeSingle();
    if (data) return data as Customer;
  }
  const all = await readCollection<Customer>("customers");
  return all.find((c) => c.phone === phone) ?? null;
}

export async function saveCustomer(c: Customer) {
  const client = svc();
  if (client) {
    const { error } = await client.from("profiles").upsert({ id: c.id, phone: c.phone, full_name: c.name, email: c.email } as never);
    if (error) throw new Error(error.message);
    return;
  }
  await upsertItem("customers", c);
}

export async function getAddresses(customerId: string): Promise<Address[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("addresses").select("*").eq("customer_id", customerId);
    if (data) return data as Address[];
  }
  const all = await readCollection<Address>("addresses");
  return all.filter((a) => a.customer_id === customerId);
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("return_requests").select("*").order("created_at", { ascending: false });
    if (data) return data as ReturnRequest[];
  }
  return readCollection<ReturnRequest>("returns");
}

export async function saveReturnRequest(r: ReturnRequest) {
  const client = svc();
  if (client) {
    const { error } = await client.from("return_requests").insert(r as never);
    if (error) throw new Error(error.message);
    return;
  }
  const all = await readCollection<ReturnRequest>("returns");
  all.unshift(r);
  await writeCollection("returns", all);
}

export async function updateReturnRequest(id: string, status: ReturnRequest["status"]) {
  const client = svc();
  if (client) {
    await client.from("return_requests").update({ status } as never).eq("id", id);
    return;
  }
  const all = await readCollection<ReturnRequest>("returns");
  const r = all.find((x) => x.id === id);
  if (r) r.status = status;
  await writeCollection("returns", all);
}

// ---------- Notifications ----------

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit);
    return (data as Notification[]) ?? [];
  }
  const all = await readCollection<Notification>("notifications");
  return all.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, limit);
}

export async function saveNotification(n: Notification) {
  const client = svc();
  if (client) {
    const { error } = await client.from("notifications").insert(n as never);
    if (error) throw new Error(error.message);
    return;
  }
  const all = await readCollection<Notification>("notifications");
  all.unshift(n);
  await writeCollection("notifications", all.slice(0, 500));
}

// ---------- QR product verification ----------

export interface BackInStockSignup {
  id: string;
  product_id: string;
  product_name: string;
  contact: string;
  created_at: string;
}

export async function getBackInStockSignups(): Promise<BackInStockSignup[]> {
  const items = await readCollection<BackInStockSignup>("backinstock");
  return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getVerificationByCode(code: string): Promise<ProductVerification | null> {
  const client = svc();
  if (client) {
    const { data } = await client.from("product_verifications").select("*").eq("code", code).maybeSingle();
    if (data) return data as ProductVerification;
  }
  const all = await readCollection<ProductVerification>("verifications");
  return all.find((v) => v.code === code) ?? null;
}

export async function registerVerification(v: ProductVerification) {
  const client = svc();
  if (client) {
    const { error } = await client.from("product_verifications").insert(v as never);
    if (error) throw new Error(error.message);
    return;
  }
  const all = await readCollection<ProductVerification>("verifications");
  all.push(v);
  await writeCollection("verifications", all);
}

export async function claimVerification(code: string) {
  const client = svc();
  if (client) {
    const { data, error } = await client
      .from("product_verifications")
      .update({ status: "verified", verified_at: new Date().toISOString() } as never)
      .eq("code", code)
      .eq("status", "active")
      .select("*");
    if (error) throw new Error(error.message);
    return (data?.[0] as ProductVerification) ?? null;
  }
  const all = await readCollection<ProductVerification>("verifications");
  const v = all.find((x) => x.code === code && x.status === "active");
  if (!v) return null;
  v.status = "verified";
  v.verified_at = new Date().toISOString();
  await writeCollection("verifications", all);
  return v;
}

export async function generateVerification(productId: string, productName: string): Promise<ProductVerification> {
  const code = `TF-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const v: ProductVerification = {
    id: crypto.randomUUID(), code, product_id: productId, product_name: productName,
    status: "active", created_at: new Date().toISOString(),
  };
  await registerVerification(v);
  return v;
}

export async function getVerifications(): Promise<ProductVerification[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("product_verifications").select("*").order("created_at", { ascending: false }).limit(200);
    if (data) return data as ProductVerification[];
  }
  const all = await readCollection<ProductVerification>("verifications");
  return all.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function setVerificationStatus(code: string, status: ProductVerification["status"]) {
  const client = svc();
  if (client) {
    const { error } = await client.from("product_verifications").update({ status } as never).eq("code", code);
    if (error) throw new Error(error.message);
    return;
  }
  const all = await readCollection<ProductVerification>("verifications");
  const v = all.find((x) => x.code === code);
  if (v) { v.status = status; await writeCollection("verifications", all); }
}

export async function getInventoryRows(): Promise<{ product_id: string; stock: number; reserved?: number }[]> {
  const client = svc();
  if (client) {
    const { data } = await client.from("inventory").select("*");
    if (data) return data as { product_id: string; stock: number }[];
  }
  return [];
}
