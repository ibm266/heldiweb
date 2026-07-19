"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { siteFaqGroupsForMode } from "@/components/site-faqs";

// Grouped accordion for the /faq page. Same markup and classes as the
// homepage FAQ so the styling stays identical; one question open at a time
// across all groups. Builds its own groups from the commerce mode so the
// price questions stay hidden in waitlist mode (and the dev toggle can
// preview both states).
export function FaqPageList() {
  const { mode } = useCart();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const groups = siteFaqGroupsForMode(mode);

  return (
    <>
      {groups.map((group, groupIndex) => (
        <div className="faq faq--grouped" key={group.title}>
          <h2 className="centered">{group.title}</h2>
          <div className="faq-list">
            {group.faqs.map((faq, index) => {
              const key = `${groupIndex}-${index}`;
              const open = openKey === key;
              return (
                <article key={faq.question}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`faq-page-answer-${key}`}
                      onClick={() => setOpenKey(open ? null : key)}
                    >
                      <span>{faq.question}</span>
                      <b aria-hidden="true">{open ? "–" : "+"}</b>
                    </button>
                  </h3>
                  <p id={`faq-page-answer-${key}`} hidden={!open}>
                    {faq.answer}
                    {faq.more ? (
                      <>
                        {" "}
                        <a href={faq.more.href}>{faq.more.label}</a>.
                      </>
                    ) : null}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
