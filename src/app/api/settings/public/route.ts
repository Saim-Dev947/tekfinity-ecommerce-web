import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    store_name: s.store_name,
    delivery_charge: s.delivery_charge,
    free_delivery_above: s.free_delivery_above,
    whatsapp_number: s.whatsapp_number,
    return_days: s.return_days,
    warranty_text: s.warranty_text,
  });
}
