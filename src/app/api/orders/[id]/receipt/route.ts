import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderById, saveOrder } from "@/lib/db";

const schema = z.object({
  order_id: z.string().min(4).max(40),
  phone: z.string().min(9).max(16),
  receipt: z.string().min(20).max(400_000), // data URL, capped ~300KB
});

const PHONE_RE = /^\+?[\d\s-]{9,16}$/;

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    if (!PHONE_RE.test(data.phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    if (!data.receipt.startsWith("data:image/")) {
      return NextResponse.json({ error: "Receipt must be an image" }, { status: 400 });
    }
    const order = await getOrderById(data.order_id.trim().toUpperCase());
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const orderPhone = order.phone.replace(/\D/g, "");
    const given = data.phone.replace(/\D/g, "");
    if (!orderPhone.endsWith(given.slice(-10)) && !given.endsWith(orderPhone.slice(-10))) {
      return NextResponse.json({ error: "Phone number does not match" }, { status: 403 });
    }
    if (order.payment_method === "cod") {
      return NextResponse.json({ error: "COD orders do not need a receipt" }, { status: 400 });
    }
    if (order.payment_status === "verified") {
      return NextResponse.json({ error: "Payment already verified" }, { status: 400 });
    }
    await saveOrder({
      ...order,
      receipt_url: data.receipt,
      payment_status: "submitted",
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, message: "Receipt submitted — pending admin verification" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
