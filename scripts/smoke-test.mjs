#!/usr/bin/env node
/**
 * Smoke test — requires the dev/prod server running (default http://localhost:3000).
 * Usage: npm run test  (with `npm run dev` running in another terminal)
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

const pages = [
  "/", "/shop", "/shop?category=smart-watches", "/shop?category=power-banks",
  "/product/airpods-pro-2-usb-c", "/product/smart-watch-series-8-gps",
  "/cart", "/checkout", "/track", "/wishlist", "/faq", "/verify", "/account",
  "/admin/login", "/api/catalog", "/api/settings/public", "/sitemap.xml", "/robots.txt",
];

let pass = 0, fail = 0;
for (const p of pages) {
  try {
    const res = await fetch(BASE + p, { redirect: "manual" });
    const ok = res.status === 200 || (p === "/admin" ? res.status === 307 : false);
    if (ok) { pass++; console.log(`  ✓ ${res.status} ${p}`); }
    else { fail++; console.log(`  ✗ ${res.status} ${p}`); }
  } catch (e) {
    fail++;
    console.log(`  ✗ ERR ${p} — ${e.message}`);
  }
}

// API checks
const checks = [
  ["POST", "/api/coupons/validate", { code: "WELCOME10", subtotal: 20000 }, 200],
  ["POST", "/api/coupons/validate", { code: "NOPE", subtotal: 100 }, 404],
  ["POST", "/api/verify/claim", { code: "TF-INVALID" }, 404],
  ["POST", "/api/newsletter", { email: "smoke@test.com" }, 200],
  ["POST", "/api/backinstock", { product_id: "nonexistent", contact: "0300-0000000" }, 404],
  ["POST", "/api/backinstock", { product_id: "", contact: "" }, 400],
];
for (const [method, path, body, want] of checks) {
  try {
    const res = await fetch(BASE + path, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.status === want) { pass++; console.log(`  ✓ ${res.status} ${method} ${path}`); }
    else { fail++; console.log(`  ✗ ${res.status} (want ${want}) ${method} ${path}`); }
  } catch (e) {
    fail++;
    console.log(`  ✗ ERR ${method} ${path} — ${e.message}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
