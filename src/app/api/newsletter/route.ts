import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertItem } from "@/lib/jsondb";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({ email: z.string().email().max(160) });

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());
    const svc = createServiceClient();
    if (svc) {
      await svc.from("notifications").insert({ type: "newsletter", message: email, is_read: false } as never);
    } else {
      await upsertItem("notifications", {
        id: crypto.randomUUID(), type: "newsletter", message: email,
        is_read: false, created_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
}
