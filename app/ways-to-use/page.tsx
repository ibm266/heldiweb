import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";
import { WaysComicStrip, type ComicStrip } from "@/components/ways-comic-strip";

export const metadata: Metadata = {
  title: "Ways to use · Heldi",
  description:
    "Dal, dahi, takeaway, rotis and the jar in the middle of the table. Every way to stir Heldi in, three steps each. Ek, do, protein.",
  alternates: { canonical: "/ways-to-use" }
};

const STEP_LABELS = ["Ek", "Do", "Protein"] as const;

type Method = {
  id: string;
  chip: string;
  eyebrow: string;
  title: string;
  ground: "ink" | "cream" | "gold";
  intro: ReactNode;
  steps: [ReactNode, ReactNode, ReactNode];
  serving: string;
  note?: string;
  strip?: ComicStrip;
};

const METHODS: Method[] = [
  {
    id: "pot",
    chip: "The pot",
    eyebrow: "THE POT",
    title: "How do you add it to dal or curry?",
    ground: "ink",
    intro: (
      <>
        A heaped tablespoon adds 10g of protein. The only trick is the
        spread: <CopyHighlight>sprinkle it all around the surface</CopyHighlight>,
        not one heap in the middle, then stir. The pot will deny everything.
      </>
    ),
    steps: [
      <>Cook your dal, curry or sabzi like always, then take the pot off the boil.</>,
      <>Sprinkle a heaped tablespoon per person all around the surface.</>,
      <>Stir until it disappears, about ten seconds, and serve.</>
    ],
    serving: "1 heaped tbsp per person",
    strip: {
      video: "/videos/ways-to-use/pot-strip.mp4",
      poster: "/images/ways-to-use/pot-strip.webp",
      width: 1920,
      height: 1080,
      label: "In the pot",
      captions: ["Cook like always.", "Heat off.", "Stir one in. Gone."],
      alt: "Engraved brass pot in the Heldi pouch style, shown three times: cooking over a flame, off the heat with its lid set aside, and with a bangled hand stirring in a spoonful."
    }
  },
  {
    id: "dahi",
    chip: "Dahi & raita",
    eyebrow: "COLD BOWLS",
    title: "What about dahi and raita?",
    ground: "cream",
    intro: (
      <>
        The same moves as the pot, minus the waiting: dahi is already cool,
        so there is <CopyHighlight>no cooling-off period</CopyHighlight>. A
        teaspoon does its bit in your own bowl; a tablespoon suits a raita
        made for the table. Whisk it smooth and it is gone.
      </>
    ),
    steps: [
      <>Spoon out your dahi or mix your raita like always.</>,
      <>Sprinkle a teaspoon to a tablespoon across the bowl.</>,
      <>Stir until smooth. Cold bowls take it the fastest.</>
    ],
    serving: "1 tsp to 1 tbsp per bowl",
    note: "Yes, those are the same steps as the pot. That is rather the point."
  },
  {
    id: "table",
    chip: "The table jar",
    eyebrow: "THE WHOLE TABLE",
    title: "Why does the jar live on the table?",
    ground: "gold",
    intro: (
      <>
        Because that is where the food is. Set it in the middle, next to the
        achaar, and <CopyHighlight>everyone sorts their own plate</CopyHighlight>:
        a tablespoon in papa&apos;s dal, a teaspoon in nani&apos;s raita, and
        nobody&apos;s dinner is anybody else&apos;s business.
      </>
    ),
    steps: [
      <>Put the jar in the middle of the table. Not the cupboard.</>,
      <>Everyone adds their own. Start with a teaspoon, work up to a heaped tablespoon.</>,
      <>Stir it into your bowl and pass the jar along.</>
    ],
    serving: "1 tsp each, to start",
    note: "This is the job the jar was made for."
  },
  {
    id: "takeaway",
    chip: "Takeaway",
    eyebrow: "FRIDAY NIGHT",
    title: "Does it work in a takeaway?",
    ground: "cream",
    intro: (
      <>
        Beautifully. A takeaway curry is still a curry: hot, saucy and very
        stir-able. Plate up your own portion, sprinkle, stir, enjoy.{" "}
        <CopyHighlight>
          What happens between you and your korma stays between you and your
          korma.
        </CopyHighlight>
      </>
    ),
    steps: [
      <>Order like always. Friday is Friday.</>,
      <>Plate up your portion and sprinkle a tablespoon over it whilst it&apos;s hot.</>,
      <>Stir, serve, enjoy.</>
    ],
    serving: "1 tbsp per portion"
  },
  {
    id: "freezer",
    chip: "The freezer stash",
    eyebrow: "THE FREEZER STASH",
    title: "What about the food mum sent you home with?",
    ground: "ink",
    intro: (
      <>
        Half the freezers in this country hold a dabba of somebody&apos;s
        mum&apos;s dal. Heldi goes in at the end of its journey, not the
        beginning: defrost, heat it through, take it off the heat, and stir
        in a spoonful just before you eat.{" "}
        <CopyHighlight>The recipe stays hers.</CopyHighlight>
      </>
    ),
    steps: [
      <>Defrost and heat it through like always.</>,
      <>Off the heat. Give it a minute to stop steaming.</>,
      <>Stir in a spoonful just before serving. Aunty never needs to know.</>
    ],
    serving: "1 tbsp per portion"
  },
  {
    id: "roti",
    chip: "Rotis",
    eyebrow: "THE ATTA",
    title: "How do you make protein rotis?",
    ground: "cream",
    intro: (
      <>
        The one method where Heldi goes in before the cooking. Mix it into
        the dry atta first so it spreads evenly, then{" "}
        <CopyHighlight>knead with cold water</CopyHighlight>. Cold matters:
        warm water turns whey clumpy, cold keeps the dough smooth. The dough
        drinks a little more water than plain atta, so add a splash extra if
        it feels tight, and let it rest before rolling.
      </>
    ),
    steps: [
      <>Whisk one to two tablespoons of Heldi into each cup of dry atta.</>,
      <>Knead with cold water, a splash more than usual, and rest the dough for 15 minutes.</>,
      <>Roll and cook like always on a medium tawa. Protein browns a touch faster, so watch the first one.</>
    ],
    serving: "1 to 2 tbsp per cup of atta",
    note: "Same soft rotis. Just carrying more."
  }
];

