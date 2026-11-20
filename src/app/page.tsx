import Link from "next/link";
import { ArrowRight, BadgeCheck, Headphones, RotateCcw, ShieldCheck, Truck, Zap } from "lucide-react";
import { getCategories, getFAQs, getFlashSales, getProducts, getReviews, getSettings } from "@/lib/db";
import { ProductCard, formatPKR } from "@/components/product-card";
import { FlashCountdown } from "@/components/flash-countdown";
import { Newsletter } from "@/components/newsletter";
import { Reveal } from "@/components/reveal";
import type { Metadata } from "next";
import type { Product } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.seo?.title, description: s.seo?.description };
}

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories, faqs, settings, flashSales] = await Promise.all([
    getProducts(), getCategories(), getFAQs(), getSettings(), getFlashSales(),
  ]);

  const active = products.filter((p) => p.is_active !== false && p.stock > 0);
  const featured = active.filter((p) => p.is_featured).slice(0, 8);
  const trending = [...active].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0)).slice(0, 4);
  const bestsellers = active.filter((p) => p.is_bestseller).slice(0, 4);
  const newArrivals = active.filter((p) => p.is_new).slice(0, 4);
  const flash = active.filter((p) => p.is_flash_sale);
  const flashEnd = flashSales[0]?.ends_at;

  const reviews = (await Promise.all(active.slice(0, 6).map((p) => getReviews(p.id)))).flat().slice(0, 6);

  const perks = [
    { icon: Truck, title: "Fast Nationwide Delivery", text: "Karachi in 24 hours, other cities in 2–3 days." },
    { icon: ShieldCheck, title: "6-Month Warranty", text: "Checking warranty on all eligible products." },
    { icon: RotateCcw, title: "Easy Returns", text: "7-day return & exchange, subject to policy." },
    { icon: BadgeCheck, title: "Verified Products", text: "Scan the QR code to verify registered items." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-navy blur-3xl" />
        <div className="container-x relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <p className="badge bg-teal/15 text-teal ring-1 ring-teal/30">Premium Mobile Accessories · Pakistan</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Premium accessories for <span className="text-teal">every phone.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              Discover quality products, thoughtfully selected to bring lasting value and a better everyday experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn bg-white px-7 py-3.5 text-sm font-bold text-ink hover:bg-mist">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="btn border border-white/20 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                Explore Products
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative hidden lg:block">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1000&q=80&auto=format&fit=crop"
                alt="AirPods Pro"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
                <div>
                  <p className="text-sm font-bold">AirPods Pro (2nd Gen)</p>
                  <p className="text-xs text-white/70">{formatPKR(58999)}</p>
                </div>
                <Link href="/product/airpods-pro-2-usb-c" className="btn bg-teal px-4 py-2 text-xs font-bold text-white hover:bg-tealDark">
                  Buy
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-14 sm:py-20" aria-labelledby="categories">
        <Reveal className="flex items-end justify-between">
          <div>
            <h2 id="categories" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Shop by Category</h2>
            <p className="mt-2 text-sm text-slate-500">Everything you need for your Apple ecosystem.</p>
          </div>
          <Link href="/shop" className="link-underline hidden text-sm font-semibold text-teal sm:block">View all</Link>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="aspect-[4/3] overflow-hidden bg-mist">
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  )}
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm font-bold text-ink group-hover:text-teal">{c.name}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Flash sale */}
      {flash.length > 0 && (
        <section className="bg-mist py-14 sm:py-20" aria-labelledby="flash-sale">
          <div className="container-x">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="badge bg-red-500/10 text-red-600 ring-1 ring-red-500/30"><Zap className="mr-1 h-3 w-3" /> Flash Sale</p>
                <h2 id="flash-sale" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Deals that won&apos;t last</h2>
              </div>
              {flashEnd && <FlashCountdown endsAt={flashEnd} />}
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {flash.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <ProductSection id="featured" title="Featured Products" subtitle="Hand-picked premium gear" products={featured} cols={4} />

      {/* Best sellers */}
      {bestsellers.length > 0 && (
        <section className="container-x py-14 sm:py-20" aria-labelledby="best">
          <Reveal className="flex items-end justify-between">
            <div>
              <h2 id="best" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Best Sellers</h2>
              <p className="mt-2 text-sm text-slate-500">What Pakistan loves most.</p>
            </div>
            <Link href="/shop?sort=popular" className="link-underline text-sm font-semibold text-teal">Shop bestsellers</Link>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {bestsellers.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
          </div>
        </section>
      )}

      {/* New arrivals + trending */}
      <section className="bg-mist py-14 sm:py-20" aria-label="New arrivals and trending">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">New Arrivals</h2>
              <Link href="/shop?sort=newest" className="link-underline text-sm font-semibold text-teal">View all</Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight">Trending Now</h2>
              <Link href="/shop?sort=popular" className="link-underline text-sm font-semibold text-teal">View all</Link>
            </div>
            <ul className="mt-6 space-y-3">
              {trending.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} className="card flex items-center gap-4 p-3 transition hover:shadow-lift">
                    <span className="font-display text-xl font-bold text-line">{String(i + 1).padStart(2, "0")}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-slate-500">★ {p.rating?.toFixed(1) ?? "—"}</p>
                    </div>
                    <p className="font-display text-sm font-bold text-teal">{formatPKR(p.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-x py-14 sm:py-20" aria-labelledby="why">
        <Reveal className="text-center">
          <h2 id="why" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Why shop with Tekfinity?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Premium quality, honest pricing and support you can actually reach.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 0.07}>
              <div className="card h-full p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <perk.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-ink">{perk.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{perk.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-navy py-14 text-white sm:py-20" aria-labelledby="reviews">
          <div className="container-x">
            <Reveal className="text-center">
              <Headphones className="mx-auto h-8 w-8 text-teal" />
              <h2 id="reviews" className="mt-3 font-display text-2xl font-bold sm:text-3xl">Loved by customers</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="card border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex gap-1 text-teal" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < r.rating ? "" : "opacity-25"}>★</span>
                    ))}
                  </div>
                  {r.title && <figcaption className="mt-3 text-sm font-bold">{r.title}</figcaption>}
                  <blockquote className="mt-1 text-sm leading-relaxed text-white/70">{r.body}</blockquote>
                  <p className="mt-3 text-xs font-semibold text-teal">{r.customer_name}</p>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />

      {/* FAQ teaser */}
      {faqs.length > 0 && (
        <section className="container-x py-14 sm:py-20" aria-labelledby="faq-teaser">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-teaser" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.id} className="card group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ink">
                    {f.question}
                    <span className="ml-4 text-teal transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.answer}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center">
              <Link href="/faq" className="link-underline text-sm font-semibold text-teal">See all FAQs</Link>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function ProductSection({
  id, title, subtitle, products, cols = 4,
}: { id: string; title: string; subtitle: string; products: Product[]; cols?: number }) {
  if (!products.length) return null;
  const grid = cols === 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4";
  return (
    <section className="container-x py-14 sm:py-20" aria-labelledby={id}>
      <Reveal className="flex items-end justify-between">
        <div>
          <h2 id={id} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link href="/shop" className="link-underline text-sm font-semibold text-teal">View all</Link>
      </Reveal>
      <div className={`mt-8 grid gap-4 ${grid}`}>
        {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
      </div>
    </section>
  );
}
