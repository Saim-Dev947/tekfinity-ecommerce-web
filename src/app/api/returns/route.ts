import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderById, saveNotification, saveReturnRequest } from "@/lib/db";

const schema = z.object({
  order_id: z.string().min(4).max(40),
  phone: z.string().min(9).max(16),
  reason: z.string().min(10).max(1000),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const order = await getOrderById(data.order_id.trim().toUpperCase());
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const orderPhone = order.phone.replace(/\D/g, "");
    const givenPhone = data.phone.replace(/\D/g, "");
    if (!orderPhone.endsWith(givenPhone.slice(-10)) && !givenPhone.endsWith(orderPhone.slice(-10))) {
      return NextResponse.json({ error: "Phone number does not match this order" }, { status: 403 });
    }
    if (order.status === "cancelled") {
      return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
    }
    const deliveredAt = new Date(order.created_at).getTime();
    if (Date.now() - deliveredAt > 30 * 24 * 3600 * 1000 && order.status === "delivered") {
      return NextResponse.json({ error: "Return window has passed" }, { status: 400 });
    }

    await saveReturnRequest({
      id: crypto.randomUUID(),
      order_id: order.id,
      customer_phone: order.phone,
      reason: data.reason.trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    });
    await saveNotification({
      id: crypto.randomUUID(), customer_phone: order.phone, type: "return_request",
      message: `Return requested for order ${order.id}`,
      created_at: new Date().toISOString(),
    }).catch(() => {});
    return NextResponse.json({ ok: true, message: "Return request submitted" }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please provide order ID, phone and a reason (min 10 chars)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not submit request" }, { status: 500 });
  }
}
