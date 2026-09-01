"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export type PdpAccordionItem = { question: string; answer: ReactNode };

// The accordion shell only. The answers are product facts and live with the
// product: Khana's in product-accordions.tsx, Chai's in chai-accordions.tsx.
// Keeping the shell here is what stops a second SKU inheriting the first
// one's serving size, protein figure and ingredients list by accident.
export function PdpAccordion({ items }: { items: PdpAccordionItem[] }) {
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
      {items.map((item, index) => {
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
