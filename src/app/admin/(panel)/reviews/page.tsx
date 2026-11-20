import { getAllReviews, getProducts } from "@/lib/db";
import { ReviewManager } from "./review-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([getAllReviews(), getProducts()]);
  const names = Object.fromEntries(products.map((p) => [p.id, p.name]));
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Product Reviews</h1>
      <p className="mt-1 text-sm text-slate-500">Approve or reject customer reviews before they appear on product pages.</p>
      <ReviewManager reviews={reviews} productNames={names} />
    </div>
  );
}
