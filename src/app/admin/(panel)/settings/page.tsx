import { getSettings } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Website Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Store info, contact details, delivery charges and payment account numbers.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
