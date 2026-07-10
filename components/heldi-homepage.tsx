"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

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

const DISHES = [
  { name: "Dal tadka", grams: 9 },
  { name: "Chana masala", grams: 8 },
  { name: "Cucumber raita", grams: 3 },
  { name: "Bowl of dahi", grams: 5 },
  { name: "Aloo chaat", grams: 4 }
];

const FAQS = [
  {
    question: "Is whey protein vegetarian?",
    answer:
      "Yes. Whey is the pale liquid left when milk curdles — the same one you see when paneer is made at home. We simply filter it to concentrate the protein and gently dry it into a fine powder. Nothing added, just the part of milk that has always been there."
  },
  {
    question: "Will my food taste different?",
    answer:
      "No. The blend is tuned with spices that already belong in the dish — coriander, cumin, turmeric — so the protein does not sit on top of the flavour. It disappears into it. No chalky film, no protein-shake aftertaste."
  },
  {
    question: "Do I cook with it or add it after?",
    answer:
      "Add it after cooking. Mix a spoonful with a splash of water into a quick paste and stir it into the bowl — or put the pouch on the table and let each person add their own."
  },
  {
    question: "Can I use it in dishes that are not on the pouch?",
    answer:
      "Yes. Anything with a gravy, a dal or a yoghurt base works — sambar, kadhi, korma, bhindi in gravy, even a chaat with dahi on top. If a spoon can stir it, Heldi can disappear into it."
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
      "Stir into two or three dishes and add 20–30g across one meal",
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
      You&apos;re on the list — one email the day we launch.
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

function useAnimatedNumber(target: number) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    previous.current = target;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(frame);
    }

    const startedAt = performance.now();
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / 550);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return Math.round(display);
}

export function HeldiHomepage({
  grams = 10,
  heroAnimation = "split-flap",
  flapDwellMs = 2200,
  ticker = true
}: HeldiHomepageProps) {
  const [dishOn, setDishOn] = useState(() => DISHES.map(() => false));
  const [faqOpen, setFaqOpen] = useState(-1);
  const [joined, setJoined] = useState(false);
  const [jar, setJar] = useState<"gold" | "silver">("gold");

  const total = useMemo(
    () =>
      DISHES.reduce(
        (sum, dish, index) => sum + dish.grams + (dishOn[index] ? grams : 0),
        0
      ),
    [dishOn, grams]
  );
  const displayTotal = useAnimatedNumber(total);
  const heldiCount = dishOn.filter(Boolean).length;

  function toggleDish(index: number) {
    setDishOn((current) =>
      current.map((value, dishIndex) => (dishIndex === index ? !value : value))
    );
  }

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a href="#top" aria-label="Heldi home">
          <Wordmark onDark />
        </a>
        <div className="nav-links">
          <a href="#pouch">The pouch</a>
          <a href="#thali">Tonight&apos;s table</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a className="button button--pill" href="#join">
            Join waitlist
          </a>
        </div>
      </nav>

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
              /hel-dee/ — <em>adj.</em> how my nani says “healthy.”
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
              the dishes your family already eats — same recipes, same taste, more
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
              alt="Heldi pouch — same recipes, same taste, more protein"
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
              clean — no chalky film, no protein-shake aftertaste, no new habits.
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
        <div className="split-layout split-layout--top">
          <div className="thali-list">
            <p className="eyebrow eyebrow--gold">PUT IT ON TONIGHT&apos;S TABLE</p>
            <h2>One pouch. Every dish with a gravy, a dal or a dahi.</h2>
            <p className="muted">
              Tap a dish to stir Heldi in and watch the table add up. No one at
              dinner notices a thing.
            </p>
            <div className="dish-rows">
              {DISHES.map((dish, index) => {
                const active = dishOn[index];
                return (
                  <div className="dish-row" key={dish.name}>
                    <div className="dish-name">
                      <h3>{dish.name}</h3>
                      <span>{dish.grams}g protein on its own</span>
                    </div>
                    <strong className={active ? "active" : ""}>
                      {dish.grams + (active ? grams : 0)}g
                    </strong>
                    <button
                      className={`toggle${active ? " is-active" : ""}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleDish(index)}
                    >
                      {active ? `Heldi in · +${grams}g` : "+ Stir in Heldi"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="total-card" aria-live="polite">
            <span>ON THE TABLE TONIGHT</span>
            <strong>{displayTotal}g</strong>
            <span>OF PROTEIN</span>
            <em>
              {heldiCount
                ? `+${heldiCount * grams}g from Heldi`
                : "Tap a dish to stir Heldi in"}
            </em>
          </aside>
        </div>
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
              <p>A spoonful, a splash of water, a quick stir into the bowl — or let everyone add their own at the table.</p>
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
              shelf — a proper home on the counter, not a plastic tub in the
              cupboard. Pick your lid at checkout.
            </p>
          </div>
          <div className="jar-card">
            <p>PICK YOUR LID</p>
            <div className="jar-options" role="radiogroup" aria-label="Jar lid colour">
              {(["gold", "silver"] as const).map((colour) => (
                <button
                  className={jar === colour ? "is-active" : ""}
                  type="button"
                  role="radio"
                  aria-checked={jar === colour}
                  onClick={() => setJar(colour)}
                  key={colour}
                >
                  <span className={`lid-swatch lid-swatch--${colour}`} />
                  {colour[0].toUpperCase() + colour.slice(1)}
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
          <p>One email the day we launch — and a free jar with your first order.</p>
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
