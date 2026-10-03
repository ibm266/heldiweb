import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { PouchPicker, PouchSmallPrint } from "@/components/shop/pouch-picker";
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
    "Heldi Khana for the bowl, Heldi Chai for the mug, or both. Two protein blends that stir into the food and drinks your family already makes.",
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
          <h1 className="story-hero__title">
            Pick the pouch that fits your kitchen.
          </h1>
          <p className="story-hero__lede">
            A bowl at the dinner table, or a mug by the kettle. Whichever you
            reach for,{" "}
            <CopyHighlight>
              the recipes stay exactly as your family makes them.
            </CopyHighlight>
          </p>
        </div>
        <PouchPicker />
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">WHICH ONE?</p>
          <h2>Will you use Heldi in a bowl or a mug?</h2>
          <p>
            <CopyHighlight>Khana</CopyHighlight> is the savoury one: whey
            protein isolate with warm spices for dal, curry, sabzi and raita.
            Stir a spoonful into your own bowl at the table, or take the pot
            off the heat and stir it through for everyone.
          </p>
          <p>
            <CopyHighlight>Chai</CopyHighlight> is the one for hot drinks:
            whey and milk protein concentrate with ginger, cardamom, cinnamon,
            black pepper and clove, a little coconut sugar, stirred into chai,
            tea, coffee or hot chocolate once the cup is cool enough to drink.
            It launches alongside Khana.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>The bowl, the mug, or both. Your call.</h2>
          <WaitlistOrShopCta />
        </div>
      </section>

      <section className="section section--cream">
        <div className="content">
          <PouchSmallPrint />
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
