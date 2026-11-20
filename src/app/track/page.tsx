import { getOrderById, getSettings } from "@/lib/db";
import { TrackClient } from "@/components/track-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Track Your Order" };
export const dynamic = "force-dynamic";

export default async function TrackPage({
  searchParams,
}: { searchParams: { order?: string; phone?: string } }) {
  let order = null;
  let error = "";
  if (searchParams.order) {
    const found = await getOrderById(searchParams.order.trim().toUpperCase());
    if (found) {
      const op = found.phone.replace(/\D/g, "");
      const gp = (searchParams.phone || "").replace(/\D/g, "");
      if (!gp || op.endsWith(gp.slice(-10)) || gp.endsWith(op.slice(-10))) {
        order = found;
      } else {
        error = "Phone number does not match this order.";
      }
    } else {
      error = "Order not found. Check your Order ID and try again.";
    }
  }

  const settings = order ? await getSettings() : null;

  return (
    <div className="container-x max-w-3xl py-10 sm:py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">Track Your Order</h1>
      <p className="mt-2 text-sm text-slate-500">Enter your Order ID and the phone number used at checkout.</p>

      {!order ? (
        <form className="card mt-8 p-6" action="/track" method="get">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="t-order" className="label">Order ID</label>
              <input id="t-order" name="order" required placeholder="TF-XXXXXX" className="input font-mono uppercase" defaultValue={searchParams.order || ""} />
            </div>
            <div>
              <label htmlFor="t-phone" className="label">Phone number</label>
              <input id="t-phone" name="phone" required type="tel" placeholder="0300-1234567" className="input" defaultValue={searchParams.phone || ""} />
            </div>
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">{error}</p>}
          <button type="submit" className="btn-teal mt-5 w-full py-3.5 sm:w-auto sm:px-10">Track Order</button>
        </form>
      ) : (
        <TrackClient order={order} settings={settings} />
      )}
    </div>
  );
}
