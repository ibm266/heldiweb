"use client";

import { useCart } from "@/components/cart/cart-context";
import { formatPence } from "@/lib/commerce/money";
import { SHIPPING } from "@/lib/pricing";
import {
  FORMULA,
  NUTRITION_ROWS,
  RI_FOOTNOTE,
  SERVING_LABEL
} from "./nutrition-data";
import { PdpAccordion, type PdpAccordionItem } from "./pdp-accordion";

// Khana's facts. Every figure here is Khana's serving, Khana's blend and
// Khana's shelf life; nothing in this file is safe for another SKU. A second
// product supplies its own list to <PdpAccordion /> (see chai-accordions.tsx).
const ACCORDION_ITEMS: PdpAccordionItem[] = [
  {
    question: "What's inside",
    answer: (
      <p>
        The protein is whey protein isolate, made from whey, the part of milk
        that&apos;s left when paneer is made. The spices are the ones already in
        your masala dabba: cumin, coriander, garam masala, Kashmiri chilli and
        turmeric. A pinch of fine sea salt and a little sunflower lecithin,
        which helps it stir in, make up the rest. <strong>All natural</strong>,{" "}
        <strong>no added sugar</strong> (contains naturally occurring sugars),
        gluten free, vegetarian and 98% lactose-free.{" "}
        <strong>Contains milk (whey).</strong> Blended and packed in the UK.{" "}
        <a href="/inside-the-pouch">See where every ingredient comes from</a>,
        or <a href="/our-story">read why it started in our kitchen</a>.
      </p>
    )
  },
  {
    question: "How to use it",
    answer: (
      <p>
        <strong>Serve</strong> your food just as always.{" "}
        <strong>Stir</strong> a heaped tablespoon into your own bowl at the
        table. <strong>Store</strong> the rest in the jar on the table, ready
        for next time. Cooking for everyone? Take the pot off the heat and stir
        in a spoonful per person. In something smooth, like a big pot of dal or
        dahi, a whisk does a better job than a spoon.{" "}
        <a href="/ways-to-use">See every way to use it</a>, including rotis
        and Friday&apos;s takeaway.
      </p>
    )
  },
  {
    question: "The protein numbers",
    answer: (
      <p>
        A <strong>12g serving</strong>, about one heaped tablespoon, contains{" "}
        <strong>10.1g of protein</strong>. The blend contains{" "}
        <strong>84.1g protein per 100g</strong>. A cooked bowl of dal has
        around 6g on its own; adding Heldi brings it to{" "}
        <strong>16g in the same bowl</strong>. Protein contributes to the
        maintenance of muscle mass.{" "}
        <a href="/truth">Why 6g a bowl isn&apos;t enough for most adults</a>.
      </p>
    )
  },
  {
    question: "Dietary & allergens",
    answer: (
      <>
        <p>
          <strong>Vegetarian, not vegan.</strong> The protein is whey, from
          milk, made without animal rennet. Heldi is{" "}
          <strong>not yet formally halal certified</strong>; it contains no
          meat, no alcohol and no animal rennet. If certification matters to
          your table, email <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a>.
        </p>
        <p>
          <strong>Lactose intolerant?</strong> A spoonful contains roughly{" "}
          <strong>0.3g of lactose</strong>, a fraction of the amount in a glass
          of milk. Tolerance varies from person to person. A confirmed{" "}
          <strong>dairy allergy</strong> is different: Heldi{" "}
          <strong>contains milk (whey)</strong>, so it is not suitable.
        </p>
        <p>
          <strong>Diabetes?</strong> Khana has no added sugar and contains
          under 1g of carbohydrate per spoonful. We can&apos;t give medical
          advice, so show the label to your GP or dietitian. More on{" "}
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
          <strong>Formula:</strong> {FORMULA}
        </p>
        <table className="nutri-table">
          <thead>
            <tr>
              <th scope="col">Nutrition declaration</th>
              <th scope="col">Per 100g</th>
              <th scope="col">{SERVING_LABEL}</th>
              <th scope="col">%RI per serving*</th>
            </tr>
          </thead>
          <tbody>
            {NUTRITION_ROWS.map((row) => (
              <tr key={row.label} className={row.indent ? "nutri-table__indent" : undefined}>
                <th scope="row">{row.label}</th>
                <td>{row.per100g}</td>
                <td>{row.perServing}</td>
                <td>{row.riPerServing}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nutri-footnote">{RI_FOOTNOTE}</p>
        <p>
          A spoonful contains <strong>0.14g of salt</strong>. That is 2.4% of
          an adult&apos;s daily reference intake.
        </p>
        <p>
          Open <strong>Nutrition &amp; amino acids</strong> near the top of the
          page for the full amino acid profile. Heldi is a{" "}
          <strong>complete protein</strong>.
        </p>
      </>
    )
  },
  {
    question: "Shipping, returns & storage",
    answer: <ShippingAnswer />
  }
];

// Rates are prices, so waitlist mode gets the how-it-ships story without
// the numbers; the full rates return when the shop goes live.
function ShippingAnswer() {
  const { mode } = useCart();
  return (
    <>
      {mode === "live" ? (
        <p>
          <strong>Free UK shipping</strong> on orders over{" "}
          {formatPence(SHIPPING.freeOverPence)}. Otherwise{" "}
          <strong>Royal Mail Tracked 48</strong> at{" "}
          {formatPence(SHIPPING.standardPence)}. The Sample ships free. We
          pack each order and send it by Royal Mail.
        </p>
      ) : (
        <p>
          We send UK orders by <strong>Royal Mail Tracked 48</strong>. The
          rates will appear here when the shop opens.
        </p>
      )}
      <p>
        Every pouch has an <strong>18-month best-before</strong> on the base.
        After opening, keep it in the table jar or the resealed pouch, cool and
        dry, and use it within <strong>3 months</strong> for the best taste.
        Keep the spoon dry.
      </p>
    </>
  );
}

export function ProductAccordions() {
  return <PdpAccordion items={ACCORDION_ITEMS} />;
}
