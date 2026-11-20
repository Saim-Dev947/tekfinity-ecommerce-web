import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { VerifyForm } from "@/components/verify-form";

export const metadata: Metadata = { title: "Verify Your Product" };

export default function VerifyPage() {
  return (
    <div className="container-x max-w-xl py-14 text-center sm:py-20">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
        <ShieldCheck className="h-8 w-8" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">Product Verification</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Enter the verification code found on your product packaging or QR label to check its registration status.
      </p>
      <VerifyForm />
      <p className="mt-6 text-xs text-slate-400">
        Verification confirms the code is registered in our system. It does not replace official manufacturer authentication.
      </p>
    </div>
  );
}
