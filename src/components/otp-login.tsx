"use client";

import { useEffect, useRef, useState } from "react";
import { createClientBrowser } from "@/lib/supabase";
import { useStore } from "./providers";

export function OtpLogin() {
  const { toast } = useStore();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ phone?: string } | null>(null);
  const sbRef = useRef<ReturnType<typeof createClientBrowser>>(null);

  useEffect(() => {
    sbRef.current = createClientBrowser();
    if (sbRef.current) {
      sbRef.current.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    }
  }, []);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = sbRef.current;
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.signInWithOtp({ phone: phone.startsWith("+") ? phone : `+92${phone.replace(/^0/, "")}` });
    setLoading(false);
    if (error) toast("error", error.message);
    else { setSent(true); toast("success", "OTP sent — check your SMS/WhatsApp"); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = sbRef.current;
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.verifyOtp({
      phone: phone.startsWith("+") ? phone : `+92${phone.replace(/^0/, "")}`,
      token: otp, type: "sms",
    });
    setLoading(false);
    if (error) toast("error", error.message);
    else {
      const { data } = await sb.auth.getSession();
      setUser(data.session?.user ?? null);
      toast("success", "Signed in");
    }
  };

  const signOut = async () => {
    await sbRef.current?.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
      <div className="mt-3 flex items-center justify-between rounded-xl bg-teal/10 px-4 py-3">
        <p className="text-sm font-semibold text-tealDark">Signed in{user.phone ? ` — ${user.phone}` : ""}</p>
        <button onClick={signOut} className="text-xs font-bold text-ink underline">Sign out</button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {!sent ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-3 sm:flex-row">
          <input
            required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567" aria-label="Phone number for OTP login"
            className="input flex-1" autoComplete="tel"
          />
          <button type="submit" disabled={loading} className="btn-teal px-6">
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-3 sm:flex-row">
          <input
            required value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric"
            placeholder="6-digit OTP" aria-label="OTP code" className="input flex-1"
            maxLength={8}
          />
          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? "Verifying…" : "Verify & Sign In"}
          </button>
          <button type="button" onClick={() => setSent(false)} className="btn-ghost px-4 text-xs">Change number</button>
        </form>
      )}
      <p className="text-xs text-slate-400">We&apos;ll send a one-time code via SMS/WhatsApp. Requires Supabase phone auth to be configured.</p>
    </div>
  );
}
