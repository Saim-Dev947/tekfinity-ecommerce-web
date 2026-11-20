import { getFAQs } from "@/lib/db";
import { FAQClient } from "@/components/faq-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ — Frequently Asked Questions" };
export const revalidate = 300;

export default async function FAQPage() {
  const faqs = await getFAQs();
  return (
    <div className="container-x max-w-4xl py-10 sm:py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
      <p className="mt-2 text-sm text-slate-500">Everything about orders, delivery, payments, warranty and returns.</p>
      <FAQClient faqs={faqs} />
    </div>
  );
}
