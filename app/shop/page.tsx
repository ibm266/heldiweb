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
    "Two pouches. Khana for the pot, Chai for the mug. Pick the one your kitchen needs first.",
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
          <h1 className="story-hero__title">Pick your pouch.</h1>
          <p className="story-hero__lede">
            Khana goes into the food. Chai goes into the drink. A spoonful
            each, same rule:{" "}
            <CopyHighlight>nobody at the table can tell</CopyHighlight>.
          </p>
        </div>
        <PouchPicker />
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">WHICH ONE?</p>
          <h2>The pot or the mug.</h2>
          <p>
            <CopyHighlight>Khana</CopyHighlight> is the savoury one: whey
            protein isolate with warm spices, made to vanish into dal, curry,
            sabzi and raita once the pot is off the heat. It is the pouch on
            sale first.
          </p>
          <p>
            <CopyHighlight>Chai</CopyHighlight> is the one for hot drinks:
            whey and casein with cardamom, ginger, cinnamon and clove, a
            little coconut sugar, stirred into chai, tea, coffee or hot
            chocolate once the cup is off the boil. It is still in
            development, so it has a page and no price yet.
          </p>
          <p className="story-note">
            Both contain milk. Both are vegetarian. Both are food
            supplements, not a substitute for a varied and balanced diet.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>Pot or mug, the waitlist hears first.</h2>
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
