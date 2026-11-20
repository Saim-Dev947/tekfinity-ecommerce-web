import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getProducts } from "@/lib/db";
import { deleteProductAction } from "@/app/admin/actions";
import { formatPKR } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  let products = await getProducts();
  if (searchParams.q) {
    const s = searchParams.q.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(s) || p.slug.includes(s) || (p.sku ?? "").includes(s));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-slate-500">{products.length} products in catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/export/products" className="btn-outline px-5 py-2.5 text-sm">Export CSV</a>
          <Link href="/admin/products/import" className="btn-outline px-5 py-2.5 text-sm">Import CSV</Link>
          <Link href="/admin/products/new" className="btn-teal px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> Add Product</Link>
        </div>
      </div>

      <form className="mt-4" action="/admin/products" method="get">
        <input name="q" defaultValue={searchParams.q || ""} placeholder="Search name, slug, SKU…" className="input w-full sm:w-80" aria-label="Search products" />
      </form>

      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-mist"><tr>
              <th className="th">Product</th><th className="th">Price</th><th className="th">Stock</th>
              <th className="th">Flags</th><th className="th">Status</th><th className="th"></th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-mist/50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-ink hover:text-teal">{p.name}</Link>
                        <p className="text-xs text-slate-500">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td font-semibold">{formatPKR(p.price)}{p.compare_at_price ? <span className="ml-1 text-xs text-slate-400 line-through">{formatPKR(p.compare_at_price)}</span> : null}</td>
                  <td className="td">
                    <span className={p.stock <= 0 ? "font-bold text-red-600" : p.stock <= (p.low_stock_threshold ?? 5) ? "font-bold text-amber-600" : "font-semibold"}>
                      {p.stock <= 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && <span className="badge bg-blue-100 text-blue-700">Featured</span>}
                      {p.is_bestseller && <span className="badge bg-teal/10 text-teal">Best Seller</span>}
                      {p.is_new && <span className="badge bg-purple-100 text-purple-700">New</span>}
                      {p.is_flash_sale && <span className="badge bg-red-100 text-red-700">Sale</span>}
                    </div>
                  </td>
                  <td className="td">{p.is_active === false ? <span className="badge bg-slate-200 text-slate-600">Hidden</span> : <span className="badge bg-teal/10 text-teal">Live</span>}</td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${p.id}/edit`} className="btn-ghost px-3 py-1.5 text-xs">Edit</Link>
                      <form action={deleteProductAction.bind(null, p.id)}>
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Delete ${p.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={6} className="td py-10 text-center text-slate-500">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
