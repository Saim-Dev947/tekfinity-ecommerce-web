import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk";
  const products = await getProducts();
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/track`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/verify`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
