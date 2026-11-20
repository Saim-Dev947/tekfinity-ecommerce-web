"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { toggleOrderFlag, updateOrderStatus, updatePaymentStatus } from "@/app/admin/actions";
import { ORDER_STATUS_LABELS, type OrderStatus, type PaymentMethod, type PaymentStatus } from "@/lib/types";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const PAYMENTS: PaymentStatus[] = ["pending", "submitted", "verified", "rejected"];

export function OrderControls({
  orderId, status, paymentStatus, paymentMethod, trackingInfo, isFlagged,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  trackingInfo: string;
  isFlagged: boolean;
}) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState(status);
  const [newPayment, setNewPayment] = useState(paymentStatus);
  const [tracking, setTracking] = useState(trackingInfo);
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const run = async (key: string, fn: () => Promise<{ ok?: boolean; error?: string } | void>) => {
    setLoading(key); setMsg("");
    try {
      const res = await fn();
      if (res && "error" in res && res.error) setMsg(res.error);
      else { setMsg("Saved ✓"); router.refresh(); }
    } catch {
      setMsg("Action failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card space-y-5 p-6">
      <h2 className="font-display text-lg font-bold">Manage Order</h2>

      <div>
        <label htmlFor="oc-status" className="label">Order status</label>
        <select id="oc-status" className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}>
          {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="oc-pay" className="label">Payment status</label>
        <select id="oc-pay" className="input" value={newPayment} onChange={(e) => setNewPayment(e.target.value as PaymentStatus)}>
          {PAYMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {paymentMethod !== "cod" && (
          <p className="mt-1.5 text-xs text-slate-500">Manual payment — only mark <strong>verified</strong> after checking the receipt/transfer.</p>
        )}
      </div>

      <div>
        <label htmlFor="oc-track" className="label">Tracking info (optional)</label>
        <input id="oc-track" className="input" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Courier, tracking #…" />
      </div>

      {msg && <p className={`rounded-lg px-3 py-2 text-sm font-medium ${msg.includes("✓") ? "bg-teal/10 text-teal" : "bg-red-50 text-red-600"}`}>{msg}</p>}

      <div className="space-y-2">
        <button
          disabled={loading !== null}
          onClick={() => run("save", () => updateOrderStatus(orderId, newStatus, tracking))}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
        </button>
        <button
          disabled={loading !== null}
          onClick={() => run("pay", () => updatePaymentStatus(orderId, newPayment))}
          className="btn-outline w-full py-3 text-sm"
        >
          {loading === "pay" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Update payment status
        </button>
        <button
          disabled={loading !== null}
          onClick={() => run("flag", () => toggleOrderFlag(orderId))}
          className={`w-full rounded-full border py-3 text-sm font-semibold transition ${isFlagged ? "border-amber-300 bg-amber-50 text-amber-700" : "border-line text-slate-600 hover:border-ink"}`}
        >
          <Flag className="mr-1.5 inline h-4 w-4" /> {isFlagged ? "Unflag order" : "Flag for review"}
        </button>
      </div>
    </div>
  );
}
