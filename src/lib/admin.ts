import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "tf_admin_session";
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-insecure-secret-change-me";

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function adminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials(email: string, password: string) {
  const okEmail = !process.env.ADMIN_EMAIL || email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  const okPass = process.env.ADMIN_PASSWORD ? password === process.env.ADMIN_PASSWORD : false;
  return okEmail && okPass;
}

export function createAdminSession() {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12h
  const payload = Buffer.from(JSON.stringify({ exp, role: "admin" })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  cookies().set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 12,
  });
}

export function destroyAdminSession() {
  cookies().delete(COOKIE);
}

export function isAdmin(): boolean {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
