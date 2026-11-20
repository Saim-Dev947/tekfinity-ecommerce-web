import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders } from "@/lib/db";
import { createClientServer, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const schema = z.object({ phone: z.string().min(9).max(16) });

function samePhone(left: string, right: string) {
  const a = left.replace(/\D/g, "");
  const b = right.replace(/\D/g, "");
  return a.length >= 10 && b.length >= 10
    ? a.slice(-10) === b.slice(-10)
    : a === b;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = schema.safeParse({ phone: searchParams.get("phone") || "" });
    if (!parsed.success) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    let phone = parsed.data.phone;
    if (isSupabaseConfigured) {
      const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
      const client = createClientServer();
      if (!token || !client) {
        return NextResponse.json({ error: "Sign in with phone OTP to view order history" }, { status: 401 });
      }
      const { data, error } = await client.auth.getUser(token);
      if (error || !data.user?.phone) {
        return NextResponse.json({ error: "A verified phone sign-in is required" }, { status: 401 });
      }
      if (!samePhone(data.user.phone, phone)) {
        return NextResponse.json({ error: "Use the phone number associated with your account" }, { status: 403 });
      }
      phone = data.user.phone;
    }

    const orders = await getOrders();
    const mine = orders
      .filter((o) => samePhone(o.phone, phone))
      .map((o) => ({
        id: o.id,
        status: o.status,
        payment_status: o.payment_status,
        total: o.total,
        created_at: o.created_at,
        items_count: o.items.reduce((n, i) => n + i.quantity, 0),
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json({ orders: mine });
  } catch (error) {
    console.error("Account order lookup failed", error);
    return NextResponse.json({ error: "Could not load order history" }, { status: 500 });
  }
}
