"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { WaysComicStrip } from "@/components/ways-comic-strip";
import { METHODS } from "@/components/ways-to-use-methods";

/**
 * The homepage "how it works" gallery: three of the /ways-to-use methods (the
 * pot, the cold bowls, the whole table) shown as animated pouch-style strips in
 * a horizontal rail that scrolls on every width. The section makes the "as easy
 * as 1, 2, 3" point once, then lets the strips prove every method is three
 * steps. Strip data and copy come straight from the shared METHODS source so
 * the two surfaces never drift.
 */
const RAIL_IDS = ["pot", "dahi", "table"] as const;

const RAIL_METHODS = RAIL_IDS.map((id) => {
  const method = METHODS.find((candidate) => candidate.id === id);
  if (!method?.strip) {
    throw new Error(`ways-gallery: method "${id}" is missing its strip`);
  }
  return method;
});

export function WaysGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
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

  const onRailScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const center = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;

    Array.from(rail.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });

    setActive((current) => (current === best ? current : best));
  }, []);

  function scrollToCard(index: number) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[index] as HTMLElement | undefined;
    if (!card) return;

    const target = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, target),
      behavior: reducedMotion ? "auto" : "smooth"
    });
    setActive(index);
  }

  return (
    <div className="ways-gallery">
      <header className="ways-gallery__header">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>It&apos;s as easy as 1, 2, 3.</h2>
        <p className="ways-gallery__lede">
          Once the pouch is open, you can{" "}
          <CopyHighlight>stop shaking and start stirring</CopyHighlight>. These
          are the ways Heldi works best, and every one of them is just three
          steps.
        </p>
      </header>

      <p className="ways-gallery__hint" aria-hidden="true">
        scroll for all three &#8594;
      </p>

      <div className="ways-gallery__rail" ref={railRef} onScroll={onRailScroll}>
        {RAIL_METHODS.map((method) => (
          <article className="ways-gallery__card" key={method.id}>
            <WaysComicStrip strip={method.strip!} serving={method.serving} />
          </article>
        ))}
      </div>

      <div
        className="ways-gallery__dots"
        role="tablist"
        aria-label="Ways to use Heldi"
      >
        {RAIL_METHODS.map((method, index) => (
          <button
            key={method.id}
            type="button"
            role="tab"
            className={`ways-gallery__dot${
              index === active ? " is-active" : ""
            }`}
            aria-label={`${method.chip}, card ${index + 1} of ${RAIL_METHODS.length}`}
            aria-selected={index === active}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>

      <div className="ways-gallery__foot">
        <a className="pill-link" href="/ways-to-use">
          See every way to use it &#8594;
        </a>
      </div>
    </div>
  );
}
