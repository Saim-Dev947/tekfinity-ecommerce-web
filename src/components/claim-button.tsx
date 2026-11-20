"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";
import { useStore } from "./providers";

export function ClaimButton({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useStore();

  const claim = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/verify/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");
      toast("success", "Code registration confirmed. This does not authenticate product genuineness.");
      router.refresh();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Claim failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={claim} disabled={loading} className="btn-teal mt-6 px-8 py-3.5">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
      {loading ? "Registering…" : "Register This Code"}
    </button>
  );
}
