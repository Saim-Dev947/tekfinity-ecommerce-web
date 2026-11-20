import { getFlashSales, getProducts } from "@/lib/db";
import { FlashManager } from "./flash-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flash Sales — Admin" };
export const dynamic = "force-dynamic";

export default async function FlashSalesPage() {
  const [sales, products] = await Promise.all([getFlashSales(), getProducts()]);
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Flash Sales</h1>
      <p className="mt-1 text-sm text-slate-500">
        Control the homepage flash-sale countdown and which products appear in the deals section.
      </p>
      <FlashManager sales={sales} products={products.filter((p) => p.is_active !== false)} />
    </div>
  );
}
