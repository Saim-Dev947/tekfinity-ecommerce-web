"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";

function F({ label, name, defaultValue = "", type = "text", hint }: { label: string; name: string; defaultValue?: string | number; type?: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={`s-${name}`} className="label">{label}</label>
      <input id={`s-${name}`} name={name} type={type} step={type === "number" ? "any" : undefined} defaultValue={defaultValue} className="input" />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    const res = await saveSettingsAction(new FormData(e.currentTarget));
    setLoading(false);
    if (res && "error" in res && res.error) { setMsg(String(res.error)); return; }
    setMsg("Settings saved ✓");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card mt-6 space-y-8 p-6">
      <fieldset>
        <legend className="font-display text-base font-bold">Store</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="Store name" name="store_name" defaultValue={settings.store_name} />
          <F label="Tagline" name="tagline" defaultValue={settings.tagline} />
          <div className="sm:col-span-2"><F label="Announcement bar" name="announcement" defaultValue={settings.announcement} hint="Shown at the very top of every page" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-base font-bold">Contact</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="WhatsApp number" name="whatsapp_number" defaultValue={settings.whatsapp_number} hint="International format, digits only: 923001234567" />
          <F label="Contact phone" name="contact_phone" defaultValue={settings.contact_phone} />
          <F label="Contact email" name="contact_email" type="email" defaultValue={settings.contact_email} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-base font-bold">Delivery & Policies</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Delivery charge (PKR)" name="delivery_charge" type="number" defaultValue={settings.delivery_charge ?? 250} />
          <F label="Free delivery above (PKR)" name="free_delivery_above" type="number" defaultValue={settings.free_delivery_above ?? 0} hint="0 = never free" />
          <F label="Return window (days)" name="return_days" type="number" defaultValue={settings.return_days ?? 7} />
          <div className="sm:col-span-2 lg:col-span-4"><F label="Warranty text" name="warranty_text" defaultValue={settings.warranty_text} /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-base font-bold">Manual Payment Accounts</legend>
        <p className="mt-1 text-xs text-slate-500">Shown to customers at checkout. Update when accounts change.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="JazzCash number" name="jazzcash_number" defaultValue={settings.jazzcash_number} />
          <F label="Easypaisa number" name="easypaisa_number" defaultValue={settings.easypaisa_number} />
          <F label="Bank name" name="bank_name" defaultValue={settings.bank_details?.bank_name} />
          <F label="Account title" name="account_title" defaultValue={settings.bank_details?.account_title} />
          <F label="IBAN" name="iban" defaultValue={settings.bank_details?.iban} />
          <F label="Account number" name="account_number" defaultValue={settings.bank_details?.account_number} />
        </div>
      </fieldset>

      {msg && <p className={`rounded-lg px-3 py-2 text-sm font-medium ${msg.includes("✓") ? "bg-teal/10 text-teal" : "bg-red-50 text-red-600"}`}>{msg}</p>}
      <button type="submit" disabled={loading} className="btn-teal px-8 py-3">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Settings
      </button>
    </form>
  );
}
