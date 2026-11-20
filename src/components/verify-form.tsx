"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";

export function VerifyForm() {
  const [code, setCode] = useState("");
  const router = useRouter();

  return (
    <form
      className="card mx-auto mt-8 max-w-md p-6 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) router.push(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
      }}
    >
      <label htmlFor="v-code" className="label">Verification code</label>
      <div className="flex gap-2">
        <input
          id="v-code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="TF-XXXXXX-XXXX" className="input flex-1 font-mono uppercase"
          autoComplete="off" spellCheck={false}
        />
        <button type="submit" className="btn-teal px-5">
          <ScanLine className="h-4 w-4" /> Verify
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">Codes look like TF-ABC123-XYZ789.</p>
    </form>
  );
}
