"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useState
} from "react";
import { MenuGallery } from "@/components/menu-gallery";

type HeroAnimation = "split-flap" | "dissolve";

type HeldiHomepageProps = {
  grams?: number;
  heroAnimation?: HeroAnimation;
  flapDwellMs?: number;
  ticker?: boolean;
};

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
      "No. The blend is tuned with spices that already belong in the dish, coriander, cumin, turmeric, so the protein does not sit on top of the flavour. It disappears into it. No chalky film, no protein-shake aftertaste."
  },
  {
    question: "Do I cook with it or add it after?",
    answer:
      "Add it after cooking. Mix a spoonful with a splash of water into a quick paste and stir it into the bowl, or put the pouch on the table and let each person add their own."
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

const AUDIENCES = [
  {
    label: "FOR YOU",
    title: "Hit your protein target without another shake.",
    points: [
      "Stir into two or three dishes and add 20-30g across one meal",
      "Whey isolate absorbs fast and blends clean",
      "Zero change to the food you love"
    ]
  },
  {
    label: "FOR THE FAMILY",
    title: "One pouch, the whole table.",
    points: [
      "Disappears into the dal, the curry, the raita everyone already eats",
      "Works for fussy eaters and big appetites alike",
      "No separate “healthy” cooking required"
    ]
  },
  {
    label: "FOR PARENTS & GRANDPARENTS",
    title: "Built for the way they already cook.",
    points: [
      "Protein contributes to the maintenance of muscle mass",
      "99% lactose-free isolate",
      "Not a single recipe changes"
    ]
  }
];

const JARS = [
  {
    id: "gold" as const,
    label: "Gold",
    image: "/images/jar-gold.png",
    width: 777,
    height: 620
  },
  {
    id: "silver" as const,
    label: "Silver",
    image: "/images/jar-silver.png",
    width: 850,
    height: 629
  }
];

const TICKER_COPY =
  "MADE IN THE UK  •  FOR INDIAN KITCHENS  •  NO SHAKER, NO BLENDER  •  100% VEGETARIAN  •  FREE JAR WITH YOUR FIRST ORDER  •  SAME RECIPES, SAME TASTE  •  LAUNCHING AUTUMN 2026  •  ";

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
      src="/images/heldi-wordmark.png"
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

export function HeldiHomepage({
  grams = 10,
  heroAnimation = "split-flap",
  flapDwellMs = 2200,
  ticker = true
}: HeldiHomepageProps) {
  const [faqOpen, setFaqOpen] = useState(-1);
  const [joined, setJoined] = useState(false);
  const [jar, setJar] = useState<"gold" | "silver">("gold");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  const selectedJar = JARS.find((option) => option.id === jar) ?? JARS[0];

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

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a href="#top" aria-label="Heldi home" className="nav-home">
          <Wordmark onDark />
          <span className="nav-elephant-badge">
            <Image
              className="nav-elephant-logo"
              src="/images/elephant-large-transparent.png"
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

      {isMobileNav ? (
        <a className="floating-cta" href="#join">
          Join waitlist
        </a>
      ) : null}

      <section className="hero" id="top">
        <div className="hero-inner">
          <Image
            className="hero-elephant hero-elephant--left"
            src="/images/elephant-large-transparent.png"
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
              raita and every other home-cooked favourite. One pouch, stirred into
              the dishes your family already eats. Same recipes, same taste, more
              protein.
            </p>
            <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="hero-email" />
          </div>
          <Image
            className="hero-elephant"
            src="/images/elephant-large-transparent.png"
            alt="Decorated Indian elephant illustration"
            width={2048}
            height={2048}
            priority
          />
        </div>
        <div className="double-rule" aria-hidden="true" />
      </section>

      {ticker ? (
        <div className="ticker" aria-label={TICKER_COPY}>
          <div className="ticker-track" aria-hidden="true">
            <span>{TICKER_COPY}</span>
            <span>{TICKER_COPY}</span>
          </div>
        </div>
      ) : null}

      <section className="section section--cream" id="pouch">
        <div className="split-layout split-layout--center">
          <div className="pouch-card">
            <Image
              className="pouch-image"
              src="/images/pouch.png"
              alt="Heldi pouch, same recipes, same taste, more protein"
              width={1360}
              height={2048}
              sizes="(max-width: 700px) 80vw, 440px"
            />
          </div>
          <div className="section-copy">
            <p className="eyebrow">THE POUCH</p>
            <h2>Same recipes. Same taste. More protein.</h2>
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

      <section className="section section--ink" id="thali">
        <MenuGallery gramsPerTbsp={grams} />
      </section>

      <section className="section section--cream" id="how">
        <div className="content">
          <h2 className="centered">No shaking. No blending. Ten seconds a bowl.</h2>
          <div className="steps">
            <article>
              <strong>1</strong><h3>Cook like always</h3>
              <p>Make your dal, curry or raita exactly the way you always have.</p>
            </article>
            <article>
              <strong>2</strong><h3>Stir in a spoonful</h3>
              <p>A spoonful, a splash of water, a quick stir into the bowl, or let everyone add their own at the table.</p>
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
          <div className="audience-grid">
            {AUDIENCES.map((audience) => (
              <article className="sticker-card" key={audience.label}>
                <p className="eyebrow">{audience.label}</p>
                <h3>{audience.title}</h3>
                <ul>
                  {audience.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
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
        <div className="split-layout split-layout--center split-layout--between">
          <div className="section-copy section-copy--dark">
            <p className="eyebrow eyebrow--gold">WITH YOUR FIRST ORDER</p>
            <h2>A jar for the masala dabba. On us.</h2>
            <p>
              Every first order ships with a refillable Heldi jar for the spice
              shelf, a proper home on the counter, not a plastic tub in the
              cupboard. Pick your jar at checkout.
            </p>
          </div>
          <div className="jar-card">
            <p>PICK YOUR JAR</p>
            <div className="jar-preview-card">
              <Image
                src={selectedJar.image}
                alt={`Heldi pouch with ${selectedJar.label.toLowerCase()} jar`}
                width={selectedJar.width}
                height={selectedJar.height}
                sizes="(max-width: 700px) 90vw, 420px"
              />
            </div>
            <div className="jar-options" role="radiogroup" aria-label="Jar colour">
              {JARS.map((option) => (
                <button
                  className={`jar-option jar-option--${option.id}${jar === option.id ? " is-active" : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={jar === option.id}
                  onClick={() => setJar(option.id)}
                  key={option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <em>{jar === "gold" ? "Gold it is." : "Silver it is."}</em>
          </div>
        </div>
      </section>

      <section className="final-cta section--bordered" id="join">
        <Image className="cta-elephant cta-elephant--left" src="/images/elephant-small.png" alt="" width={270} height={280} />
        <div className="final-cta-copy">
          <h2>Be first to stir it in.</h2>
          <p>One email the day we launch, and a free jar with your first order.</p>
          <WaitlistForm joined={joined} onJoin={() => setJoined(true)} id="footer-email" />
        </div>
        <Image className="cta-elephant cta-elephant--right" src="/images/elephant-small.png" alt="" width={270} height={280} />
      </section>

      <footer>
        <Wordmark footer onDark />
        <span>© 2026 Heldi · Made in the UK · Desi protein for Indian food</span>
      </footer>
    </main>
  );
}
