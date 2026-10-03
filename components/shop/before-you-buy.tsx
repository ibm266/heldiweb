import type { ReactNode } from "react";

// "Three things you should know before you buy": the product pages' honest
// section, in Mihir's words from his two before-you-buy films (building-heldi
// content/edits/before-you-buy-v1 and before-you-buy-chai-v1, 2 Oct 2026). It
// tells buyers how to get the best from each blend rather than pretending it
// is perfect (BRAND.md §3, small-brand honesty).
//
// It lives inside the product layout rather than as a band below it, so it is
// close to the top of the page (Mihir, 3 Oct 2026). From 900px it is a gold
// panel in the photo column, under the how-to-use steps, the three cards
// stacked. On a phone it is a full-width gold band straight after the buy
// button, before the reviews and the rest. Either way the
// "Things you should know before you buy" button under the product name
// (BeforeYouBuyLink) jumps to it. The product pages place it; see the
// skeleton note in buy-box.tsx and globals.css "Product page (pdp)".

type Visual = "cool" | "spice" | "taste";

type Thing = { title: string; body: ReactNode; visual?: Visual };

type BeforeYouBuyCopy = {
  title: string;
  lede: ReactNode;
  things: [Thing, Thing, Thing];
  close: string;
};

const COPY: Record<"khana" | "chai", BeforeYouBuyCopy> = {
  khana: {
    title: "Three things you should know before you buy Heldi Khana.",
    lede: (
      <>
        My dad told me the first rule of business: never tell anyone what is
        wrong with your product. But although I&apos;m Sindhi, I&apos;m not a
        businessman. So here is what I would tell a friend before they spend
        their money.
      </>
    ),
    things: [
      {
        title: "Start smaller than a spoon.",
        body: (
          <>
            The serving is a heaped tablespoon, but you don&apos;t have to start
            there. Begin with <strong>a teaspoon or half a tablespoon</strong>,
            whatever you&apos;re comfortable with. Go past a tablespoon in one
            bowl and you might notice a change in texture and a slight change in
            taste.
          </>
        )
      },
      {
        title: "A big pot may need a whisk.",
        body: (
          <>
            Stirring a few tablespoons into a big pot of dal or a big bowl of
            dahi? With a lot of powder it can clump, so{" "}
            <strong>use a whisk</strong> and the clumps break straight up. Added
            at the table, on your own plate, it mixes in with no trouble at all.
          </>
        )
      },
      {
        title: "It brings out flavour. It doesn't add one.",
        body: (
          <>
            Khana is blended to bring out the flavours already in your dish, not
            to add its own. If you stir it straight into the pot after cooking,{" "}
            <strong>you may want to adjust the spices a little</strong>.
          </>
        )
      }
    ],
    close:
      "Keep those three in mind and you can use Heldi Khana in pretty much anything. Some of our aunties and uncles stir it into omelettes and noodles."
  },
  chai: {
    title: "Three things you should know before you buy Heldi Chai.",
    lede: (
      <>
        As much as I want you to try Heldi, please don&apos;t buy it until
        you&apos;ve read this. Three things, and the first one matters most.
      </>
    ),
    things: [
      {
        title: "Let it cool before you stir.",
        visual: "cool",
        body: (
          <>
            <strong>Never stir Heldi Chai into boiling liquid.</strong>{" "}
            It&apos;s made with real milk protein, and at around 75°C the proteins break
            apart and clump into little white specks. Your chai can still be
            hot, just not too hot:{" "}
            <strong>if it&apos;s cool enough to drink, you can stir Heldi in</strong>.
            And if specks ever appear, don&apos;t worry, we can save that cup.
            Pour it through a sieve and enjoy it.
          </>
        )
      },
      {
        title: "There's a little spice at the bottom.",
        visual: "spice",
        body: (
          <>
            When you reach the end of your cup you&apos;ll see a bit of spice
            left: ground ginger, cardamom, cinnamon, black pepper and clove.{" "}
            <strong>Real spices don&apos;t dissolve.</strong>{" "}
            Honestly, I see that as a good sign.
          </>
        )
      },
      {
        title: "Everyone has their chai a certain way.",
        visual: "taste",
        body: (
          <>
            We&apos;ve made one recipe to suit everyone, so{" "}
            <strong>you might need to adjust it to yours</strong>. There&apos;s a
            little coconut sugar in it; if you like your chai on the sweet side,
            add a bit more. Want more of a kick? Add another half tablespoon of
            Heldi Chai, and you&apos;ll feel that ginger.
          </>
        )
      }
    ],
    close:
      "However you take your chai, Heldi is an easy way to get more from the drinks you love."
  }
};

