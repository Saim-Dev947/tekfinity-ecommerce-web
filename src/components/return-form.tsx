"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useStore } from "./providers";

export function ReturnForm({ orderId, phone }: { orderId: string; phone: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, phone, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSent(true);
      toast("success", "Return request submitted");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return <span className="text-xs font-semibold text-teal">Return requested ✓</span>;
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal">
        <RotateCcw className="h-3.5 w-3.5" /> Request return/exchange
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="mt-2 w-full">
      <textarea
        required minLength={10} rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for return/exchange (min 10 characters)" aria-label="Return reason"
        className="input w-full text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={loading} className="btn-teal px-4 py-2 text-xs">
          {loading ? "Sending…" : "Submit Request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-4 py-2 text-xs">Cancel</button>
      </div>
    </form>
  );
}
