"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Zap } from "lucide-react";
import { deleteFlashSaleAction, saveFlashSaleAction, setFlashSaleProductAction } from "@/app/admin/actions";
import type { FlashSale, Product } from "@/lib/types";

export function FlashManager({ sales, products }: { sales: FlashSale[]; products: Product[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const save = async (formData: FormData) => {
    setBusy("save"); setMsg("");
    const res = await saveFlashSaleAction(formData);
    setMsg(res?.error || "Flash sale saved.");
    setBusy("");
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this flash sale?")) return;
    setBusy(id);
    await deleteFlashSaleAction(id);
    setBusy("");
    router.refresh();
  };

  const toggleProduct = async (p: Product) => {
    setBusy(p.id);
    await setFlashSaleProductAction(p.id, !p.is_flash_sale);
    setBusy("");
    router.refresh();
  };

  const activeSale = sales.find((s) => s.is_active !== false);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Sale settings */}
      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Zap className="h-4 w-4 text-teal" /> Sale schedule</h2>
          {sales.length === 0 && <p className="mt-3 text-sm text-slate-500">No flash sales configured.</p>}
          <ul className="mt-4 space-y-2">
            {sales.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    Ends {new Date(s.ends_at).toLocaleString("en-PK")} · {s.is_active === false ? "inactive" : "active"}
                  </p>
                </div>
                <button onClick={() => remove(s.id)} disabled={busy === s.id} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Delete ${s.name}`}>
                  {busy === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <form action={save} className="card space-y-4 p-5">
          <h2 className="font-display text-lg font-bold">{activeSale ? "Edit sale" : "New flash sale"}</h2>
          {activeSale && <input type="hidden" name="id" value={activeSale.id} />}
          <div>
            <label htmlFor="fs-name" className="label">Sale name</label>
            <input id="fs-name" name="name" className="input" defaultValue={activeSale?.name || "Flash Sale"} required />
          </div>
          <div>
            <label htmlFor="fs-ends" className="label">Ends at</label>
            <input id="fs-ends" name="ends_at" type="datetime-local" className="input" defaultValue={activeSale ? activeSale.ends_at.slice(0, 16) : ""} required />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="is_active" defaultChecked={activeSale ? activeSale.is_active !== false : true} className="h-4 w-4 accent-teal" /> Active
          </label>
          {msg && <p className="text-xs font-semibold text-teal">{msg}</p>}
          <button className="btn-teal w-full py-3 text-sm" disabled={busy === "save"}>
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Sale
          </button>
        </form>
      </div>

      {/* Sale products */}
      <div className="card overflow-hidden self-start">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold">Products in this sale ({products.filter((p) => p.is_flash_sale).length})</h2>
          <p className="mt-0.5 text-xs text-slate-500">Toggle products to include them in the homepage deals section.</p>
        </div>
        <ul className="divide-y divide-line">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
              </div>
              <button
                onClick={() => toggleProduct(p)}
                disabled={busy === p.id}
                aria-pressed={Boolean(p.is_flash_sale)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${p.is_flash_sale ? "bg-teal" : "bg-line"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.is_flash_sale ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
