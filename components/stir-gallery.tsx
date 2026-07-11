"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { getStirFrameStyle, getStirImageFrame } from "@/lib/stir-gallery-frames";

type Dish = {
  name: string;
  tag: "THE MAIN" | "ON THE SIDE";
  base: number;
  image: string;
  video?: string;
};

const DISHES: Dish[] = [
  {
    name: "Dal tadka",
    tag: "THE MAIN",
    base: 9,
    image: "/images/stir-gallery/dal-tadka.webp",
    video: "/videos/stir-gallery/dal-tadka-stir.mp4"
  },
  {
    name: "Chana masala",
    tag: "THE MAIN",
    base: 8,
    image: "/images/stir-gallery/chana-masala.webp",
    video: "/videos/stir-gallery/chana-masala-stir.mp4"
  },
  {
    name: "Cucumber raita",
    tag: "ON THE SIDE",
    base: 3,
    image: "/images/stir-gallery/cucumber-raita.webp",
    video: "/videos/stir-gallery/cucumber-raita-stir.mp4"
  },
  {
    name: "Kadhi",
    tag: "THE MAIN",
    base: 7,
    image: "/images/stir-gallery/kadhi.webp",
    video: "/videos/stir-gallery/kadhi-stir.mp4"
  },
  {
    name: "Bowl of dahi",
    tag: "ON THE SIDE",
    base: 5,
    image: "/images/stir-gallery/bowl-of-dahi-clean.webp",
    video: "/videos/stir-gallery/bowl-of-dahi-stir.mp4"
  }
];

const CAPTIONS = [
  "Still tastes exactly the same.",
  "The same food, just a little heldier.",
  "Nani is impressed.",
  "Save some for the raita.",
  "A very strong bowl indeed.",
  "Even mama approves of this one.",
  "The dal did not even notice.",
  "At this point, keep the jar on the table."
];

