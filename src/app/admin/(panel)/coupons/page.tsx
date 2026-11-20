import { getCoupons } from "@/lib/db";
import { CouponManager } from "./coupon-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coupons — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">Coupons</h1>
      <p className="mt-1 text-sm text-slate-500">Create discount codes customers can apply at checkout.</p>
      <CouponManager coupons={coupons} />
    </div>
  );
}
