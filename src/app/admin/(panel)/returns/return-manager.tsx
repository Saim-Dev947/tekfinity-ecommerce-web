"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { reviewReturnAction } from "@/app/admin/actions";
import type { ReturnRequest } from "@/lib/types";

export function ReturnManager({ returns }: { returns: ReturnRequest[] }) {
  const router = useRouter();

  const act = async (id: string, approve: boolean) => {
    await reviewReturnAction(id, approve);
    router.refresh();
  };

  return (
    <div className="card mt-6 divide-y divide-line">
      {returns.map((r) => (
        <div key={r.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-teal">{r.order_id}</p>
            <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
            <p className="mt-1 text-xs text-slate-400">
              {r.customer_phone} · {r.created_at ? new Date(r.created_at).toLocaleString("en-PK") : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`badge ${r.status === "approved" ? "bg-teal/10 text-teal" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {r.status}
            </span>
            {r.status === "pending" && (
              <>
                <button onClick={() => act(r.id, true)} className="rounded-lg bg-teal/10 p-2 text-teal hover:bg-teal hover:text-white" aria-label="Approve return">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => act(r.id, false)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white" aria-label="Reject return">
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      {returns.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No return requests.</p>}
    </div>
  );
}
