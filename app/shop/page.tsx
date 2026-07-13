import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/shop/buy-box";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { getProduct } from "@/lib/commerce/catalog";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Heldi Khana · Heldi",
  description: "Protein that disappears into dal, curry and raita.",
  alternates: { canonical: "/shop" }
};

export default async function ShopPage() {
  const product = await getProduct("khana");
  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: product.images.map((image) => `${SITE_URL}${image.url}`),
    brand: { "@type": "Brand", name: "Heldi" },
    // No offer while in waitlist mode — availability would be misleading.
    ...(COMMERCE_MODE === "live"
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: "5.00",
            highPrice: "35.00",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/shop`
          }
        }
      : {})
  };

  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream" data-nav-hero>
        <BuyBox product={product} />
      </section>

      <SubpageFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </main>
  );
}
