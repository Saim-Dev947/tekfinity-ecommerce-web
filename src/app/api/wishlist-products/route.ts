import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/db";

const schema = z.object({ ids: z.array(z.string().max(64)).max(200) });

export async function POST(req: Request) {
  try {
    const { ids } = schema.parse(await req.json());
    const products = await getProducts();
    const wanted = new Set(ids);
    return NextResponse.json({ products: products.filter((p) => wanted.has(p.id)) });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
