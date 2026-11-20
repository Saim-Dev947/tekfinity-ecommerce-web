"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { useStore } from "./providers";
import type { Category } from "@/lib/types";

export function Header({
  storeName,
  announcement,
  categories,
}: {
  storeName: string;
  announcement?: string;
  categories: Category[];
}) {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setOpen(false);
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/track", label: "Track Order" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {announcement && (
        <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white/90 sm:text-xs">
          {announcement}
        </div>
      )}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled ? "border-line bg-white/90 shadow-card backdrop-blur-xl" : "border-transparent bg-white"
        }`}
      >
        <div className="container-x flex h-16 items-center gap-3 lg:h-[72px]">
          <button
            className="rounded-lg p-2 hover:bg-mist lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label={storeName}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-xl" />
            <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
              {storeName}
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-mist ${
                  pathname === l.href ? "text-teal" : "text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setMega(true)}
              onMouseLeave={() => setMega(false)}
            >
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {mega && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full w-72 rounded-2xl border border-line bg-white p-2 shadow-lift"
                  >
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/shop?category=${c.slug}`}
                        className="block rounded-xl px-4 py-2.5 text-sm font-medium text-ink hover:bg-mist"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <form onSubmit={search} className="ml-auto hidden flex-1 max-w-md md:block" role="search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search AirPods, cases, chargers…"
                className="w-full rounded-full border border-line bg-mist py-2.5 pl-11 pr-4 text-sm focus:border-teal focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20"
                aria-label="Search products"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-3">
            <Link href="/wishlist" className="relative rounded-full p-2.5 hover:bg-mist" aria-label={`Wishlist (${wishlist.length})`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-mist" aria-label={`Cart (${cartCount} items)`}>
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="rounded-full p-2.5 hover:bg-mist" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* mobile search */}
        <div className="border-t border-line px-4 py-2 md:hidden">
          <form onSubmit={search} role="search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search products…"
                className="w-full rounded-full border border-line bg-mist py-2.5 pl-10 pr-4 text-sm focus:border-teal focus:bg-white focus:outline-none"
                aria-label="Search products"
              />
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-line bg-white lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-x flex flex-col py-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-4 py-3 text-base font-semibold text-ink hover:bg-mist">
                  {l.label}
                </Link>
              ))}
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
              {categories.map((c) => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink hover:bg-mist">
                  {c.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
