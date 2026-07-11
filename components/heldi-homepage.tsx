"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { AudienceGallery } from "@/components/audience-gallery";
import { MenuGallery } from "@/components/menu-gallery";

type HeroAnimation = "split-flap" | "dissolve";
type HeroLayout = "video" | "classic";

type HeldiHomepageProps = {
  grams?: number;
  heroAnimation?: HeroAnimation;
  heroLayout?: HeroLayout;
  flapDwellMs?: number;
  ticker?: boolean;
};

const HERO_VIDEO_SRC = "/videos/heldi-hero-v3.mp4";
const HERO_VIDEO_POSTER = "/images/hero-video-poster.png";

const WORDS = ["INDIAN FOOD", "DAL", "CURRY", "RAITA", "DAHI", "CHAAT"];
const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLS = 11;

const FAQS = [
  {
    question: "Is whey protein vegetarian?",
    answer:
      "Yes. Whey is the pale liquid left when milk curdles, the same one you see when paneer is made at home. We simply filter it to concentrate the protein and gently dry it into a fine powder. Nothing added, just the part of milk that has always been there."
  },
  {
    question: "Will my food taste different?",
    answer:
      "No. The spices are designed to disappear into the dish, not sit on top of the flavour. Heldi blends clean into what you already cook. No chalky film, no protein-shake aftertaste."
  },
  {
    question: "How do I use it?",
    answer:
      "Once the pot is done cooking and has cooled a little, stir the powder straight into the full dal, curry or raita and mix it through. If you are adding to a whole pot, a splash of water can help loosen it. Or leave the jar on the table and let each person add as much as they like to their own bowl."
  },
  {
    question: "Can I use it in dishes that are not on the pouch?",
    answer:
      "Yes. Anything with a gravy, a dal or a yoghurt base works, sambar, kadhi, korma, bhindi in gravy, even a chaat with dahi on top. If a spoon can stir it, Heldi can disappear into it."
  },
  {
    question: "Is it safe for parents and grandparents?",
    answer:
      "Heldi is designed for the whole table. Protein contributes to the maintenance of muscle mass, and the isolate is 99% lactose-free, 100% vegetarian and free from added sugar, preservatives and gluten."
  }
];

const TICKER_COPY =
  "MADE IN THE UK  •  FOR INDIAN KITCHENS  •  NO SHAKER, NO BLENDER  •  100% VEGETARIAN  •  FREE JAR WITH YOUR FIRST ORDER  •  SAME RECIPES, SAME TASTE  •  LAUNCHING AUTUMN 2026  •  ";

const IMAGE_VERSION = "ink-blue-2";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
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

