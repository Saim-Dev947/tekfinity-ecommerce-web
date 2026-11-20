import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductActions, WishlistButton } from "./product-actions";

export function formatPKR(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : 0;
  const outOfStock = product.stock <= 0 || product.is_active === false;

  return (
    <article className="group card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-mist" tabIndex={-1} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="badge bg-red-500 text-white">-{discount}%</span>}
          {product.is_new && <span className="badge bg-teal text-white">New</span>}
          {product.is_bestseller && <span className="badge bg-ink text-white">Best Seller</span>}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="badge bg-ink px-4 py-1.5 text-sm text-white">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category_slug && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{product.category_slug.replace("-", " ")}</p>
        )}
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-teal">
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">{formatPKR(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-slate-400 line-through">{formatPKR(product.compare_at_price)}</span>
          )}
        </div>
        {product.rating ? (
          <p className="mt-1 text-xs text-slate-500">★ {product.rating.toFixed(1)} ({product.review_count ?? 0} reviews)</p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <ProductActions product={product} compact />
          <WishlistButton productId={product.id} className="ml-auto" />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-square bg-mist" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 rounded bg-mist" />
        <div className="h-4 w-full rounded bg-mist" />
        <div className="h-4 w-2/3 rounded bg-mist" />
        <div className="h-9 w-full rounded-full bg-mist" />
      </div>
    </div>
  );
}
