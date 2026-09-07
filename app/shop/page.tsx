import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { PouchPicker } from "@/components/shop/pouch-picker";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";

// The shop front: both pouches side by side, pick one. Khana's buy box lives
// at /shop/khana and Chai's page at /shop/chai; this page only routes. It
// carries no prices in either mode (the product pages own those) and no
// protein figures (Chai has none to publish yet, see chai-data.ts).

export const metadata: Metadata = {
  title: "Shop · Heldi",
  description:
    "Choose Heldi Khana for shared pots, or meet Heldi Chai for hot drinks. Two pouches for two everyday kitchen routines.",
  alternates: { canonical: "/shop" }
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Heldi pouches",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/shop/khana`,
      name: "Heldi Khana"
    },
    {
      "@type": "ListItem",
      position: 2,
      url: `${SITE_URL}/shop/chai`,
      name: "Heldi Chai"
    }
  ]
};

export default function ShopPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero shop-front" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">TWO POUCHES</p>
          <h1 className="story-hero__title">Start with what you make most.</h1>
          <p className="story-hero__lede">
            If dinner is already on the stove, start with Khana. If your day
            is measured in mugs, meet Chai.{" "}
            <CopyHighlight>Choose by the next recipe</CopyHighlight>, then see
            exactly what goes in and when to stir.
          </p>
        </div>
        <PouchPicker />
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">WHICH ONE?</p>
          <h2>What is usually on the stove?</h2>
          <p>
            <CopyHighlight>Khana</CopyHighlight> is the savoury one: whey
            protein isolate with warm spices for dal, curry, sabzi and raita.
            Finish cooking, take the pot off the heat, then stir it through the
            shared pot or add it to your own bowl. Khana is the pouch on sale
            first.
          </p>
          <p>
            <CopyHighlight>Chai</CopyHighlight> belongs beside the mugs. It
            brings whey and casein together with cardamom, ginger, cinnamon,
            clove and a little coconut sugar for chai, tea, coffee or hot
            chocolate. Its page shows the method and label facts, but there is
            no price until it is ready for the shop.
          </p>
          <p className="story-note">
            Both contain milk. Both are vegetarian. Both are food
            supplements, not a substitute for a varied and balanced diet.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>Choose from the next thing you are making.</h2>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListSchema) }}
      />
    </main>
  );
}
