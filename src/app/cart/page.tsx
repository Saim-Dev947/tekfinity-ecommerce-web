"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/providers";
import { formatPKR } from "@/components/product-card";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, setQty, removeFromCart, cartSubtotal, toast } = useStore();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [delivery, setDelivery] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon.trim(), subtotal: cartSubtotal }),
    });
    const data = await res.json();
    if (res.ok) {
      setDiscount(data.discount);
      setCouponMsg(`Coupon applied — you save ${formatPKR(data.discount)}`);
      toast("success", "Coupon applied");
    } else {
      setDiscount(0);
      setCouponMsg(data.error || "Invalid coupon");
      toast("error", data.error || "Invalid coupon");
    }
  };

  useEffect(() => {
    if (!mounted || !cart.length) { setDelivery(null); return; }
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((s) => {
        const charge = s.free_delivery_above && cartSubtotal >= s.free_delivery_above ? 0 : (s.delivery_charge ?? 250);
        setDelivery(charge);
      })
      .catch(() => setDelivery(250));
  }, [mounted, cart.length, cartSubtotal]);

  if (!mounted) {
    return <div className="container-x py-16"><div className="h-64 animate-pulse rounded-2xl bg-mist" /></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Discover something you&apos;ll love.</p>
        <Link href="/shop" className="btn-teal mt-6 px-8">Continue Shopping</Link>
      </div>
    );
  }

  const total = cartSubtotal - discount + (delivery ?? 0);

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {cart.map((item) => (
            <li key={`${item.product_id}-${item.color ?? ""}`} className="card flex gap-4 p-4 sm:p-5">
              <Link href={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist sm:h-28 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-bold text-ink hover:text-teal sm:text-base">{item.name}</Link>
                    {item.color && <p className="mt-0.5 text-xs text-slate-500">Color: {item.color}</p>}
                    <p className="mt-1 text-sm font-bold text-teal">{formatPKR(item.price)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id, item.color)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Remove ${item.name}`}>
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line" role="group" aria-label="Quantity">
                    <button onClick={() => setQty(item.product_id, item.color, item.quantity - 1)} className="p-2 hover:text-teal" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button onClick={() => setQty(item.product_id, item.color, item.quantity + 1)} className="p-2 hover:text-teal" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="font-display font-bold text-ink">{formatPKR(item.price * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>

            <div className="mt-4 flex gap-2">
              <input
                className="input flex-1" placeholder="Promo code" value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                aria-label="Promo code"
              />
              <button onClick={applyCoupon} className="btn-outline px-5 py-2.5 text-sm">Apply</button>
            </div>
            {couponMsg && <p className={`mt-2 text-xs font-medium ${discount > 0 ? "text-teal" : "text-red-500"}`}>{couponMsg}</p>}

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{formatPKR(cartSubtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-teal"><dt>Discount</dt><dd className="font-semibold">−{formatPKR(discount)}</dd></div>}
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-semibold">{delivery === null ? "…" : delivery === 0 ? "Free" : formatPKR(delivery)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPKR(Math.max(0, total))}</dd></div>
            </dl>

            <Link href="/checkout" className="btn-teal mt-5 w-full py-4 text-base">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-400">Cash on Delivery · JazzCash · Easypaisa · Bank Transfer</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
