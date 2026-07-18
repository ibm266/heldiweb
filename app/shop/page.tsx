import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { BuyBox } from "@/components/shop/buy-box";
import { GiftingBand } from "@/components/shop/gifting-band";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { getProduct } from "@/lib/commerce/catalog";
import { COMMERCE_MODE } from "@/lib/commerce/config";
import { serializeJsonLd } from "@/lib/json-ld";
import { getPublishedReviews } from "@/lib/reviews-store";
import { SITE_URL } from "@/lib/site";
import { SAMPLE_PRICE_PENCE, TIERS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Heldi Khana · Heldi",
  description: "Protein that disappears into dal, curry and raita.",
  alternates: { canonical: "/shop" }
};

// Refresh hourly so a review flipped to 'published' in Supabase appears
// without needing a redeploy.
export const revalidate = 3600;

export default async function ShopPage() {
  const product = await getProduct("khana");
  if (!product) notFound();

  // Published reviews when there are any; otherwise the gallery falls back to
  // its placeholder set (see components/reviews/review-gallery.tsx).
  const publishedReviews = await getPublishedReviews();

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
            lowPrice: (SAMPLE_PRICE_PENCE / 100).toFixed(2),
            highPrice: (TIERS.triple.launchPence / 100).toFixed(2),
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

      <ReviewsSection
        id="reviews"
        tone="gold"
        heading="Stirred, tasted, reviewed."
        lede="Bowls from kitchens like yours. Some clips are ours, the rest arrive with the reviews, spoon count and all."
        submitCta
        reviews={publishedReviews.length ? publishedReviews : undefined}
      />

      <GiftingBand />

      <SubpageFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />
    </main>
  );
}
