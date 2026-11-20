import Link from "next/link";
import { AlertTriangle, BadgeCheck, ShieldX } from "lucide-react";
import { getVerificationByCode } from "@/lib/db";
import { ClaimButton } from "@/components/claim-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verification Result" };
export const dynamic = "force-dynamic";

export default async function VerifyCodePage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const v = await getVerificationByCode(code);

  return (
    <div className="container-x max-w-xl py-14 text-center sm:py-20">
      {!v ? (
        <>
          <ShieldX className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-5 font-display text-2xl font-bold">Invalid Verification Code</h1>
          <p className="mt-2 text-sm text-slate-500">
            Code <span className="font-mono font-bold text-ink">{code}</span> is not registered in our system.
            If you believe this is an error, contact support with a photo of the label.
          </p>
        </>
      ) : v.status === "verified" ? (
        <>
          <AlertTriangle className="mx-auto h-16 w-16 text-amber-500" />
          <h1 className="mt-5 font-display text-2xl font-bold">Already Registered</h1>
          <p className="mt-2 text-sm text-slate-500">
            This code was verified{v.verified_at ? ` on ${new Date(v.verified_at).toLocaleDateString("en-PK")}` : ""}.
            Each verification code can only be registered once.
          </p>
          {v.product_name && <p className="mt-3 font-semibold text-ink">Product: {v.product_name}</p>}
        </>
      ) : v.status === "revoked" ? (
        <>
          <ShieldX className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-5 font-display text-2xl font-bold">Code Revoked</h1>
          <p className="mt-2 text-sm text-slate-500">This verification code has been revoked. Please contact support.</p>
        </>
      ) : (
        <>
          <BadgeCheck className="mx-auto h-16 w-16 text-teal" />
          <h1 className="mt-5 font-display text-2xl font-bold text-teal">Registered Product Found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This code is registered to <strong className="text-ink">{v.product_name || "a Tekfinity product"}</strong>.
            Claim it below to register it to you — each code can only be claimed once.
          </p>
          <dl className="card mx-auto mt-6 max-w-sm space-y-2 p-5 text-left text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Verification ID</dt><dd className="font-mono font-bold">{v.code}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-semibold text-teal">Active — unclaimed</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Issued</dt><dd>{v.created_at ? new Date(v.created_at).toLocaleDateString("en-PK") : "—"}</dd></div>
          </dl>
          <ClaimButton code={v.code} />
        </>
      )}

      <div className="mt-10">
        <Link href="/verify" className="link-underline text-sm font-semibold text-teal">Verify another code</Link>
      </div>
    </div>
  );
}
