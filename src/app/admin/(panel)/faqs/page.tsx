import { getFAQs } from "@/lib/db";
import { FAQManager } from "./faq-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQs — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFAQsPage() {
  const faqs = await getFAQs();
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">FAQs</h1>
      <p className="mt-1 text-sm text-slate-500">Questions shown on the FAQ page and homepage.</p>
      <FAQManager faqs={faqs} />
    </div>
  );
}
