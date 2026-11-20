import Link from "next/link";
import { Bell, Banknote, Package, ShoppingCart, Users, AlertTriangle, Clock } from "lucide-react";
import { getCustomers, getNotifications, getOrders, getProducts, getSettings } from "@/lib/db";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types";
import { formatPKR } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

function Stat({ label, value, icon: Icon, href, warn }: { label: string; value: string | number; icon: any; href?: string; warn?: boolean }) {
  const inner = (
    <div className={`card p-5 ${href ? "transition hover:shadow-lift" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${warn ? "bg-amber-100 text-amber-600" : "bg-teal/10 text-teal"}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboard() {
  const [orders, products, customers, settings, notifications] = await Promise.all([
    getOrders(), getProducts(), getCustomers(), getSettings(), getNotifications(8),
  ]);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = activeOrders.filter((o) => o.payment_status === "verified" || o.payment_method === "cod")
    .reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.filter((o) => o.payment_status === "verified" || o.payment_method === "cod")
    .reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5));
  const outOfStock = products.filter((p) => p.stock <= 0);
  const flagged = orders.filter((o) => o.is_flagged);
  const recent = orders.slice(0, 8);

  // Revenue last 14 days
  const days: { label: string; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === key && o.status !== "cancelled");
    days.push({
      label: d.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    });
  }
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  const paymentBreakdown = {
    cod: orders.filter((o) => o.payment_method === "cod").length,
    jazzcash: orders.filter((o) => o.payment_method === "jazzcash").length,
    easypaisa: orders.filter((o) => o.payment_method === "easypaisa").length,
    bank_transfer: orders.filter((o) => o.payment_method === "bank_transfer").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back — here&apos;s today at {settings.store_name || "Tekfinity"}.</p>
        </div>
        <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Today's Sales" value={formatPKR(todayRevenue)} icon={Banknote} />
        <Stat label="Total Revenue" value={formatPKR(revenue)} icon={Banknote} href="/admin/payments" />
        <Stat label="Total Orders" value={orders.length} icon={ShoppingCart} href="/admin/orders" />
        <Stat label="Pending Orders" value={pending} icon={Clock} href="/admin/orders?status=pending" warn={pending > 0} />
        <Stat label="Customers" value={customers.length} icon={Users} href="/admin/customers" />
        <Stat label="Products" value={products.length} icon={Package} href="/admin/products" />
        <Stat label="Low Stock" value={lowStock.length} icon={AlertTriangle} href="/admin/inventory" warn={lowStock.length > 0} />
        <Stat label="Out of Stock" value={outOfStock.length} icon={AlertTriangle} href="/admin/inventory" warn={outOfStock.length > 0} />
      </div>

      {flagged.length > 0 && (
        <div className="card mt-6 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">{flagged.length} order{flagged.length > 1 ? "s" : ""} flagged for review</p>
          <p className="text-xs text-amber-700">Possible repeat orders — review in <Link href="/admin/orders?flagged=1" className="font-semibold underline">Orders</Link>.</p>
        </div>
      )}

      {/* Recent activity */}
      {notifications.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Bell className="h-4 w-4 text-teal" /> Recent Activity</h2>
          <ul className="mt-3 space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-slate-600">{n.message}</span>
                <span className="shrink-0 text-xs text-slate-400">{n.created_at ? new Date(n.created_at).toLocaleString("en-PK") : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Revenue — last 14 days</h2>
          <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label="Bar chart of daily revenue">
            {days.map((d) => (
              <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">
                  {d.total ? formatPKR(d.total) : ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-teal/80 transition group-hover:bg-teal"
                  style={{ height: `${Math.max(4, (d.total / maxDay) * 140)}px` }}
                  title={`${d.label}: ${formatPKR(d.total)} (${d.count} orders)`}
                />
                <span className="text-[10px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold">Payment Methods</h2>
          <ul className="mt-4 space-y-3">
            {([
              ["Cash on Delivery", paymentBreakdown.cod],
              ["JazzCash", paymentBreakdown.jazzcash],
              ["Easypaisa", paymentBreakdown.easypaisa],
              ["Bank Transfer", paymentBreakdown.bank_transfer],
            ] as const).map(([label, n]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-bold text-ink">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-teal hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-mist"><tr>
              <th className="th">Order</th><th className="th">Customer</th><th className="th">Total</th>
              <th className="th">Payment</th><th className="th">Status</th><th className="th">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {recent.map((o) => <OrderRow key={o.id} order={o} />)}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="td py-10 text-center text-slate-500">No orders yet.</td></tr>
              )}
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
  return (
    <tr className="hover:bg-mist/50">
      <td className="td font-mono text-xs font-bold"><Link href={`/admin/orders/${order.id}`} className="text-teal hover:underline">{order.id}</Link></td>
      <td className="td">{order.customer_name}<br /><span className="text-xs text-slate-500">{order.phone}</span></td>
      <td className="td font-semibold">{formatPKR(order.total)}</td>
      <td className="td text-xs">{order.payment_method.replace("_", " ")}<br /><span className="text-slate-500">{order.payment_status}</span></td>
      <td className="td"><span className={`badge ${badge}`}>{ORDER_STATUS_LABELS[order.status]}</span>{order.is_flagged && <span className="badge ml-1 bg-amber-100 text-amber-700">flagged</span>}</td>
      <td className="td text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-PK")}</td>
    </tr>
  );
}
