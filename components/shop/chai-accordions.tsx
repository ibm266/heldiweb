"use client";

import { useCart } from "@/components/cart/cart-context";
import {
  CHAI_INGREDIENT_NAMES,
  CHAI_MUGS_PER_POUCH,
  CHAI_POUCH_GRAMS,
  CHAI_SERVING_GRAMS
} from "./chai-data";
import { PdpAccordion, type PdpAccordionItem } from "./pdp-accordion";

// Chai's facts. Nothing here may be copied from product-accordions.tsx
// without checking it: that file states a 12g serving, 10.4g of protein,
// 86.9g per 100g, 0.3g of lactose, a cumin ingredients list and an 18-month
// best-before, and every one of those is Khana's, not Chai's.

const INGREDIENTS = CHAI_INGREDIENT_NAMES.join(", ");

const ACCORDION_ITEMS: PdpAccordionItem[] = [
  {
    question: "What's inside",
    answer: (
      <>
        <p>
          Whey protein isolate and micellar casein, both from milk, blended
          with real chai spices and a little coconut sugar. In full:{" "}
          {INGREDIENTS}. <strong>Contains milk (whey and casein).</strong>{" "}
          Blended and packed in the UK.
        </p>
        <p>
          The percentages are not on this page yet, and that is deliberate.
          The blend is still in trials, and the ingredients list on a food
          supplement is a legal declaration rather than a description, so it
          publishes when the finished blend has been analysed and not before.{" "}
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
          <strong>heaped tablespoon</strong> just before you drink. Off the
          boil matters: whey does not enjoy a rolling boil, and neither does
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
          Not yet, and we would rather say so than round something up. Chai is{" "}
          <strong>high in protein</strong>, which is true of every version of
          the blend we have made. The exact grams in a mug depend on the final
          whey and casein ratio, and that is still being decided on the bench.
        </p>
        <p>
          The figure that lands on this page will come from{" "}
          <strong>analysis of the finished blend</strong>, not from adding up
          what went into it. Protein contributes to the maintenance of muscle
          mass.{" "}
          <a href="/truth">Read the honest truth about protein</a>, which uses
          Khana&apos;s numbers in the meantime.
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
          for you. If you are lactose intolerant rather than allergic, wait
          for the declaration: Khana is 98% lactose-free, but Chai is a
          different blend and we will not borrow Khana&apos;s figure for it.
        </p>
        <p>
          <strong>Watching sugar?</strong> Chai is sweetened with{" "}
          <strong>coconut sugar</strong>, so unlike Khana it is not a
          no-added-sugar product. We can&apos;t give medical advice, so show
          the label to your GP or dietitian once it is final. More on{" "}
          <a href="/faq">kids, pregnancy and kidneys in the full FAQ</a>.
        </p>
      </>
    )
  },
  {
    question: "Nutrition",
    answer: (
      <>
        <p>
          The nutrition declaration for Chai is{" "}
          <strong>not published yet</strong>. A declaration on a food
          supplement has to be right, and ours has to come from analysis of
          the finished blend rather than a calculation from the recipe. It
          goes up here, and on the pouch, before Chai is ever sold.
        </p>
        <p>
          What we can tell you now: a serving is one heaped tablespoon,{" "}
          <strong>{CHAI_SERVING_GRAMS}g</strong>, and a{" "}
          {CHAI_POUCH_GRAMS}g pouch makes about {CHAI_MUGS_PER_POUCH}{" "}
          mugs. Khana&apos;s full table and amino acid profile are on the{" "}
          <a href="/shop">Khana page</a> if you want to see the shape of what
          is coming.
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
