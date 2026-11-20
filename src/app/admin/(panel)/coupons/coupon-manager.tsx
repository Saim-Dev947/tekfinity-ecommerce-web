"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCouponAction, saveCouponAction } from "@/app/admin/actions";
import type { Coupon } from "@/lib/types";

const empty = {
  code: "", discount_type: "percent" as "percent" | "fixed",
  discount_value: 10, min_order_amount: "", expires_at: "", usage_limit: "",
};

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
      min_order_amount: c.min_order_amount?.toString() || "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      usage_limit: c.usage_limit?.toString() || "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData();
    fd.set("code", form.code);
    fd.set("discount_type", form.discount_type);
    fd.set("discount_value", String(form.discount_value));
    if (form.min_order_amount) fd.set("min_order_amount", form.min_order_amount);
    if (form.expires_at) fd.set("expires_at", form.expires_at);
    if (form.usage_limit) fd.set("usage_limit", form.usage_limit);
    if (editing) fd.set("id", editing.id);
    fd.set("used_count", String(editing?.used_count ?? 0));
    fd.set("is_active", "on");

    const res = await saveCouponAction(fd);
    setLoading(false);
    if (res && "error" in res && res.error) { setError(String(res.error)); return; }
    setOpen(false); setEditing(null); setForm(empty);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCouponAction(id);
    router.refresh();
  };

  const input = "input";

  return (
    <div className="mt-6">
      <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="btn-teal px-5 py-2.5 text-sm">
        <Plus className="h-4 w-4" /> New Coupon
      </button>

      {open && (
        <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{editing ? "Edit Coupon" : "New Coupon"}</h2>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-mist" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Code</label>
              <input required className={input} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className={input} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (PKR)</option>
              </select>
            </div>
            <div>
              <label className="label">{form.discount_type === "percent" ? "Percent off" : "Amount off (PKR)"}</label>
              <input required type="number" min={1} className={input} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Min order (PKR)</label>
              <input type="number" min={0} className={input} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <label className="label">Expires</label>
              <input type="date" className={input} value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div>
              <label className="label">Usage limit</label>
              <input type="number" min={1} className={input} value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {editing ? "Save" : "Create"}
          </button>
        </form>
      )}

      <div className="card mt-4 overflow-hidden">
        <table className="w-full min-w-[640px]">
          <thead className="bg-mist"><tr>
            <th className="th">Code</th><th className="th">Discount</th><th className="th">Min Order</th>
            <th className="th">Expires</th><th className="th">Used</th><th className="th">Status</th><th className="th"></th>
          </tr></thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-mist/50">
                <td className="td font-mono font-bold">{c.code}</td>
                <td className="td">{c.discount_type === "percent" ? `${c.discount_value}%` : `Rs. ${c.discount_value.toLocaleString("en-PK")}`}</td>
                <td className="td">{c.min_order_amount ? `Rs. ${c.min_order_amount.toLocaleString("en-PK")}` : "—"}</td>
                <td className="td text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-PK") : "Never"}</td>
                <td className="td">{c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                <td className="td">{c.is_active === false ? <span className="badge bg-slate-200 text-slate-600">Off</span> : <span className="badge bg-teal/10 text-teal">Active</span>}</td>
                <td className="td">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(c)} className="rounded-lg p-2 text-slate-400 hover:bg-mist hover:text-ink" aria-label={`Edit ${c.code}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Delete ${c.code}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={7} className="td py-10 text-center text-slate-500">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
