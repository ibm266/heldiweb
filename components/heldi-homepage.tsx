"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties
} from "react";
import { CartIcon } from "@/components/cart/cart-icon";
import { useCart } from "@/components/cart/cart-context";
import { ComparisonSection } from "@/components/comparison-section";
import { DevModeToggle } from "@/components/cart/dev-mode-toggle";
import { FooterLegal } from "@/components/subpage-nav";
import { CopyHighlight } from "@/components/copy-highlight";
import { HOME_FAQ_GROUPS } from "@/components/home-faqs";
import { MenuGallery } from "@/components/menu-gallery";
import { NavMore } from "@/components/nav-more";
import { RangeSection } from "@/components/range-section";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { GiftingBand } from "@/components/shop/gifting-band";
import {
  MAX_DAILY_SERVINGS,
  NUTRITION_ROWS,
  SERVING_GRAMS
} from "@/components/shop/nutrition-data";
import { StatutoryStatements } from "@/components/shop/statutory-statements";
import { StirGallery } from "@/components/stir-gallery";
import { useNavScrollState } from "@/components/use-nav-scroll-hide";
import { WaitlistForm } from "@/components/waitlist-form";
import { useWaitlistOffer } from "@/components/waitlist-offer-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";
import { WaysGallery } from "@/components/ways-gallery";
import { WAITLIST_HEADLINE } from "@/lib/waitlist-offer";

type HeroAnimation = "split-flap" | "dissolve";
type HeroLayout = "video" | "classic" | "reveal";

type HeldiHomepageProps = {
  grams?: number;
  heroAnimation?: HeroAnimation;
  heroLayout?: HeroLayout;
  flapDwellMs?: number;
  ticker?: boolean;
};

const HERO_VIDEO_SRC = "/videos/heldi-hero-v3.mp4";
const HERO_VIDEO_POSTER = "/images/hero-video-poster.png";
const ELEPHANT_RUN_GOLD_SRC = "/videos/elephant-run-gold.mp4";
const ELEPHANT_RUN_MS = 3000;
const ELEPHANT_RUN_END_AT_S = 3;
const CURTAIN_FADE_MS = 520;
const ELEPHANT_KEY_TOLERANCE = 46;

// The curtain plays once per tab session; the elephants button replays it.
const CURTAIN_SEEN_KEY = "heldi_curtain_seen_v1";

function hasSeenCurtain(): boolean {
  try {
    return window.sessionStorage.getItem(CURTAIN_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markCurtainSeen(): void {
  try {
    window.sessionStorage.setItem(CURTAIN_SEEN_KEY, "1");
  } catch {
    // Storage blocked: the curtain just plays again next load.
  }
}

function sampleCurtainKeyColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): [number, number, number] {
  const points = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3]
  ];
  let r = 0;
  let g = 0;
  let b = 0;

  for (const [x, y] of points) {
    const index = (y * width + x) * 4;
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
  }

  return [
    Math.round(r / points.length),
    Math.round(g / points.length),
    Math.round(b / points.length)
  ];
}

function isCurtainBackgroundPixel(
  r: number,
  g: number,
  b: number,
  key: [number, number, number],
  tolerance: number
) {
  const dr = Math.abs(r - key[0]);
  const dg = Math.abs(g - key[1]);
  const db = Math.abs(b - key[2]);

  if (dr + dg + db > tolerance * 3) return false;

  // Keep cream smoke and ink elephants; only remove warm gold backdrop tones.
  return r > 145 && g > 95 && b < 130 && r >= g && g >= b;
}

function drawCurtainCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;

  const scale = Math.max(width / vw, height / vh);
  const drawWidth = vw * scale;
  const drawHeight = vh * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
}

// The hero's rotating word, in order. Chai, tea and coffee are Chai's; the
// rest are Khana's. After INDIAN FOOD the list alternates food and drink so
// both pouches come up in the first few words (chai second, tea fourth)
// rather than the drinks waiting until the food has run out. COLS is the
// split-flap board's width: the longest word.
const WORDS = [
  "INDIAN FOOD",
  "CHAI",
  "DAL",
  "TEA",
  "CURRY",
  "COFFEE",
  "RAITA",
  "CHAAT",
  "DAHI"
];
const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLS = 11;

// One ticker per commerce mode: waitlist carries the launch date, the waitlist
// offer and no price lines; live carries the family-rate line and drops the
// date. The launch date lives here (BRAND.md §11.5).
//
// The offer's ticker items come from lib/waitlist-offer.ts (BRAND.md §11.9):
// two while the free sample pairs are open, one once the first 100 have gone.
// Everything else in the string is fixed, including the trailing bullet the
// marquee needs to loop cleanly.
function waitlistTickerCopy(offerItems: string[]): string {
  return [
    "THEY SHAKE, WE STIR",
    "BLENDED AND PACKED IN THE UK",
    "FOR INDIAN KITCHENS",
    "KHANA FOR THE BOWL, CHAI FOR THE MUG",
    "100% VEGETARIAN",
    ...offerItems,
    "SAME RECIPES, SAME TASTE",
    "LAUNCHING WINTER 2026",
    ""
  ].join("  •  ");
}
const TICKER_COPY_LIVE =
  "THEY SHAKE, WE STIR  •  BLENDED AND PACKED IN THE UK  •  FOR INDIAN KITCHENS  •  KHANA FOR THE BOWL, CHAI FOR THE MUG  •  100% VEGETARIAN  •  AUNTIES & UNCLES PAY LESS  •  SAME RECIPES, SAME TASTE  •  ";

