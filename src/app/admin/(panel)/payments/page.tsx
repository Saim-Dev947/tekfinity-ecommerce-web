import { getOrders } from "@/lib/db";
import { formatPKR } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments — Admin" };
export const dynamic = "force-dynamic";

const METHODS = [
  ["cod", "Cash on Delivery"],
  ["jazzcash", "JazzCash"],
  ["easypaisa", "Easypaisa"],
  ["bank_transfer", "Bank Transfer"],
] as const;

export default async function AdminPaymentsPage() {
  const orders = await getOrders();
  const valid = orders.filter((o) => o.status !== "cancelled");

  const rows = METHODS.map(([key, label]) => {
    const list = valid.filter((o) => o.payment_method === key);
    return {
      key, label,
      count: list.length,
      total: list.reduce((s, o) => s + o.total, 0),
      verified: list.filter((o) => o.payment_status === "verified").length,
      pending: list.filter((o) => o.payment_status === "pending" || o.payment_status === "submitted").length,
      rejected: list.filter((o) => o.payment_status === "rejected").length,
    };
  });

  // Daily totals last 30 days
  const days: { label: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    days.push({
      label: d.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      total: valid.filter((o) => new Date(o.created_at).toDateString() === key).reduce((s, o) => s + o.total, 0),
    });
  }
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  // Monthly totals
  const months = new Map<string, number>();
  for (const o of valid) {
    const m = new Date(o.created_at).toLocaleDateString("en-PK", { month: "long", year: "numeric" });
    months.set(m, (months.get(m) || 0) + o.total);
  }
  const monthly = [...months.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const pendingReceipts = orders.filter((o) => o.payment_status === "submitted" && o.receipt_url);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-slate-500">Manual payment verification — uploaded receipts are never auto-confirmed.</p>

      {pendingReceipts.length > 0 && (
        <div className="card mt-5 border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>{pendingReceipts.length} receipt{pendingReceipts.length > 1 ? "s" : ""} awaiting verification.</strong>{" "}
          Review them in <a href={`/admin/orders/${pendingReceipts[0].id}`} className="font-semibold underline">Orders</a>.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((r) => (
          <div key={r.key} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{r.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{formatPKR(r.total)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {r.count} order{r.count === 1 ? "" : "s"} · {r.verified} verified · {r.pending} pending · {r.rejected} rejected
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold">Daily Sales — last 30 days</h2>
          <div className="mt-5 flex h-36 items-end gap-1" role="img" aria-label="Daily sales bar chart">
            {days.map((d) => (
              <div key={d.label} className="group flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-teal/70 transition group-hover:bg-teal" style={{ height: `${Math.max(3, (d.total / maxDay) * 120)}px` }} title={`${d.label}: ${formatPKR(d.total)}`} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>{days[0].label}</span><span>{days[29].label}</span></div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold">Monthly Summary</h2>
          <table className="mt-4 w-full">
            <thead><tr className="border-b border-line"><th className="th">Month</th><th className="th text-right">Revenue</th></tr></thead>
            <tbody className="divide-y divide-line">
              {monthly.map(([m, t]) => (
                <tr key={m}><td className="td">{m}</td><td className="td text-right font-semibold">{formatPKR(t)}</td></tr>
              ))}
              {monthly.length === 0 && <tr><td colSpan={2} className="td py-6 text-center text-slate-500">No sales yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
