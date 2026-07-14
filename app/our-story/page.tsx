import type { Metadata } from "next";
import Image from "next/image";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "Our story · Heldi",
  description:
    "Heldi began with a word my nani made up. The story of protein made for the family table.",
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

          <figure className="story-hero__figure">
            <Image
              className="story-hero__image"
              src="/images/our-story/nani.jpg"
              alt="Mihir with his nani"
              width={1024}
              height={682}
              priority
              sizes="(max-width: 900px) 100vw, 880px"
            />
            <figcaption className="story-hero__caption">
              My nani — the woman who coined it.
            </figcaption>
          </figure>

          <p className="story-hero__lede">
            Ask her if the food was healthy and she would smile and say it was
            heldi. Not healthy in the clinical sense. Heldi the way home-cooked
            food is: warm, familiar, made with care, made for you.
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered story-pull">
        <p className="story-pull__line">That word stayed with me.</p>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">MIHIR</p>
          <h2>I grew up on dal. Training asked for more.</h2>
          <p>
            I&apos;m Mihir. I grew up in a vegetarian house on dal, sabzi, raita
            and chai, and I loved all of it. Then training became a big part of
            my life, and the food of my childhood started slipping off my plate.
            Not because I stopped loving it. Because the numbers didn&apos;t add
            up. The meals I grew up on are rich in almost everything except
            protein.
          </p>
          <p>
            I didn&apos;t want bland fitness food, and I didn&apos;t want
            another shake. I wanted the food I loved to do one more thing for
            me. So I made Heldi: protein that disappears into the dishes we
            already cook.
          </p>
        </div>
      </section>

      <section className="section section--ink section--bordered story-family">
        <div className="story-family__grid">
          <figure className="story-family__figure">
            <Image
              className="story-family__image"
              src="/images/our-story/mama-papa.jpg"
              alt="Mihir with his mama and papa after a Heldi meal"
              width={672}
              height={1024}
              sizes="(max-width: 900px) 80vw, 360px"
            />
          </figure>
          <div className="story-family__copy">
            <p className="eyebrow eyebrow--gold">THE TASTE PANEL</p>
            <h2 className="story-family__tagline">
              Heldi meal. Cleared plates. Unanimous thumbs-up.
            </h2>
            <p>
              Mama — the best cook I know. Papa — a dal lover through and
              through. Neither was ever going to drink a shake. Both were always
              going to stay at the table.
            </p>
            <p>
              As we get older, protein matters more, not less. Protein
              contributes to the maintenance of muscle mass, and I want as many
              long walks with my mum and dad as I can get. Their plate is part
              of that plan.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cream section--bordered story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE FAMILY TABLE</p>
          <h2>Food first. Family friendly.</h2>
          <p>
            In a lot of desi homes, supplements carry a stigma. Powders are for
            gym boys, not for the family table. Heldi is built to be the
            opposite. Food first. Family friendly. Whey, the part of milk that
            has always been there, stirred into recipes that never change.
          </p>
          <p>
            Heldi is not here to replace tradition. It is here to back it up.
            The food we grew up with is already beautiful. Heldi simply helps it
            carry more of what we need.
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered story-close">
        <div className="story-close__inner">
          <p className="story-close__prove">
            Heldi exists to prove what we already know there is.
          </p>
          <p className="story-close__signoff">Strength in tradition.</p>

          <div className="story-close__cta">
            <WaitlistOrShopCta />
          </div>

          <Image
            className="story-close__elephant"
            src="/images/variants/ink-blue/elephant-large-transparent.png?v=ink-blue-3"
            alt=""
            width={2048}
            height={2048}
            aria-hidden="true"
          />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
