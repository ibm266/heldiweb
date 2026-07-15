import type { Metadata } from "next";
import Image from "next/image";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Our story · Heldi",
  description:
    "Heldi is healthy, the way my nani says it. The story of the name, the kitchen trials, and protein made for the family table.",
  alternates: { canonical: "/our-story" }
};

export default function OurStoryPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">OUR STORY</p>
          <h1 className="story-hero__title">
            Heldi began with a word my nani made up.
          </h1>

          <figure className="story-photo-card story-hero__figure">
            <Image
              className="story-photo-card__image"
              src="/images/our-story/nani.jpg"
              alt="Mihir with his nani"
              width={1024}
              height={682}
              priority
              sizes="(max-width: 560px) calc(100vw - 4.5rem), 440px"
            />
            <figcaption className="story-photo-card__caption">
              My nani, the woman who coined it.
            </figcaption>
          </figure>

          <p className="story-hero__lede">
            Ask her if the food was healthy and she would smile and say it was{" "}
            <CopyHighlight>heldi</CopyHighlight>. Not healthy in the clinical
            sense. Heldi the way home-cooked food is:{" "}
            <CopyHighlight>warm, familiar, made with care, made for you</CopyHighlight>.
            That is where the name comes from.{" "}
            <CopyHighlight>Healthy, the way my nani says it.</CopyHighlight>
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-pull">
        <p className="story-pull__line">That word stayed with me.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">MIHIR</p>
          <h2>I grew up on dal. Training asked for more.</h2>
          <p>
            I&apos;m Mihir. I grew up in a vegetarian house on dal, sabzi,
            raita and chai, and I loved all of it. Then training became a big
            part of my life, and the food of my childhood started slipping off
            my plate. Not because I stopped loving it. Because{" "}
            <CopyHighlight>the numbers didn&apos;t add up</CopyHighlight>.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">Nani&apos;s menu</h3>
            <p className="story-menu-card__subtitle">
              same dishes, since forever
            </p>
            <ul className="story-menu-card__list">
              <li className="story-menu-card__item">
                <span>Dal tadka</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>6g</span>
              </li>
              <li className="story-menu-card__item">
                <span>Two rotis</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>6g</span>
              </li>
              <li className="story-menu-card__item">
                <span>Aloo sabzi</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>3g</span>
              </li>
              <li className="story-menu-card__item">
                <span>Cucumber raita</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>4g</span>
              </li>
              <li className="story-menu-card__item">
                <span>Masala chai</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>1g</span>
              </li>
            </ul>
            <div className="story-menu-card__totals">
              <p>
                <span>Protein on my plate</span>
                <strong>20g</strong>
              </p>
              <p>
                <span>What training asked</span>
                <strong>30g</strong>
              </p>
            </div>
            <p className="story-menu-card__gap">
              <span>The gap</span>
              <strong>10g</strong>
            </p>
          </div>

          <p>
            The meals I grew up on are rich in almost everything{" "}
            <CopyHighlight>except protein</CopyHighlight>. I didn&apos;t want
            bland fitness food, and I didn&apos;t want another shake. I wanted
            the food I loved to do one more thing for me. So I made Heldi:{" "}
            <CopyHighlight>one spoonful, ten grams of protein</CopyHighlight>,
            disappearing into the dishes we already cook.
          </p>
          <p className="story-note">The same food, just a little Heldier.</p>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE KITCHEN TRIALS</p>
          <h2>Six powders. One kitchen. A few ruined dinners.</h2>
          <p>
            I did not start with whey. I started with{" "}
            <CopyHighlight>
              every protein powder you can think of
            </CopyHighlight>{" "}
            and brought each one home to the only lab that mattered: my
            mother&apos;s kitchen. She cooked, I stirred, and we ate the
            results. Some of them we would rather forget.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">The trial menu</h3>
            <p className="story-menu-card__subtitle">
              every powder, judged at the table
            </p>
            <ul className="story-menu-card__list">
              <li className="story-menu-card__item">
                <span>Brown rice protein</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>gritty</span>
              </li>
              <li className="story-menu-card__item">
                <span>Pea protein</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>tasted like the bag</span>
              </li>
              <li className="story-menu-card__item">
                <span>Soy protein</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>split the kadhi</span>
              </li>
              <li className="story-menu-card__item">
                <span>Casein</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>turned dal to cement</span>
              </li>
              <li className="story-menu-card__item">
                <span>Whey protein</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>close, but heavy</span>
              </li>
              <li className="story-menu-card__item">
                <span>Whey protein isolate</span>
                <span className="story-menu-card__dots" aria-hidden="true" />
                <span>disappeared</span>
              </li>
            </ul>
          </div>
          <p>
            Whey protein isolate was the only one that vanished into the pot.
            No grit, no aftertaste, no argument from the cook. The dishes
            stayed nani&apos;s dishes. That was the whole test:{" "}
            <CopyHighlight>
              if Mama could taste the difference, it failed
            </CopyHighlight>
            .
          </p>
          <p className="story-note">
            One pot of kadhi gave its life for this. We remember it fondly.
          </p>
          <a className="pill-link" href="/inside-the-pouch">
            See what&apos;s in the pouch now &#8594;
          </a>
        </div>
      </section>

      <section className="section section--ink section--bordered story-family">
        <div className="story-family__grid">
          <figure className="story-photo-card story-photo-card--on-ink story-family__figure">
            <Image
              className="story-photo-card__image"
              src="/images/our-story/mama-papa.jpg"
              alt="Mihir with his mama and papa after a Heldi meal"
              width={672}
              height={1024}
              sizes="(max-width: 900px) 70vw, 300px"
            />
            <figcaption className="story-photo-card__caption">
              The taste panel, mid-verdict.
            </figcaption>
          </figure>
          <div className="story-family__copy">
            <p className="eyebrow eyebrow--gold">THE TASTE PANEL</p>
            <h2 className="story-family__tagline">
              One Heldi meal. Two cleared plates.
            </h2>
            <ul className="story-family__badges" aria-label="The taste panel">
              <li className="story-family__badge">
                <strong>Mama</strong> the best cook I know
              </li>
              <li className="story-family__badge">
                <strong>Papa</strong> a dal loyalist
              </li>
              <li className="story-family__badge story-family__badge--verdict">
                <strong>Verdict</strong> thumbs-up, twice
              </li>
            </ul>
            <p>
              Neither of them was ever going to drink a shake. Both of them
              were always going to stay at the table. And anyone with Indian
              parents knows the rules: every decision is a negotiation, and{" "}
              <CopyHighlight>every deal ends in a compromise</CopyHighlight>.
              This one didn&apos;t. The food stayed exactly the same, and the
              protein came to the table.
            </p>
            <p>
              And this is the part that matters. As we get older, protein
              matters more, not less. Protein contributes to the maintenance
              of muscle mass, and I want{" "}
              <CopyHighlight>
                as many long walks with my mama and papa as I can get
              </CopyHighlight>
              . Their plate is part of that plan.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">
          Not here to replace tradition. Here to back it up.
        </p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE FAMILY TABLE</p>
          <h2>Food first. Family friendly.</h2>
          <p>
            In a lot of desi homes, supplements carry a stigma. Powders are for
            gym boys, not for the family table. Heldi is built to be{" "}
            <CopyHighlight>the opposite</CopyHighlight>: whey, the part of milk
            that has always been there, stirred into{" "}
            <CopyHighlight>recipes that never change</CopyHighlight>.
          </p>
          <p>
            The food we grew up with is already beautiful. Heldi simply helps
            it carry more of what we need, for{" "}
            <CopyHighlight>every generation at the table</CopyHighlight>.
          </p>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">WHAT&apos;S NEXT</p>
          <h2>Khana is on the table. Chai is on the stove.</h2>
          <p>
            Khana, our savoury blend, is the first Heldi to reach the table.{" "}
            <CopyHighlight>Chai is in development now</CopyHighlight>, going
            through the same kitchen trials, in front of the same taste panel,
            who have not lowered their standards for anyone.
          </p>
          <p className="story-note">Watch this space.</p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <Image
          className="cta-elephant cta-elephant--left"
          src="/images/variants/ink-blue/elephant-large-transparent.png?v=ink-blue-3"
          alt=""
          width={2048}
          height={2048}
          sizes="240px"
          aria-hidden="true"
        />
        <div className="final-cta-copy">
          <h2>Strength in tradition.</h2>
          <p>Heldi exists to prove the strength that was always on the table.</p>
          <WaitlistOrShopCta />
        </div>
        <Image
          className="cta-elephant cta-elephant--right"
          src="/images/variants/ink-blue/elephant-large-transparent.png?v=ink-blue-3"
          alt=""
          width={2048}
          height={2048}
          sizes="240px"
          aria-hidden="true"
        />
      </section>

      <SubpageFooter />
    </main>
  );
}
