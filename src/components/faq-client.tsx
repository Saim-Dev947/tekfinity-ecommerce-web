"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { FAQ } from "@/lib/types";

export function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category || "General")))], [faqs]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return faqs.filter((f) =>
      (cat === "All" || (f.category || "General") === cat) &&
      (!s || f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s))
    );
  }, [faqs, q, cat]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions…" aria-label="Search FAQs"
            className="input pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="FAQ categories">
          {categories.map((c) => (
            <button
              key={c} role="tab" aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`badge px-3.5 py-1.5 text-xs normal-case ${cat === c ? "bg-ink text-white" : "bg-mist text-ink hover:bg-line"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-sm text-slate-500">No questions match your search.</div>
        )}
        {filtered.map((f) => (
          <details key={f.id} className="card group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-ink sm:text-base">
              {f.question}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-teal transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