// The cooling rule as three cups, steam going from three lines to one, the
// way the film shows it.
const COOL_STEPS = [
  { steam: 3, label: "Boiling", verdict: "Never", tone: "no" },
  { steam: 2, label: "Too hot to sip", verdict: "Not yet", tone: "wait" },
  { steam: 1, label: "Cool enough to drink", verdict: "Stir it in", tone: "yes" }
] as const;

const TASTE_CUPS = [
  { label: "Sweet tooth", verdict: "add sugar" },
  { label: "Just right", verdict: "as it comes" },
  { label: "More kick", verdict: "+ half a spoon" }
] as const;

function Cup({ steam = 0, dregs = false }: { steam?: number; dregs?: boolean }) {
  return (
    <span className="know-cup__art" aria-hidden="true">
      <span className="know-cup__steam">
        {Array.from({ length: steam }, (_, index) => (
          <span key={index} />
        ))}
      </span>
      <span className={`know-cup__mug${dregs ? " know-cup__mug--dregs" : ""}`} />
    </span>
  );
}

// The last sip, with the spice settled at the bottom of an empty cup.
function SpiceCup() {
  return (
    <ul className="know-cups know-cups--one" aria-label="The end of the cup">
      <li className="know-cup">
        <Cup dregs />
        <span className="know-cup__label">Real spices settle</span>
        <span className="know-cup__verdict">A good sign</span>
      </li>
    </ul>
  );
}

function CoolScale() {
  return (
    <ol className="know-cups" aria-label="When to stir Heldi Chai in">
      {COOL_STEPS.map((step) => (
        <li key={step.label} className={`know-cup know-cup--${step.tone}`}>
          <Cup steam={step.steam} />
          <span className="know-cup__label">{step.label}</span>
          <span className="know-cup__verdict">{step.verdict}</span>
        </li>
      ))}
    </ol>
  );
}

function TasteCups() {
  return (
    <ul className="know-cups" aria-label="Adjust it to your taste">
      {TASTE_CUPS.map((cup) => (
        <li key={cup.label} className="know-cup">
          <Cup />
          <span className="know-cup__label">{cup.label}</span>
          <span className="know-cup__verdict">{cup.verdict}</span>
        </li>
      ))}
    </ul>
  );
}

export const BEFORE_YOU_BUY_ID = "before-you-buy";

export function BeforeYouBuyLink() {
  return (
    <a className="pdp__nutrition-link pdp__nutrition-link--down" href={`#${BEFORE_YOU_BUY_ID}`}>
      Things you should know before you buy <b aria-hidden="true">↓</b>
    </a>
  );
}

export function BeforeYouBuy({ product }: { product: "khana" | "chai" }) {
  const copy = COPY[product];
  const headingId = `${BEFORE_YOU_BUY_ID}-${product}`;
  return (
    <section className="know" id={BEFORE_YOU_BUY_ID} aria-labelledby={headingId}>
      <header className="know__head">
        <p className="eyebrow">BEFORE YOU BUY</p>
        <h2 id={headingId}>{copy.title}</h2>
        <p className="know__lede">{copy.lede}</p>
      </header>
      {/* Chai's cooling rule leads because it matters most; its lede says so. */}
      <ol className="know__grid">
        {copy.things.map((thing, index) => (
          <li key={thing.title} className="know-card">
            <div className="know-card__text">
              <span className="know-card__num" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="know-card__title">{thing.title}</h3>
              <p className="know-card__body">{thing.body}</p>
            </div>
            {thing.visual === "cool" ? <CoolScale /> : null}
            {thing.visual === "spice" ? <SpiceCup /> : null}
            {thing.visual === "taste" ? <TasteCups /> : null}
          </li>
        ))}
      </ol>
      <p className="know__close">{copy.close}</p>
    </section>
  );
}
