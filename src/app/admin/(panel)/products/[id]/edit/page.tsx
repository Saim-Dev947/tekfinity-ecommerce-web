import { getCategories, getProductById } from "@/lib/db";
import { ProductForm } from "../../product-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Admin" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([getProductById(params.id), getCategories()]);
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">{product ? "Edit Product" : "Product not found"}</h1>
      {product && <ProductForm product={product} categories={categories} />}
    </div>
  );
}
