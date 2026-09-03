import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { CHAI_FORMULA } from "@/components/shop/chai-data";
import { FORMULA } from "@/components/shop/nutrition-data";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Inside the pouch · Heldi",
  description:
    "Whey protein isolate from Arla, spices from Spice Entice and Buy Whole Foods Online, sunflower lecithin from Special Ingredients. Blended and packed in England. Every ingredient in Heldi Khana and Heldi Chai, and what each one is doing.",
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
            Every ingredient. Nothing to hide.
          </h1>
          <p className="story-hero__lede">
            Khana is eight ingredients, Chai is nine, and{" "}
            <CopyHighlight>most of them are spices you already cook with.</CopyHighlight>{" "}
            Here is every one of them, where it came from, and the paperwork
            that follows it in.
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
          <h2>It starts with milk, from people who know milk.</h2>
          <p>
            About 94% of every pouch is whey protein isolate, and ours comes
            from <CopyHighlight>Arla</CopyHighlight>, the farmer-owned dairy
            cooperative behind some of the most trusted dairy in Europe. Whey
            is the part of milk your nani strains off when she makes paneer.
            Arla filters it until it is{" "}
            <CopyHighlight>close to 90% protein</CopyHighlight>, gently dries
            it, and sends it to us with its test results attached. The
            certificate for our batch says 92.66%, but that figure is measured
            with the water taken out; as the powder actually arrives it is
            88.83%, and that is the number every calculation on this site
            uses.
          </p>
          <p>
            It is made <CopyHighlight>without animal rennet</CopyHighlight>,
            which keeps it fully vegetarian. No meat, no gelatine, no alcohol,
            nothing hiding behind a technical name. We do not yet hold a formal
            halal certificate; if that matters to your table, email{" "}
            info@heldi.co.uk and we will tell you exactly where things stand.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">The batch report</h3>
            <p className="story-menu-card__subtitle">
              batch FF25466001, tested before it gets near a kitchen
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
            Every batch of whey arrives with a certificate of analysis like
            this one: protein content, purity, and a full safety screen,
            checked before it comes anywhere near a pot.{" "}
            <CopyHighlight>Desi households check marks. So do we.</CopyHighlight>
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
          <h2>Ingredients with a name and an address.</h2>
          <p>
            Khana in full, most to least:{" "}
            <CopyHighlight>{FORMULA}</CopyHighlight>. Only the whey carries a
            percentage. The order is the order, largest first, because that is
            what a label has to show; the exact spice ratios are the recipe,
            and those we keep.
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
            , there to help the blend settle into the dishes you already make.
            The <CopyHighlight>garam masala</CopyHighlight> is a blend rather
            than a single spice, so it has its own supplier:{" "}
            <CopyHighlight>Buy Whole Foods Online</CopyHighlight>, also in the
            UK.
          </p>
          <p>
            The <CopyHighlight>sunflower lecithin</CopyHighlight> comes from
            Special Ingredients, a UK supplier, and it is the only word on the
            label that sounds like chemistry. It is not. Lecithin is a fat that
            occurs <CopyHighlight>naturally in seeds</CopyHighlight>, and in egg
            yolk, which is the whole reason mayonnaise holds together instead
            of splitting into oil and vinegar. Ours is separated out when
            sunflower seeds are pressed for their oil. Nothing is synthesised
            to make it.
          </p>
          <p>
            What it does is simple. It is the reason a spoonful sinks into the
            pot and vanishes, instead of sitting on the surface in lumps that
            never wet through. We use sunflower rather than soya because soya
            is one of the fourteen allergens a label has to declare, and this
            way that is one fewer thing for you to read.
          </p>
          <p>
            There is <CopyHighlight>fine sea salt</CopyHighlight> too. Just
            enough to keep it tasting like food rather than a supplement.
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">A mug is not a pot.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE CHAI POUCH</p>
          <h2>Nine ingredients, and two of them are new.</h2>
          <p>
            Chai in full, most to least:{" "}
            <CopyHighlight>{CHAI_FORMULA}</CopyHighlight>. Same Arla whey, same
            sunflower lecithin, same rule about keeping the spice ratios to
            ourselves. Two things are new, and both are there because a drink
            has to behave like a drink.
          </p>
          <p>
            The first is a{" "}
            <CopyHighlight>second milk protein</CopyHighlight>. Whey on its own
            is thin in liquid. It dissolves, it delivers the protein, and it
            leaves you with something closer to spiced water than to chai. So
            the chai carries milk protein concentrate alongside it, which is
            mostly casein, the part of milk that gives milk its body. Casein is
            the reason a glass of milk feels like something in the mouth and a
            glass of water does not. It is in there{" "}
            <CopyHighlight>for creaminess</CopyHighlight>, and for nothing
            else.
          </p>
          <p>
            The second is <CopyHighlight>coconut sugar</CopyHighlight>, and it
            is the reason Chai never borrows Khana&apos;s &ldquo;no added
            sugar&rdquo;. A mug of spiced protein with no sweetness in it at all
            is a drink you finish once, politely, and never make again. There is
            enough to make it worth drinking and no more, and the amount is
            printed on the label rather than left for you to guess at.
          </p>
          <p>
            Then the masala:{" "}
            <CopyHighlight>
              ginger, cardamom, Ceylon cinnamon, black pepper and clove
            </CopyHighlight>
            , in the order they appear on the label. Ginger leads, which is why
            the first thing you taste is warmth rather than sweetness. The
            cinnamon is Ceylon rather than cassia, the softer and sweeter of the
            two. The black pepper is not a typo; chai without it loses its
            edge.
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
                <span>just enough sweetness</span>
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
            where Khana names the whey alone. Same rule as everything else on
            this page. If it is in there, it is on the label.
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
            , in small batches. Short supply lines, and a founder who can
            drive to where his product is made. If something ever looks off,
            we do not wait for a report from an ocean away. We go and look.
          </p>
          <p>
            That is also why this page exists. When you make things close to
            home, <CopyHighlight>showing your working is easy</CopyHighlight>.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>Read the label out loud.</h2>
          <p>
            Eight ingredients in the khana, nine in the chai, and nothing in
            either that you need to look up.
          </p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
