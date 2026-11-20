import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const cols = [
    {
      title: "Shop",
      links: [
        { href: "/shop?category=airpods", label: "AirPods" },
        { href: "/shop?category=smart-watches", label: "Smart Watches" },
        { href: "/shop?category=power-banks", label: "Power Banks" },
        { href: "/shop?category=chargers", label: "Chargers & Cables" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { href: "/track", label: "Track Order" },
        { href: "/faq", label: "FAQ" },
        { href: "/account", label: "My Account" },
        { href: "/wishlist", label: "Wishlist" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/verify", label: "Verify Product" },
        { href: "/faq", label: "Return Policy" },
        { href: "/faq", label: "Warranty" },
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/techfinity-logo.png" alt="Tekfinity" width={108} height={36} className="h-9 w-auto" />
            <span className="font-display text-xl font-bold text-white">{settings.store_name || "Tekfinity"}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            {settings.tagline || "Premium Apple accessories & electronics in Pakistan."}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {settings.contact_phone && (
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-teal" /> {settings.contact_phone}</li>
            )}
            {settings.contact_email && (
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal" /> {settings.contact_email}</li>
            )}
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-teal" /> Karachi, Pakistan — shipping nationwide</li>
          </ul>
          <div className="mt-5 flex gap-2">
            {settings.social?.instagram && (
              <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 hover:bg-teal">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings.social?.facebook && (
              <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2.5 hover:bg-teal">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {settings.whatsapp_number && (
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2.5 hover:bg-teal">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        {cols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/60 transition hover:text-teal">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.store_name || "Tekfinity"}. All rights reserved.</p>
          <p>Cash on Delivery · JazzCash · Easypaisa · Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
