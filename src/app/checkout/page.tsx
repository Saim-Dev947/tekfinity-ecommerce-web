"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useStore } from "@/components/providers";
import { formatPKR } from "@/components/product-card";
import { PaymentInstructions } from "@/components/payment-instructions";
import type { PaymentMethod, SiteSettings } from "@/lib/types";

const PROVINCES = ["Sindh", "Punjab", "KPK", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir"];

const METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives" },
  { id: "jazzcash", label: "JazzCash", desc: "Manual transfer — upload receipt after ordering" },
  { id: "easypaisa", label: "Easypaisa", desc: "Manual transfer — upload receipt after ordering" },
  { id: "bank_transfer", label: "Bank Transfer", desc: "IBAN transfer — upload receipt after ordering" },
];

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", province: "", postal: "", notes: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings/public").then((r) => r.json()).then(setSettings).catch(() => {});
    try {
      const saved = JSON.parse(localStorage.getItem("tf_coupon") || "null");
      if (saved?.code) setCouponCode(saved.code);
    } catch { /* ignore */ }
  }, []);

  const subtotal = useMemo(() => cart.reduce((n, i) => n + i.price * i.quantity, 0), [cart]);
  const delivery = settings ? (settings.free_delivery_above && subtotal >= settings.free_delivery_above ? 0 : settings.delivery_charge ?? 250) : 250;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError("Please fill in name, phone, address and city.");
      return;
    }
    if (!/^\+?\d[\d\s-]{8,15}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number (e.g. 0300-1234567).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name, phone: form.phone, email: form.email || undefined,
            address: form.address, city: form.city, province: form.province || undefined,
            postal_code: form.postal || undefined, notes: form.notes || undefined,
          },
          items: cart.map((i) => ({ product_id: i.product_id, color: i.color, quantity: i.quantity })),
          payment_method: method,
          coupon_code: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.order_id);
      clearCart();
      localStorage.removeItem("tf_coupon");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return <div className="container-x py-16"><div className="h-96 animate-pulse rounded-2xl bg-mist" /></div>;

  if (orderId) {
    return (
      <div className="container-x py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-teal" />
        <h1 className="mt-4 font-display text-3xl font-bold">Order placed!</h1>
        <p className="mt-2 text-slate-500">Your order ID is</p>
        <p className="mt-1 font-mono text-2xl font-bold text-teal">{orderId}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
          {method === "cod"
            ? "Pay cash when your order is delivered. We'll confirm shortly."
            : "Complete your payment using the details below, then upload your receipt from your order tracking page or WhatsApp."}
        </p>
        {method !== "cod" && <PaymentInstructions method={method} settings={settings} />}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/track?order=${orderId}&phone=${encodeURIComponent(form.phone)}`} className="btn-primary">Track Order</Link>
          <Link href="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <Link href="/shop" className="btn-teal mt-6 px-8">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Contact & address */}
          <section className="card p-6" aria-labelledby="sec-contact">
            <h2 id="sec-contact" className="font-display text-lg font-bold">Contact & Delivery</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="c-name" className="label">Full name *</label>
                <input id="c-name" required className="input" value={form.name} onChange={set("name")} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="c-phone" className="label">Phone number *</label>
                <input id="c-phone" required type="tel" className="input" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="0300-1234567" />
              </div>
              <div>
                <label htmlFor="c-email" className="label">Email (optional)</label>
                <input id="c-email" type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-addr" className="label">Delivery address *</label>
                <textarea id="c-addr" required rows={2} className="input" value={form.address} onChange={set("address")} autoComplete="street-address" placeholder="House/flat, street, area" />
              </div>
              <div>
                <label htmlFor="c-city" className="label">City *</label>
                <input id="c-city" required className="input" value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder="e.g. Karachi, Lahore, Islamabad" />
              </div>
              <div>
                <label htmlFor="c-prov" className="label">Province</label>
                <select id="c-prov" className="input" value={form.province} onChange={set("province")}>
                  <option value="">Select…</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-postal" className="label">Postal code (optional)</label>
                <input id="c-postal" className="input" value={form.postal} onChange={set("postal")} inputMode="numeric" />
              </div>
              <div>
                <label htmlFor="c-notes" className="label">Order notes (optional)</label>
                <input id="c-notes" className="input" value={form.notes} onChange={set("notes")} placeholder="Delivery instructions…" />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6" aria-labelledby="sec-pay">
            <h2 id="sec-pay" className="font-display text-lg font-bold">Payment Method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button
                  key={m.id} type="button" onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`rounded-2xl border p-4 text-left transition ${method === m.id ? "border-teal bg-teal/5 ring-1 ring-teal" : "border-line hover:border-slate-300"}`}
                >
                  <p className="flex items-center gap-2 text-sm font-bold text-ink">
                    {m.id === "cod" ? <CheckCircle2 className="h-4 w-4 text-teal" /> : <Smartphone className="h-4 w-4 text-slate-400" />}
                    {m.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{m.desc}</p>
                </button>
              ))}
            </div>
            {method !== "cod" && (
              <div className="mt-4 rounded-xl bg-mist p-4 text-sm text-slate-600">
                <PaymentInstructions method={method} settings={settings} compact />
                <p className="mt-2 font-medium text-ink">After paying, upload your receipt screenshot on the tracking page or via WhatsApp. Orders are only confirmed after payment verification.</p>
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {cart.map((i) => (
                <li key={`${i.product_id}-${i.color}`} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mist">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-ink text-[10px] font-bold text-white">{i.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-ink">{i.name}</p>
                    {i.color && <p className="text-xs text-slate-500">{i.color}</p>}
                  </div>
                  <p className="text-sm font-bold">{formatPKR(i.price * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{formatPKR(subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-semibold">{delivery === 0 ? "Free" : formatPKR(delivery)}</dd>
              </div>
              {settings?.free_delivery_above ? (
                <p className="rounded-lg bg-teal/5 px-3 py-2 text-xs font-medium text-tealDark">
                  {delivery === 0
                    ? "You've unlocked free delivery!"
                    : `Add ${formatPKR(Math.max(0, settings.free_delivery_above - subtotal))} more for free delivery`}
                </p>
              ) : null}
              {couponCode && <div className="flex justify-between text-teal"><dt>Coupon</dt><dd className="font-semibold">{couponCode} (applied at checkout)</dd></div>}
              <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPKR(subtotal + delivery)}</dd></div>
            </dl>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-teal mt-5 w-full py-4 text-base">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : `Place Order — ${formatPKR(subtotal + delivery)}`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">By ordering you agree to our return & warranty policy.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}


