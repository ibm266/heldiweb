"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type ComicStrip = {
  video: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  captions: [string, string, string];
  /**
   * Horizontal center of each of the three subjects, as a percentage of the
   * strip width. Captions sit under these anchors so they line up with the
   * art on any screen width (the art fills the width at every size, so the
   * percentages hold). Tuned per strip because the generated subjects are
   * not evenly spaced.
   */
  anchors: [number, number, number];
};

/* Either a single amount, or the first-time to old-hand ladder. */
export type Serving = string | { start: string; upto: string };

export const SERVING_LADDER_LABELS = {
  start: "Light hand",
  upto: "Heavy hand"
} as const;

type WaysComicStripProps = {
  strip: ComicStrip;
  serving: Serving;
};

/**
 * An animated strip in the back-of-pouch engraving style. The generated art
 * is completely clean (no text, no boxes); the header bar, step chips and
 * captions here are real HTML styled to match. One horizontal asset serves
 * every viewport. The poster renders immediately; the video mounts only once
 * the strip scrolls near the viewport, and never under
 * prefers-reduced-motion, where the poster stands alone.
 */
export function WaysComicStrip({ strip, serving }: WaysComicStripProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setAllowMotion(!media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={rootRef} className="ways-strip">
      <div className="ways-strip__bar">{strip.label}</div>
      <div className="ways-strip__media">
        <Image
          src={strip.poster}
          alt={strip.alt}
          width={strip.width}
          height={strip.height}
          sizes="(max-width: 899px) 92vw, min(92vw, 1020px)"
        />
        {inView && allowMotion ? (
          <video
            className="ways-strip__video"
            src={strip.video}
            poster={strip.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <figcaption className="ways-strip__steps">
        {strip.captions.map((caption, index) => (
          <span
            key={index}
            className="ways-strip__step"
            style={{ left: `${strip.anchors[index]}%` }}
          >
            {caption}
          </span>
        ))}
      </figcaption>
      {typeof serving === "string" ? (
        <p className="ways-strip__serving">
          <span>How much</span>
          <strong>{serving}</strong>
        </p>
      ) : (
        <div className="ways-strip__serving ways-strip__serving--ladder">
          <p>
            <span>{SERVING_LADDER_LABELS.start}</span>
            <strong>{serving.start}</strong>
          </p>
          <p>
            <span>{SERVING_LADDER_LABELS.upto}</span>
            <strong>{serving.upto}</strong>
          </p>
        </div>
      )}
    </figure>
  );
}
