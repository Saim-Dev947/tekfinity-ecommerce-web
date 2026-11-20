"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatPKR } from "./product-card";

export interface RecentItem {
  slug: string;
  name: string;
  price: number;
  image: string;
}

export const RECENT_KEY = "tf_recent";

export function pushRecent(item: RecentItem) {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as RecentItem[];
    const list = parsed.filter((i) => i.slug !== item.slug);
    list.unshift(item);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch { /* ignore */ }
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const list: RecentItem[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setItems(list.filter((i) => i.slug !== excludeSlug).slice(0, 8));
    } catch { /* ignore */ }
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="recently-viewed">
      <h2 id="recently-viewed" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
        <Clock className="h-5 w-5 text-teal" /> Recently Viewed
      </h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((i) => (
          <Link
            key={i.slug}
            href={`/product/${i.slug}`}
            className="group w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-white transition hover:border-teal/50 hover:shadow-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.image} alt={i.name} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-3">
              <p className="line-clamp-2 text-xs font-semibold text-ink">{i.name}</p>
              <p className="mt-1 text-sm font-bold text-teal">{formatPKR(i.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
