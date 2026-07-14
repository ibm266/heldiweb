import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Inside the pouch · Heldi",
  description:
    "Whey protein isolate from Arla, spices from Spice Entice, sunflower lecithin from Special Ingredients. Blended and packed in England, with every batch tested. The full Heldi label, ingredient by ingredient.",
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
            Four ingredients. Nothing to hide.
          </h1>
          <p className="story-hero__lede">
            Whey protein isolate, sunflower lecithin, cumin, fine sea salt.{" "}
            <CopyHighlight>That is the whole label.</CopyHighlight> Here is
            where each one comes from, and the paperwork that follows it in.
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
            <CopyHighlight>over 90% protein</CopyHighlight>, gently dries it,
            and sends it to us with its test results attached.
          </p>
          <p>
            It is made <CopyHighlight>without animal rennet</CopyHighlight>,
            which keeps it fully vegetarian. No meat, no gelatine, nothing
            hiding behind a technical name.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">The batch report</h3>
            <p className="story-menu-card__subtitle">
              batch FF25465001, tested before it gets near a kitchen
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
                <span>Salmonella</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>Absent</span>
              </li>
              <li className="story-menu-card__item">
                <span>Listeria</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>Not detected</span>
              </li>
              <li className="story-menu-card__item">
                <span>E. coli</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>Not detected</span>
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
          <p className="eyebrow">THE OTHER THREE</p>
          <h2>Ingredients with a name and an address.</h2>
          <p>
            Every spice we blend comes from{" "}
            <a
              href="https://www.spicentice.com/collections/cooks-ingredients"
              rel="noopener"
              target="_blank"
            >
              Spice Entice
            </a>
            , a British spice house, from the same cook&apos;s ingredients
            range they sell to home kitchens. In Khana, that is{" "}
            <CopyHighlight>cumin</CopyHighlight>, there to help the blend
            settle into the dishes you already make.
          </p>
          <p>
            The <CopyHighlight>sunflower lecithin</CopyHighlight> comes from
            Special Ingredients, a UK supplier. Lecithin is the reason a
            spoonful of Heldi disappears into the pot instead of sitting on
            top in clumps. Ours comes from sunflowers, not soy.
          </p>
          <p>
            The last ingredient is <CopyHighlight>fine sea salt</CopyHighlight>,
            0.6% of the blend. Just enough to keep it tasting like food rather
            than a supplement.
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
            Four ingredients, ten grams of protein a spoonful, nothing you
            need to look up.
          </p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
