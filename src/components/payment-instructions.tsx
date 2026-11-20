import { Landmark, Smartphone } from "lucide-react";
import type { PaymentMethod, SiteSettings } from "@/lib/types";

export function PaymentInstructions({ method, settings, compact = false, amount }: { method: PaymentMethod; settings: SiteSettings | null; compact?: boolean; amount?: number }) {
  if (!settings) return null;
  const amt = amount ? ` for Rs. ${amount.toLocaleString("en-PK")}` : "";
  if (method === "jazzcash") {
    return (
      <div className={compact ? "" : "mt-4 rounded-2xl border border-line p-5"}>
        <p className="flex items-center gap-2 text-sm font-bold text-ink"><Smartphone className="h-4 w-4 text-teal" /> JazzCash</p>
        <p className="mt-1 text-sm">Send payment{amt} to <strong>{settings.jazzcash_number || "—"}</strong> and send the receipt screenshot on WhatsApp or upload it when tracking your order.</p>
      </div>
    );
  }
  if (method === "easypaisa") {
    return (
      <div className={compact ? "" : "mt-4 rounded-2xl border border-line p-5"}>
        <p className="flex items-center gap-2 text-sm font-bold text-ink"><Smartphone className="h-4 w-4 text-teal" /> Easypaisa</p>
        <p className="mt-1 text-sm">Send payment{amt} to <strong>{settings.easypaisa_number || "—"}</strong> and share the receipt screenshot for verification.</p>
      </div>
    );
  }
  return (
    <div className={compact ? "" : "mt-4 rounded-2xl border border-line p-5"}>
      <p className="flex items-center gap-2 text-sm font-bold text-ink"><Landmark className="h-4 w-4 text-teal" /> Bank Transfer</p>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Bank</dt><dd className="font-semibold">{settings.bank_details?.bank_name}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Title</dt><dd className="font-semibold">{settings.bank_details?.account_title}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">IBAN</dt><dd className="font-mono font-semibold">{settings.bank_details?.iban}</dd></div>
      </dl>
      {amount ? <p className="mt-2 text-xs text-slate-500">Transfer exactly Rs. {amount.toLocaleString("en-PK")} and mention your order ID in the transfer reference.</p> : null}
    </div>
  );
}
