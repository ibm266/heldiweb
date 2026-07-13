"use client";

import Image from "next/image";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState
} from "react";
import { AudienceGallery } from "@/components/audience-gallery";
import { CartIcon } from "@/components/cart/cart-icon";
import { CopyHighlight } from "@/components/copy-highlight";
import { HOME_FAQS } from "@/components/home-faqs";
import { MenuGallery } from "@/components/menu-gallery";
import { StirGallery } from "@/components/stir-gallery";
import { useNavScrollState } from "@/components/use-nav-scroll-hide";

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

const WORDS = ["INDIAN FOOD", "DAL", "CURRY", "RAITA", "DAHI", "CHAAT"];
const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLS = 11;

const FAQS = HOME_FAQS;

const TICKER_COPY =
  "THEY SHAKE, WE STIR  •  MADE IN THE UK  •  FOR INDIAN KITCHENS  •  100% VEGETARIAN  •  FREE JAR WITH YOUR FIRST ORDER  •  SAME RECIPES, SAME TASTE  •  LAUNCHING AUTUMN 2026  •  ";

const POUCH_BADGE_ICONS = {
  highProtein: "/images/pouch-badges/high-protein.png",
  allNatural: "/images/pouch-badges/all-natural.png",
  lactoseFree: "/images/pouch-badges/lactose-free.png",
  noSugar: "/images/pouch-badges/no-sugar.png",
  glutenFree: "/images/pouch-badges/gluten-free.png",
  vegetarian: "/images/pouch-badges/vegetarian.png"
} as const;

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
    label: "All natural",
    width: 256,
    height: 256
  },
  {
    icon: POUCH_BADGE_ICONS.lactoseFree,
    label: "99% lactose-free",
    width: 280,
    height: 377
  },
  {
    icon: POUCH_BADGE_ICONS.noSugar,
    label: "No added sugar",
    width: 386,
    height: 390
  },
  {
    icon: POUCH_BADGE_ICONS.glutenFree,
    label: "Gluten free",
    width: 328,
    height: 225
  },
  {
    icon: POUCH_BADGE_ICONS.vegetarian,
    label: "Vegetarian",
    width: 286,
    height: 367
  }
];

const HOW_IT_WORKS_STEPS: {
  icon: string;
  title: string;
  description: ReactNode | ((grams: number) => ReactNode);
}[] = [
  {
    icon: "/images/how-it-works/step-1-cook.png",
    title: "Cook like always",
    description: (
      <>
        Your dal, curry or raita, <CopyHighlight>same as ever</CopyHighlight>.
      </>
    )
  },
  {
    icon: "/images/how-it-works/step-2-stir.png",
    title: "Stir in a spoonful",
    description: (
      <>
        Stir straight into the pot <CopyHighlight>whilst it&apos;s cooling</CopyHighlight>
        , or at the table.
      </>
    )
  },
  {
    icon: "/images/how-it-works/step-3-eat.png",
    title: "Eat what you love",
    description: (
      <>
        The meal you grew up with, with a{" "}
        <CopyHighlight>protein</CopyHighlight> boost.
      </>
    )
  }
];

const IMAGE_VERSION = "ink-blue-8";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
}

function HeroShowcasePills() {
  return (
    <ul className="hero-reveal-showcase__pills" aria-label="Product attributes">
      {HERO_SHOWCASE_PILLS.map((pill) => (
        <li key={pill.label} className="hero-reveal-showcase__pill">
          <Image
            className="hero-reveal-showcase__pill-icon"
            src={pill.icon}
            alt=""
            width={pill.width}
            height={pill.height}
            aria-hidden="true"
          />
          {pill.label}
        </li>
      ))}
    </ul>
  );
}

