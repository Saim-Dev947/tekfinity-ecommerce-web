"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, HelpCircle, X } from "lucide-react";
import Link from "next/link";

export function WhatsAppFloat({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false);
  const digits = (phone || "").replace(/\D/g, "");
  const waLink = `https://wa.me/${digits}?text=${encodeURIComponent("Hi! I need help with my order.")}`;
  const telLink = `tel:${digits ? "+" + digits : ""}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
            role="dialog" aria-label="Customer support"
          >
            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3 text-white">
              <div>
                <p className="text-sm font-bold">Customer Support</p>
                <p className="text-[11px] text-white/80">Typically replies within minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Close support chat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 p-3">
              {digits ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-[#25D366]/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /></span>
                  Chat on WhatsApp
                </a>
              ) : null}
              {digits ? (
                <a href={telLink} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/10 text-teal"><Phone className="h-4 w-4" /></span>
                  Call support
                </a>
              ) : null}
              <Link href="/faq" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink"><HelpCircle className="h-4 w-4" /></span>
                FAQs & help
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-110"
      >
        {open ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        {!open && digits && <span className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden="true" />}
      </button>
    </div>
  );
}
