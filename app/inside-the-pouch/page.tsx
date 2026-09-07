import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { CHAI_FORMULA } from "@/components/shop/chai-data";
import { FORMULA } from "@/components/shop/nutrition-data";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Inside the pouch · Heldi",
  description:
    "The full Heldi Khana and Heldi Chai ingredient lists, with named suppliers, the Arla whey certificate, and where each pouch is blended and packed.",
  alternates: { canonical: "/inside-the-pouch" }
};

export default function InsideThePouchPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">INSIDE THE POUCH</p>
          <h1 className="story-hero__title">
            The ingredients, in label order.
          </h1>
          <p className="story-hero__lede">
            Khana has eight ingredients and Chai has nine. The lists below
            follow the order printed on each label,{" "}
            <CopyHighlight>from the milk proteins through every spice</CopyHighlight>.
            We also name the suppliers and explain which documents support
            the figures.
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-pull">
        <p className="story-pull__line">Short label. Long paper trail.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE WHEY</p>
          <h2>Arla whey, read on an as-is basis.</h2>
          <p>
            Whey protein isolate makes up 94% of Khana, and the same ingredient
            also appears in Chai. Ours comes from{" "}
            <CopyHighlight>Arla</CopyHighlight>, a farmer-owned dairy
            cooperative. Whey is the liquid separated from milk when paneer is
            made. Arla filters and dries it, then supplies a certificate of
            analysis with the batch. Certificate 0000672935 reports{" "}
            <CopyHighlight>92.66% protein in dry matter</CopyHighlight> at
            4.13% moisture. On the as-is basis used for the product
            calculations, the whey is 88.83% protein.
          </p>
          <p>
            Arla makes it <CopyHighlight>without animal rennet</CopyHighlight>,
            so it is suitable for vegetarians. It contains no meat, gelatine or
            alcohol. We do not yet hold a formal halal certificate. If that
            matters to your table, email{" "}
            info@heldi.co.uk and we will tell you exactly where things stand.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">The batch report</h3>
            <p className="story-menu-card__subtitle">
              Arla whey ingredient, batch FF25466001
            </p>
            <ul className="story-menu-card__list">
              <li className="story-menu-card__item">
                <span>Protein (dry matter)</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>92.7%</span>
              </li>
              <li className="story-menu-card__item">
                <span>Fat</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>0.3%</span>
              </li>
              <li className="story-menu-card__item">
                <span>Lactose</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>2.3%</span>
              </li>
              <li className="story-menu-card__item">
                <span>Moisture</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>4.1%</span>
              </li>
              <li className="story-menu-card__item">
                <span>Safety screen</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>Passed</span>
              </li>
            </ul>
          </div>
          <p>
            Every whey batch arrives with a certificate of analysis. The
            report above records the protein, fat, lactose, moisture and safety
            screen for the incoming Arla ingredient. It is not an analysis of
            a finished Heldi pouch.{" "}
            <CopyHighlight>
              The finished nutrition values are calculated from the recipe and
              supplier data
            </CopyHighlight>
            .
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">
          Blended in England. Packed in England.
        </p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE OTHER SEVEN</p>
          <h2>Khana, in label order.</h2>
          <p>
            Khana in full, most to least:{" "}
            <CopyHighlight>{FORMULA}</CopyHighlight>. Only the whey carries a
            percentage. Food labels list ingredients in descending order by
            weight, so that is the order shown here. The exact spice ratios are
            part of the recipe and are not published.
          </p>
          <p>
            The single spices come from{" "}
            <a
              href="https://www.spicentice.com/collections/cooks-ingredients"
              rel="noopener"
              target="_blank"
            >
              Spice Entice
            </a>
            , a British spice house, from the same cook&apos;s ingredients
            range they sell to home kitchens. In Khana, that is{" "}
            <CopyHighlight>
              cumin, coriander, Kashmiri chilli and turmeric
            </CopyHighlight>
            , which form the single-spice part of the savoury blend.
            The <CopyHighlight>garam masala</CopyHighlight> is a blend rather
            than a single spice, so it has its own supplier:{" "}
            <CopyHighlight>Buy Whole Foods Online</CopyHighlight>, also in the
            UK.
          </p>
          <p>
            The <CopyHighlight>sunflower lecithin</CopyHighlight> comes from
            Special Ingredients, a UK supplier. Lecithin is a fat that occurs{" "}
            <CopyHighlight>naturally in seeds</CopyHighlight> and egg yolk.
            Ours is separated during sunflower oil processing rather than
            synthesised.
          </p>
          <p>
            Sunflower lecithin helps the powder wet and disperse through the
            pot instead of remaining as dry lumps on the surface. We use
            sunflower rather than soya because soya is one of the fourteen
            allergens that must be declared. This leaves soya out of the
            formula and out of the allergen statement.
          </p>
          <p>
            <CopyHighlight>Fine sea salt</CopyHighlight> completes the Khana
            ingredient list and forms part of the savoury spice blend.
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">The mug needs its own formula.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE CHAI POUCH</p>
          <h2>Chai, in label order.</h2>
          <p>
            Chai in full, most to least:{" "}
            <CopyHighlight>{CHAI_FORMULA}</CopyHighlight>. Same Arla whey, same
            sunflower lecithin and the same descending-weight rule. Milk
            protein concentrate and coconut sugar do not appear in Khana. Chai
            also has its own five-spice masala.
          </p>
          <p>
            The second milk protein is{" "}
            <CopyHighlight>milk protein concentrate</CopyHighlight>. Whey on
            its own produces a thinner drink. Milk protein concentrate is
            mostly casein and gives liquid more body. It is included{" "}
            <CopyHighlight>for creaminess</CopyHighlight>, rather than to set
            the protein figure.
          </p>
          <p>
            Chai also contains <CopyHighlight>coconut sugar</CopyHighlight>, so
            it never carries Khana&apos;s &ldquo;no added sugar&rdquo; wording.
            Coconut sugar provides the sweetness in the formula, and its 10%
            share is printed in the ingredient list.
          </p>
          <p>
            Then the masala:{" "}
            <CopyHighlight>
              ginger, cardamom, Ceylon cinnamon, black pepper and clove
            </CopyHighlight>
            , in descending order by weight. Ginger is the largest spice in the
            formula. The cinnamon is Ceylon rather than cassia, and the black
            pepper is an intentional part of the masala.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">What each one is doing</h3>
            <p className="story-menu-card__subtitle">
              the chai pouch, ingredient by job
            </p>
            <ul className="story-menu-card__list">
              <li className="story-menu-card__item">
                <span>Whey protein isolate</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>the protein</span>
              </li>
              <li className="story-menu-card__item">
                <span>Milk protein concentrate</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>the creaminess</span>
              </li>
              <li className="story-menu-card__item">
                <span>Coconut sugar</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>the sweetness</span>
              </li>
              <li className="story-menu-card__item">
                <span>Ginger, cardamom, cinnamon, pepper, clove</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>the masala</span>
              </li>
              <li className="story-menu-card__item">
                <span>Sunflower lecithin</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>keeps it from separating</span>
              </li>
            </ul>
          </div>
          <p>
            Both milk proteins come from milk, so the chai pouch reads{" "}
            <CopyHighlight>
              contains milk (whey and milk protein concentrate)
            </CopyHighlight>{" "}
            where Khana names whey alone. Each statement follows the milk
            ingredients in that product.
          </p>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">MADE IN ENGLAND</p>
          <h2>Blended here. Packed here.</h2>
          <p>
            Every pouch of Heldi is{" "}
            <CopyHighlight>blended in England and packed in England</CopyHighlight>
            , in small batches. The founder can drive to the blending and
            packing site. If something looks wrong, we can speak directly to
            the people making it and inspect it there.
          </p>
          <p>
            That proximity supports the same approach as this page: named
            suppliers, batch records and{" "}
            <CopyHighlight>details that you can check</CopyHighlight>.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>The full list is here.</h2>
          <p>
            Eight ingredients in Khana and nine in Chai, shown in the same
            order as their labels.
          </p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
