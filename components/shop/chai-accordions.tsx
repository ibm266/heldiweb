"use client";

import { useCart } from "@/components/cart/cart-context";
import {
  CHAI_ALLERGENS,
  CHAI_FORMULA,
  CHAI_LACTOSE_PER_100G,
  CHAI_MUGS_PER_POUCH,
  CHAI_NATURAL_LINE,
  CHAI_NUTRITION_ROWS,
  CHAI_POUCH_GRAMS,
  CHAI_PROTEIN_MARKETING_GRAMS,
  CHAI_PROTEIN_PER_100G,
  CHAI_PROTEIN_PER_SERVING_GRAMS,
  CHAI_RI_FOOTNOTE,
  CHAI_SERVING_GRAMS,
  CHAI_SERVING_LABEL,
  CHAI_SERVING_SPOON
} from "./chai-data";
import { PdpAccordion, type PdpAccordionItem } from "./pdp-accordion";

// Chai's facts, every one read from chai-data.ts. Nothing here may be copied
// from product-accordions.tsx without checking it: that file states Khana's
// serving, protein, lactose, ingredients and best-before, and Chai's are all
// different. The figures are calculated from the recipe (the header of
// chai-data.ts says how) and say so where a reader would want to know.

// Lactose in one serving, derived so it moves with the per-100g figure. It
// was typed as 0.1g, which was right for micellar casein and went stale when
// MPC85 took its place.
const LACTOSE_PER_MUG = ((CHAI_LACTOSE_PER_100G * CHAI_SERVING_GRAMS) / 100).toFixed(1);

