import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Our story · Heldi",
  description:
    "Why Mihir built Heldi after trying six protein powders in his mother's kitchen, and why the family table still gets the final say.",
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
            Heldi began with the way my nani said healthy.
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
              My nani. Her healthy became Heldi.
            </figcaption>
          </figure>

          <p className="story-hero__lede">
            Ask my nani if the food was healthy and she would say it was{" "}
            <CopyHighlight>heldi</CopyHighlight>. She meant the meals she had
            always made us:{" "}
            <CopyHighlight>warm, familiar, cooked with care</CopyHighlight>.
            That was simply how she said it, and the word stuck with me. When
            it came time to name this, I borrowed hers.{" "}
            <CopyHighlight>Healthy, the way my nani says it.</CopyHighlight>
          </p>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-pull">
        <p className="story-pull__line">That was the word I kept.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">MIHIR</p>
          <h2>I loved our dinner. I was still 10g short.</h2>
          <p>
            I&apos;m Mihir. I grew up in a vegetarian house on dal, sabzi,
            raita and chai. When training became a big part of my life, I
            started paying attention to protein. That dinner came to 20g.
            I was aiming for 30g, and{" "}
            <CopyHighlight>I did not want to give up the food I loved</CopyHighlight>.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">Nani&apos;s menu</h3>
            <p className="story-menu-card__subtitle">
              what was actually on my plate
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
            The problem was practical. I wanted to eat{" "}
            <CopyHighlight>the same dinner with my family</CopyHighlight>,
            without adding another shake or making a separate plate. Heldi
            came from that stubborn requirement:{" "}
            <CopyHighlight>one spoonful, ten grams of protein</CopyHighlight>,
            stirred into the dishes already being passed round.
          </p>
          <p className="story-note">The same food, just a little Heldier.</p>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE KITCHEN TRIALS</p>
          <h2>Six powders. One kitchen. A few ruined dinners.</h2>
          <p>
            I bought{" "}
            <CopyHighlight>
              six different protein powders
            </CopyHighlight>{" "}
            and carried them into my mother&apos;s kitchen. She cooked the dal
            and kadhi. I added the powder. Then we sat down and ate whatever I
            had done to dinner. Some of those trials we would rather forget.
          </p>
          <div className="story-menu-card">
            <h3 className="story-menu-card__title">The trial menu</h3>
            <p className="story-menu-card__subtitle">
              six powders, judged with dinner
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
            Whey protein isolate was the only one that mixed through without
            grit or aftertaste. The dal still tasted like my mother&apos;s
            dal. That gave us one useful rule:{" "}
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
              Mama and Papa had no interest in shakes. They did have very clear
              opinions about dinner. In our house, a new idea is usually
              discussed from every side. This one got two cleared plates and{" "}
              <CopyHighlight>no request to change the recipe</CopyHighlight>.
              That was the verdict I needed.
            </p>
            <p>
              Protein contributes to the maintenance of muscle mass. I want{" "}
              <CopyHighlight>
                as many long walks with my mama and papa as I can get
              </CopyHighlight>
              . They are the family I had in mind while making Heldi.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">
          The recipes led. Heldi had to fit.
        </p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE FAMILY TABLE</p>
          <h2>Made for the food we share.</h2>
          <p>
            To reach our dinner table, a protein powder had to work for all of
            us. The base is{" "}
            <CopyHighlight>whey, the part of milk that has always been there</CopyHighlight>,
            stirred into{" "}
            <CopyHighlight>the recipes we already make</CopyHighlight>.
          </p>
          <p>
            Dal, sabzi and raita already brought our family to the table.
            Heldi has one small job: add protein in a form that works for{" "}
            <CopyHighlight>every generation at the table</CopyHighlight>.
          </p>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">WHAT&apos;S NEXT</p>
          <h2>Two pouches, one launch day.</h2>
          <p>
            Khana and Chai went through the same kitchen trials, with Mama and
            Papa as the taste panel. Their standards have not moved.{" "}
            <CopyHighlight>Both pouches launch together</CopyHighlight>.
          </p>
          <p className="story-note">
            <Link href="/shop/chai">Have a look at the Chai pouch</Link>.
          </p>
        </div>
      </section>

      <section className="final-cta section--bordered story-final">
        <Image
          className="cta-elephant cta-elephant--left"
          src="/images/variants/ink-blue/elephant-large-transparent.webp?v=ink-blue-4"
          alt=""
          width={2048}
          height={2048}
          sizes="240px"
          aria-hidden="true"
        />
        <div className="final-cta-copy">
          <h2>The family table gets the final say.</h2>
          <p>Heldi started in our kitchen. Every decision still comes back there.</p>
          <WaitlistOrShopCta />
        </div>
        <Image
          className="cta-elephant cta-elephant--right"
          src="/images/variants/ink-blue/elephant-large-transparent.webp?v=ink-blue-4"
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
