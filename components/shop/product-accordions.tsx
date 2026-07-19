"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPence } from "@/lib/commerce/money";
import { SHIPPING } from "@/lib/pricing";
import {
  FORMULA,
  NUTRITION_ROWS,
  RI_FOOTNOTE,
  SERVING_LABEL
} from "./nutrition-data";

const ACCORDION_ITEMS: { question: string; answer: ReactNode }[] = [
  {
    question: "What's inside",
    answer: (
      <p>
        Whey protein, the part of milk that&apos;s always been on your table,
        blended to disappear into home cooking. <strong>All natural</strong>,{" "}
        <strong>no added sugar</strong>, gluten free, vegetarian and 98%
        lactose-free. <strong>Contains milk (whey).</strong> Blended and
        packed in England.{" "}
        <a href="/inside-the-pouch">See where every ingredient comes from</a>,
        or <a href="/our-story">read our story</a> for why we built it this
        way.
      </p>
    )
  },
  {
    question: "How to use it",
    answer: (
      <p>
        Cook like always. Stir a spoonful into the pot{" "}
        <strong>while it&apos;s cooling</strong>, or into your bowl at the
        table. Same dal, same curry, same raita, with a{" "}
        <strong>protein boost</strong>.{" "}
        <a href="/ways-to-use">See every way to use it</a>, from dahi to
        rotis to Friday&apos;s takeaway.
      </p>
    )
  },
  {
    question: "The protein numbers",
    answer: (
      <p>
        One heaped tablespoon, a <strong>12g serving</strong>, adds{" "}
        <strong>10.4g of protein</strong> to a bowl; the blend itself is{" "}
        <strong>86.9g protein per 100g</strong>. A bowl of dal has around 6g on
        its own, so with Heldi that&apos;s <strong>16g in the same bowl</strong>,
        same taste. Protein contributes to the maintenance of muscle mass.{" "}
        <a href="/truth">Read the honest truth about protein</a>.
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
          <strong>Lactose intolerant?</strong> Usually fine. A spoonful carries
          roughly <strong>0.3g of lactose</strong>, a fraction of a glass of
          milk. A confirmed <strong>dairy allergy</strong> is different: Heldi{" "}
          <strong>contains milk (whey)</strong>, so it is not for you.
        </p>
        <p>
          <strong>Diabetes?</strong>{" "}No added sugar and under 1g of
          carbohydrate a spoonful; we can&apos;t give medical advice, so show
          the label to your GP or dietitian. More on{" "}
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
          A spoonful adds just <strong>0.13g of salt</strong>, about 2% of an
          adult&apos;s daily guideline, so it stays friendly to low-salt plates.
        </p>
        <p>
          The full <strong>amino acid profile</strong> is in the nutrition
          popup at the top of this page. Heldi is a{" "}
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
          {formatPence(SHIPPING.standardPence)}. The Sample ships free.
          Sent by us, packed with care.
        </p>
      ) : (
        <p>
          <strong>UK delivery</strong> by <strong>Royal Mail Tracked 48</strong>,
          sent by us, packed with care. Rates are confirmed when the shop
          opens.
        </p>
      )}
      <p>
        Every pouch has an <strong>18-month best-before</strong> on the base.
        Once open, reseal it, keep it cool and dry, and use within{" "}
        <strong>3 months</strong> for the best taste. Never dip a wet spoon
        in.
      </p>
    </>
  );
}

export function ProductAccordions() {
  const [openIndex, setOpenIndex] = useState(-1);
  const lockScrollY = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (lockScrollY.current == null) return;
    window.scrollTo({ top: lockScrollY.current });
    lockScrollY.current = null;
  }, [openIndex]);

  function toggle(index: number) {
    lockScrollY.current = window.scrollY;
    setOpenIndex((current) => (current === index ? -1 : index));
  }

  return (
    <div className="pdp-accordion">
      {ACCORDION_ITEMS.map((item, index) => {
        const open = openIndex === index;
        return (
          <article key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`pdp-accordion-answer-${index}`}
                onClick={() => toggle(index)}
              >
                <span>{item.question}</span>
                <b aria-hidden="true">{open ? "–" : "+"}</b>
              </button>
            </h3>
            <div
              id={`pdp-accordion-answer-${index}`}
              className="pdp-accordion__answer"
              hidden={!open}
            >
              {item.answer}
            </div>
          </article>
        );
      })}
    </div>
  );
}
