import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProductBySlug, getProducts, getReviews, getSettings } from "@/lib/db";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard, formatPKR } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { images: p.images[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [reviews, products, settings, categories] = await Promise.all([
    getReviews(product.id), getProducts(), getSettings(), getCategories(),
  ]);
  const related = products
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.category_slug === product.category_slug))
    .slice(0, 4);
  const category = categories.find((c) => c.id === product.category_id || c.slug === product.category_slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku || product.id,
    brand: { "@type": "Brand", name: product.brand || settings.store_name || "Tekfinity" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk"}/product/${product.slug}`,
    },
    aggregateRating: reviews.length
      ? {
          "@type": "AggregateRating",
          ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
          reviewCount: reviews.length,
        }
      : undefined,
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-teal">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-teal">Shop</Link></li>
          {category && <><li aria-hidden="true">/</li><li><Link href={`/shop?category=${category.slug}`} className="hover:text-teal">{category.name}</Link></li></>}
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-ink" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <ProductDetail product={product} reviews={reviews} />

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related">
          <h2 id="related" className="font-display text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
          </div>
        </section>
      )}
    </div>
  );
}
