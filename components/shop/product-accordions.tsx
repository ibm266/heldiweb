"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
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
        <strong>no added sugar</strong>, gluten free, vegetarian and 99%
        lactose-free. <strong>Contains milk (whey).</strong>{" "}
        <a href="/our-story">Read our story</a> for why we built it this way.
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
        <strong>protein boost</strong>.
      </p>
    )
  },
  {
    question: "The protein numbers",
    answer: (
      <p>
        One heaped tablespoon adds <strong>10.4g of protein</strong> to a
        bowl. A bowl of dal has around 6g on its own, so with Heldi that&apos;s{" "}
        <strong>16g in the same bowl</strong>, same taste. Protein contributes
        to the maintenance of muscle mass.{" "}
        <a href="/truth">Read the honest truth about protein</a>.
      </p>
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
          The full <strong>amino acid profile</strong> is in the nutrition
          popup at the top of this page. Heldi is a{" "}
          <strong>complete protein</strong>.
        </p>
      </>
    )
  },
  {
    question: "Shipping & returns",
    answer: (
      <p>
        <strong>Free UK shipping</strong> on orders over{" "}
        {formatPence(SHIPPING.freeOverPence)}. Otherwise{" "}
        <strong>Royal Mail Tracked 48</strong> at{" "}
        {formatPence(SHIPPING.standardPence)}. The Sample Trio ships free.
        Sent by us, packed with care.
      </p>
    )
  }
];

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
