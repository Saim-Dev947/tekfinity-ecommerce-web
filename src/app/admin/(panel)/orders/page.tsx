import Link from "next/link";
import { getOrders } from "@/lib/db";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types";
import { formatPKR } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: { searchParams: { status?: string; q?: string; flagged?: string } }) {
  let orders = await getOrders();
  if (searchParams.status && searchParams.status !== "all") {
    orders = orders.filter((o) => o.status === searchParams.status);
  }
  if (searchParams.flagged === "1") orders = orders.filter((o) => o.is_flagged);
  if (searchParams.q) {
    const s = searchParams.q.toLowerCase();
    orders = orders.filter((o) =>
      o.id.toLowerCase().includes(s) || o.customer_name.toLowerCase().includes(s) || o.phone.includes(s)
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>

      <form className="mt-4 flex flex-wrap items-center gap-2" action="/admin/orders" method="get">
        <input name="q" defaultValue={searchParams.q || ""} placeholder="Search ID, name, phone…" className="input w-full sm:w-64" aria-label="Search orders" />
        <select name="status" defaultValue={searchParams.status || "all"} className="input w-auto" aria-label="Filter by status">
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="flagged" value="1" defaultChecked={searchParams.flagged === "1"} className="h-4 w-4 accent-teal" /> Flagged only
        </label>
        <button className="btn-primary px-5 py-2.5 text-sm">Filter</button>
        <a
          href={`/api/admin/export/orders?${new URLSearchParams(
            Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v)) as Record<string, string>
          ).toString()}`}
          className="btn-outline ml-auto px-5 py-2.5 text-sm"
        >
          Export CSV
        </a>
      </form>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-mist"><tr>
              <th className="th">Order</th><th className="th">Customer</th><th className="th">Items</th>
              <th className="th">Total</th><th className="th">Payment</th><th className="th">Status</th><th className="th">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => <OrderRow key={o.id} order={o} />)}
              {orders.length === 0 && <tr><td colSpan={7} className="td py-10 text-center text-slate-500">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const badge =
    order.status === "cancelled" ? "bg-red-100 text-red-700" :
    order.status === "delivered" ? "bg-teal/10 text-teal" :
    order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700";
  const payBadge =
    order.payment_status === "verified" ? "bg-teal/10 text-teal" :
    order.payment_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return (
    <tr className="hover:bg-mist/50">
      <td className="td font-mono text-xs font-bold">
        <Link href={`/admin/orders/${order.id}`} className="text-teal hover:underline">{order.id}</Link>
        {order.is_flagged && <span className="badge ml-1 bg-amber-100 text-amber-700">!</span>}
      </td>
      <td className="td">{order.customer_name}<br /><span className="text-xs text-slate-500">{order.phone}</span></td>
      <td className="td text-xs">{order.items.reduce((n, i) => n + i.quantity, 0)} item(s)</td>
      <td className="td font-semibold">{formatPKR(order.total)}</td>
      <td className="td">
        <span className="text-xs">{order.payment_method.replace("_", " ")}</span><br />
        <span className={`badge ${payBadge}`}>{order.payment_status}</span>
      </td>
      <td className="td"><span className={`badge ${badge}`}>{ORDER_STATUS_LABELS[order.status]}</span></td>
      <td className="td text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-PK")}</td>
    </tr>
  );
}