function DissolveBoard() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setWordIndex((index) => (index + 1) % WORDS.length),
      2600
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="dissolve-board" aria-live="polite">
      {WORDS[wordIndex].split("").map((letter, index) => (
        <span
          key={`${wordIndex}-${index}`}
          style={{ animationDelay: `${index * 55}ms` }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function WaitlistForm({
  joined,
  onJoin,
  id
}: {
  joined: boolean;
  onJoin: () => void;
  id: string;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onJoin();
  }

  return joined ? (
    <p className="waitlist-success" role="status">
      You&apos;re on the list. One email the day we launch.
    </p>
  ) : (
    <form className="waitlist-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <input id={id} name="email" type="email" placeholder="you@example.com" required />
      <button className="button button--square" type="submit">
        Join waitlist
      </button>
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
        /* autoplay blocked — poster remains visible */
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
  const [floatingCtaSuppressed, setFloatingCtaSuppressed] = useState(false);
  const heroWaitlistRef = useRef<HTMLDivElement>(null);
  const footerWaitlistRef = useRef<HTMLDivElement>(null);
  const menuSectionRef = useRef<HTMLElement>(null);

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

    const includeHeroWaitlist = heroLayout === "classic";
    const anchors = [
      includeHeroWaitlist ? heroWaitlistRef.current : null,
      footerWaitlistRef.current,
      menuSectionRef.current
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

  const showFloatingCta = isMobileNav && !floatingCtaSuppressed;

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a href="#top" aria-label="Heldi home" className="nav-home">
          <Wordmark onDark />
          <span className="nav-elephant-badge">
            <Image
              className="nav-elephant-logo"
              src={imageSrc("/images/elephant-large-transparent.png")}
              alt="Heldi"
              width={2048}
              height={2048}
              priority
            />
          </span>
        </a>
        {isMobileNav ? (
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
        ) : null}
        <div
          className={`nav-links${isMobileNav && menuOpen ? " is-open" : ""}`}
          id="nav-menu"
        >
          <a href="#pouch" onClick={() => setMenuOpen(false)}>The pouch</a>
          <a href="#thali" onClick={() => setMenuOpen(false)}>Tonight&apos;s table</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          {!isMobileNav ? (
            <a
              className="button button--pill nav-cta"
              href="#join"
            >
              Join waitlist
            </a>
          ) : null}
        </div>
      </nav>

      {showFloatingCta ? (
        <a className="floating-cta" href="#join">
          Join waitlist
        </a>
      ) : null}

      <section
        className={`hero${heroLayout === "video" ? " hero--video" : ""}`}
        id="top"
      >
        {heroLayout === "video" ? (
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
            <div ref={heroWaitlistRef} className="hero-video-actions">
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
              <div ref={heroWaitlistRef}>
                <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="hero-email" />
              </div>
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
        <div className="split-layout split-layout--center">
          <div className="pouch-card">
            <Image
              className="pouch-image"
              src={imageSrc("/images/pouch.png")}
              alt="Heldi pouch, same recipes, same taste, more protein"
              width={1360}
              height={2048}
              sizes="(max-width: 700px) 80vw, 440px"
            />
          </div>
          <div className="section-copy">
            <p className="eyebrow">THE POUCH</p>
            <h2>The food you love with the nutrients you need.</h2>
            <p>
              One blend, tuned to vanish into anything with a gravy, a dal or a
              yoghurt base. A 90%+ whey isolate from British dairy that dissolves
              clean. No chalky film, no protein-shake aftertaste, no new habits.
            </p>
            <div className="stats">
              <div><strong>{grams}g</strong><span>protein per bowl</span></div>
              <div><strong>90%+</strong><span>whey protein isolate</span></div>
              <div><strong>99%</strong><span>lactose-free</span></div>
              <div><b>No added sugar</b></div>
              <div><b>Gluten free</b></div>
              <div><b>100% vegetarian</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--ink" id="thali" ref={menuSectionRef}>
        <MenuGallery gramsPerTbsp={grams} />
      </section>

      <section className="section section--cream" id="how">
        <div className="content">
          <h2 className="centered">No shaking. No blending. Just stir in.</h2>
          <div className="steps">
            <article>
              <strong>1</strong><h3>Cook like always</h3>
              <p>Make your dal, curry or raita exactly the way you always have.</p>
            </article>
            <article>
              <strong>2</strong><h3>Stir in a spoonful</h3>
              <p>A spoonful stirred straight into the bowl. Loosen if needed, or let everyone add their own at the table.</p>
            </article>
            <article>
              <strong>3</strong><h3>Eat what you love</h3>
              <p>The same meal you grew up with, now with {grams}g more protein per bowl.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--gold section--bordered">
        <div className="content">
          <h2 className="centered">Built for you. Made for the whole family.</h2>
          <AudienceGallery />
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
                  {open ? <p id={`faq-answer-${index}`}>{faq.answer}</p> : null}
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
              the dinner table, where it belongs. Not the cupboard. Right there
              beside the dal, where everyone can reach for it.
            </p>
          </div>
          <div className="jar-card">
            <div className="jar-preview-card">
              <Image
                className="jar-preview-image"
                src={imageSrc("/images/jars-both.png")}
                alt="Heldi pouch with silver and gold table jars"
                width={1024}
                height={1024}
                sizes="(max-width: 560px) calc(100vw - 4rem), (max-width: 899px) min(90vw, 420px), 420px"
              />
            </div>
          </div>
          <div className="section-copy section-copy--dark">
            <p>
              Silver or gold? That is a choice every mama likes to make. Gold
              when the table is set for guests. Silver for the meal the whole
              family eats every night. We ship both finishes with your first
              pouch. You pick the one that stays.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta section--bordered" id="join">
        <Image className="cta-elephant cta-elephant--left" src={imageSrc("/images/elephant-small.png")} alt="" width={270} height={280} />
        <div className="final-cta-copy">
          <h2>Be first to stir it in.</h2>
          <p>One email the day we launch, and a free jar with your first order.</p>
          <div ref={footerWaitlistRef}>
            <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="footer-email" />
          </div>
        </div>
        <Image className="cta-elephant cta-elephant--right" src={imageSrc("/images/elephant-small.png")} alt="" width={270} height={280} />
      </section>

      <footer>
        <Wordmark footer onDark />
        <span>© 2026 Heldi · Made in the UK · Desi protein for Indian food</span>
      </footer>
    </main>
  );
}
