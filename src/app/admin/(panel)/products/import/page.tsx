import { getCategories } from "@/lib/db";
import { ImportClient } from "./import-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Import Products — Admin" };
export const dynamic = "force-dynamic";

export default async function ImportProductsPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Import Products</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bulk-add products from a CSV file. Download the template, fill it in, then upload.
      </p>
      <ImportClient categories={categories.map((c) => c.slug)} />
    </div>
  );
}
