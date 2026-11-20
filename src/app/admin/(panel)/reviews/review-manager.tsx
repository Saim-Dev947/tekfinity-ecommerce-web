"use client";

import { useRouter } from "next/navigation";
import { Check, Star, X } from "lucide-react";
import { moderateReviewAction } from "@/app/admin/actions";
import type { ProductReview } from "@/lib/types";

export function ReviewManager({ reviews, productNames }: { reviews: ProductReview[]; productNames: Record<string, string> }) {
  const router = useRouter();

  const act = async (id: string, approve: boolean) => {
    await moderateReviewAction(id, approve);
    router.refresh();
  };

  return (
    <div className="card mt-6 divide-y divide-line">
      {reviews.map((r) => (
        <div key={r.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-ink">{r.customer_name}</p>
              <span className="flex text-teal" aria-label={`${r.rating} stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-25"}`} />
                ))}
              </span>
              <span className={`badge ${r.is_approved ? "bg-teal/10 text-teal" : "bg-amber-100 text-amber-700"}`}>
                {r.is_approved ? "Published" : "Pending"}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">{productNames[r.product_id] || r.product_id}</p>
            {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
            <p className="mt-0.5 text-sm text-slate-600">{r.body}</p>
            <p className="mt-1 text-xs text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleString("en-PK") : ""}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {!r.is_approved && (
              <button onClick={() => act(r.id, true)} className="flex items-center gap-1.5 rounded-lg bg-teal/10 px-3 py-2 text-xs font-bold text-teal hover:bg-teal hover:text-white" aria-label="Approve review">
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
            )}
            {r.is_approved && (
              <button onClick={() => act(r.id, false)} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200" aria-label="Unpublish review">
                <X className="h-3.5 w-3.5" /> Unpublish
              </button>
            )}
          </div>
        </div>
      ))}
      {reviews.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No reviews yet.</p>}
    </div>
  );
}
