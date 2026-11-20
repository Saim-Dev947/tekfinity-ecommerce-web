"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function FlashCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!endsAt) return null;
  const end = new Date(endsAt).getTime();
  const diff = now === null ? null : Math.max(0, end - now);

  const parts = diff === null
    ? { d: 0, h: 0, m: 0, s: 0 }
    : {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      };

  const cells: [number, string][] = [
    [parts.d, "Days"], [parts.h, "Hours"], [parts.m, "Mins"], [parts.s, "Secs"],
  ];

  return (
    <div className="flex items-center gap-2" aria-label="Flash sale countdown">
      <Clock className="h-4 w-4 text-red-500" />
      {cells.map(([v, l]) => (
        <div key={l} className="text-center">
          <div className="min-w-[2.6rem] rounded-lg bg-ink px-2 py-1.5 font-display text-sm font-bold tabular-nums text-white">
            {String(v).padStart(2, "0")}
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{l}</p>
        </div>
      ))}
    </div>
  );
}
