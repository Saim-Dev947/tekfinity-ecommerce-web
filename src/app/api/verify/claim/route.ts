import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { claimVerification, getVerificationByCode } from "@/lib/db";

const schema = z.object({ code: z.string().min(4).max(80) });

export async function POST(req: Request) {
  try {
    const { code } = schema.parse(await req.json());
    const normalized = code.trim().toUpperCase();
    const existing = await getVerificationByCode(normalized);

    if (!existing) {
      return NextResponse.json({ result: "invalid", message: "Invalid verification code" }, { status: 404 });
    }
    if (existing.status === "verified") {
      return NextResponse.json({
        result: "already_verified",
        message: "This code has already been registered/verified",
        product_name: existing.product_name,
        verified_at: existing.verified_at,
      });
    }
    if (existing.status === "revoked") {
      return NextResponse.json({ result: "revoked", message: "This verification code has been revoked", product_name: existing.product_name });
    }

    const claimed = await claimVerification(normalized);
    if (!claimed) {
      return NextResponse.json({ result: "already_verified", message: "This code was just verified" });
    }
    return NextResponse.json({
      result: "registered",
      message: "Code registration confirmed. This does not authenticate the product's manufacturer or origin.",
      product_name: claimed.product_name,
      verified_at: claimed.verified_at,
    });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    console.error("Verification code claim failed", error);
    return NextResponse.json({ error: "Could not register this code" }, { status: 500 });
  }
}