const POUCH_BADGE_ICONS = {
  highProtein: "/images/pouch-badges/high-protein.png",
  allNatural: "/images/pouch-badges/all-natural.png",
  vegetarian: "/images/pouch-badges/vegetarian.png"
} as const;

// The hero shows both pouches, so its pills are only the claims both can
// stand up. Khana's own row (98% lactose-free, no added sugar, gluten free)
// lives on /shop/khana; Chai carries coconut sugar and has no gluten or
// lactose test yet, so none of those three belong beside the pair.
const HERO_SHOWCASE_PILLS: {
  icon: string;
  label: string;
  width: number;
  height: number;
}[] = [
  {
    icon: POUCH_BADGE_ICONS.highProtein,
    label: "High protein",
    width: 256,
    height: 256
  },
  {
    icon: POUCH_BADGE_ICONS.allNatural,
    label: "Real spices",
    width: 256,
    height: 256
  },
  {
    icon: POUCH_BADGE_ICONS.vegetarian,
    label: "Vegetarian",
    width: 286,
    height: 367
  }
];

const IMAGE_VERSION = "ink-blue-14";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
}

function HeroPills() {
  return (
    <ul className="hero-card__pills" aria-label="Product attributes">
      {HERO_SHOWCASE_PILLS.map((pill) => (
        <li key={pill.label} className="hero-card__pill">
          <Image
            className="hero-card__pill-icon"
            src={pill.icon}
            alt=""
            width={pill.width}
            height={pill.height}
            sizes="22px"
            aria-hidden="true"
          />
          {pill.label}
        </li>
      ))}
    </ul>
  );
}

// The CTA pair and the offer ticket. One DOM for both widths: a stacked right
// column on wide, a two-button grid with the ticket under it on mobile.
function HeroActions() {
  const { mode } = useCart();
  const { open } = useWaitlistPopup();
  return (
    <div className="hero-card__actions">
      {mode === "live" ? (
        <Link className="button button--pill hero-card__cta" href="/shop">
          Shop now
        </Link>
      ) : (
        <button
          className="button button--pill hero-card__cta"
          type="button"
          onClick={() => open("popup-hero")}
        >
          Join waitlist
        </button>
      )}
      <a className="button button--pill button--outline hero-card__cta" href="#how">
        How it works
      </a>
      <HeroIncentive className="hero-card__ticket" />
    </div>
  );
}

// The brand line, what the two pouches do, and who made them. Left column on
// wide; the last block in the card on mobile.
function HeroStory() {
  return (
    <div className="hero-card__story">
      <p className="hero-card__tagline">More from the food you love.</p>
      <p className="hero-card__support">
        Nobody should have to swap their mum&apos;s dal for a protein bar. So we
        made protein you stir into your home-cooked favourites. A spoonful of
        Heldi Khana adds{" "}
        <strong className="hero-card__grams">10g of protein</strong> to your dal,
        curry or sabzi, and a spoonful of Heldi Chai adds <strong>5g</strong> to
        your chai, tea or coffee.
      </p>
      <p className="hero-card__claim">
        Developed by Indian home cooks for Indian families.
      </p>
    </div>
  );
}

// "Protein powder for", its letters dissolving in once the curtain lifts,
// the way the rotating word does. The spans are presentational; the h1 still
// reads as one phrase.
const HERO_PREFIX = "Protein powder for";

// Splits a phrase into its words, each with the index of its first letter in
// the whole phrase (spaces counted), so letter delays run on across words.
function wordRuns(text: string): { part: string; start: number }[] {
  return text.split(" ").map((part, index, parts) => ({
    part,
    start: parts.slice(0, index).reduce((total, word) => total + word.length + 1, 0)
  }));
}

