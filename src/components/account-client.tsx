"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, Package, RotateCcw, User } from "lucide-react";
import { formatPKR } from "./product-card";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types";
import { OtpLogin } from "./otp-login";
import { ReturnForm } from "./return-form";
import { createClientBrowser } from "@/lib/supabase";

interface OrderSummary {
  id: string; status: Order["status"]; payment_status: Order["payment_status"];
  total: number; created_at: string; items_count: number;
}

export function AccountClient({ supabaseEnabled }: { supabaseEnabled: boolean }) {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  // prefill from last used phone
  useEffect(() => {
    try { setPhone(localStorage.getItem("tf_phone") || ""); } catch { /* ignore */ }
  }, []);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Enter a valid phone number");
      return;
    }
    setLoading(true); setError("");
    try {
      const headers: HeadersInit = {};
      if (supabaseEnabled) {
        const client = createClientBrowser();
        const { data: { session } } = await client!.auth.getSession();
        if (!session) throw new Error("Sign in with phone OTP before viewing your order history.");
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`/api/account/orders?phone=${encodeURIComponent(phone)}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders);
      localStorage.setItem("tf_phone", phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x max-w-4xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight">My Account</h1>

      {/* Auth */}
      <section className="card mt-6 p-6" aria-labelledby="auth-title">
        <h2 id="auth-title" className="flex items-center gap-2 font-display text-lg font-bold"><User className="h-5 w-5 text-teal" /> Sign in</h2>
        {supabaseEnabled ? (
          <OtpLogin />
        ) : (
          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Setup required:</strong> Phone OTP login activates once Supabase credentials are configured (see README). For now, look up your orders by phone number below.
          </div>
        )}
      </section>

      {/* Order lookup */}
      <section className="card mt-6 p-6" aria-labelledby="orders-title">
        <h2 id="orders-title" className="flex items-center gap-2 font-display text-lg font-bold"><Package className="h-5 w-5 text-teal" /> Order History</h2>
        {supabaseEnabled && <p className="mt-2 text-sm text-slate-500">Sign in with phone OTP above to view orders associated with your verified number.</p>}
        <form onSubmit={lookup} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number used at checkout" aria-label="Phone number"
            className="input flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? "Loading…" : "View Orders"}
          </button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">{error}</p>}

        {orders !== null && (
          <div className="mt-5">
            {orders.length === 0 ? (
              <p className="rounded-xl bg-mist px-4 py-6 text-center text-sm text-slate-500">No orders found for this number.</p>
            ) : (
              <ul className="divide-y divide-line">
                {orders.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)}
                      className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                      aria-expanded={openOrder === o.id}
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-teal">{o.id}</p>
                        <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString("en-PK")} · {o.items_count} item(s)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatPKR(o.total)}</p>
                          <p className="text-xs font-medium text-slate-500">{ORDER_STATUS_LABELS[o.status]}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${openOrder === o.id ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {openOrder === o.id && (
                      <div className="mb-4 rounded-xl bg-mist p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link href={`/track?order=${o.id}&phone=${encodeURIComponent(phone)}`} className="text-sm font-semibold text-teal hover:underline">
                            Track this order →
                          </Link>
                          <ReturnForm orderId={o.id} phone={phone} />
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <RotateCcw className="h-3.5 w-3.5" /> Need a return or exchange? Open an order above and request it — our team reviews within 24 hours.
      </p>
    </div>
  );
}
