import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag } from "lucide-react";
import { getOrderById } from "@/lib/db";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, type OrderStatus, type PaymentStatus } from "@/lib/types";
import { formatPKR } from "@/components/product-card";
import { OrderControls } from "./order-controls";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id.toUpperCase());
  if (!order) notFound();

  const stepIdx = ORDER_STATUS_STEPS.indexOf(order.status);

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold text-teal">{order.id}</h1>
          <p className="text-sm text-slate-500">Placed {new Date(order.created_at).toLocaleString("en-PK")}</p>
        </div>
        {order.is_flagged && (
          <span className="badge bg-amber-100 px-3 py-1.5 text-amber-800">
            <Flag className="mr-1 h-3.5 w-3.5" /> Flagged: {order.flag_reason}
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Status tracker */}
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Fulfilment Status</h2>
            <ol className="mt-4">
              {ORDER_STATUS_STEPS.map((s, i) => {
                const reached = i <= stepIdx && order.status !== "cancelled";
                const current = i === stepIdx && order.status !== "cancelled";
                return (
                  <li key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${reached ? "bg-teal text-white" : "bg-line text-slate-400"} ${current ? "ring-4 ring-teal/20" : ""}`}>
                        {i + 1}
                      </span>
                      {i < ORDER_STATUS_STEPS.length - 1 && <span className={`my-0.5 w-0.5 flex-1 ${i < stepIdx ? "bg-teal" : "bg-line"}`} style={{ minHeight: "1.5rem" }} />}
                    </div>
                    <p className={`pb-4 pt-0.5 text-sm font-semibold ${reached ? "text-ink" : "text-slate-400"}`}>
                      {ORDER_STATUS_LABELS[s]}{current ? " — current" : ""}
                    </p>
                  </li>
                );
              })}
              {order.status === "cancelled" && <p className="text-sm font-bold text-red-600">Order cancelled</p>}
              {order.status === "return_requested" && <p className="text-sm font-bold text-amber-600">Return requested</p>}
            </ol>
          </section>

          {/* Items */}
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Items</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold">{i.name} <span className="text-slate-500">× {i.quantity}</span></p>
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
              <div className="flex justify-between font-bold text-base"><dt>Total</dt><dd>{formatPKR(order.total)}</dd></div>
            </dl>
          </section>

          {/* Customer */}
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Customer</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase text-slate-400">Name</dt><dd className="mt-0.5 font-medium">{order.customer_name}</dd></div>
              <div><dt className="text-xs font-semibold uppercase text-slate-400">Phone</dt><dd className="mt-0.5 font-medium">{order.phone}</dd></div>
              {order.email && <div><dt className="text-xs font-semibold uppercase text-slate-400">Email</dt><dd className="mt-0.5 font-medium">{order.email}</dd></div>}
              <div><dt className="text-xs font-semibold uppercase text-slate-400">City</dt><dd className="mt-0.5 font-medium">{order.city}{order.province ? `, ${order.province}` : ""}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-400">Address</dt><dd className="mt-0.5 font-medium">{order.address} {order.postal_code ? `— ${order.postal_code}` : ""}</dd></div>
              {order.notes && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-400">Notes</dt><dd className="mt-0.5 font-medium">{order.notes}</dd></div>}
            </dl>
          </section>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-6">
          <OrderControls
            orderId={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            paymentMethod={order.payment_method}
            trackingInfo={order.tracking_info || ""}
            isFlagged={!!order.is_flagged}
          />

          {order.receipt_url && (
            <section className="card p-6">
              <h2 className="font-display text-lg font-bold">Payment Receipt</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.receipt_url} alt="Payment receipt" className="mt-3 w-full rounded-xl border border-line" />
              <p className="mt-2 text-xs text-slate-500">Submitted receipt — verify manually before approving.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
