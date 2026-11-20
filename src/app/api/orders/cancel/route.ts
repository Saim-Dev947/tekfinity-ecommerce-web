import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderById, getProductById, saveNotification, saveOrder, saveProduct } from "@/lib/db";

const schema = z.object({
  order_id: z.string().min(4).max(40),
  phone: z.string().min(9).max(16),
});

const CANCELLABLE = ["pending", "confirmed", "processing"];

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const order = await getOrderById(data.order_id.trim().toUpperCase());
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const op = order.phone.replace(/\D/g, "");
    const gp = data.phone.replace(/\D/g, "");
    if (!op.endsWith(gp.slice(-10)) && !gp.endsWith(op.slice(-10))) {
      return NextResponse.json({ error: "Phone number does not match" }, { status: 403 });
    }
    if (!CANCELLABLE.includes(order.status)) {
      return NextResponse.json({ error: `Order can't be cancelled at stage: ${order.status}. Contact support on WhatsApp.` }, { status: 400 });
    }

    // Restock items
    for (const item of order.items) {
      const p = await getProductById(item.product_id);
      if (p) await saveProduct({ ...p, stock: p.stock + item.quantity });
    }

    await saveOrder({
      ...order,
      status: "cancelled",
      status_history: [
        ...(order.status_history ?? []),
        { status: "cancelled" as const, at: new Date().toISOString(), note: "Cancelled by customer" },
      ],
      updated_at: new Date().toISOString(),
    });
    await saveNotification({
      id: crypto.randomUUID(), customer_phone: order.phone, type: "order_update",
      message: `Order ${order.id} cancelled by customer`,
      created_at: new Date().toISOString(),
    }).catch(() => {});
    return NextResponse.json({ ok: true, message: "Order cancelled" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return NextResponse.json({ error: "Could not cancel order" }, { status: 500 });
  }
}
