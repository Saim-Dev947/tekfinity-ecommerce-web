import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getOrders } from "@/lib/db";
import { ORDER_STATUS_LABELS } from "@/lib/types";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  let orders = await getOrders();
  if (sp.get("status") && sp.get("status") !== "all") {
    orders = orders.filter((o) => o.status === sp.get("status"));
  }
  if (sp.get("flagged") === "1") orders = orders.filter((o) => o.is_flagged);
  const q = (sp.get("q") || "").toLowerCase();
  if (q) {
    orders = orders.filter((o) =>
      o.id.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.phone.includes(q)
    );
  }

  const header = ["Order ID", "Date", "Customer", "Phone", "City", "Items", "Payment Method", "Payment Status", "Order Status", "Subtotal", "Discount", "Delivery", "Total", "Coupon", "Flagged"];
  const rows = orders.map((o) => [
    o.id,
    new Date(o.created_at).toISOString(),
    o.customer_name,
    o.phone,
    o.city,
    o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
    o.payment_method,
    o.payment_status,
    ORDER_STATUS_LABELS[o.status] ?? o.status,
    o.subtotal,
    o.discount,
    o.delivery_charge,
    o.total,
    o.coupon_code ?? "",
    o.is_flagged ? "yes" : "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tekfinity-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
