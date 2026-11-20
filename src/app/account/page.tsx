import type { Metadata } from "next";
import { AccountClient } from "@/components/account-client";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <AccountClient supabaseEnabled={isSupabaseConfigured} />;
}
