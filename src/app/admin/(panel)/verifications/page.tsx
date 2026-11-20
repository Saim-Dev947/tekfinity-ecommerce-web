import { getProducts, getVerifications } from "@/lib/db";
import { VerificationManager } from "./verification-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "QR Verifications — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const [verifications, products] = await Promise.all([getVerifications(), getProducts()]);
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">QR Product Verifications</h1>
      <p className="mt-1 text-sm text-slate-500">
        Generate unique verification codes for products. Customers scan the QR or enter the code at /verify.
        Only generate codes for products whose authenticity you have verified with your supplier.
      </p>
      <VerificationManager verifications={verifications} products={products} />
    </div>
  );
}
