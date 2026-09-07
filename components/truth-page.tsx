"use client";

import { useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { TRUTH_FAQS } from "@/components/truth-faqs";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

const TARGET = 75;

const MEALS = [
  { name: "Morning", dish: "Chai + two toast", grams: 7 },
  { name: "Lunch", dish: "Dal chawal", grams: 13 },
  { name: "Dinner", dish: "Sabzi, roti + dahi", grams: 15 }
];

const DAY_TOTAL = MEALS.reduce((total, meal) => total + meal.grams, 0);

const AMINOS = [
  "His",
  "Ile",
  "Leu",
  "Lys",
  "Met",
  "Phe",
  "Thr",
  "Trp",
  "Val"
];

type AminoState = "full" | "low" | "small" | "gold";

const FOODS: {
  name: string;
  states: AminoState[];
  caption: string;
}[] = [
  {
    name: "Dal",
    states: AMINOS.map((amino) => (amino === "Met" ? "low" : "small")),
    caption: "Dal contains all nine, but is relatively low in methionine."
  },
  {
    name: "Rice",
    states: AMINOS.map((amino) => (amino === "Lys" ? "low" : "small")),
    caption: "Rice is relatively low in lysine."
  },
  {
    name: "Dal chawal",
    states: AMINOS.map(() => "small"),
    caption: "Together, dal and rice complement each other. The portion is still modest in protein."
  },
  {
    name: "Paneer",
    states: AMINOS.map(() => "full"),
    caption: "Paneer provides all nine essential amino acids."
  },
  {
    name: "Whey",
    states: AMINOS.map(() => "gold"),
    caption: "Whey provides all nine in a strong amino acid profile."
  }
];

const FIXES = [
  { name: "+ A bowl of dahi", grams: 8 },
  { name: "+ Paneer in the sabzi", grams: 12 },
  { name: "+ 1 tbsp Heldi Khana", grams: 10 }
];

function Meter({
  value,
  label
}: {
  value: number;
  label: string;
}) {
  const fillPercent = Math.min(100, (value / TARGET) * 100);
  const reached = value >= TARGET;

  return (
    <div className="truth-meter">
      <div className="truth-meter__head">
        <span className="truth-meter__label">{label}</span>
        <span className="truth-meter__score">
          <span
            className={`truth-meter__value${reached ? " is-reached" : ""}`}
            key={value}
          >
            {value}g
          </span>
          <span className="truth-meter__goal">/ {TARGET}g target</span>
        </span>
      </div>
      <div
        className="truth-meter__track"
        role="img"
        aria-label={`${value} grams of ${TARGET} gram daily target`}
      >
        <div
          className={`truth-meter__fill${reached ? " is-reached" : ""}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}

export function TruthPage() {
  const [eaten, setEaten] = useState<boolean[]>(() =>
    Array(MEALS.length).fill(false)
  );
  const [fixed, setFixed] = useState<boolean[]>(() =>
    Array(FIXES.length).fill(false)
  );
  const [faqOpen, setFaqOpen] = useState(-1);
  const [foodIndex, setFoodIndex] = useState(0);

  const dayTotal = MEALS.reduce(
    (total, meal, index) => total + (eaten[index] ? meal.grams : 0),
    0
  );
  const dayDone = eaten.every(Boolean);

  const fixTotal =
    DAY_TOTAL +
    FIXES.reduce(
      (total, fix, index) => total + (fixed[index] ? fix.grams : 0),
      0
    );
  const fixDone = fixed.every(Boolean);

  const food = FOODS[foodIndex];

  return (
    <>
      <section className="section section--cream truth-hero" data-nav-hero>
        <div className="truth-hero__inner">
          <p className="eyebrow">THE HONEST TRUTH</p>
          <h1>How much protein is in dal, really?</h1>
          <p>
            A standard 80g cooked bowl of dal has{" "}
            <CopyHighlight>5 to 7g</CopyHighlight> of protein. The 18g figures
            commonly quoted online can be valid for roughly 75g of lentils
            weighed dry, but that amount cooks into substantially more than
            one standard bowl. A full day of home-cooked vegetarian food often
            lands around 35 to 45g. The target used here for an active adult is{" "}
            <CopyHighlight>75g or more</CopyHighlight>.
          </p>

          <div className="truth-bowls">
            <div className="truth-bowl truth-bowl--myth">
              <span className="truth-bowl__name">
                What the internet calls one bowl
              </span>
              <span className="truth-bowl__grams truth-bowl__grams--struck">
                18g
              </span>
              <span className="truth-bowl__note">
                18g belongs to roughly 75g of dry lentils. That amount cooks
                into more than one 80g bowl
              </span>
            </div>
            <div className="truth-bowl truth-bowl--real">
              <span className="truth-bowl__name">Cooked dal</span>
              <span className="truth-bowl__grams">6g</span>
              <span className="truth-bowl__note">a standard bowl at the table</span>
            </div>
          </div>

          <p className="truth-bowls__caption">
            Bade bade bowls mein, chhoti chhoti proteins.
          </p>
        </div>
      </section>

      <section className="section section--ink section--bordered truth-day">
        <div className="truth-block">
          <p className="eyebrow eyebrow--gold">YOUR DAY ON A PLATE</p>
          <h2>How much protein is in a vegetarian Indian day?</h2>
          <p className="truth-block__lede">
            This example uses ordinary cooked portions. Tap each meal to see
            how the day adds up.
          </p>

          <div className="truth-day__cards">
            {MEALS.map((meal, index) => (
              <button
                key={meal.name}
                type="button"
                className={`truth-meal${eaten[index] ? " is-eaten" : ""}`}
                onClick={() =>
                  setEaten((current) =>
                    current.map((state, i) => (i === index ? true : state))
                  )
                }
                disabled={eaten[index]}
              >
                <span className="truth-meal__tag">{meal.name}</span>
                <span className="truth-meal__dish">{meal.dish}</span>
                <span className="truth-meal__grams">
                  <span aria-hidden="true">
                    {eaten[index] ? `${meal.grams}g` : "?"}
                  </span>
                  <span className="sr-only">
                    {meal.grams}g of protein
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Meter value={dayTotal} label="Protein on the day" />

          <p className="truth-day__verdict" aria-live="polite">
            {dayDone
              ? `This example day is ${TARGET - DAY_TOTAL}g below the target used here.`
              : " "}
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered truth-team">
        <div className="truth-block">
          <p className="eyebrow">THE AMINO ACID PROFILE</p>
          <h2>Is dal a complete protein?</h2>
          <p>
            Dal contains all nine essential amino acids, but is relatively low
            in methionine. Rice is relatively low in lysine. Eating them
            together improves the balance of the meal&apos;s amino acid
            profile, but it does not increase the grams of protein already on
            the plate. A standard bowl of dal still provides around 6g towards
            the 75g target used in this example.
          </p>
          <p className="truth-block__lede">
            Tap a food to reveal its amino acid line-up.
          </p>

          <div
            className="truth-team__chips"
            role="radiogroup"
            aria-label="Pick a food"
          >
            {FOODS.map((option, index) => (
              <button
                key={option.name}
                type="button"
                role="radio"
                aria-checked={foodIndex === index}
                className={`truth-chip${foodIndex === index ? " is-active" : ""}`}
                onClick={() => setFoodIndex(index)}
              >
                {option.name}
              </button>
            ))}
          </div>

          <div className="truth-team__lineup" aria-live="polite">
            {AMINOS.map((amino, index) => (
              <span
                key={amino}
                className={`truth-amino truth-amino--${food.states[index]}`}
              >
                {amino}
              </span>
            ))}
          </div>
          {FOODS.map((option, index) => (
            <p
              key={option.name}
              className="truth-team__caption"
              hidden={foodIndex !== index}
            >
              {option.caption}
            </p>
          ))}
        </div>
      </section>

      <section className="section section--cream truth-decades">
        <div className="truth-block">
          <p className="eyebrow">PROTEIN OVER TIME</p>
          <h2>Why does protein matter as we get older?</h2>
          <p>
            Muscle mass tends to decline gradually from your 30s onwards, and
            research finds that South Asian adults carry less muscle on
            average to begin with. A gradual change can be easy to miss at 30
            and still matter at 75, in something as ordinary as{" "}
            <CopyHighlight>carrying your own shopping</CopyHighlight>.
          </p>

          <svg
            className="truth-chart"
            viewBox="0 0 560 300"
            role="img"
            aria-label="Illustrative line chart of muscle mass from age 35 to 85. The low protein and low activity line falls steeply. The enough protein and staying active line falls more gently. This is not an individual prediction."
          >
            <line x1="50" y1="20" x2="50" y2="250" stroke="#011246" strokeWidth="3" />
            <line x1="50" y1="250" x2="540" y2="250" stroke="#011246" strokeWidth="3" />
            <text x="60" y="288" fill="#4a4238" fontSize="15">35</text>
            <text x="280" y="288" fill="#4a4238" fontSize="15">60</text>
            <text x="510" y="288" fill="#4a4238" fontSize="15">85</text>
            <text x="16" y="150" fill="#4a4238" fontSize="15" transform="rotate(-90 16 150)">
              muscle
            </text>
            <path
              d="M60 60 C 220 80, 380 120, 530 165"
              fill="none"
              stroke="#011246"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M60 60 C 200 105, 340 190, 530 240"
              fill="none"
              stroke="#a8432b"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1 10"
            />
            <text x="330" y="105" fill="#011246" fontSize="15" fontWeight="600">
              enough protein + staying active
            </text>
            <text x="80" y="205" fill="#a8432b" fontSize="15" fontWeight="600">
              low protein, low activity
            </text>
          </svg>

          <p className="truth-decades__claim">
            Protein contributes to the maintenance of muscle mass. This
            applies as part of a varied and balanced diet and a healthy
            lifestyle.
          </p>
        </div>
      </section>

      <section className="section section--gold section--bordered truth-whey">
        <div className="truth-block">
          <p className="eyebrow">COMPARE THE SOURCES</p>
          <h2>How does whey isolate compare with other vegetarian proteins?</h2>
          <p>
            <CopyHighlight>Whey protein isolate</CopyHighlight> is a
            concentrated vegetarian source. It comes from milk, like paneer
            and dahi, and is filtered further than whey concentrate. The
            options below differ in protein content, amino acid profile and
            how they behave in food.
          </p>

          <div className="powder-stack">
            <div className="powder powder--hero">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.2 1.3-6.6L2.5 9l6.6-.8z"
                  fill="currentColor"
                />
              </svg>
              <span className="powder__name">Whey Protein Isolate</span>
              <span className="powder__grams">90g</span>
              <span className="powder__per">protein per 100g</span>
              <span className="powder__note">
                All nine essential amino acids. Whey isolate contains far less
                lactose than concentrate; Heldi Khana is 98% lactose-free.
                Made to disappear into the dish.
              </span>
            </div>

            <div className="powder-row">
              <div className="powder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 1 1-12 0c0-3.2 2.5-6.5 6-11z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span className="powder__name">Whey concentrate</span>
                <span className="powder__grams">75g</span>
                <span className="powder__per">protein per 100g</span>
                <span className="powder__note">
                  More lactose and less protein than isolate.
                </span>
              </div>
              <div className="powder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7v5l3.5 2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="powder__name">Casein</span>
                <span className="powder__grams">78g</span>
                <span className="powder__per">protein per 100g</span>
                <span className="powder__note">
                  Tends to thicken the pot.
                </span>
              </div>
              <div className="powder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 19C5 10.5 10.5 5 19 5c0 8.5-5.5 14-14 14z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 19c3-3 6-6 9-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="powder__name">Soy isolate</span>
                <span className="powder__grams">88g</span>
                <span className="powder__per">protein per 100g</span>
                <span className="powder__note">
                  Can bring a noticeable beany taste.
                </span>
              </div>
              <div className="powder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="6" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="13" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="19" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="powder__name">Pea protein</span>
                <span className="powder__grams">78g</span>
                <span className="powder__per">protein per 100g</span>
                <span className="powder__note">
                  Relatively low in one essential amino acid.
                </span>
              </div>
            </div>
          </div>

          <p className="truth-whey__nonveg">
            In a meat-based meal, one spoonful of Heldi Khana can be stirred
            into chicken curry, mutton curry or butter chicken. It adds 10g of
            protein on top of the protein already in the dish.
          </p>
        </div>
      </section>

      <section className="section section--ink section--bordered truth-fix">
        <div className="truth-block">
          <p className="eyebrow eyebrow--gold">CLOSE THE GAP</p>
          <h2>How to get more protein as an Indian vegetarian.</h2>
          <p className="truth-block__lede">
            This example adds dahi first, paneer second and Heldi Khana last.
            Tap each one to update the day.
          </p>

          <div className="truth-fix__chips">
            {FIXES.map((fix, index) => (
              <button
                key={fix.name}
                type="button"
                className={`truth-chip truth-chip--dark${
                  fixed[index] ? " is-active" : ""
                }`}
                onClick={() =>
                  setFixed((current) =>
                    current.map((state, i) => (i === index ? true : state))
                  )
                }
                disabled={fixed[index]}
              >
                {fix.name} <strong>{fix.grams}g</strong>
              </button>
            ))}
          </div>

          <Meter value={fixTotal} label="Updated day total" />

          <p className="truth-day__verdict" aria-live="polite">
            {fixDone
              ? "This example day is closer to the 75g target."
              : " "}
          </p>

          <div className="truth-fix__cta">
            <WaitlistOrShopCta />
          </div>
        </div>
      </section>

      <section className="section section--cream section--bordered" id="faq">
        <div className="faq">
          <h2 className="centered">Questions people ask.</h2>
          <div className="faq-list">
            {TRUTH_FAQS.map((faq, index) => {
              const open = faqOpen === index;
              return (
                <article key={faq.question}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`truth-faq-answer-${index}`}
                      onClick={() => setFaqOpen(open ? -1 : index)}
                    >
                      <span>{faq.question}</span>
                      <b aria-hidden="true">{open ? "–" : "+"}</b>
                    </button>
                  </h3>
                  <p id={`truth-faq-answer-${index}`} hidden={!open}>
                    {faq.answer}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="faq-more">
            <a className="pill-link" href="/faq">
              See the full FAQ &#8594;
            </a>
          </p>
          <p className="truth-sources">
            Figures are drawn from NHS guidance, the British Nutrition
            Foundation and McCance and Widdowson&apos;s Composition of Foods.
            Heldi is a food supplement. Food supplements are not a substitute
            for a varied and balanced diet and a healthy lifestyle.
          </p>
        </div>
      </section>
    </>
  );
}
