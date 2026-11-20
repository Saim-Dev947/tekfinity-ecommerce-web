import { getCategories, getProducts } from "@/lib/db";
import { ShopClient } from "@/components/shop-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse AirPods, cases, chargers, phone covers and premium electronics accessories.",
};

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: { searchParams: { q?: string; category?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const active = products.filter((p) => p.is_active !== false);

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Shop</h1>
        <p className="mt-2 text-sm text-slate-500">
          {active.length} products · Free delivery over Rs. 3,000
        </p>
      </div>
      <ShopClient
        products={active}
        categories={categories}
        initialQuery={searchParams.q || ""}
        initialCategory={searchParams.category || ""}
      />
    </div>
  );
}