function HeroPrefix() {
  return (
    <span className="hero-card__prefix">
      {wordRuns(HERO_PREFIX).map(({ part, start }, partIndex) => {
        return (
          <span className="hero-card__prefix-word" key={partIndex}>
            {part.split("").map((letter, letterIndex) => (
              <span
                className="hero-card__prefix-letter"
                key={letterIndex}
                style={{ animationDelay: `${120 + (start + letterIndex) * 22}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

// The rotating word in its gold badge. Same words, order and timing as
// DissolveBoard (3.2s on the first word, 2.6s on the rest, letters dissolving
// in 55ms apart). New here: the letters dissolve out before the next word,
// and the badge stretches from one word's width to the next. --len lets the
// CSS shrink the type so INDIAN FOOD always fits the card.
const BADGE_IN_STEP_MS = 55;
const BADGE_OUT_STEP_MS = 22;
const BADGE_OUT_MS = 240;

function HeroWordBadge({ active }: { active: boolean }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [run, setRun] = useState(0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef(0);

  // Timer-driven rotation, reset whenever `active` toggles, so setting state
  // in the effect is the point.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setWordIndex(0);
    setLeaving(false);
    if (!active) return;

    // A fresh run re-keys the letters so the first word dissolves in as the
    // card appears.
    setRun((value) => value + 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let timer: number;

    function scheduleNext() {
      timer = window.setTimeout(
        () => {
          const next = (index + 1) % WORDS.length;
          if (reduce) {
            index = next;
            setWordIndex(index);
            scheduleNext();
            return;
          }
          setLeaving(true);
          timer = window.setTimeout(() => {
            index = next;
            setLeaving(false);
            setWordIndex(index);
            scheduleNext();
          }, BADGE_OUT_MS + WORDS[index].length * BADGE_OUT_STEP_MS);
        },
        index === 0 ? 3200 : 2600
      );
    }

    scheduleNext();
    return () => window.clearTimeout(timer);
  }, [active]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Stretch from the last word's width to this one's. Measured before paint,
  // so the new word never flashes at the old width.
  useLayoutEffect(() => {
    const el = badgeRef.current;
    if (!el) return;
    el.style.width = "";
    const to = el.getBoundingClientRect().width;
    const from = widthRef.current;
    widthRef.current = to;
    if (
      !from ||
      Math.abs(from - to) < 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    el.style.width = `${from}px`;
    void el.offsetWidth;
    el.style.width = `${to}px`;
  }, [wordIndex]);

  const word = WORDS[wordIndex];

  return (
    <span
      ref={badgeRef}
      className={`hero-card__badge${leaving ? " is-leaving" : ""}`}
      style={{ "--len": word.length } as CSSProperties}
      aria-live="polite"
      onTransitionEnd={(event) => {
        if (event.propertyName === "width") event.currentTarget.style.width = "";
      }}
    >
      {wordRuns(word).map(({ part, start }, partIndex) => {
        return (
          <span className="hero-card__badge-word" key={`${run}-${wordIndex}-${partIndex}`}>
            {part.split("").map((letter, letterIndex) => (
              <span
                className="hero-card__badge-letter"
                key={letterIndex}
                style={{
                  animationDelay: `${
                    (start + letterIndex) *
                    (leaving ? BADGE_OUT_STEP_MS : BADGE_IN_STEP_MS)
                  }ms`
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

// The waitlist offer, beside the hero's Join waitlist button so joining has an
// obvious payoff. Waitlist mode only: in live mode there is no offer to
// advertise. The reveal hero shows it as a tear-off ticket; the split-flap
// hero as a plain line under its form. The words come from
// lib/waitlist-offer.ts, never from here.
function HeroIncentive({ className = "hero-incentive" }: { className?: string }) {
  const { mode } = useCart();
  const offer = useWaitlistOffer();
  if (mode === "live") return null;
  return <p className={className}>{offer.sentence}</p>;
}

function PouchEquation() {
  return (
    <>
      <div
        className="pouch-equation"
        aria-label="6 grams of protein in a bowl of dal, plus 10 grams from one spoonful of Heldi, equals 16 grams in the same bowl"
      >
        <div className="pouch-eq__item">
          <strong>6g</strong>
          <span>protein in your dal</span>
        </div>
        <span className="pouch-eq__op" aria-hidden="true">+</span>
        <div className="pouch-eq__item pouch-eq__item--gold">
          <strong>10g</strong>
          <span>one spoonful of Heldi</span>
        </div>
        <span className="pouch-eq__op" aria-hidden="true">=</span>
        <div className="pouch-eq__item pouch-eq__item--ink">
          <strong>16g</strong>
          <span>same bowl, same taste</span>
        </div>
      </div>
    </>
  );
}

function Wordmark({
  large = false,
  onDark = false,
  footer = false
}: {
  large?: boolean;
  onDark?: boolean;
  footer?: boolean;
}) {
  const className = [
    "heldi-logo",
    large && "heldi-logo--large",
    footer && "heldi-logo--footer",
    onDark && "heldi-logo--on-dark"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      className={className}
      src={imageSrc("/images/heldi-wordmark.webp")}
      alt="Heldi"
      width={1934}
      height={609}
      priority={large}
      sizes={
        large
          ? "(max-width: 899px) 78vw, (max-width: 1280px) 52vw, 720px"
          : footer
            ? "120px"
            : "140px"
      }
    />
  );
}

function SplitFlapBoard({ dwellMs }: { dwellMs: number }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [chars, setChars] = useState(() => Array<string>(COLS).fill(" "));
  const [versions, setVersions] = useState(() => Array<number>(COLS).fill(0));
  const target = WORDS[wordIndex].padEnd(COLS, " ");

  useEffect(() => {
    let dwellTimer: number | undefined;
    const timer = window.setInterval(() => {
      let changed = false;

      setChars((current) => {
        const next = current.map((char, index) => {
          if (char === target[index]) return char;
          changed = true;
          return CHARSET[(CHARSET.indexOf(char) + 1) % CHARSET.length];
        });

        if (changed) {
          setVersions((currentVersions) =>
            currentVersions.map((version, index) =>
              next[index] === current[index] ? version : version + 1
            )
          );
        }

        return next;
      });
    }, 75);

    const settleTimer = window.setInterval(() => {
      setChars((current) => {
        if (current.join("") !== target) return current;

        window.clearInterval(timer);
        window.clearInterval(settleTimer);
        dwellTimer = window.setTimeout(
          () => setWordIndex((index) => (index + 1) % WORDS.length),
          wordIndex === 0 ? 3200 : dwellMs
        );
        return current;
      });
    }, 80);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(settleTimer);
      if (dwellTimer) window.clearTimeout(dwellTimer);
    };
  }, [dwellMs, target, wordIndex]);

  return (
    <div className="flap-board" aria-live="polite" aria-label={WORDS[wordIndex]}>
      {chars.map((char, index) => {
        const active = index < WORDS[wordIndex].length;
        return (
          <span className={`flap-tile${active ? " is-active" : ""}`} key={index}>
            <span className="flap-letter" key={versions[index]}>
              {char === " " ? "\u00a0" : char}
            </span>
            <span className="flap-hinge" aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

function DissolveBoard({ active = true }: { active?: boolean }) {
  const [wordIndex, setWordIndex] = useState(0);

  // Timer-driven word rotation: the effect resets the index when `active`
  // toggles and advances it on a schedule, so setting state here is the point.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!active) {
      setWordIndex(0);
      return;
    }

    setWordIndex(0);
    let index = 0;
    let timer: number;

    function scheduleNext() {
      const dwellMs = index === 0 ? 3200 : 2600;
      timer = window.setTimeout(() => {
        index = (index + 1) % WORDS.length;
        setWordIndex(index);
        scheduleNext();
      }, dwellMs);
    }

    scheduleNext();

    return () => window.clearTimeout(timer);
  }, [active]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="dissolve-board" aria-live="polite">
      {WORDS[wordIndex].split(" ").map((part, wordPartIndex, parts) => {
        const wordKey = `${wordIndex}-w${wordPartIndex}`;

        return (
          <span className="dissolve-word" key={wordKey}>
            {part.split("").map((letter, letterIndex) => {
              const delayIndex =
                parts
                  .slice(0, wordPartIndex)
                  .reduce((total, segment) => total + segment.length + 1, 0) +
                letterIndex;

              return (
                <span
                  key={`${wordKey}-${letterIndex}`}
                  style={{ animationDelay: `${delayIndex * 55}ms` }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncPlayback() {
      const el = videoRef.current;
      if (!el) return;

      if (motionQuery.matches) {
        el.pause();
        el.removeAttribute("autoplay");
        return;
      }

      el.play().catch(() => {
        /* autoplay blocked, poster remains visible */
      });
    }

    syncPlayback();
    motionQuery.addEventListener("change", syncPlayback);

    return () => motionQuery.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <div className="hero-video-shell">
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        poster={HERO_VIDEO_POSTER}
        aria-label="Heldi hero film: a family dinner table, ink-blue elephants cross the scene, smoke clears to reveal the Heldi pouch and tagline, Bringing something new to the table."
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}

function HeroReveal({
  onIntroComplete
}: {
  onIntroComplete?: () => void;
}) {
  const { mode } = useCart();
  const [revealed, setRevealed] = useState(false);
  const [curtainDismissed, setCurtainDismissed] = useState(false);
  const [curtainFading, setCurtainFading] = useState(false);
  const [canCallElephants, setCanCallElephants] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const keyColorRef = useRef<[number, number, number] | null>(null);
  const frameRef = useRef<number>(0);
  const onIntroCompleteRef = useRef(onIntroComplete);
  const introCompletedRef = useRef(false);

  useEffect(() => {
    onIntroCompleteRef.current = onIntroComplete;
  }, [onIntroComplete]);

  function handleCallElephants() {
    if (!canCallElephants || !curtainDismissed) return;
    setCurtainDismissed(false);
    setCurtainFading(false);
    setCanCallElephants(false);
    setReplayNonce((nonce) => nonce + 1);
  }

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // First run only (replayNonce 0): a curtain already seen this tab session
    // skips straight to the revealed state. Replays via the elephants button
    // (replayNonce > 0) bypass the gate. Reading storage here, inside the
    // effect, keeps server and first client render identical.
    const skipToRevealed =
      motionQuery.matches || (replayNonce === 0 && hasSeenCurtain());

    if (skipToRevealed) {
      // Reduced motion: skip the elephant intro and land on the revealed state
      // immediately. matchMedia is client-only, so this settles in an effect.
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setRevealed(true);
      setCurtainDismissed(true);
      setCanCallElephants(true);
      markCurtainSeen();
      if (!introCompletedRef.current) {
        introCompletedRef.current = true;
        onIntroCompleteRef.current?.();
      }
      return;
    }

    const el = videoRef.current;
    const canvas = canvasRef.current;
    const curtain = curtainRef.current;
    let unmountTimer: number | undefined;
    let finished = false;

    function finishReveal() {
      if (finished) return;
      finished = true;

      markCurtainSeen();
      removeSkipListeners();
      setRevealed(true);
      if (!introCompletedRef.current) {
        introCompletedRef.current = true;
        onIntroCompleteRef.current?.();
      }
      setCurtainFading(true);
      unmountTimer = window.setTimeout(() => {
        setCurtainDismissed(true);
        setCanCallElephants(true);
      }, CURTAIN_FADE_MS + 40);
    }

    // While the curtain is up, the first interaction of any kind skips it.
    function skipIntroNow() {
      el?.pause();
      finishReveal();
    }

    const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

    function addSkipListeners() {
      for (const type of SKIP_EVENTS) {
        window.addEventListener(type, skipIntroNow, { passive: true });
      }
    }

    function removeSkipListeners() {
      for (const type of SKIP_EVENTS) {
        window.removeEventListener(type, skipIntroNow);
      }
    }

    function onTimeUpdate() {
      if (!el || el.currentTime < ELEPHANT_RUN_END_AT_S) return;
      el.pause();
      el.removeEventListener("timeupdate", onTimeUpdate);
      finishReveal();
    }

    function paintCurtainFrame() {
      if (!el || !canvas || !curtain || el.readyState < 2) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = curtain.getBoundingClientRect();
      if (!width || !height) return;

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        keyColorRef.current = null;
      }

      drawCurtainCover(ctx, el, pixelWidth, pixelHeight);

      const frame = ctx.getImageData(0, 0, pixelWidth, pixelHeight);
      if (!keyColorRef.current) {
        keyColorRef.current = sampleCurtainKeyColor(
          frame.data,
          pixelWidth,
          pixelHeight
        );
      }

      const key = keyColorRef.current;
      const pixels = frame.data;

      for (let i = 0; i < pixels.length; i += 4) {
        if (
          isCurtainBackgroundPixel(
            pixels[i],
            pixels[i + 1],
            pixels[i + 2],
            key,
            ELEPHANT_KEY_TOLERANCE
          )
        ) {
          pixels[i + 3] = 0;
        }
      }

      ctx.putImageData(frame, 0, 0);
    }

    function renderCurtainFrame() {
      paintCurtainFrame();

      if (!el || el.paused || el.ended) return;
      frameRef.current = window.requestAnimationFrame(renderCurtainFrame);
    }

    function startCurtainRender() {
      window.cancelAnimationFrame(frameRef.current);
      keyColorRef.current = null;
      renderCurtainFrame();
    }

    addSkipListeners();

    if (el && canvas && curtain) {
      window.cancelAnimationFrame(frameRef.current);
      el.pause();
      el.currentTime = 0;
      el.addEventListener("ended", finishReveal);
      el.addEventListener("timeupdate", onTimeUpdate);
      el.addEventListener("play", startCurtainRender);
      el.addEventListener("loadeddata", paintCurtainFrame);
      paintCurtainFrame();
      el.play().catch(finishReveal);
    } else {
      const fallbackTimer = window.setTimeout(finishReveal, ELEPHANT_RUN_MS);
      return () => {
        removeSkipListeners();
        window.clearTimeout(fallbackTimer);
      };
    }

    const safetyTimer = window.setTimeout(finishReveal, ELEPHANT_RUN_MS + 500);

    return () => {
      removeSkipListeners();
      window.cancelAnimationFrame(frameRef.current);
      el?.removeEventListener("ended", finishReveal);
      el?.removeEventListener("timeupdate", onTimeUpdate);
      el?.removeEventListener("play", startCurtainRender);
      el?.removeEventListener("loadeddata", paintCurtainFrame);
      window.clearTimeout(safetyTimer);
      if (unmountTimer) window.clearTimeout(unmountTimer);
    };
  }, [replayNonce]);

  return (
    <div className="hero-reveal">
      <div className={`hero-reveal-panel${revealed ? " is-revealed" : ""}`}>
        {/* Wide: centred headline, then story | pouches | actions. Mobile:
            one column, reordered in CSS (headline, pouches, actions, story).
            The /hel-dee/ sticker sits on the card's top-right corner at both
            widths. */}
        <div className={`hero-card${mode === "live" ? " hero-card--live" : ""}`}>
          <p className="hero-card__sticker">
            <span className="hero-card__sticker-term">/hel-dee/</span>
            <span className="hero-card__sticker-gloss">
              <em>adj.</em> how my nani says “healthy.”
            </span>
          </p>
          <h1 className="hero-card__lede">
            <HeroPrefix />
            <span className="hero-card__badge-row">
              <HeroWordBadge active={revealed} />
            </span>
          </h1>
          <div className="hero-card__body">
            <HeroStory />
            <div className="hero-card__pack">
              <Image
                className="hero-card__pack-image"
                src={imageSrc("/images/hero-pair-cutout.webp")}
                alt="The Heldi Khana and Heldi Chai pouches side by side, one for the bowl and one for the mug"
                width={708}
                height={667}
                priority
                sizes="(max-width: 899px) 262px, 354px"
              />
              <HeroPills />
            </div>
            <HeroActions />
          </div>
          {revealed ? (
            <button
              type="button"
              className={`hero-reveal-call-elephants${
                canCallElephants ? " is-visible" : ""
              }`}
              onClick={handleCallElephants}
              disabled={!canCallElephants}
              aria-label="Press to call the elephants"
              aria-hidden={!canCallElephants}
              tabIndex={canCallElephants ? 0 : -1}
              data-tooltip="Press to call the elephants"
            >
              <Image
                className="hero-reveal-call-elephants__icon"
                src={imageSrc("/images/elephant-large-transparent.webp")}
                alt=""
                width={2048}
                height={2048}
                sizes="34px"
              />
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={curtainRef}
        className={`hero-reveal-curtain${curtainFading ? " is-fading" : ""}${
          curtainDismissed ? " is-dismissed" : ""
        }`}
        aria-hidden={curtainDismissed}
      >
        <video
          ref={videoRef}
          className="hero-reveal-curtain__video"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={ELEPHANT_RUN_GOLD_SRC} type="video/mp4" />
        </video>
        <canvas
          ref={canvasRef}
          className="hero-reveal-curtain__canvas"
          aria-label="Decorated ink-blue elephants and comic dust cloud sweep across the screen"
        />
      </div>
    </div>
  );
}

export function HeldiHomepage({
  grams = 10,
  heroAnimation = "split-flap",
  heroLayout = "video",
  flapDwellMs = 2200,
  ticker = true
}: HeldiHomepageProps) {
  const [faqOpen, setFaqOpen] = useState(-1);
  const [faqGroup, setFaqGroup] = useState<string>(HOME_FAQ_GROUPS[0].id);
  const [joined, setJoined] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIntroComplete, setHeroIntroComplete] = useState(
    heroLayout !== "reveal"
  );
  const { hidden: scrollHidden } = useNavScrollState();
  const { mode } = useCart();
  const { open: openWaitlist } = useWaitlistPopup();
  const offer = useWaitlistOffer();
  const tickerCopy =
    mode === "live" ? TICKER_COPY_LIVE : waitlistTickerCopy(offer.tickerItems);
  const navHidden = scrollHidden && !menuOpen;

  // Close the mobile menu when the viewport grows past the nav breakpoint.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");

    function syncMobileNav() {
      if (!media.matches) setMenuOpen(false);
    }

    syncMobileNav();
    media.addEventListener("change", syncMobileNav);

    return () => media.removeEventListener("change", syncMobileNav);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function closeMenu() {
      setMenuOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menuOpen]);

  // A hash like /#join or /#how can arrive before this streamed homepage has
  // finished mounting, so the browser's initial jump lands short or not at
  // all. Land the target clear of the fixed nav once the layout settles, and
  // re-run a few times because content above keeps loading and shifting it.
  // Instant, not smooth: a deep-link arrival should just be there, and it
  // also respects reduced motion for free. Bails the moment the visitor
  // scrolls themselves.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    let userMoved = false;
    function markMoved() {
      userMoved = true;
    }
    window.addEventListener("wheel", markMoved, { passive: true });
    window.addEventListener("touchstart", markMoved, { passive: true });
    window.addEventListener("keydown", markMoved);

    const settle = () => {
      if (userMoved) return;
      const clearance =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-clearance"
          )
        ) *
          16 +
        16;
      const y = target.getBoundingClientRect().top + window.scrollY - clearance;
      window.scrollTo({ top: y, behavior: "instant" });
    };

    const raf = requestAnimationFrame(() => requestAnimationFrame(settle));
    const timers = [250, 700, 1500].map((ms) => window.setTimeout(settle, ms));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("wheel", markMoved);
      window.removeEventListener("touchstart", markMoved);
      window.removeEventListener("keydown", markMoved);
    };
  }, []);

  return (
    <main>
      <div
        className={`nav-shell${
          heroLayout === "reveal" && !heroIntroComplete ? " nav-shell--intro" : ""
        }${navHidden ? " nav-shell--hidden" : ""}`}
      >
        <div className="nav-menu-toggle">
          <button
            className="nav-burger"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span className="nav-burger-bar" aria-hidden="true" />
            <span className="nav-burger-bar" aria-hidden="true" />
            <span className="nav-burger-bar" aria-hidden="true" />
          </button>
        </div>
        <nav
          className={`nav${
            heroLayout === "reveal" && !heroIntroComplete ? " nav--intro" : ""
          }`}
          aria-label="Main navigation"
        >
          <a href="#top" aria-label="Heldi home" className="nav-home">
            <span className="nav-brand">
              <Image
                className="nav-elephant-logo nav-elephant-logo--face-in"
                src={imageSrc("/images/elephant-large-transparent.webp")}
                alt=""
                width={2048}
                height={2048}
                sizes="32px"
                priority
              />
              <Wordmark />
              <Image
                className="nav-elephant-logo"
                src={imageSrc("/images/elephant-large-transparent.webp")}
                alt=""
                width={2048}
                height={2048}
                sizes="32px"
                priority
              />
            </span>
          </a>
          {/* The three .nav-links__foldable links move into NavMore between
              900 and 1139px; keep them in step with components/nav-more.tsx. */}
          <div className="nav-links nav-links--desktop">
            <a href="#how">How it works</a>
            <Link href="/truth">The truth</Link>
            <Link className="nav-links__foldable" href="/our-story">Our story</Link>
            <Link href="/heldi-living">Heldi Living</Link>
            <Link className="nav-links__foldable" href="/inside-the-pouch">Inside the pouch</Link>
            <Link className="nav-links__foldable" href="/faq">FAQ</Link>
            <NavMore />
            <Link href="/shop">Shop</Link>
            {mode !== "live" ? (
              <button
                className="nav-join"
                type="button"
                onClick={() => openWaitlist("popup-nav")}
              >
                Join waitlist
              </button>
            ) : null}
            <DevModeToggle variant="menu" />
          </div>
          <div
            className={`nav-links nav-links--mobile${
              menuOpen ? " is-open" : ""
            }`}
            id="nav-menu"
          >
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <Link href="/truth" onClick={() => setMenuOpen(false)}>The truth</Link>
            <Link href="/our-story" onClick={() => setMenuOpen(false)}>Our story</Link>
            <Link href="/heldi-living" onClick={() => setMenuOpen(false)}>Heldi Living</Link>
            <Link href="/inside-the-pouch" onClick={() => setMenuOpen(false)}>Inside the pouch</Link>
            <Link href="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            {mode !== "live" ? (
              <button
                className="nav-links__cta"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openWaitlist("popup-menu");
                }}
              >
                Join waitlist
              </button>
            ) : null}
            <DevModeToggle variant="menu" />
          </div>
        </nav>
        <div className="nav-cart">
          <CartIcon />
        </div>
      </div>

      <section
        data-floating-cta-suppress
        data-nav-hero
        className={`hero${
          heroLayout === "video"
            ? " hero--video"
            : heroLayout === "reveal"
              ? " hero--reveal"
              : ""
        }${heroLayout === "reveal" && !heroIntroComplete ? " hero--intro" : ""}`}
        id="top"
      >
        {heroLayout === "reveal" ? (
          <HeroReveal onIntroComplete={() => setHeroIntroComplete(true)} />
        ) : heroLayout === "video" ? (
          <div className="hero-video-inner">
            <header className="hero-video-header">
              <Wordmark large />
              <p className="pronunciation">
                /hel-dee/ <em>adj.</em> how my nani says “healthy.”
              </p>
            </header>
            <HeroVideo />
            <h2 className="hero-video-lede">
              Desi protein that disappears into
              <br />
              dal, curry, raita and
              <br />
              other home-cooked favourites.
            </h2>
            <div className="hero-video-actions">
              {mode === "live" ? (
                <Link className="button button--pill" href="/shop">
                  Shop now
                </Link>
              ) : (
                <button
                  className="button button--pill"
                  type="button"
                  onClick={() => openWaitlist("popup-hero-pill")}
                >
                  Join waitlist
                </button>
              )}
              <a className="button button--pill button--outline" href="#how">
                How it works
              </a>
            </div>
          </div>
        ) : (
          <div className="hero-inner">
            <Image
              className="hero-elephant hero-elephant--left"
              src={imageSrc("/images/elephant-large-transparent.webp")}
              alt="Decorated Indian elephant illustration"
              width={2048}
              height={2048}
              sizes="(max-width: 899px) 13vw, 168px"
              priority
            />
            <div className="hero-copy">
              <Wordmark large />
              <p className="pronunciation">
                /hel-dee/ <em>adj.</em> how my nani says “healthy.”
              </p>
              <h1>Desi protein for</h1>
              <div className="word-board">
                {heroAnimation === "split-flap" ? (
                  <SplitFlapBoard dwellMs={flapDwellMs} />
                ) : (
                  <DissolveBoard />
                )}
              </div>
              <p className="hero-subline">Never drink another protein shake again.</p>
              <p className="hero-body">
                Heldi is a protein made to disappear straight into your dal, curry,
                raita and every other home-cooked favourite.
                <strong className="hero-body__tagline">
                  The same food, just a little Heldier.
                </strong>
              </p>
              <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="hero-email" />
              {!joined ? <HeroIncentive /> : null}
            </div>
            <Image
              className="hero-elephant"
              src={imageSrc("/images/elephant-large-transparent.webp")}
              alt="Decorated Indian elephant illustration"
              width={2048}
              height={2048}
              sizes="(max-width: 899px) 13vw, 168px"
              priority
            />
          </div>
        )}
        {ticker ? (
          <div className="ticker" aria-label={tickerCopy}>
            <div className="ticker-track" aria-hidden="true">
              <span>{tickerCopy}</span>
              <span>{tickerCopy}</span>
            </div>
          </div>
        ) : null}
        <div className="double-rule" aria-hidden="true" />
      </section>

      <section
        className="section section--ink section--bordered"
        id="stir"
      >
        <StirGallery boostGrams={grams} />
      </section>

      <RangeSection />

      <section className="section section--cream section--bordered" id="how">
        <WaysGallery />
      </section>

      <GiftingBand showShopCta />

      <section
        className="section section--gold section--bordered"
        id="truth"
      >
        <div className="truth-block">
          <p className="eyebrow">THE HONEST TRUTH</p>
          <h2>That 18g figure? It&apos;s for dry dal.</h2>
          {/* 18g is about 75g of dry lentils, not 100g: the same figure and
              basis as /truth and the "How much protein is in a bowl of dal?" FAQ. */}
          <p>
            We looked at the bowl that actually lands on your table. A cooked
            bowl of dal has{" "}
            <CopyHighlight>closer to 6g of protein</CopyHighlight>, not the 18g
            quoted on most sites, which is for about 75g of dry lentils.
          </p>
          <PouchEquation />
          {/* 94%, not 90%: the pouch is 94% whey protein isolate, while the
              isolate itself is 88.83% protein as it arrives. See FORMULA in
              components/shop/nutrition-data.ts. The blend was confirmed on
              3 Sep 2026, so this line is no longer provisional; BRAND.md §11.1
              still lists everything that moves if the recipe does. */}
          <p className="pouch-section__ingredient">
            94% whey protein isolate. The rest, warm spices you already know.
          </p>
          <div className="pill-links">
            <a className="pill-link" href="/truth">
              Why 6g isn&apos;t enough for most adults &#8594;
            </a>
            <a className="pill-link" href="/inside-the-pouch">
              See what&apos;s inside &#8594;
            </a>
          </div>
        </div>
      </section>

      <section className="section section--ink" id="thali">
        <MenuGallery gramsPerTbsp={grams} />
      </section>

      {/* Founder band before the shaker comparison: with the audience band
          gone, menus (ink) and the comparison (ink) would otherwise touch.
          The showcase-only reviews band travels with it so the cream, gold,
          ink order holds in showcase mode too (PLAYBOOK R1). */}
      <ReviewsSection
        id="reviews"
        tone="cream"
        eyebrow="THEY STIRRED. THEY TOLD US."
        heading="How it went at their table."
        showLeaderboard
      />

      <section className="section section--gold section--bordered founder-band founder-band--gold">
        <div className="founder-band__inner">
          <figure className="story-photo-card founder-band__figure">
            <Image
              className="story-photo-card__image"
              src="/images/our-story/nani.jpg"
              alt="Mihir with his nani"
              width={1024}
              height={682}
              sizes="(max-width: 899px) min(100vw - 4.5rem, 360px), 440px"
            />
            <figcaption className="story-photo-card__caption">
              My nani, the woman who coined it.
            </figcaption>
          </figure>
          <p className="founder-band__quote">
            My nani never said healthy. She said heldi. Warm food, made with
            care, made for you. That is where the name comes from.
          </p>
          {/* The brand values that live here (BRAND.md §1): time with
              parents, made active, as a wish and never a health outcome;
              family recipes kept cooking and passed on. */}
          <p className="founder-band__quote">
            I want more time with my mama and papa, and I want it to be the
            active kind: long walks and full tables. I&apos;d love my
            mama&apos;s palak paneer, the way my dadi taught it to her, to
            still be cooking when it&apos;s my turn at the stove. I made Heldi
            so nobody has to give up the food they grew up on.
          </p>
          <p className="founder-band__signature">&mdash; Mihir, founder</p>
          <a className="pill-link" href="/our-story">
            Read our story &#8594;
          </a>
        </div>
      </section>

      <ComparisonSection />

      <section className="section section--cream section--bordered" id="faq">
        <div className="faq">
          <h2 className="centered">The questions we hear most.</h2>
          {/* One group shows at a time, but every group and every answer is
              rendered (hidden, not left out), so crawlers read all thirteen
              and they match the FAQPage JSON-LD in app/page.tsx. */}
          <div className="faq-groups" role="radiogroup" aria-label="Question topics">
            {HOME_FAQ_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                role="radio"
                aria-checked={faqGroup === group.id}
                aria-controls={`faq-group-${group.id}`}
                className={`truth-chip${faqGroup === group.id ? " is-active" : ""}`}
                onClick={() => {
                  setFaqGroup(group.id);
                  setFaqOpen(-1);
                }}
              >
                {group.label}
              </button>
            ))}
          </div>
          {HOME_FAQ_GROUPS.map((group) => (
            <div
              className="faq-list faq-list--grouped"
              id={`faq-group-${group.id}`}
              key={group.id}
              hidden={faqGroup !== group.id}
            >
              {group.faqs.map(({ faq, index }) => {
                const open = faqOpen === index;
                return (
                  <article key={faq.question}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`faq-answer-${index}`}
                        onClick={() => setFaqOpen(open ? -1 : index)}
                      >
                        <span>{faq.question}</span>
                        <b aria-hidden="true">{open ? "–" : "+"}</b>
                      </button>
                    </h3>
                    <p id={`faq-answer-${index}`} hidden={!open}>
                      {faq.answer}
                    </p>
                  </article>
                );
              })}
            </div>
          ))}
          <p className="faq-more">
            <a className="pill-link" href="/faq">
              See the full FAQ &#8594;
            </a>
          </p>
        </div>
      </section>

      <section className="section section--ink" id="jar">
        <div className="jar-layout">
          <div className="section-copy section-copy--dark">
            <p className="eyebrow eyebrow--gold">WITH EVERY ORDER</p>
            <h2>A jar for the table. On us.</h2>
            <p>
              Every pouch order comes with a refillable jar for the{" "}
              <CopyHighlight>dinner table</CopyHighlight>. Not the cupboard.
              Keep it <CopyHighlight>beside the dal</CopyHighlight> so everyone
              can reach for a spoonful. It comes in gold, and only gold. We
              considered silver for about four minutes, then remembered our
              families would have the final say.
            </p>
          </div>
          <div className="jar-card">
            <div className="jar-preview-card">
              <Image
                className="jar-preview-image"
                src={imageSrc("/images/jar-pouch.webp")}
                alt="The navy Heldi Khana pouch beside the gold table jar and its gold spoon"
                width={768}
                height={768}
                sizes="(max-width: 560px) calc(100vw - 3rem), (max-width: 899px) min(92vw, 380px), 320px"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>

      {mode !== "live" ? (
        <section className="final-cta section--bordered" id="join" data-floating-cta-suppress>
          <Image className="cta-elephant cta-elephant--left" src={imageSrc("/images/elephant-large-transparent.webp")} alt="" width={2048} height={2048} sizes="240px" />
          <div className="final-cta-copy">
            <h2>{WAITLIST_HEADLINE}</h2>
            <p>
              {offer.paragraphParts.before}
              <CopyHighlight>{offer.paragraphParts.highlight}</CopyHighlight>
              {offer.paragraphParts.after}
            </p>
            {/* Open from the start, as in the popup: this is the last ask on
                the page, so the email field is on screen rather than one tap
                away (docs/ui-audit/README.md item 7). Not focused on load. */}
            <WaitlistForm
              joined={joined}
              onJoin={() => setJoined(true)}
              id="footer-email"
              buttonStyle="pill"
              startExpanded
              autoFocus={false}
            />
          </div>
          <Image className="cta-elephant cta-elephant--right" src={imageSrc("/images/elephant-large-transparent.webp")} alt="" width={2048} height={2048} sizes="240px" />
        </section>
      ) : null}

      {/* The homepage carries Shop now CTAs and the tier line-up in live mode,
          so it is a commercial surface and the mandatory supplement statements
          have to be reachable here too, not only on /faq. See
          components/shop/statutory-statements.tsx. */}
      <section className="section section--cream">
        <StatutoryStatements
          servingGrams={SERVING_GRAMS}
          maxServings={MAX_DAILY_SERVINGS}
          declaration={NUTRITION_ROWS}
          allergens="Contains milk (whey)."
        />
      </section>

      <footer data-floating-cta-suppress>
        <Wordmark footer onDark />
        <span>© 2026 Heldi · Blended and packed in the UK · They shake, we stir</span>
        <FooterLegal />
      </footer>
    </main>
  );
}
