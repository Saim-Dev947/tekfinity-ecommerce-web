import { getCustomers, getOrders } from "@/lib/db";
import { formatPKR } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const [customers, orders] = await Promise.all([getCustomers(), getOrders()]);

  const stats = new Map<string, { orders: number; spent: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const key = o.phone.replace(/\D/g, "");
    const cur = stats.get(key) || { orders: 0, spent: 0 };
    cur.orders += 1;
    cur.spent += o.total;
    stats.set(key, cur);
  }

  let list = customers;
  if (searchParams.q) {
    const s = searchParams.q.toLowerCase();
    list = list.filter((c) =>
      c.phone.includes(s) || (c.name ?? "").toLowerCase().includes(s) || (c.email ?? "").toLowerCase().includes(s)
    );
  }

  // Merge customers discovered only via orders
  const knownPhones = new Set(list.map((c) => c.phone.replace(/\D/g, "")));
  const orderOnly = [...stats.entries()].filter(([p]) => !knownPhones.has(p));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Customers</h1>
      <p className="mt-1 text-sm text-slate-500">{list.length} registered · {orderOnly.length} guest checkouts</p>

      <form className="mt-4" action="/admin/customers" method="get">
        <input name="q" defaultValue={searchParams.q || ""} placeholder="Search phone, name, email…" className="input w-full sm:w-80" aria-label="Search customers" />
      </form>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-mist"><tr>
              <th className="th">Customer</th><th className="th">Phone</th><th className="th">Orders</th>
              <th className="th">Total Spent</th><th className="th">Since</th><th className="th">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => {
                const st = stats.get(c.phone.replace(/\D/g, "")) || { orders: 0, spent: 0 };
                return (
                  <tr key={c.id} className="hover:bg-mist/50">
                    <td className="td font-medium">{c.name || "—"}{c.email ? <span className="block text-xs text-slate-500">{c.email}</span> : null}</td>
                    <td className="td font-mono text-sm">{c.phone}</td>
                    <td className="td">{st.orders}</td>
                    <td className="td font-semibold">{formatPKR(st.spent)}</td>
                    <td className="td text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-PK") : "—"}</td>
                    <td className="td">{c.is_active === false ? <span className="badge bg-red-100 text-red-700">Disabled</span> : <span className="badge bg-teal/10 text-teal">Active</span>}</td>
                  </tr>
                );
              })}
              {orderOnly.slice(0, 20).map(([phone, st]) => (
                <tr key={phone} className="bg-mist/40">
                  <td className="td font-medium text-slate-600">Guest checkout</td>
                  <td className="td font-mono text-sm">+92{phone.slice(-10)}</td>
                  <td className="td">{st.orders}</td>
                  <td className="td font-semibold">{formatPKR(st.spent)}</td>
                  <td className="td text-xs text-slate-500">—</td>
                  <td className="td"><span className="badge bg-slate-200 text-slate-600">Guest</span></td>
                </tr>
              ))}
              {list.length === 0 && orderOnly.length === 0 && <tr><td colSpan={6} className="td py-10 text-center text-slate-500">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
