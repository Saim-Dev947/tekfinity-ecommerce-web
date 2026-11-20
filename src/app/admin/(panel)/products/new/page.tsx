import { getCategories } from "@/lib/db";
import { ProductForm } from "../product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product — Admin" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