export default function WaysToUsePage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">WAYS TO USE</p>
          <h1 className="story-hero__title">
            We won&apos;t tell you how to run your kitchen.
          </h1>
          <p className="story-hero__lede">
            Nobody tells a desi cook what to do at their own stove, and we are
            not about to start. But once the jar is open, you can stop shaking
            and start stirring. These are the ways Heldi works best, and every
            single one is three steps.{" "}
            <CopyHighlight>Ek. Do. Protein.</CopyHighlight>
          </p>
          <nav className="ways-jump" aria-label="Jump to a way to use Heldi">
            {METHODS.map((method) => (
              <a key={method.id} className="truth-chip" href={`#${method.id}`}>
                {method.chip}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE FIRST RULE</p>
          <h2>Start with a teaspoon.</h2>
          <p>
            The heaped tablespoon is the recommended serving: 10g of protein,
            gone without a trace. But it is a serving,{" "}
            <CopyHighlight>not an entry exam</CopyHighlight>. A teaspoon still
            adds around 3g, and 3g in the raita beats 0g in the cupboard.
            Start small, taste, and work up. Nobody at the table will know
            either way.
          </p>
        </div>
      </section>

      {METHODS.map((method) => (
        <section
          key={method.id}
          id={method.id}
          className={`section section--${method.ground} section--bordered ways-method ways-method--on-${method.ground}`}
        >
          <div
            className={`ways-method__grid${
              method.strip ? " ways-method__grid--strip" : ""
            }`}
          >
            <div className="ways-method__copy">
              <p
                className={`eyebrow${
                  method.ground === "ink" ? " eyebrow--gold" : ""
                }`}
              >
                {method.eyebrow}
              </p>
              <h2>{method.title}</h2>
              <p className="ways-method__intro">{method.intro}</p>
            </div>
            {method.strip ? (
              <WaysComicStrip strip={method.strip} serving={method.serving} />
            ) : (
              <div className="ways-steps-card">
                <ol className="ways-steps">
                  {method.steps.map((step, index) => (
                    <li key={index} className="ways-step">
                      <span
                        className={`ways-step__num${
                          index === 2 ? " ways-step__num--protein" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {STEP_LABELS[index]}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                <p className="ways-steps-card__serving">
                  <span>How much</span>
                  <strong>{method.serving}</strong>
                </p>
              </div>
            )}
          </div>
          {method.note ? (
            <p className="ways-method__note">{method.note}</p>
          ) : null}
        </section>
      ))}

      <section className="final-cta section--bordered">
        <div className="final-cta-copy">
          <h2>Bring it to the table.</h2>
          <p>Every dish on this page stays exactly the same. That is the whole trick.</p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
