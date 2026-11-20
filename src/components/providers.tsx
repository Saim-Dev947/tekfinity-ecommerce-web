"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import type { CartItem } from "@/lib/types";

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

interface StoreCtx {
  cart: CartItem[];
  wishlist: string[]; // product ids
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string, color?: string) => void;
  setQty: (productId: string, color: string | undefined, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toast: (type: Toast["type"], message: string) => void;
  couponsHint: string | null;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <Providers>");
  return ctx;
}

const cartKey = "tf_cart_v1";
const wishKey = "tf_wishlist_v1";

export function Providers({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    try {
      const c = localStorage.getItem(cartKey);
      const w = localStorage.getItem(wishKey);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(wishKey, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const toast = useCallback((type: Toast["type"], message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product_id === item.product_id && i.color === item.color);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].stock, next[idx].quantity + (item.quantity ?? 1)) };
        return next;
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }];
    });
    toast("success", "Added to cart");
  }, [toast]);

  const removeFromCart = useCallback((productId: string, color?: string) => {
    setCart((prev) => prev.filter((i) => !(i.product_id === productId && i.color === color)));
  }, []);

  const setQty = useCallback((productId: string, color: string | undefined, qty: number) => {
    setCart((prev) => prev.map((i) =>
      i.product_id === productId && i.color === color
        ? { ...i, quantity: Math.max(1, Math.min(i.stock, qty)) }
        : i
    ));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const has = prev.includes(productId);
      toast(has ? "info" : "success", has ? "Removed from wishlist" : "Saved to wishlist");
      return has ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  }, [toast]);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const value = useMemo<StoreCtx>(() => ({
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartCount: cart.reduce((n, i) => n + i.quantity, 0),
    cartSubtotal: cart.reduce((n, i) => n + i.price * i.quantity, 0),
    toggleWishlist,
    isWishlisted,
    toast,
    couponsHint: null,
  }), [cart, wishlist, addToCart, removeFromCart, setQty, clearCart, toggleWishlist, isWishlisted, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-lift"
            >
              {t.type === "error" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              )}
              <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
              <button
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="text-slate-400 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
