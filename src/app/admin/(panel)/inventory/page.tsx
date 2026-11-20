import { getBackInStockSignups, getProducts } from "@/lib/db";
import { StockControls } from "./stock-controls";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory — Admin" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = (await getProducts())
    .filter((p) => p.is_active !== false)
    .sort((a, b) => a.stock - b.stock);

  const low = products.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 5));
  const out = products.filter((p) => p.stock <= 0);
  const signups = await getBackInStockSignups();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Inventory</h1>
      <p className="mt-1 text-sm text-slate-500">
        {low.length} low-stock · {out.length} out of stock · {products.length} active products
      </p>

      {low.length + out.length > 0 && (
        <div className="card mt-5 border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Stock alerts:</strong>{" "}
          {[...out, ...low].slice(0, 6).map((p) => p.name).join(", ")}
          {(low.length + out.length) > 6 ? ` and ${low.length + out.length - 6} more` : ""}
        </div>
      )}

      <div className="card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-mist"><tr>
              <th className="th">Product</th><th className="th">Current Stock</th><th className="th">Status</th><th className="th">Adjust</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const status = p.stock <= 0 ? "Out of stock" : p.stock <= (p.low_stock_threshold ?? 5) ? "Low stock" : "OK";
                const color = p.stock <= 0 ? "text-red-600" : p.stock <= (p.low_stock_threshold ?? 5) ? "text-amber-600" : "text-teal";
                return (
                  <tr key={p.id} className="hover:bg-mist/50">
                    <td className="td font-medium">{p.name}</td>
                    <td className={`td font-display text-lg font-bold ${color}`}>{p.stock}</td>
                    <td className="td"><span className={`badge ${p.stock <= 0 ? "bg-red-100 text-red-700" : p.stock <= (p.low_stock_threshold ?? 5) ? "bg-amber-100 text-amber-700" : "bg-teal/10 text-teal"}`}>{status}</span></td>
                    <td className="td"><StockControls productId={p.id} stock={p.stock} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {signups.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="font-display text-lg font-bold">Back-in-stock requests ({signups.length})</h2>
          <p className="mt-1 text-xs text-slate-500">Customers waiting to be notified when out-of-stock items return.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-mist"><tr>
                <th className="th">Product</th><th className="th">Contact</th><th className="th">Requested</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {signups.map((s) => (
                  <tr key={s.id}>
                    <td className="td font-medium">{s.product_name}</td>
                    <td className="td">{s.contact}</td>
                    <td className="td text-xs text-slate-500">{new Date(s.created_at).toLocaleString("en-PK")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
