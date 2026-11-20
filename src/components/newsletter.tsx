"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useStore } from "./providers";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmail("");
      toast("success", "Subscribed — welcome deals incoming!");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-x py-14 sm:py-20" aria-labelledby="newsletter">
      <div className="card relative overflow-hidden bg-ink p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal/25 blur-3xl" />
        <div className="relative max-w-xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/15 text-teal"><Mail className="h-5 w-5" /></span>
          <h2 id="newsletter" className="mt-4 font-display text-2xl font-bold sm:text-3xl">Get 10% off your first order</h2>
          <p className="mt-2 text-sm text-white/70">Subscribe for launches, restocks and members-only deals. No spam, unsubscribe anytime.</p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" aria-label="Email address"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 focus:border-teal focus:outline-none"
            />
            <button type="submit" disabled={loading} className="btn bg-teal px-7 py-3 text-sm font-bold text-white hover:bg-tealDark">
              <Send className="h-4 w-4" /> {loading ? "Joining…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
