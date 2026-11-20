"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { adjustStockAction } from "@/app/admin/actions";

export function StockControls({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState("");

  const adjust = async (delta: number) => {
    setBusy(true);
    await adjustStockAction(productId, delta);
    setBusy(false);
    router.refresh();
  };

  const setExact = async () => {
    const n = Number(custom);
    if (!Number.isFinite(n) || n < 0) return;
    setBusy(true);
    await adjustStockAction(productId, n - stock);
    setBusy(false);
    setCustom("");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => adjust(-1)} disabled={busy || stock <= 0} className="rounded-lg border border-line p-1.5 hover:bg-mist disabled:opacity-40" aria-label="Decrease stock">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => adjust(1)} disabled={busy} className="rounded-lg border border-line p-1.5 hover:bg-mist disabled:opacity-40" aria-label="Increase stock">
        <Plus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number" min={0} value={custom} onChange={(e) => setCustom(e.target.value)}
        placeholder="Set…" aria-label="Set exact stock" className="input w-20 px-2 py-1.5 text-xs"
        onKeyDown={(e) => e.key === "Enter" && setExact()}
      />
      <button onClick={setExact} disabled={busy || custom === ""} className="btn-ghost px-3 py-1.5 text-xs">Set</button>
    </div>
  );
}
