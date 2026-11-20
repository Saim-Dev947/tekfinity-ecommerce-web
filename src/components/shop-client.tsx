"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./product-card";
import type { Category, Product } from "@/lib/types";

type SortKey = "popular" | "newest" | "price-asc" | "price-desc";
const PAGE_SIZE = 12;

export function ShopClient({
  products, categories, initialQuery, initialCategory,
}: {
  products: Product[];
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catSlug = useMemo(() => {
    const c = categories.find((c) => c.slug === category);
    return c?.id;
  }, [categories, category]);

  const allColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors ?? []))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.brand ?? "").toLowerCase().includes(s)
      );
    }
    if (catSlug) list = list.filter((p) => p.category_id === catSlug || p.category_slug === category);
    list = list.filter((p) => p.price <= maxPrice);
    if (inStockOnly) list = list.filter((p) => p.stock > 0 && p.is_active !== false);
    if (colors.length) list = list.filter((p) => (p.colors ?? []).some((c) => colors.includes(c)));

    switch (sort) {
      case "price-asc": return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "newest": return [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      default: return [...list].sort((a, b) => ((b.is_bestseller ? 1 : 0) + (b.review_count ?? 0) / 100) - ((a.is_bestseller ? 1 : 0) + (a.review_count ?? 0) / 100));
    }
  }, [products, q, catSlug, category, maxPrice, inStockOnly, colors, sort]);

  const shown = filtered.slice(0, visible);

  const Filters = (
    <div className="space-y-6">
      <div>
        <label htmlFor="f-q" className="label flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Search</label>
        <input id="f-q" className="input" placeholder="Search products…" value={q} onChange={(e) => { setQ(e.target.value); setVisible(PAGE_SIZE); }} />
      </div>
      <fieldset>
        <legend className="label">Category</legend>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategory(""); setVisible(PAGE_SIZE); }}
            className={`badge px-3 py-1.5 text-xs normal-case ${!category ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line"}`}
          >All</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategory(c.slug); setVisible(PAGE_SIZE); }}
              className={`badge px-3 py-1.5 text-xs normal-case ${category === c.slug ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </fieldset>
      {allColors.length > 0 && (
        <fieldset>
          <legend className="label">Color</legend>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => {
              const active = colors.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => {
                    setColors((prev) => active ? prev.filter((x) => x !== c) : [...prev, c]);
                    setVisible(PAGE_SIZE);
                  }}
                  aria-pressed={active}
                  className={`badge px-3 py-1.5 text-xs normal-case ${active ? "bg-teal text-white" : "bg-mist text-ink hover:bg-line"}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div>
        <label htmlFor="f-price" className="label">Max price: Rs. {maxPrice.toLocaleString("en-PK")}</label>
        <input
          id="f-price" type="range" min={500} max={150000} step={500}
          value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setVisible(PAGE_SIZE); }}
          className="w-full accent-teal"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setVisible(PAGE_SIZE); }} className="h-4 w-4 accent-teal" />
        In stock only
      </label>
      {(q || category || maxPrice < 150000 || inStockOnly || colors.length > 0) && (
        <button
          onClick={() => { setQ(""); setCategory(""); setMaxPrice(150000); setInStockOnly(false); setColors([]); }}
          className="btn-ghost text-xs text-teal"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="card sticky top-28 p-5">{Filters}</div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button onClick={() => setFiltersOpen((v) => !v)} className="btn-outline px-4 py-2 text-xs lg:hidden" aria-expanded={filtersOpen}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <p className="text-sm text-slate-500" aria-live="polite">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" /> Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink focus:border-teal focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>
        </div>

        {filtersOpen && <div className="card mb-5 p-5 lg:hidden">{Filters}</div>}

        {shown.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-lg font-bold text-ink">No products found</p>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {filtered.length > visible && (
              <div className="mt-10 text-center">
                <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline px-8">
                  Load More ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
