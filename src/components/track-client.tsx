"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Package, Printer, RotateCcw, Upload, XCircle } from "lucide-react";
import { formatPKR } from "./product-card";
import { useStore } from "./providers";
import { PaymentInstructions } from "./payment-instructions";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, type Order, type SiteSettings } from "@/lib/types";

export function TrackClient({ order, settings }: { order: Order; settings: SiteSettings | null }) {
  const { toast, addToCart } = useStore();
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);

  const cancellable = ["pending", "confirmed", "processing"].includes(order.status) && !orderCancelled;

  const cancelOrder = async () => {
    if (!confirm("Cancel this order? Items will be restocked.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, phone: order.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      setOrderCancelled(true);
      toast("success", "Order cancelled");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  const reorder = () => {
    for (const i of order.items) {
      addToCart({
        product_id: i.product_id, slug: i.slug || "", name: i.name,
        price: i.price, image: i.image || "", color: i.color,
        quantity: i.quantity, stock: 999,
      });
    }
    toast("success", "Items added back to your cart");
  };

  const stepIdx = ORDER_STATUS_STEPS.indexOf(order.status);
  const cancelled = order.status === "cancelled" || order.status === "return_requested";
  const needsReceipt = order.payment_method !== "cod" && order.payment_status !== "verified";

  const uploadReceipt = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("error", "Please upload an image file");
      return;
    }
    if (file.size > 300 * 1024) {
      toast("error", "Image must be under 300KB");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, phone: order.phone, receipt: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDone(true);
      toast("success", "Receipt submitted for verification");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order ID</p>
            <p className="font-mono text-xl font-bold text-teal">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
            <p className={`text-lg font-bold ${cancelled ? "text-red-500" : "text-ink"}`}>{ORDER_STATUS_LABELS[order.status]}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</p>
            <p className="font-display text-lg font-bold">{formatPKR(order.total)}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Placed {new Date(order.created_at).toLocaleString("en-PK")}</p>
      </div>

      {/* Progress tracker */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold">Delivery Progress</h2>
        {cancelled ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            This order was {order.status === "cancelled" ? "cancelled" : "marked for return"}.
          </p>
        ) : (
          <ol className="mt-6">
            {ORDER_STATUS_STEPS.map((s, i) => {
              const reached = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                      reached ? "border-teal bg-teal text-white" : "border-line bg-white text-slate-300"
                    } ${current ? "ring-4 ring-teal/20" : ""}`}>
                      {reached ? <Check className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </span>
                    {i < ORDER_STATUS_STEPS.length - 1 && (
                      <span className={`my-1 w-0.5 flex-1 ${i < stepIdx ? "bg-teal" : "bg-line"}`} style={{ minHeight: "2rem" }} />
                    )}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className={`text-sm font-bold ${reached ? "text-ink" : "text-slate-400"}`}>{ORDER_STATUS_LABELS[s]}</p>
                    {current && <p className="text-xs font-medium text-teal">Current status</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {order.tracking_info && (
          <p className="mt-2 rounded-xl bg-mist px-4 py-3 text-sm text-slate-600"><strong>Tracking:</strong> {order.tracking_info}</p>
        )}
        {order.status_history && order.status_history.length > 1 && (
          <div className="mt-4 border-t border-line pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">History</h3>
            <ul className="mt-2 space-y-1.5">
              {[...order.status_history].reverse().map((e, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-semibold text-ink">{ORDER_STATUS_LABELS[e.status]}{e.note ? <span className="font-normal text-slate-500"> — {e.note}</span> : null}</span>
                  <span className="shrink-0 text-slate-400">{new Date(e.at).toLocaleString("en-PK")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cancel order */}
      {cancellable && (
        <div className="card border-red-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-ink">Need to cancel?</h2>
              <p className="text-xs text-slate-500">You can cancel while the order is pending, confirmed or processing. Stock is restocked automatically.</p>
            </div>
            <button onClick={cancelOrder} disabled={cancelling} className="btn border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
              <XCircle className="h-4 w-4" /> {cancelling ? "Cancelling…" : "Cancel Order"}
            </button>
          </div>
        </div>
      )}
      {orderCancelled && (
        <div className="card border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
          This order has been cancelled. Any advance payment will be refunded after verification.
        </div>
      )}

      {/* Items */}
      <div id="order-invoice" className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Items</h2>
          <button onClick={() => window.print()} className="no-print flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal hover:text-teal">
            <Printer className="h-3.5 w-3.5" /> Print Invoice
          </button>
        </div>
        <dl className="mt-2 hidden print:block">
          <div className="flex justify-between text-xs"><dt className="text-slate-500">Order</dt><dd className="font-mono font-bold">{order.id}</dd></div>
          <div className="flex justify-between text-xs"><dt className="text-slate-500">Customer</dt><dd>{order.customer_name} · {order.phone}</dd></div>
          <div className="flex justify-between text-xs"><dt className="text-slate-500">Address</dt><dd className="text-right">{order.address}{order.city ? `, ${order.city}` : ""}{order.province ? `, ${order.province}` : ""}</dd></div>
        </dl>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold text-ink">{i.name} × {i.quantity}</p>
                {i.color && <p className="text-xs text-slate-500">{i.color}</p>}
              </div>
              <p className="font-bold">{formatPKR(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatPKR(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-teal"><dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</dt><dd>−{formatPKR(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{order.delivery_charge === 0 ? "Free" : formatPKR(order.delivery_charge)}</dd></div>
          <div className="flex justify-between font-bold"><dt>Total</dt><dd>{formatPKR(order.total)}</dd></div>
        </dl>
        <p className="mt-2 text-xs text-slate-500">Payment: {order.payment_method.replace("_", " ")} · Status: {order.payment_status}</p>
        <div className="no-print mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <button onClick={reorder} className="btn-outline px-4 py-2 text-sm">
            <RotateCcw className="h-4 w-4" /> Reorder
          </button>
          <Link href="/shop" className="btn-outline px-4 py-2 text-sm">Continue Shopping</Link>
        </div>
      </div>

      {/* Receipt upload */}
      {needsReceipt && (
        <div className="card border-teal/30 bg-teal/5 p-6">
          <h2 className="font-display text-lg font-bold">Payment Receipt</h2>
          <p className="mt-1 text-sm text-slate-600">
            {order.payment_status === "submitted"
              ? "Your receipt was submitted and is awaiting verification. We'll update once reviewed."
              : "Upload your payment screenshot. An admin will verify it — your order is confirmed only after verification."}
          </p>
          <PaymentInstructions method={order.payment_method} settings={settings} amount={order.total} />
          {!done && order.payment_status !== "submitted" && (
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload Receipt"}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0])} />
            </label>
          )}
          {done && <p className="mt-3 text-sm font-semibold text-teal">Receipt received — thank you!</p>}
        </div>
      )}
    </div>
  );
}