function HeroRevealActions({
  joined,
  onJoin,
  id,
  className
}: {
  joined: boolean;
  onJoin: () => void;
  id: string;
  className: string;
}) {
  return (
    <div className={className}>
      <WaitlistForm
        joined={joined}
        onJoin={onJoin}
        id={id}
        buttonStyle="pill"
      />
      <a className="button button--pill button--outline" href="#how">
        How it works
      </a>
    </div>
  );
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

function PouchStats({ grams, className }: { grams: number; className: string }) {
  return (
    <div className={className}>
      <div className="pouch-stat pouch-stat--gold">
        <strong>{grams}g</strong>
        <span>protein per bowl</span>
      </div>
      <div className="pouch-stat pouch-stat--white">
        <strong>All natural</strong>
        <span>ingredients</span>
      </div>
    </div>
  );
}

function PouchBadgesList({ className }: { className: string }) {
  return (
    <ul className={className} aria-label="Product attributes">
      <li className="pouch-badge">
        <Image
          className="pouch-badge__icon"
          src={POUCH_BADGE_ICONS.lactoseFree}
          alt=""
          width={280}
          height={377}
          aria-hidden="true"
        />
        99% lactose-free
      </li>
      <li className="pouch-badge">
        <Image
          className="pouch-badge__icon"
          src={POUCH_BADGE_ICONS.noSugar}
          alt=""
          width={386}
          height={390}
          aria-hidden="true"
        />
        No added sugar
      </li>
      <li className="pouch-badge">
        <Image
          className="pouch-badge__icon"
          src={POUCH_BADGE_ICONS.glutenFree}
          alt=""
          width={328}
          height={225}
          aria-hidden="true"
        />
        Gluten free
      </li>
      <li className="pouch-badge">
        <Image
          className="pouch-badge__icon"
          src={POUCH_BADGE_ICONS.vegetarian}
          alt=""
          width={286}
          height={367}
          aria-hidden="true"
        />
        Vegetarian
      </li>
    </ul>
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
      src={imageSrc("/images/heldi-wordmark.png")}
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

function WaitlistForm({
  joined,
  onJoin,
  id,
  buttonStyle = "square"
}: {
  joined: boolean;
  onJoin: () => void;
  id: string;
  buttonStyle?: "square" | "pill";
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onJoin();
  }

  const buttonClassName =
    buttonStyle === "pill" ? "button button--pill" : "button button--square";

  if (joined) {
    return (
      <p className="waitlist-success" role="status">
        You&apos;re on the list. Tell your mum we said hi.
      </p>
    );
  }

  return (
    <form
      className={`waitlist-form${expanded ? " waitlist-form--expanded" : ""}`}
      onSubmit={submit}
    >
      {expanded ? (
        <>
          <label className="sr-only" htmlFor={id}>
            Email address
          </label>
          <input
            ref={inputRef}
            id={id}
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
          <button className={buttonClassName} type="submit">
            Join waitlist
          </button>
        </>
      ) : (
        <button
          className={buttonClassName}
          type="button"
          onClick={() => setExpanded(true)}
        >
          Join waitlist
        </button>
      )}
    </form>
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
  joined,
  onJoin,
  onIntroComplete
}: {
  joined: boolean;
  onJoin: () => void;
  onIntroComplete?: () => void;
}) {
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

    if (motionQuery.matches) {
      setRevealed(true);
      setCurtainDismissed(true);
      setCanCallElephants(true);
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
      return () => window.clearTimeout(fallbackTimer);
    }

    const safetyTimer = window.setTimeout(finishReveal, ELEPHANT_RUN_MS + 500);

    return () => {
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
        <div className="hero-reveal-columns">
          <div className="hero-reveal-showcase">
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
                  src={imageSrc("/images/elephant-large-transparent.png")}
                  alt=""
                  width={2048}
                  height={2048}
                />
              </button>
            ) : null}
            <div className="hero-reveal-showcase__main">
              <div className="hero-reveal-showcase__copy">
                <h1 className="hero-reveal-lede">
                  <span className="hero-reveal-lede__prefix">
                    <span className="hero-reveal-lede__prefix-line">Protein </span>
                    <span className="hero-reveal-lede__prefix-line">Powder </span>
                    <span className="hero-reveal-lede__prefix-line">for</span>
                  </span>
                  <span className="word-board">
                    <DissolveBoard active={revealed} />
                  </span>
                </h1>
                <HeroRevealActions
                  joined={joined}
                  onJoin={onJoin}
                  id="hero-reveal-email"
                  className="hero-reveal-actions hero-reveal-actions--in-showcase"
                />
              </div>
              <div className="hero-reveal-pouch">
                <Image
                  className="hero-reveal-pouch__image"
                  src={imageSrc("/images/pouch.png")}
                  alt="Heldi pouch, same recipes, same taste, more protein"
                  width={1360}
                  height={2048}
                  priority
                  sizes="(max-width: 899px) 52vw, (max-width: 1280px) 320px, 420px"
                />
              </div>
            </div>
            <div className="hero-reveal-showcase__foot">
              <p className="pronunciation pronunciation--showcase">
                /hel-dee/ <em>adj.</em> how my nani says “healthy.”
              </p>
              <div className="hero-reveal-showcase__rule" aria-hidden="true" />
              <HeroShowcasePills />
            </div>
          </div>
          <HeroRevealActions
            joined={joined}
            onJoin={onJoin}
            id="hero-reveal-email-mobile"
            className="hero-reveal-actions hero-reveal-actions--below"
          />
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
  const [joined, setJoined] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [floatingCtaSuppressed, setFloatingCtaSuppressed] = useState(true);
  const [heroIntroComplete, setHeroIntroComplete] = useState(
    heroLayout !== "reveal"
  );
  const { hidden: scrollHidden } = useNavScrollState();
  const navHidden = scrollHidden && !menuOpen;
  const heroSectionRef = useRef<HTMLElement>(null);
  const footerWaitlistRef = useRef<HTMLDivElement>(null);
  const menuSectionRef = useRef<HTMLElement>(null);
  const truthSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");

    function syncMobileNav() {
      setIsMobileNav(media.matches);
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

  useEffect(() => {
    if (!isMobileNav) {
      setFloatingCtaSuppressed(true);
      return;
    }

    const anchors = [
      heroSectionRef.current,
      footerWaitlistRef.current,
      menuSectionRef.current,
      truthSectionRef.current
    ].filter((element): element is HTMLDivElement | HTMLElement => element !== null);
    if (!anchors.length) return;

    const visibility = new Map<Element, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target, entry.isIntersecting);
        });
        setFloatingCtaSuppressed([...visibility.values()].some(Boolean));
      },
      { threshold: 0.15 }
    );

    anchors.forEach((anchor) => observer.observe(anchor));

    return () => observer.disconnect();
  }, [isMobileNav, joined]);

  const showFloatingCta =
    isMobileNav && !floatingCtaSuppressed && heroIntroComplete;

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
                src={imageSrc("/images/elephant-large-transparent.png")}
                alt=""
                width={2048}
                height={2048}
                priority
              />
              <Wordmark />
              <Image
                className="nav-elephant-logo"
                src={imageSrc("/images/elephant-large-transparent.png")}
                alt=""
                width={2048}
                height={2048}
                priority
              />
            </span>
          </a>
          <div className="nav-links nav-links--desktop">
            <a href="#how">How it works</a>
            <a href="/truth">The truth</a>
            <a href="/our-story">Our story</a>
            <a href="/heldi-living">Heldi Living</a>
            <a href="/shop">Shop</a>
          </div>
          <div
            className={`nav-links nav-links--mobile${
              menuOpen ? " is-open" : ""
            }`}
            id="nav-menu"
          >
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="/truth" onClick={() => setMenuOpen(false)}>The truth</a>
            <a href="/our-story" onClick={() => setMenuOpen(false)}>Our story</a>
            <a href="/heldi-living" onClick={() => setMenuOpen(false)}>Heldi Living</a>
            <a href="/shop" onClick={() => setMenuOpen(false)}>Shop</a>
          </div>
        </nav>
        <div className="nav-cart">
          <CartIcon />
        </div>
      </div>

      {showFloatingCta ? (
        <a className="floating-cta" href="#join">
          Join waitlist
        </a>
      ) : null}

      <section
        ref={heroSectionRef}
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
          <HeroReveal
            joined={joined}
            onJoin={() => setJoined(true)}
            onIntroComplete={() => setHeroIntroComplete(true)}
          />
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
              <a className="button button--pill" href="#join">
                Join waitlist
              </a>
              <a className="button button--pill button--outline" href="#how">
                How it works
              </a>
            </div>
          </div>
        ) : (
          <div className="hero-inner">
            <Image
              className="hero-elephant hero-elephant--left"
              src={imageSrc("/images/elephant-large-transparent.png")}
              alt="Decorated Indian elephant illustration"
              width={2048}
              height={2048}
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
            </div>
            <Image
              className="hero-elephant"
              src={imageSrc("/images/elephant-large-transparent.png")}
              alt="Decorated Indian elephant illustration"
              width={2048}
              height={2048}
              priority
            />
          </div>
        )}
        {ticker ? (
          <div className="ticker" aria-label={TICKER_COPY}>
            <div className="ticker-track" aria-hidden="true">
              <span>{TICKER_COPY}</span>
              <span>{TICKER_COPY}</span>
            </div>
          </div>
        ) : null}
        <div className="double-rule" aria-hidden="true" />
      </section>

      <section className="section section--cream" id="pouch">
        <div className="pouch-section">
          <div className="pouch-section__copy">
            <h2>Food you love. Nutrients you need.</h2>
            <p>
              <CopyHighlight>Vanishes clean</CopyHighlight> into every gravy,
              dal and yoghurt base. No chalk, no aftertaste.
            </p>
          </div>
          <PouchStats grams={grams} className="pouch-section__stats" />
          <PouchBadgesList className="pouch-section__badges" />
        </div>
      </section>

      <section
        className="section section--ink section--bordered"
        id="stir"
      >
        <StirGallery boostGrams={grams} />
      </section>

      <section className="section section--cream" id="how">
        <div className="how-it-works">
          <header className="how-it-works__header">
            <p className="eyebrow">HOW IT WORKS</p>
            <div className="how-it-works__header-mobile">
              <h2>
                No shaking.
                <br />
                No blending.
                <br />
                More protein.
              </h2>
            </div>
            <div className="how-it-works__header-laptop">
              <h2>Food you love. Nutrients you need.</h2>
              <p>
                <CopyHighlight>Vanishes clean</CopyHighlight> into every
                gravy, dal and yoghurt base. No chalk, no aftertaste.
              </p>
            </div>
          </header>
          <ol className="how-it-works__steps">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <li key={step.title} className="how-it-works__step">
                <div className="how-it-works__icon" aria-hidden="true">
                  <Image
                    src={imageSrc(step.icon)}
                    alt=""
                    width={256}
                    height={256}
                  />
                </div>
                <div className="how-it-works__copy">
                  <h3>{step.title}</h3>
                  <p>
                    {typeof step.description === "function"
                      ? step.description(grams)
                      : step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="section section--gold section--bordered"
        id="truth"
        ref={truthSectionRef}
      >
        <div className="truth-block">
          <p className="eyebrow">THE HONEST TRUTH</p>
          <h2>The internet says 18g. Your dal says 6.</h2>
          <p>
            Protein contributes to the maintenance of muscle mass, and that
            matters more every year past 30. Yet most protein numbers online
            are measured dry, not in the bowl you actually eat. Here is the{" "}
            <CopyHighlight>honest fix</CopyHighlight>.
          </p>
          <PouchEquation />
          <p className="pouch-section__ingredient">
            90% whey protein isolate. The rest, spices you already know.
          </p>
          <a className="pill-link" href="/truth">
            Read the full truth &#8594;
          </a>
        </div>
      </section>

      <section className="section section--ink" id="thali" ref={menuSectionRef}>
        <MenuGallery gramsPerTbsp={grams} />
      </section>

      <section className="section section--gold section--bordered" id="audience">
        <div className="content">
          <h2 className="centered">Built for you. Made for the whole family.</h2>
          <AudienceGallery />
        </div>
      </section>

      <section className="section section--ink section--bordered founder-band">
        <div className="founder-band__inner">
          <p className="founder-band__quote">
            I made Heldi for my parents. They were never going to drink a
            shake, and they were never going to give up dal. So the protein
            came to the table instead.
          </p>
          <p className="founder-band__signature">&mdash; Mihir, founder</p>
          <a className="pill-link pill-link--dark" href="/our-story">
            Read our story &#8594;
          </a>
        </div>
      </section>

      <section className="section section--cream section--bordered" id="faq">
        <div className="faq">
          <h2 className="centered">The questions we hear most.</h2>
          <div className="faq-list">
            {FAQS.map((faq, index) => {
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
        </div>
      </section>

      <section className="section section--ink" id="jar">
        <div className="jar-layout">
          <div className="section-copy section-copy--dark">
            <p className="eyebrow eyebrow--gold">WITH YOUR FIRST ORDER</p>
            <h2>A jar for the table. On us.</h2>
            <p>
              Every first order ships with a refillable Heldi jar that sits on
              the <CopyHighlight>dinner table</CopyHighlight>, where it belongs.
              Not the cupboard. Right there{" "}
              <CopyHighlight>beside the dal</CopyHighlight>, where everyone can
              reach for it. Silver or gold? That is a choice every mama likes
              to make. Gold when the table is set for guests. Silver for the
              meal the whole family eats every night.
            </p>
          </div>
          <div className="jar-card">
            <div className="jar-preview-card">
              <Image
                className="jar-preview-image"
                src={imageSrc("/images/jar-pouch.png")}
                alt="Heldi pouch with silver and gold table jars"
                width={768}
                height={768}
                sizes="(max-width: 560px) calc(100vw - 3rem), (max-width: 899px) min(92vw, 380px), 320px"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta section--bordered" id="join">
        <Image className="cta-elephant cta-elephant--left" src={imageSrc("/images/elephant-small.png")} alt="" width={270} height={280} />
        <div className="final-cta-copy">
          <h2>Be first to stir it in.</h2>
          <p>
            One email the day we launch, and a{" "}
            <CopyHighlight>free jar</CopyHighlight> for the family table.
          </p>
          <div ref={footerWaitlistRef}>
            <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="footer-email" />
          </div>
        </div>
        <Image className="cta-elephant cta-elephant--right" src={imageSrc("/images/elephant-small.png")} alt="" width={270} height={280} />
      </section>

      <footer>
        <Wordmark footer onDark />
        <span>© 2026 Heldi · Made in the UK · They shake, we stir</span>
      </footer>
    </main>
  );
}
