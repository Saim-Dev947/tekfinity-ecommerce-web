"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteFAQAction, saveFAQAction } from "@/app/admin/actions";
import type { FAQ } from "@/lib/types";

const empty = { question: "", answer: "", category: "", sort_order: 0, is_published: true };

export function FAQManager({ faqs }: { faqs: FAQ[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startEdit = (f: FAQ) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category || "", sort_order: f.sort_order ?? 0, is_published: f.is_published !== false });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData();
    fd.set("question", form.question);
    fd.set("answer", form.answer);
    fd.set("category", form.category);
    fd.set("sort_order", String(form.sort_order));
    if (form.is_published) fd.set("is_published", "on");
    if (editing) fd.set("id", editing.id);
    const res = await saveFAQAction(fd);
    setLoading(false);
    if (res && "error" in res && res.error) { setError(String(res.error)); return; }
    setOpen(false); setEditing(null); setForm(empty);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteFAQAction(id);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="btn-teal px-5 py-2.5 text-sm">
        <Plus className="h-4 w-4" /> New FAQ
      </button>

      {open && (
        <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{editing ? "Edit FAQ" : "New FAQ"}</h2>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-mist" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div>
            <label className="label">Question</label>
            <input required className="input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </div>
          <div>
            <label className="label">Answer</label>
            <textarea required rows={4} className="input" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Delivery, Payments…" />
            </div>
            <div>
              <label className="label">Sort order</label>
              <input type="number" className="input" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-teal" />
              Published
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save FAQ
          </button>
        </form>
      )}

      <div className="card mt-4 divide-y divide-line">
        {faqs.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{f.question}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{f.answer}</p>
              <p className="mt-1 text-xs text-slate-400">{f.category || "General"} · order {f.sort_order ?? 0} · {f.is_published === false ? "Hidden" : "Published"}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => startEdit(f)} className="rounded-lg p-2 text-slate-400 hover:bg-mist hover:text-ink" aria-label="Edit FAQ"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(f.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete FAQ"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No FAQs yet.</p>}
      </div>
    </div>
  );
}
