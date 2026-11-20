import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getCategories, getSettings } from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: {
      default: s.seo?.title || "Tekfinity — Premium Mobile Accessories",
      template: "%s | Tekfinity",
    },
    description: s.seo?.description || "Premium phone cases, chargers, power banks, smartwatches and electronics accessories — fast delivery across Pakistan with cash on delivery.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk"),
    openGraph: { type: "website", siteName: s.store_name || "Tekfinity" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090B10",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-teal focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <Header storeName={settings.store_name || "Tekfinity"} announcement={settings.announcement} categories={categories} />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer settings={settings} />
          <WhatsAppFloat phone={settings.whatsapp_number} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    name: settings.store_name || "Tekfinity",
                    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk",
                    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk"}/techfinity-logo.png`,
                  },
                  {
                    "@type": "WebSite",
                    name: settings.store_name || "Tekfinity",
                    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk",
                    potentialAction: {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tekfinity.pk"}/shop?q={search_term_string}`,
                      },
                      "query-input": "required name=search_term_string",
                    },
                  },
                ],
              }),
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
