import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect("/admin/login");
  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-mist">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
