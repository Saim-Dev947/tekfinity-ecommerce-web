import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getProducts } from "@/lib/db";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await getProducts();
  const header = ["ID", "Name", "Slug", "Category", "Price", "Compare At Price", "Stock", "SKU", "Brand", "Status", "Featured", "Description"];
  const rows = products.map((p) => [
    p.id, p.name, p.slug, p.category_slug ?? p.category_id ?? "", p.price, p.compare_at_price ?? "",
    p.stock, p.sku ?? "", p.brand ?? "", p.is_active === false ? "inactive" : "active",
    p.is_featured ? "yes" : "", (p.description ?? "").slice(0, 500),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tekfinity-products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
