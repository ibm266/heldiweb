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

      <section className="section section--cream story" data-nav-hero>
        <div className="story__inner">
          <p className="eyebrow">OUR STORY</p>
          <h1 className="story__title">
            Heldi began with a word my nani made up.
          </h1>

          <p>
            Ask her if the food was healthy and she would smile and say it was
            heldi. Not healthy in the clinical sense. Heldi the way home-cooked
            food is: warm, familiar, made with care, made for you.
          </p>

          <p className="story__pull">That word stayed with me.</p>

          <p>
            I&apos;m Mihir. I grew up in a vegetarian house on dal, sabzi,
            raita and chai, and I loved all of it. Then training became a big
            part of my life, and the food of my childhood started slipping off
            my plate. Not because I stopped loving it. Because the numbers
            didn&apos;t add up. The meals I grew up on are rich in almost
            everything except protein.
          </p>

          <p>
            I didn&apos;t want bland fitness food, and I didn&apos;t want
            another shake. I wanted the food I loved to do one more thing for
            me. So I made Heldi: protein that disappears into the dishes we
            already cook.
          </p>

          <p>
            Then I realised who really needed it. My parents. They will never
            drink a protein shake, and they will never stop eating dal. As we
            get older, protein matters more, not less. Protein contributes to
            the maintenance of muscle mass, and I want as many long walks with
            my mum and dad as I can get. Their plate is part of that plan.
          </p>

          <p>
            In a lot of desi homes, supplements carry a stigma. Powders are for
            gym boys, not for the family table. Heldi is built to be the
            opposite. Food first. Family friendly. Whey, the part of milk that
            has always been there, stirred into recipes that never change.
          </p>

          <p>
            Heldi is not here to replace tradition. It is here to back it up.
            The food we grew up with is already beautiful. Heldi simply helps
            it carry more of what we need.
          </p>

          <p className="story__signoff">Strength in tradition.</p>

          <div className="story__cta">
            <WaitlistOrShopCta />
          </div>

          <Image
            className="story__elephant"
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
