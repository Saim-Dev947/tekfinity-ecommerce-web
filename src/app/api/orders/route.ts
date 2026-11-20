import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoupons, getOrderById, getOrders, getProductById, getSettings, saveCustomer, saveNotification, saveOrder, saveProduct, getCustomerByPhone } from "@/lib/db";
import type { Coupon, Order, OrderItem } from "@/lib/types";

const schema = z.object({
  customer: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().regex(/^\+?[\d\s-]{9,16}$/, "Invalid phone number"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(80),
    province: z.string().max(80).optional(),
    postal_code: z.string().max(20).optional(),
    notes: z.string().max(500).optional(),
  }),
  items: z.array(z.object({
    product_id: z.string().min(1),
    color: z.string().max(60).optional(),
    quantity: z.number().int().min(1).max(20),
  })).min(1).max(50),
  payment_method: z.enum(["cod", "jazzcash", "easypaisa", "bank_transfer"]),
  coupon_code: z.string().max(40).optional(),
});

function genOrderId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TF-${rand}`;
}

function discountFor(coupon: Coupon, subtotal: number) {
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0;
  if (coupon.discount_type === "percent") return Math.round((subtotal * coupon.discount_value) / 100);
  return Math.min(coupon.discount_value, subtotal);
}

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    // Re-price everything server-side — never trust client prices.
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    for (const item of body.items) {
      const p = await getProductById(item.product_id);
      if (!p || p.is_active === false) {
        return NextResponse.json({ error: `Product unavailable: ${item.product_id}` }, { status: 400 });
      }
      if (p.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${p.name} (only ${p.stock} left)` }, { status: 400 });
      }
      orderItems.push({
        product_id: p.id, name: p.name, slug: p.slug,
        price: p.price, quantity: item.quantity,
        image: p.images[0], color: item.color,
      });
      subtotal += p.price * item.quantity;
    }

    // Coupon
    let discount = 0;
    let couponCode: string | null = null;
    if (body.coupon_code) {
      const coupons = await getCoupons();
      const c = coupons.find((x) => x.code.toUpperCase() === body.coupon_code!.toUpperCase() && x.is_active !== false);
      if (!c) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
      if (c.expires_at && new Date(c.expires_at) < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
      }
      if (c.usage_limit && (c.used_count ?? 0) >= c.usage_limit) {
        return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
      }
      discount = discountFor(c, subtotal);
      couponCode = c.code;
    }

    const settings = await getSettings();
    const delivery = settings.free_delivery_above && subtotal >= settings.free_delivery_above ? 0 : settings.delivery_charge ?? 250;
    const total = subtotal - discount + delivery;

    // Decrement stock
    for (const item of body.items) {
      const p = await getProductById(item.product_id);
      if (p) await saveProduct({ ...p, stock: p.stock - item.quantity });
    }

    // Customer record
    const customer = await getCustomerByPhone(body.customer.phone);
    if (!customer) {
      await saveCustomer({
        id: crypto.randomUUID(), phone: body.customer.phone,
        name: body.customer.name, email: body.customer.email || undefined,
        created_at: new Date().toISOString(),
      });
    }

    // Fraud signal: flag repeat orders from same phone within 24h (review only, never auto-block)
    const phoneDigits = body.customer.phone.replace(/\D/g, "");
    const recent = (await getOrders()).filter(
      (o) => o.phone.replace(/\D/g, "") === phoneDigits &&
        Date.now() - new Date(o.created_at).getTime() < 24 * 3600 * 1000 &&
        o.status !== "cancelled"
    );
    const flagged = recent.length >= 2;

    const order: Order = {
      id: genOrderId(),
      customer_id: customer?.id ?? null,
      customer_name: body.customer.name,
      phone: body.customer.phone,
      email: body.customer.email || undefined,
      address: body.customer.address,
      city: body.customer.city,
      province: body.customer.province,
      postal_code: body.customer.postal_code,
      notes: body.customer.notes,
      items: orderItems,
      subtotal, discount, delivery_charge: delivery, total,
      coupon_code: couponCode,
      payment_method: body.payment_method,
      payment_status: body.payment_method === "cod" ? "pending" : "pending",
      status: "pending",
      status_history: [{ status: "pending" as const, at: new Date().toISOString(), note: "Order placed" }],
      is_flagged: flagged,
      flag_reason: flagged ? `${recent.length + 1} orders from same phone within 24h` : null,
      created_at: new Date().toISOString(),
    };
    await saveOrder(order);
    await saveNotification({
      id: crypto.randomUUID(), customer_phone: order.phone, type: "new_order",
      message: `New order ${order.id} — Rs. ${total.toLocaleString("en-PK")} via ${order.payment_method}${flagged ? " (FLAGGED)" : ""}`,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ order_id: order.id, total, payment_method: order.payment_method }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Invalid request" }, { status: 400 });
    }
    console.error("Order creation failed", err);
    return NextResponse.json({ error: "Could not place order. Please try again." }, { status: 500 });
  }
}
