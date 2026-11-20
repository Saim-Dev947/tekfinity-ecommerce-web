"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useStore } from "./providers";

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const { toast } = useStore();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, customer_name: name, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
      toast("success", "Review submitted — it will appear after moderation.");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card h-fit p-6 text-center">
        <p className="font-bold text-ink">Thank you!</p>
        <p className="mt-1 text-sm text-slate-500">Your review for {productName} was submitted for moderation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card h-fit space-y-4 p-6" aria-labelledby="review-form-title">
      <h3 id="review-form-title" className="font-display text-lg font-bold">Write a review</h3>
      <div>
        <label htmlFor="rv-name" className="label">Your name</label>
        <input id="rv-name" required className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </div>
      <fieldset>
        <legend className="label">Rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star className={`h-6 w-6 ${n <= rating ? "fill-teal text-teal" : "text-line"}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="rv-title" className="label">Title (optional)</label>
        <input id="rv-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label htmlFor="rv-body" className="label">Review</label>
        <textarea id="rv-body" required rows={4} className="input" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
      </div>
      <button type="submit" disabled={loading} className="btn-teal w-full py-3">
        {loading ? "Submitting…" : "Submit Review"}
      </button>
      <p className="text-xs text-slate-400">Reviews are moderated before publishing.</p>
    </form>
  );
}
