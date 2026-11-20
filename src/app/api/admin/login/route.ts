import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCredentialsConfigured, createAdminSession, verifyAdminCredentials } from "@/lib/admin";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  try {
    const { email, password } = schema.parse(await req.json());
    if (!adminCredentialsConfigured()) {
      return NextResponse.json(
        { error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment (see README)." },
        { status: 503 }
      );
    }
    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
