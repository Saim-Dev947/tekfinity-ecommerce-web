import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertItem, readCollection } from "@/lib/jsondb";
import { getProductById, usingSupabase } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase";
import type { ProductReview } from "@/lib/types";

const schema = z.object({
  product_id: z.string().min(1),
  customer_name: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const product = await getProductById(data.product_id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const review: ProductReview = {
      id: crypto.randomUUID(),
      product_id: data.product_id,
      customer_name: data.customer_name.trim(),
      rating: data.rating,
      title: data.title?.trim() || undefined,
      body: data.body.trim(),
      is_approved: false,
      created_at: new Date().toISOString(),
    };

    const svc = createServiceClient();
    if (svc) {
      const { error } = await svc.from("product_reviews").insert(review as never);
      if (error) throw new Error(error.message);
    } else {
      await upsertItem("reviews", review);
    }
    return NextResponse.json({ ok: true, message: "Review submitted for moderation" }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not submit review" }, { status: 500 });
  }
}
