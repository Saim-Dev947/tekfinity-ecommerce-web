import { NextResponse } from "next/server";
import { getCategories, getProducts, getSettings } from "@/lib/db";

/**
 * Product catalog feed — compatible with Meta Commerce Manager / Instagram Shop
 * catalog import (CSV/JSON). Schedule a sync or point Meta's catalog data source
 * at this endpoint. Requires NEXT_PUBLIC_SITE_URL for absolute product URLs.
 */
export async function GET() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk";

  const items = products
    .filter((p) => p.is_active !== false && p.stock > 0)
    .map((p) => {
      const cat = categories.find((c) => c.id === p.category_id || c.slug === p.category_slug);
      return {
        id: p.id,
        name: p.name,
        description: p.description.slice(0, 9999),
        price: p.price.toFixed(2),
        currency: "PKR",
        availability: p.stock > 0 ? "in stock" : "out of stock",
        condition: "new",
        link: `${base}/product/${p.slug}`,
        image_link: p.images[0],
        brand: p.brand || settings.store_name || "Tekfinity",
        google_product_category: cat?.name || "Electronics > Audio",
        product_type: cat ? `Electronics > ${cat.name}` : "Electronics",
        additional_image_link: p.images.slice(1),
      };
    });

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    store: settings.store_name || "Tekfinity",
    item_count: items.length,
    items,
  });
}
