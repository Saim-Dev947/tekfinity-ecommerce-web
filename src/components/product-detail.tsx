"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Check, Expand, Loader2, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck, X } from "lucide-react";
import { useStore } from "./providers";
import { WishlistButton } from "./product-actions";
import { formatPKR } from "./product-card";
import { ReviewForm } from "./review-form";
import { RecentlyViewed, pushRecent } from "./recently-viewed";
import type { Product, ProductReview } from "@/lib/types";

export function ProductDetail({ product, reviews }: { product: Product; reviews: ProductReview[] }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [color, setColor] = useState(product.colors?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [notifyContact, setNotifyContact] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [notifyMsg, setNotifyMsg] = useState("");
  const { addToCart, toast } = useStore();
  const router = useRouter();
  const out = product.stock <= 0 || product.is_active === false;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;

  useEffect(() => {
    pushRecent({
      slug: product.slug, name: product.name,
      price: product.price, image: product.images[0],
    });
  }, [product.slug, product.name, product.price, product.images]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const notifyMe = async () => {
    if (!notifyContact.trim()) return;
    setNotifyState("sending");
    setNotifyMsg("");
    try {
      const res = await fetch("/api/backinstock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, contact: notifyContact.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setNotifyState("done");
      toast("success", data.message || "We'll notify you when it's back");
    } catch (err) {
      setNotifyState("error");
      setNotifyMsg(err instanceof Error ? err.message : "Failed — try again");
    }
  };

  const buyNow = () => {
    if (out) return;
    addToCart({
      product_id: product.id, slug: product.slug, name: product.name,
      price: product.price, compare_at_price: product.compare_at_price,
      image: product.images[0], color, quantity: qty, stock: product.stock,
    });
    router.push("/checkout");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery */}
      <div>
        <button
          onClick={() => setZoomOpen(true)}
          className="group relative block aspect-square w-full overflow-hidden rounded-3xl border border-line bg-mist text-left"
          aria-label={`Zoom product image — ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={product.images[imgIdx]}
            src={product.images[imgIdx]}
            alt={product.name}
            initial={{ opacity: 0.6, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-card backdrop-blur transition group-hover:opacity-100">
            <Expand className="h-4.5 w-4.5" />
          </span>
          {discount > 0 && <span className="badge absolute left-4 top-4 bg-red-500 px-3 py-1 text-sm text-white">-{discount}%</span>}
        </button>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImgIdx(i)}
                aria-label={`View image ${i + 1}`}
                aria-selected={i === imgIdx}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === imgIdx ? "border-teal" : "border-line hover:border-slate-300"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.brand && <p className="text-xs font-bold uppercase tracking-widest text-teal">{product.brand}</p>}
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>

        {avgRating > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex text-teal" aria-label={`${avgRating.toFixed(1)} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-current" : "opacity-25"}`} />
              ))}
            </span>
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-slate-500">({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-ink sm:text-4xl">{formatPKR(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <>
              <span className="text-lg text-slate-400 line-through">{formatPKR(product.compare_at_price)}</span>
              <span className="badge bg-red-500/10 text-red-600 ring-1 ring-red-500/30">Save {formatPKR(product.compare_at_price - product.price)}</span>
            </>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <fieldset className="mt-6">
            <legend className="label">Color: <span className="font-normal text-slate-500">{color}</span></legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    color === c ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Stock */}
        <div className="mt-5 flex items-center gap-2 text-sm font-medium">
          {out ? (
            <span className="text-red-600">Out of stock</span>
          ) : product.stock <= (product.low_stock_threshold ?? 5) ? (
            <span className="text-amber-600">Only {product.stock} left — order soon</span>
          ) : (
            <span className="flex items-center gap-1.5 text-teal"><Check className="h-4 w-4" /> In stock</span>
          )}
        </div>

        {/* Qty + actions */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-line" role="group" aria-label="Quantity">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-teal disabled:opacity-40" aria-label="Decrease quantity" disabled={qty <= 1}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold tabular-nums" aria-live="polite">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3 hover:text-teal disabled:opacity-40" aria-label="Increase quantity" disabled={qty >= product.stock}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <WishlistButton productId={product.id} className="h-11 w-11 border border-line" />
        </div>

        <div className="mt-4 space-y-3">
          <button onClick={() => !out && addToCart({
            product_id: product.id, slug: product.slug, name: product.name,
            price: product.price, compare_at_price: product.compare_at_price,
            image: product.images[0], color, quantity: qty, stock: product.stock,
          })} disabled={out} className="btn-outline w-full py-4 text-base">
            <ShoppingBag className="h-5 w-5" /> Add to Cart
          </button>
          <button onClick={buyNow} disabled={out} className="btn-teal w-full py-4 text-base">
            Buy Now — {formatPKR(product.price * qty)}
          </button>
        </div>

        {/* Back in stock notify */}
        {out && (
          <div className="mt-4 rounded-2xl border border-line bg-mist/60 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink"><Bell className="h-4 w-4 text-teal" /> Notify me when back in stock</p>
            {notifyState === "done" ? (
              <p className="mt-2 text-sm font-semibold text-teal">You're on the list — we'll reach out as soon as it's back.</p>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  value={notifyContact}
                  onChange={(e) => setNotifyContact(e.target.value)}
                  placeholder="Phone number or email"
                  className="input flex-1"
                  inputMode="tel"
                  aria-label="Phone number or email for back-in-stock alert"
                />
                <button onClick={notifyMe} disabled={notifyState === "sending" || !notifyContact.trim()} className="btn-outline shrink-0 px-4 text-sm">
                  {notifyState === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Me"}
                </button>
              </div>
            )}
            {notifyState === "error" && <p className="mt-2 text-xs font-semibold text-red-600">{notifyMsg}</p>}
          </div>
        )}

        {/* Trust badges */}
        <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-line pt-6 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-2 text-slate-600"><Truck className="h-4 w-4 shrink-0 text-teal" /> Free delivery over Rs. 3,000</li>
          <li className="flex items-center gap-2 text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0 text-teal" /> 6-month checking warranty</li>
          <li className="flex items-center gap-2 text-slate-600"><Check className="h-4 w-4 shrink-0 text-teal" /> Cash on Delivery available</li>
        </ul>

        {/* Specs */}
        {product.specifications && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold">Specifications</h2>
            <dl className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-ink">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Delivery / returns */}
        <div className="mt-6 rounded-2xl bg-mist p-5 text-sm text-slate-600">
          <p><strong className="text-ink">Delivery:</strong> Karachi within 24 hours · other cities 2–3 days.</p>
          <p className="mt-1"><strong className="text-ink">Returns:</strong> 7-day return/exchange window subject to policy.</p>
          <p className="mt-1"><strong className="text-ink">Authenticity:</strong> Eligible products include a QR verification code — <a href="/verify" className="font-semibold text-teal underline">verify yours</a>.</p>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 shadow-lift backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{product.name}</p>
            <p className="font-display text-base font-bold text-teal">{formatPKR(product.price)}</p>
          </div>
          <button
            onClick={() => !out && addToCart({
              product_id: product.id, slug: product.slug, name: product.name,
              price: product.price, compare_at_price: product.compare_at_price,
              image: product.images[0], color, quantity: qty, stock: product.stock,
            })}
            disabled={out}
            className="btn-outline shrink-0 px-4 py-2.5 text-sm"
          >
            <ShoppingBag className="h-4 w-4" /> Cart
          </button>
          <button onClick={buyNow} disabled={out} className="btn-teal shrink-0 px-5 py-2.5 text-sm">
            Buy Now
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />

      {/* Reviews */}
      <section className="mt-16 lg:col-span-2" aria-labelledby="reviews">
        <h2 id="reviews" className="font-display text-2xl font-bold tracking-tight">Customer reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {reviews.length === 0 && <li className="card p-6 text-sm text-slate-500">No reviews yet — be the first to share your experience.</li>}
            {reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ink">{r.customer_name}</p>
                  <span className="flex text-teal" aria-label={`${r.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : "opacity-25"}`} />)}
                  </span>
                </div>
                {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm text-slate-600">{r.body}</p>
              </li>
            ))}
          </ul>
          <ReviewForm productId={product.id} productName={product.name} />
        </div>
      </section>

      <div className="lg:col-span-2">
        <RecentlyViewed excludeSlug={product.slug} />
      </div>

      {/* Image zoom lightbox */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4"
          role="dialog" aria-modal="true" aria-label={`Enlarged view of ${product.name}`}
          onClick={() => setZoomOpen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={() => setZoomOpen(false)}
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-4xl cursor-crosshair overflow-hidden rounded-2xl bg-mist"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoomPos({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[imgIdx]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-100"
              style={{ transform: "scale(2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
              draggable={false}
            />
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src} onClick={() => setImgIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${i === imgIdx ? "border-teal" : "border-white/30 opacity-70"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
