"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard, Ticket,
  HelpCircle, Boxes, Settings, LogOut, ShieldCheck, Menu, X, Undo2, QrCode, Star, Zap,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/verifications", label: "QR Verifications", icon: QrCode },
  { href: "/admin/returns", label: "Returns", icon: Undo2 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const content = (
    <>
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <ShieldCheck className="h-6 w-6 text-teal" />
        <div>
          <p className="font-display text-sm font-bold text-white">Tekfinity</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active ? "bg-teal text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white">
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-[104px] z-40 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <p className="text-sm font-bold text-white">Admin Panel</p>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Toggle admin menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[152px] z-40 bg-ink lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex h-full w-64 flex-col" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="sticky top-[104px] hidden h-[calc(100vh-104px)] w-60 shrink-0 flex-col bg-ink lg:flex">
        {content}
      </aside>
    </>
  );
}
