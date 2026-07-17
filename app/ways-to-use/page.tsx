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
    "Dal, dahi, takeaway, rotis and the jar in the middle of the table. Every way to stir Heldi in, three steps each. Ek, do, protein.",
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
            We won&apos;t tell you how to run your kitchen.
          </h1>
          <p className="story-hero__lede">
            Nobody tells a desi cook what to do at their own stove, and we are
            not about to start. But once the jar is open, you can{" "}
            <CopyHighlight>stop shaking and start stirring</CopyHighlight>.
            These are the ways Heldi works best, and every one of them takes{" "}
            <CopyHighlight>the same three steps</CopyHighlight>.
          </p>
          <p className="story-hero__easy">It&apos;s as easy as 1, 2, 3.</p>
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
          <h2>Start with a teaspoon.</h2>
          <p>
            The heaped tablespoon is the recommended serving: 10g of protein,
            gone without a trace. But it is a serving,{" "}
            <CopyHighlight>not an entry exam</CopyHighlight>. A teaspoon still
            adds around 3g, and 3g in the raita beats 0g in the cupboard.
            Start small, taste, and work up. Nobody at the table will know
            either way.
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
          <h2>Bring it to the table.</h2>
          <p>Every dish on this page stays exactly the same. That is the whole trick.</p>
          <WaitlistOrShopCta />
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
