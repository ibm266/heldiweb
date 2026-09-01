import type { Metadata } from "next";
import { ChaiBuyBox } from "@/components/shop/chai-buy-box";
import { CHAI_IMAGES } from "@/components/shop/chai-data";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Heldi Chai · Heldi",
  description: "Protein that disappears into your chai.",
  alternates: { canonical: "/shop/chai" }
};

export default function ChaiPage() {
  // No `offers` block, in either commerce mode. Khana's schema switches its
  // AggregateOffer on COMMERCE_MODE because Khana has a price ladder waiting
  // behind the flag; Chai has none, so any offer here would be invented.
  // Add it in the same shape as /shop once NEXT_STEPS.md §1b lands the
  // pricing decision and the Shopify variants.
  //
  // No ReviewsSection either. It falls back to a placeholder set when there
  // are no published reviews (BRAND.md §12 forbids seeding fake reviews on a
  // new surface), lib/reviews-store.ts does not filter by product, and
  // lib/reviews.ts computes a reviewer's added grams from Khana's
  // PROTEIN_GRAMS_PER_TBSP. All three have to be product-aware before real
  // Chai reviews can show here.
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Heldi Chai",
    description:
      "A high-protein whey and casein blend with real chai spices, made to stir into chai, tea, coffee and hot chocolate. Contains milk.",
    image: CHAI_IMAGES.map((image) => `${SITE_URL}${image.url}`),
    brand: { "@type": "Brand", name: "Heldi" }
  };

  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream" data-nav-hero>
        <ChaiBuyBox />
      </section>

      <SubpageFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />
    </main>
  );
}
