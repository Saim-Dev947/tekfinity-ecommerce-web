"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useStore } from "@/components/providers";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, toast } = useStore();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    fetch("/api/wishlist-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: wishlist }),
    })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]));
  }, [mounted, wishlist]);

  const list = useMemo(() => (products || []).filter((p) => wishlist.includes(p.id)), [products, wishlist]);

  if (!mounted || products === null) {
    return <div className="container-x py-16"><div className="h-64 animate-pulse rounded-2xl bg-mist" /></div>;
  }

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex items-center gap-3">
        <Heart className="h-7 w-7 text-teal" />
        <h1 className="font-display text-3xl font-bold tracking-tight">My Wishlist</h1>
        <span className="badge bg-mist text-ink">{list.length}</span>
      </div>

      {list.length === 0 ? (
        <div className="card mt-8 p-14 text-center">
          <Heart className="mx-auto h-10 w-10 text-line" />
          <p className="mt-3 font-bold text-ink">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-slate-500">Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="btn-teal mt-5 px-8">Browse Products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <button
                onClick={() => { toggleWishlist(p.id); toast("info", "Removed from wishlist"); }}
                className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 text-red-500 shadow-card backdrop-blur hover:bg-white"
                aria-label={`Remove ${p.name} from wishlist`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
