<<<<<<< HEAD
# Tekfinity — Premium E-Commerce Store

A complete, production-ready e-commerce platform for AirPods & accessories in Pakistan.
Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth) · Framer Motion**.

---

## Features

### Storefront
- Responsive premium storefront (mobile → 1600px+): announcement bar, mega-menu nav, search, sticky mobile nav
- Home: hero, categories, flash sale w/ countdown, featured/best-seller/new/trending, reviews, perks, FAQ teaser, newsletter
- Shop: search, category/price/stock filters, 4 sort modes, load-more pagination
- Product pages: gallery, zoom-on-hover, colors, qty selector, sticky mobile buy actions, specs, reviews, JSON-LD structured data
- Cart (localStorage), promo codes, checkout with Cash on Delivery / JazzCash / Easypaisa / Bank Transfer
- Order tracking with visual progress tracker + manual payment receipt upload
- Wishlist, FAQ page (search + categories), phone-OTP account (Supabase), return/exchange requests
- QR product verification system (`/verify`) — claim-once codes, admin generation
- WhatsApp floating support button

### Admin Panel (`/admin`)
Email+password login (env credentials, signed httpOnly session cookie). Sections:
Dashboard (sales, revenue chart, payment breakdown, flagged orders) · Orders (status, payment verification, tracking, fraud flags) · Products (full CRUD) · Inventory (stock adjust + low-stock alerts) · Customers · Payments (method breakdown, daily/monthly reports) · Coupons · FAQs · QR Verifications · Returns · Settings.

### Backend
- Next.js API routes + Server Actions; all prices/totals recomputed server-side
- Supabase PostgreSQL schema with Row Level Security (see `database/migrations/0001_init.sql`)
- **Demo mode:** when Supabase env vars are absent, the app runs fully on a local JSON store (`data/local/`) seeded from `src/data/catalog.ts` — orders, coupons, products, FAQs and settings all persist locally. Orders are stored as JSON files, so demo mode is for development only; use Supabase in production.
- Instagram/catalog feed: `GET /api/catalog` returns a Meta Commerce Manager–compatible JSON feed.

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

### Demo mode (no Supabase needed)
Leave Supabase vars empty. Set admin credentials to access `/admin`:

```env
ADMIN_EMAIL=admin@tekfinity.pk
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=random-hex-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Default demo login after setting those: the values you chose. Demo catalog ships with 12 products, 3 coupons, 8 FAQs.

### Supabase setup (production)
1. Create a project at [supabase.com](https://supabase.com).
2. Run `database/migrations/0001_init.sql` in the SQL Editor, then `database/seed.sql` for demo data.
3. Add env vars from `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Enable **Phone** provider in Authentication → Providers for OTP login.
5. To make yourself admin: insert your `auth.users.id` into `admin_roles` (`role='admin'`). Note: the built-in admin panel login uses `ADMIN_EMAIL`/`ADMIN_PASSWORD`; `admin_roles` governs Supabase-authenticated admin API access.
6. Create a public **Storage** bucket named `product-images` for product image uploads from the admin product form.

With Supabase configured, account order history requires a valid phone-OTP session and is restricted to that verified phone number. Without Supabase, phone-based order lookup is available only in the local demo mode and is not suitable for a public deployment. QR code registration confirms only that a code exists in Tekfinity's registry; it does not authenticate a product's manufacturer or origin. Generate codes only for products whose provenance has been independently verified.

In local demo mode, product image uploads are written to `public/uploads`. For production, configure Supabase and create the public `product-images` Storage bucket; uploaded image files are stored there.

---

## Payments — important

- **Cash on Delivery** works end-to-end.
- **JazzCash / Easypaisa / Bank Transfer** are *manual*: the customer sees your account details at checkout, pays externally, uploads a receipt on the tracking page, and an admin verifies/rejects it in the order detail. **A receipt upload never confirms payment automatically.**
- Automatic JazzCash/Easypaisa merchant API integration is scaffolded via env vars (`JAZZCASH_*`, `EASYPAISA_*`) — **Setup required** with the respective providers.

## Instagram / Meta Shop

`GET /api/catalog` exposes a product feed (id, name, description, price, currency, image, availability, link, category) compatible with Meta Commerce Manager catalog import. To go live:
1. Create a Facebook Business account + Commerce Manager account (**Meta approval required**).
2. Add a data source pointing at `{NEXT_PUBLIC_SITE_URL}/api/catalog` and schedule syncs.
3. Instagram Shopping availability in Pakistan depends on Meta's country eligibility and business verification — the feed works regardless, and product links deep-link to your product pages.

## Abandoned cart reminders

Cart is client-side. The `notifications` table + `WHATSAPP_BUSINESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` env vars are reserved for the WhatsApp Business API integration — **Setup required** (Business account + approved message templates + customer consent).

## Testing

```bash
npm run build     # type-check + production build
npm run dev       # then exercise: add to cart → checkout (COD) → track order → admin order management
npm test          # smoke test (requires the dev server running)
```

The smoke test hits all storefront routes plus coupon/verify/newsletter APIs — 22 checks.

Note: admin two-factor authentication (TOTP/OTP) is **setup required** — the admin login uses env credentials with a signed session cookie. Wire Supabase phone OTP or an authenticator app for production hardening.

## Deploy (Vercel)

```bash
vercel            # or connect repo in Vercel dashboard
```
Set all env vars in Project Settings. For production use Supabase (serverless JSON file storage is read-only on Vercel — demo mode orders won't persist there).

## Project structure

```
src/
  app/            # routes: storefront, /admin panel, /api
  components/     # UI: header, cards, providers (cart/wishlist/toast), admin widgets
  data/           # demo catalog (products, categories, coupons, FAQs, settings)
  lib/            # db.ts (data layer), supabase clients, admin auth, jsondb, types
database/
  migrations/0001_init.sql   # full schema + RLS
  seed.sql                   # demo data
data/local/       # runtime JSON store (demo mode, git-ignored)
```
=======
# tekfinity-ecommerce-web
Production-ready e-commerce platform for premium tech accessories in Pakistan, featuring product management, shopping cart, secure checkout, order tracking, admin dashboard, and payment management. Built with Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL &amp; Auth), Framer Motion, and REST APIs.
>>>>>>> 513c24724df3c0a1d824c9a8610dd201910fd92a
