import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";
import { METHODS } from "@/components/ways-to-use-methods";
import {
  SERVING_LADDER_LABELS,
  WaysComicStrip
} from "@/components/ways-comic-strip";

export const metadata: Metadata = {
  title: "Ways to use · Heldi",
  description:
    "Practical timings and amounts for stirring Heldi into dal, curry, dahi, raita, takeaway, rotis and chai.",
  alternates: { canonical: "/ways-to-use" }
};

const STEP_LABELS = ["Ek", "Do", "Protein"] as const;

export default function WaysToUsePage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">WAYS TO USE</p>
          <h1 className="story-hero__title">
            Here is what worked in our kitchen.
          </h1>
          <p className="story-hero__lede">
            You know how to make the food. These guides cover the Heldi part:{" "}
            <CopyHighlight>when to add it, where to sprinkle it and how much to use</CopyHighlight>.
            Pick the dish in front of you, follow the three steps, and{" "}
            <CopyHighlight>keep the recipe yours</CopyHighlight>.
          </p>
          <p className="story-hero__easy">Start with what you are cooking.</p>
          <nav className="ways-jump" aria-label="Jump to a way to use Heldi">
            {METHODS.map((method) => (
              <a key={method.id} className="truth-chip" href={`#${method.id}`}>
                {method.chip}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="double-rule" aria-hidden="true" />

      <section className="section section--gold story-copy">
        <div className="story-copy__inner">
          <p className="eyebrow">THE FIRST RULE</p>
          <h2>Start with a teaspoon, then taste.</h2>
          <p>
            A heaped tablespoon is the recommended serving and adds 10g of
            protein. For your first bowl,{" "}
            <CopyHighlight>begin with a teaspoon</CopyHighlight>, which adds
            around 3g. Sprinkle it across the food, stir well and taste. You
            can use more next time, or work up to the full serving in the same
            bowl.
          </p>
        </div>
      </section>

      {METHODS.map((method) => (
        <section
          key={method.id}
          id={method.id}
          className={`section section--${method.ground} section--bordered ways-method ways-method--on-${method.ground}`}
        >
          <div
            className={`ways-method__grid${
              method.strip ? " ways-method__grid--strip" : ""
            }`}
          >
            <div className="ways-method__copy">
              <p
                className={`eyebrow${
                  method.ground === "ink" ? " eyebrow--gold" : ""
                }`}
              >
                {method.eyebrow}
              </p>
              <h2>{method.title}</h2>
              <p className="ways-method__intro">{method.intro}</p>
            </div>
            {method.strip ? (
              <WaysComicStrip strip={method.strip} serving={method.serving} />
            ) : (
              <div className="ways-steps-card">
                <ol className="ways-steps">
                  {method.steps.map((step, index) => (
                    <li key={index} className="ways-step">
                      <span
                        className={`ways-step__num${
                          index === 2 ? " ways-step__num--protein" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {STEP_LABELS[index]}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                {typeof method.serving === "string" ? (
                  <p className="ways-steps-card__serving">
                    <span>How much</span>
                    <strong>{method.serving}</strong>
                  </p>
                ) : (
                  <div className="ways-steps-card__serving ways-steps-card__serving--ladder">
                    <p>
                      <span>{SERVING_LADDER_LABELS.start}</span>
                      <strong>{method.serving.start}</strong>
                    </p>
                    <p>
                      <span>{SERVING_LADDER_LABELS.upto}</span>
                      <strong>{method.serving.upto}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {method.note ? (
            <p className="ways-method__note">{method.note}</p>
          ) : null}
        </section>
      ))}

      <section className="final-cta section--bordered">
        <div className="final-cta-copy">
          <h2>Keep the guide beside the stove.</h2>
          <p>Start small, add Heldi at the right moment, and keep cooking your food.</p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
