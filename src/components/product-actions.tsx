"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "./providers";
import type { Product } from "@/lib/types";

export function ProductActions({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const [color, setColor] = useState(product.colors?.[0]);
  const out = product.stock <= 0 || product.is_active === false;

  return (
    <div className="flex items-center gap-2">
      {product.colors && product.colors.length > 1 && (
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="hidden rounded-lg border border-line bg-white px-2 py-1.5 text-xs sm:block"
          aria-label="Select color"
        >
          {product.colors.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      <button
        onClick={() =>
          addToCart({
            product_id: product.id, slug: product.slug, name: product.name,
            price: product.price, compare_at_price: product.compare_at_price,
            image: product.images[0], color, quantity: 1, stock: product.stock,
          })
        }
        disabled={out}
        className={`btn-teal ${compact ? "px-4 py-2 text-xs" : "w-full py-3.5"}`}
      >
        <ShoppingBag className="h-4 w-4" /> {out ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const active = isWishlisted(productId);
  return (
    <button
      onClick={() => toggleWishlist(productId)}
      className={`rounded-full p-2 transition hover:bg-mist ${active ? "text-red-500" : "text-slate-400 hover:text-red-500"} ${className}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
    >
      <Heart className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
