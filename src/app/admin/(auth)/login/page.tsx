import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login" };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ink font-display text-xl font-bold text-white">T</span>
          <h1 className="mt-4 font-display text-xl font-bold">Admin Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">Authorized personnel only.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
