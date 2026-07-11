"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";

const CARD_STEP = 304;

const AUDIENCES: {
  label: string;
  title: string;
  points: ReactNode[];
}[] = [
  {
    label: "FOR YOU",
    title: "Hit your protein target without another shake.",
    points: [
      <>Stir into two or three dishes and add <CopyHighlight>20-30g</CopyHighlight> across one meal.</>,
      <>Whey isolate absorbs fast and <CopyHighlight>blends clean</CopyHighlight>.</>,
      <>Zero change to the food you love.</>
    ]
  },
  {
    label: "FOR THE FAMILY",
    title: "One pouch, the whole table.",
    points: [
      <><CopyHighlight>Disappears into</CopyHighlight> the dal, the curry, the raita everyone already eats.</>,
      <>Works for fussy eaters and big appetites alike.</>,
      <>No separate “healthy” cooking required.</>
    ]
  },
  {
    label: "FOR PARENTS & GRANDPARENTS",
    title: "Built for the way they already cook.",
    points: [
      <>Protein contributes to the maintenance of muscle mass.</>,
      <>99% lactose-free isolate.</>,
      <>Not a single <CopyHighlight>recipe changes</CopyHighlight>.</>
    ]
  }
];

export function AudienceGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReducedMotion(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setActiveIndex(Math.round(scroller.scrollLeft / CARD_STEP));
  }, []);

  function scrollToCard(index: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: index * CARD_STEP,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  return (
    <div className="audience-gallery">
      <div
        className="audience-gallery__scroller"
        ref={scrollerRef}
        onScroll={handleScroll}
      >
        {AUDIENCES.map((audience) => (
          <article className="sticker-card audience-gallery__card" key={audience.label}>
            <p className="eyebrow">{audience.label}</p>
            <h3>{audience.title}</h3>
            <ul>
              {audience.points.map((point, index) => (
                <li key={index}>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="audience-gallery__dots" role="tablist" aria-label="Audience cards">
        {AUDIENCES.map((audience, index) => (
          <button
            key={audience.label}
            type="button"
            role="tab"
            className={`audience-gallery__dot${index === activeIndex ? " is-active" : ""}`}
            aria-label={`Card ${index + 1} of ${AUDIENCES.length}`}
            aria-selected={index === activeIndex}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
}
