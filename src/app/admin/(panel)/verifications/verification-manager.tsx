"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { generateVerificationAction, revokeVerificationAction } from "@/app/admin/actions";
import type { Product, ProductVerification } from "@/lib/types";

function VerificationQR({ code, productName }: { code: string; productName?: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${base}/verify/${code}`;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 160, margin: 1, color: { dark: "#090B10" } })
      .then(setDataUrl)
      .catch(() => {});
  }, [url]);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  if (!dataUrl) return <div className="h-20 w-20 animate-pulse rounded-lg bg-mist" />;
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR code for ${code}`} className="h-20 w-20 rounded-lg border border-line" />
      <div>
        <button onClick={copy} className="flex items-center gap-1 text-xs font-semibold text-teal hover:underline">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy link"}
        </button>
        <p className="mt-1 max-w-[10rem] truncate font-mono text-[10px] text-slate-400">{url}</p>
      </div>
    </div>
  );
}

export function VerificationManager({ verifications, products }: { verifications: ProductVerification[]; products: Product[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; url: string } | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!productId) return;
    setLoading(true); setError(""); setResult(null);
    const res = await generateVerificationAction(productId);
    setLoading(false);
    if (res && "error" in res && res.error) { setError(String(res.error)); return; }
    if (res && "code" in res && res.code && res.url) { setResult({ code: res.code, url: res.url }); router.refresh(); }
  };

  const revoke = async (code: string) => {
    if (!confirm(`Revoke code ${code}?`)) return;
    await revokeVerificationAction(code);
    router.refresh();
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Generate code for product</label>
          <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select a product…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading || !productId} className="btn-teal px-6 py-3 text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          Generate
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
      {result && (
        <div className="card border-teal/30 bg-teal/5 p-4 text-sm">
          <p className="font-bold text-teal">Code generated</p>
          <p className="mt-1 font-mono">{result.code}</p>
          <p className="mt-1 text-slate-600">Verification URL: <code>/verify/{result.code}</code> — print as QR on packaging.</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full min-w-[560px]">
          <thead className="bg-mist"><tr>
            <th className="th">QR</th><th className="th">Code</th><th className="th">Product</th><th className="th">Status</th>
            <th className="th">Verified</th><th className="th"></th>
          </tr></thead>
          <tbody className="divide-y divide-line">
            {verifications.map((v) => (
              <tr key={v.id}>
                <td className="td"><VerificationQR code={v.code} productName={v.product_name} /></td>
                <td className="td font-mono text-xs font-bold">{v.code}</td>
                <td className="td">{v.product_name || "—"}</td>
                <td className="td">
                  <span className={`badge ${v.status === "verified" ? "bg-teal/10 text-teal" : v.status === "revoked" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {v.status}
                  </span>
                </td>
                <td className="td text-xs text-slate-500">{v.verified_at ? new Date(v.verified_at).toLocaleDateString("en-PK") : "—"}</td>
                <td className="td text-right">
                  {v.status === "active" && (
                    <button onClick={() => revoke(v.code)} className="text-xs font-semibold text-red-500 hover:underline">Revoke</button>
                  )}
                </td>
              </tr>
            ))}
            {verifications.length === 0 && <tr><td colSpan={6} className="td py-10 text-center text-slate-500">No verification codes yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
