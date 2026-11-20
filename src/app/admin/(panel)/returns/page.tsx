import { getReturnRequests } from "@/lib/db";
import { ReturnManager } from "./return-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const returns = await getReturnRequests();
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Return & Exchange Requests</h1>
      <p className="mt-1 text-sm text-slate-500">Review customer requests — approve or reject within 24 hours.</p>
      <ReturnManager returns={returns} />
    </div>
  );
}