const MAX_SPOONS = 2;
const MAX_CAPTION =
  "That's 2 tbsp, the most we recommend stirring into one dish.";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${10 + ((i * 79) % 80)}%`,
  delay: `${((i * 0.11) % 0.7).toFixed(2)}s`
}));

const BURST_MS = 1300;
const POP_MS = 250;
const VIDEO_FADE_MS = 450;
const PROGRAMMATIC_SCROLL_MS = 900;

type StirGalleryProps = {
  boostGrams?: number;
};

export function StirGallery({ boostGrams = 10 }: StirGalleryProps) {
  const [spoons, setSpoons] = useState<number[]>(() =>
    Array(DISHES.length).fill(0)
  );
  const [captions, setCaptions] = useState<string[]>(() =>
    Array(DISHES.length).fill("")
  );
  const [active, setActive] = useState(0);
  const [burstAt, setBurstAt] = useState(-1);
  const [popping, setPopping] = useState(false);
  const [popAt, setPopAt] = useState(-1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animatingAt, setAnimatingAt] = useState(-1);
  const [videoFading, setVideoFading] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const burstTimer = useRef<number | undefined>(undefined);
  const popTimer = useRef<number | undefined>(undefined);
  const fadeTimer = useRef<number | undefined>(undefined);
  const scrollFlagTimer = useRef<number | undefined>(undefined);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReducedMotion(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(burstTimer.current);
      window.clearTimeout(popTimer.current);
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(scrollFlagTimer.current);
    };
  }, []);

  useEffect(() => {
    if (animatingAt < 0) return;
    const video = videoRef.current;
    if (!video) return;

    setVideoFading(false);
    video.currentTime = 0;
    void video.play().catch(() => {
      finishVideoStir();
    });
  }, [animatingAt]);

  function triggerPop(index: number) {
    setPopAt(index);
    setPopping(true);
    window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => setPopping(false), POP_MS);
  }

  function finishVideoStir() {
    setVideoFading(true);
    window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setAnimatingAt(-1);
      setVideoFading(false);
    }, VIDEO_FADE_MS);
  }

  function stir(index: number) {
    if (animatingAt === index) return;
    if (spoons[index] >= MAX_SPOONS) return;

    const dish = DISHES[index];
    const useVideo = Boolean(dish.video) && !reducedMotion;
    const nextCount = spoons[index] + 1;
    const nextCaption =
      nextCount >= MAX_SPOONS
        ? MAX_CAPTION
        : CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];

    setSpoons((current) =>
      current.map((count, i) => (i === index ? nextCount : count))
    );
    setCaptions((current) =>
      current.map((caption, i) => (i === index ? nextCaption : caption))
    );

    if (useVideo) {
      setAnimatingAt(index);
      triggerPop(index);
      return;
    }

    if (reducedMotion) return;

    triggerPop(index);
    setBurstAt(index);
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurstAt(-1), BURST_MS);
  }

  function scrollToIndex(index: number) {
    const rail = railRef.current;
    const clamped = Math.max(0, Math.min(DISHES.length - 1, index));

    if (rail) {
      const card = rail.children[clamped] as HTMLElement | undefined;
      if (card) {
        isProgrammaticScroll.current = true;
        window.clearTimeout(scrollFlagTimer.current);
        scrollFlagTimer.current = window.setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, PROGRAMMATIC_SCROLL_MS);

        const target =
          card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
        rail.scrollTo({
          left: Math.max(0, target),
          behavior: reducedMotion ? "auto" : "smooth"
        });
      }
    }

    setActive(clamped);
  }

  function onRailScroll() {
    if (isProgrammaticScroll.current) return;
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
  }

  return (
    <div className="stir-gallery">
      <header className="stir-gallery__header">
          <p className="eyebrow eyebrow--gold">SEE IT IN ACTION</p>
          <h2>Stir it into everything.</h2>
          <p className="stir-gallery__lede">
            Every dish on tonight&apos;s table takes a spoonful. Keep stirring.
            Nothing changes but <CopyHighlight>the protein</CopyHighlight>.
          </p>
        </header>

        <p className="stir-gallery__hint" aria-hidden="true">
          swipe the table &#8594;
        </p>

        <div
          className="stir-gallery__rail"
          ref={railRef}
          onScroll={onRailScroll}
        >
          {DISHES.map((dish, index) => {
            const count = spoons[index];
            const grams = dish.base + count * boostGrams;
            const boosted = count > 0;
            const isAnimating = animatingAt === index;
            const bursting =
              burstAt === index && !reducedMotion && !DISHES[index].video;
            const poppingHere = popping && popAt === index;
            const maxedOut = count >= MAX_SPOONS;
            const caption = boosted ? captions[index] : "";

            const imageFrame = getStirImageFrame(dish.name);
            const imageSrc = imageFrame?.source ?? dish.image;

            return (
              <article
                key={dish.name}
                className={`stir-card stir-card--${
                  index % 2 === 1 ? "marigold" : "cream"
                }`}
                aria-label={dish.name}
              >
                <div className="stir-card__head">
                  <span className="stir-card__name">{dish.name}</span>
                  <span className="stir-card__tag">{dish.tag}</span>
                </div>

                <div className="stir-card__photo">
                  <div className="stir-card__photo-circle">
                    <div
                      className={`stir-card__photo-frame${
                        imageFrame ? " stir-card__photo-frame--custom" : ""
                      }`}
                      style={getStirFrameStyle(imageFrame)}
                    >
                      <Image
                        src={imageSrc}
                        alt={`${dish.name}, home-cooked bowl`}
                        width={380}
                        height={380}
                        sizes="190px"
                      />
                      {isAnimating && dish.video ? (
                        <video
                          ref={videoRef}
                          className={`stir-card__video${
                            videoFading ? " is-fading" : ""
                          }`}
                          src={dish.video}
                          muted
                          playsInline
                          preload="none"
                          onEnded={finishVideoStir}
                        />
                      ) : null}
                    </div>
                  </div>
                  {bursting ? (
                    <div
                      className="stir-card__burst"
                      key={count}
                      aria-hidden="true"
                    >
                      {PARTICLES.map((particle, particleIndex) => (
                        <span
                          key={particleIndex}
                          style={{
                            left: particle.left,
                            animationDelay: particle.delay
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                  {boosted ? (
                    <span className="stir-card__badge">
                      {count === 1 ? "1 spoonful" : `${count} spoonfuls`}
                    </span>
                  ) : null}
                </div>

                <p
                  className={`stir-card__counter${
                    boosted ? " is-boosted" : ""
                  }${poppingHere ? " is-popping" : ""}`}
                >
                  {grams}g
                </p>
                <p className="stir-card__counter-label">protein in this bowl</p>

                <button
                  type="button"
                  className="stir-card__button"
                  onClick={() => stir(index)}
                  disabled={isAnimating || maxedOut}
                  aria-busy={isAnimating}
                >
                  {isAnimating
                    ? "Adding Heldi…"
                    : maxedOut
                      ? "This dish is Heldi."
                      : count === 0
                        ? "Stir in a spoonful"
                        : "Stir in another"}
                </button>

                <p className="stir-card__caption" aria-live="polite">
                  {caption}
                </p>
              </article>
            );
          })}
        </div>

        <div className="stir-gallery__dots" role="tablist" aria-label="Dishes">
          {DISHES.map((dish, index) => (
            <button
              key={dish.name}
              type="button"
              role="tab"
              className={`stir-gallery__dot${
                index === active ? " is-active" : ""
              }`}
              aria-label={dish.name}
              aria-selected={index === active}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
    </div>
  );
}