const ACCORDION_ITEMS: PdpAccordionItem[] = [
  {
    question: "What's inside",
    answer: (
      <>
        <p>
          Whey protein isolate and milk protein concentrate both come from
          milk. We blend them with chai spices and a little coconut sugar.{" "}
          <strong>{CHAI_NATURAL_LINE}</strong> In full, largest first:{" "}
          {CHAI_FORMULA}. Nothing in that list contains caffeine, so the blend
          itself is <strong>caffeine free</strong>, though the tea or coffee
          you stir it into usually is not.{" "}
          <strong>{CHAI_ALLERGENS}</strong> Blended and packed in the UK.
        </p>
        <p>
          Ingredients appear in weight order, as the label requires. We
          publish the amount of each milk protein and the coconut sugar; the
          spice ratios stay with our recipe.{" "}
          <a href="/our-story">Read how that recipe began</a>.
        </p>
      </>
    )
  },
  {
    question: "How to use it",
    answer: (
      <>
        <p>
          <strong>Make</strong> your chai, tea or coffee just as always.{" "}
          <strong>Let it cool</strong>: never add Heldi to boiling liquid. Once
          the cup is cool enough to drink, stir in a{" "}
          <strong>{CHAI_SERVING_SPOON}</strong> ({CHAI_SERVING_GRAMS}g) just
          before you drink. <strong>Store</strong>{" "}
          the rest in the jar by the kettle, ready for next time. Level, not heaped: a mug is not a pot,
          and Khana&apos;s heaped spoon would be too much here.
        </p>
        <p>
          The waiting matters. The milk protein in Chai starts to clump into
          little white specks well before the boil, so the rule is simple: if
          it is cool enough to drink, you can stir Heldi in. If a few specks
          do show up, pour the cup through a tea strainer and drink it as
          normal.
        </p>
        <p>
          Use that end-of-mug step for tea, coffee, hot chocolate and warm
          milk too. Make the drink first, then stir.
        </p>
      </>
    )
  },
  {
    question: "The protein numbers",
    answer: (
      <>
        <p>
          An <strong>{CHAI_SERVING_GRAMS}g serving</strong>, about one{" "}
          {CHAI_SERVING_SPOON}, contains{" "}
          <strong>{CHAI_PROTEIN_PER_SERVING_GRAMS}g of protein</strong>. The
          blend contains {CHAI_PROTEIN_PER_100G}g per 100g. On the front of the
          pouch and in everyday copy, we round down to{" "}
          {CHAI_PROTEIN_MARKETING_GRAMS}g per mug. Protein contributes to the
          maintenance of muscle mass.
        </p>
        <p>
          These figures are calculated from the recipe, using the whey
          certificate of analysis and typical published composition values
          for MPC85 in the way the labelling rules allow. Bacarel&apos;s own
          supplier specification is still outstanding. These calculations
          are the basis of Chai&apos;s nutrition declaration.{" "}
          <a href="/truth">Read the honest truth about protein</a>.
        </p>
      </>
    )
  },
  {
    question: "Dietary & allergens",
    answer: (
      <>
        <p>
          <strong>Vegetarian, not vegan.</strong> The protein is whey and
          milk protein concentrate, both from milk, made without animal
          rennet. Heldi is{" "}
          <strong>not yet formally halal certified</strong>; it contains no
          meat, no alcohol and no animal rennet. If certification matters to
          your table, email{" "}
          <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a>.
        </p>
        <p>
          <strong>Dairy allergy?</strong> Heldi Chai{" "}
          <strong>contains milk</strong>, as whey and as milk protein
          concentrate, so it is not for you.{" "}
          <strong>Lactose intolerant rather than allergic?</strong> Chai
          carries about {CHAI_LACTOSE_PER_100G}g of lactose per 100g, which is{" "}
          {LACTOSE_PER_MUG}g in a mug: a figure calculated from the whey
          certificate and typical values for the milk protein concentrate,
          not a test, so we say the number and do not call it lactose-free.
        </p>
        <p>
          <strong>Watching sugar?</strong> Chai contains{" "}
          <strong>coconut sugar</strong>, with 0.9g of sugars in a mug. It is
          not a no-added-sugar product. We can&apos;t give medical advice, so
          show the label to your GP or dietitian. More on{" "}
          <a href="/faq">kids, pregnancy and kidneys in the full FAQ</a>.
        </p>
      </>
    )
  },
  {
    question: "Nutrition",
    answer: (
      <>
        <table className="nutri-table">
          <caption className="sr-only">Nutrition declaration</caption>
          <thead>
            <tr>
              <th scope="col">Nutrition declaration</th>
              <th scope="col">Per 100g</th>
              <th scope="col">{CHAI_SERVING_LABEL}</th>
              <th scope="col">%RI per serving*</th>
            </tr>
          </thead>
          <tbody>
            {CHAI_NUTRITION_ROWS.map((row) => (
              <tr key={row.label} className={row.indent ? "nutri-table__indent" : undefined}>
                <th scope="row">{row.label}</th>
                <td>{row.per100g}</td>
                <td>{row.perServing}</td>
                <td>{row.riPerServing}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nutri-footnote">{CHAI_RI_FOOTNOTE}</p>
        <p>
          A {CHAI_POUCH_GRAMS}g pouch makes about {CHAI_MUGS_PER_POUCH} mugs
          at an {CHAI_SERVING_GRAMS}g serving, about one {CHAI_SERVING_SPOON},
          per mug. Open <strong>Nutrition &amp; amino acids</strong> near the
          top of the page for the full amino acid profile. The figures are
          calculated from the recipe on the same basis as the nutrition
          declaration.
        </p>
      </>
    )
  },
  {
    question: "Shipping, returns & storage",
    answer: <ShippingAnswer />
  }
];

// Rates are prices, so waitlist mode gets the how-it-ships story without the
// numbers. Chai has no shipping rates of its own yet: it is not in the
// catalogue, so there is nothing to quote in either mode.
function ShippingAnswer() {
  const { mode } = useCart();
  return (
    <>
      <p>
        We send UK orders by <strong>Royal Mail Tracked 48</strong>. The rates
        will appear here{" "}
        {mode === "live" ? "when Chai goes on sale" : "when the shop opens"}.
      </p>
      <p>
        Every pouch carries a best-before on the base. Once open, keep it in
        the jar by the kettle or the resealed pouch, cool and dry and away
        from the steam above the mug, and use a dry spoon.
      </p>
    </>
  );
}

export function ChaiAccordions() {
  return <PdpAccordion items={ACCORDION_ITEMS} />;
}
