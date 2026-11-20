import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoupons } from "@/lib/db";
import type { Coupon } from "@/lib/types";

const schema = z.object({
  code: z.string().min(2).max(40),
  subtotal: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const { code, subtotal } = schema.parse(await req.json());
    const coupons = await getCoupons();
    const c: Coupon | undefined = coupons.find(
      (x) => x.code.toUpperCase() === code.trim().toUpperCase() && x.is_active !== false
    );
    if (!c) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (c.usage_limit && (c.used_count ?? 0) >= c.usage_limit) {
      return NextResponse.json({ error: "Usage limit reached" }, { status: 400 });
    }
    if (c.min_order_amount && subtotal < c.min_order_amount) {
      return NextResponse.json({ error: `Minimum order Rs. ${c.min_order_amount.toLocaleString("en-PK")} required` }, { status: 400 });
    }
    const discount = c.discount_type === "percent"
      ? Math.round((subtotal * c.discount_value) / 100)
      : Math.min(c.discount_value, subtotal);
    return NextResponse.json({ discount, code: c.code });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
