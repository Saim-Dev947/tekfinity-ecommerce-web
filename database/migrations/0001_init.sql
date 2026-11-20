-- ============================================================
-- Tekfinity Store — Initial Schema (Supabase PostgreSQL)
-- Run in Supabase SQL Editor or via `supabase db push`.
-- Includes Row Level Security policies for all tables.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Helper: is the caller an admin? ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_roles ar
    join auth.users u on u.id = ar.user_id
    where ar.user_id = auth.uid()
  );
$$;

-- ---------- 1. profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles: owner read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, full_name, email)
  values (new.id, new.phone, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. categories ----------
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  parent_id text references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "categories: public read" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 3. products ----------
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  sku text,
  category_id text references public.categories(id) on delete set null,
  category_slug text,
  brand text,
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 5,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_flash_sale boolean not null default false,
  colors text[] not null default '{}',
  specifications jsonb not null default '{}',
  images text[] not null default '{}',
  rating numeric(2,1) default 0,
  review_count int not null default 0,
  verification_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active) where is_active;
create index if not exists idx_products_price on public.products(price);
alter table public.products enable row level security;
create policy "products: public read" on public.products for select using (true);
create policy "products: admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 4. product_images ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id);
alter table public.product_images enable row level security;
create policy "product_images: public read" on public.product_images for select using (true);
create policy "product_images: admin write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 5. product_variants ----------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  name text not null,               -- e.g. "Color: White" or "128GB"
  sku text unique,
  price_delta numeric(12,2) not null default 0,
  stock int not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_variants_product on public.product_variants(product_id);
alter table public.product_variants enable row level security;
create policy "variants: public read" on public.product_variants for select using (true);
create policy "variants: admin write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 6. inventory ----------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  stock int not null default 0 check (stock >= 0),
  reserved int not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id)
);
create index if not exists idx_inventory_product on public.inventory(product_id);
alter table public.inventory enable row level security;
create policy "inventory: admin only" on public.inventory for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 7/8. carts & cart_items (server-side carts for logged-in users) ----------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  session_id text,                  -- anonymous cart session id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id)
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null check (quantity > 0),
  color text,
  added_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
create policy "carts: owner" on public.carts for all using (auth.uid() = customer_id or public.is_admin()) with check (auth.uid() = customer_id or public.is_admin());
create policy "cart_items: owner" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid()) or public.is_admin())
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid()) or public.is_admin());

-- ---------- 9/10. wishlists & wishlist_items ----------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id)
);
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
create policy "wishlists: owner" on public.wishlists for all using (auth.uid() = customer_id or public.is_admin()) with check (auth.uid() = customer_id or public.is_admin());
create policy "wishlist_items: owner" on public.wishlist_items for all
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()) or public.is_admin())
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()) or public.is_admin());

-- ---------- 11. orders ----------
create table if not exists public.orders (
  id text primary key,                -- e.g. TF-ABC123
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  province text,
  postal_code text,
  notes text,
  items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  delivery_charge numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  payment_method text not null check (payment_method in ('cod','jazzcash','easypaisa','bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending','submitted','verified','rejected')),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested')),
  receipt_url text,
  tracking_info text,
  status_history jsonb not null default '[]',
  is_flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
alter table public.orders enable row level security;
create policy "orders: owner read" on public.orders for select
  using (auth.uid() = customer_id or phone = (select phone from public.profiles where id = auth.uid()) or public.is_admin());
create policy "orders: admin write" on public.orders for all using (public.is_admin()) with check (public.is_admin());
-- Customers may create orders via API (service role); direct inserts restricted to admin.

-- ---------- 12. order_items (normalized view — kept in sync with orders.items) ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  slug text,
  price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  image text,
  color text,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);
alter table public.order_items enable row level security;
create policy "order_items: owner read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin())));
create policy "order_items: admin write" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 13. payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  method text not null check (method in ('cod','jazzcash','easypaisa','bank_transfer')),
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','submitted','verified','rejected')),
  transaction_ref text,
  gateway_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);
alter table public.payments enable row level security;
create policy "payments: admin only" on public.payments for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 14. payment_receipts ----------
create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  file_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.payment_receipts enable row level security;
create policy "receipts: admin only" on public.payment_receipts for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 15. coupons ----------
create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_amount numeric(12,2) default 0,
  expires_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "coupons: public read" on public.coupons for select using (is_active = true);
create policy "coupons: admin write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 16. coupon_usage ----------
create table if not exists public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id text not null references public.coupons(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  discount_amount numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);
alter table public.coupon_usage enable row level security;
create policy "coupon_usage: admin only" on public.coupon_usage for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 17. product_reviews ----------
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on public.product_reviews(product_id) where is_approved;
alter table public.product_reviews enable row level security;
create policy "reviews: public read approved" on public.product_reviews for select using (is_approved = true or public.is_admin());
create policy "reviews: anyone insert" on public.product_reviews for insert with check (true);
create policy "reviews: admin write" on public.product_reviews for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 18. addresses ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  province text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.addresses enable row level security;
create policy "addresses: owner" on public.addresses for all
  using (customer_id = auth.uid() or public.is_admin())
  with check (customer_id = auth.uid() or public.is_admin());

-- ---------- 19. product_verifications ----------
create table if not exists public.product_verifications (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  product_id text references public.products(id) on delete set null,
  product_name text,
  status text not null default 'active' check (status in ('active','verified','revoked')),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.product_verifications enable row level security;
-- Anyone can look up a code (verification is meant to be public), only admins manage.
create policy "verifications: public read" on public.product_verifications for select using (true);
create policy "verifications: admin write" on public.product_verifications for all using (public.is_admin()) with check (public.is_admin());
-- Public claim via service role/API only.

-- ---------- 20. return_requests ----------
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  customer_phone text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_returns_order on public.return_requests(order_id);
alter table public.return_requests enable row level security;
create policy "returns: admin only" on public.return_requests for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 21. faqs ----------
create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  category text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create policy "faqs: public read published" on public.faqs for select using (is_published = true or public.is_admin());
create policy "faqs: admin write" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 22. flash_sales ----------
create table if not exists public.flash_sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ends_at timestamptz not null,
  product_ids text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.flash_sales enable row level security;
create policy "flash_sales: public read" on public.flash_sales for select using (is_active = true);
create policy "flash_sales: admin write" on public.flash_sales for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 23. notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_phone text,
  type text not null default 'info',   -- order_update, abandoned_cart, newsletter, low_stock…
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "notifications: admin only" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 24. site_settings (single-row config) ----------
create table if not exists public.site_settings (
  id text primary key default 'default',
  store_name text,
  tagline text,
  announcement text,
  whatsapp_number text,
  contact_email text,
  contact_phone text,
  delivery_charge numeric(12,2) default 250,
  free_delivery_above numeric(12,2) default 0,
  return_days int default 7,
  warranty_text text,
  bank_details jsonb not null default '{}',
  jazzcash_number text,
  easypaisa_number text,
  social jsonb not null default '{}',
  seo jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 25. admin_roles ----------
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','superadmin')),
  created_at timestamptz not null default now()
);
alter table public.admin_roles enable row level security;
create policy "admin_roles: admin read" on public.admin_roles for select using (public.is_admin() or auth.uid() = user_id);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['products','orders','payments','inventory','carts','site_settings'] loop
    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;
