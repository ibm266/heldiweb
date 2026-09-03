"use client";

import { useCart } from "@/components/cart/cart-context";
import {
  CHAI_FORMULA,
  CHAI_LACTOSE_PER_100G,
  CHAI_MUGS_PER_POUCH,
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

const ACCORDION_ITEMS: PdpAccordionItem[] = [
  {
    question: "What's inside",
    answer: (
      <>
        <p>
          Whey protein isolate and micellar casein, both from milk, blended
          with real chai spices and a little coconut sugar. In full, largest
          first: {CHAI_FORMULA}. <strong>Contains milk (whey and casein).</strong>{" "}
          Blended and packed in the UK.
        </p>
        <p>
          The percentages are the recipe as it is blended. They are checked
          against the analysis of the finished blend before the first pouch
          is sealed, and this page changes if the analysis says so.{" "}
          <a href="/our-story">Read our story</a> for why we built it this
          way.
        </p>
      </>
    )
  },
  {
    question: "How to use it",
    answer: (
      <>
        <p>
          Make your chai as usual. Let it come{" "}
          <strong>off the boil</strong>, add your milk, then stir in a{" "}
          <strong>{CHAI_SERVING_SPOON}</strong> ({CHAI_SERVING_GRAMS}g) just
          before you drink. Level, not heaped: a mug is not a pot, and
          Khana&apos;s heaped spoon would be too much here. Off the boil
          matters too: whey does not enjoy a rolling boil, and neither does
          the taste.
        </p>
        <p>
          It goes into more than chai. Tea, coffee, hot chocolate, warm milk.
          Anything you would run back down a platform for.
        </p>
      </>
    )
  },
  {
    question: "The protein numbers",
    answer: (
      <>
        <p>
          <strong>{CHAI_PROTEIN_PER_SERVING_GRAMS}g in a {CHAI_SERVING_SPOON}</strong>,
          the {CHAI_SERVING_GRAMS}g serving, and {CHAI_PROTEIN_PER_100G}g per
          100g. The pack rounds that to {CHAI_PROTEIN_MARKETING_GRAMS}g a mug.
          Protein contributes to the maintenance of muscle mass.
        </p>
        <p>
          Where the number comes from: the recipe, with the whey at the
          figure on its certificate of analysis and the casein at its
          specification, added up the way the labelling rules allow. The
          figure from analysis of the finished blend replaces it, here and
          on the pouch, before Chai is sold.{" "}
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
          casein, both from milk, made without animal rennet. Heldi is{" "}
          <strong>not yet formally halal certified</strong>; it contains no
          meat, no alcohol and no animal rennet. If certification matters to
          your table, email{" "}
          <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a>.
        </p>
        <p>
          <strong>Dairy allergy?</strong> Heldi Chai{" "}
          <strong>contains milk</strong>, as whey and as casein, so it is not
          for you. <strong>Lactose intolerant rather than allergic?</strong>{" "}
          Chai carries about {CHAI_LACTOSE_PER_100G}g of lactose per 100g,
          which is 0.1g in a mug: a figure calculated from the whey
          certificate and the casein specification, not a test, so we say
          the number and do not call it lactose-free.
        </p>
        <p>
          <strong>Watching sugar?</strong> Chai is sweetened with{" "}
          <strong>coconut sugar</strong>: 0.9g of sugars in a mug, so unlike
          Khana it is not a no-added-sugar product. We can&apos;t give
          medical advice, so show the label to your GP or dietitian. More on{" "}
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
          at one {CHAI_SERVING_SPOON} each. The full amino acid profile is
          under <strong>Nutrition &amp; amino acids</strong> above. Every
          figure is calculated from the recipe and is replaced by the
          analysis of the finished blend before Chai goes on sale.
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
        <strong>UK delivery</strong> by{" "}
        <strong>Royal Mail Tracked 48</strong>, sent by us, packed with care.
        Chai is not in the shop yet, so its rates are confirmed{" "}
        {mode === "live" ? "when it goes on sale" : "when the shop opens"}.
      </p>
      <p>
        Every pouch carries a best-before on the base. Once open, reseal it,
        keep it cool and dry, and never dip a wet spoon in: a mug of chai is
        steam, and steam is how powder turns to cement.
      </p>
    </>
  );
}

export function ChaiAccordions() {
  return <PdpAccordion items={ACCORDION_ITEMS} />;
}
