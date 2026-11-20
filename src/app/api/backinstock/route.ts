import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { upsertItem, readCollection } from "@/lib/jsondb";
import { getProductById } from "@/lib/db";

export interface BackInStockSignup {
  id: string;
  product_id: string;
  product_name: string;
  contact: string;
  created_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.product_id || "").trim();
    const contact = String(body.contact || "").trim();
    if (!productId || !contact) {
      return NextResponse.json({ error: "Product and a phone number or email are required" }, { status: 400 });
    }
    if (contact.length < 7 || contact.length > 120) {
      return NextResponse.json({ error: "Enter a valid phone number or email" }, { status: 400 });
    }
    const product = await getProductById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const existing = await readCollection<BackInStockSignup>("backinstock");
    if (existing.some((s) => s.product_id === productId && s.contact === contact)) {
      return NextResponse.json({ ok: true, message: "You're already on the list" });
    }
    const signup: BackInStockSignup = {
      id: randomUUID(),
      product_id: productId,
      product_name: product.name,
      contact,
      created_at: new Date().toISOString(),
    };
    await upsertItem("backinstock", signup);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
