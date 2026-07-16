import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { ReviewForm } from "@/components/review-form";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";

export const metadata: Metadata = {
  title: "Leave a review · Heldi",
  description: "Stars, spoon count, straight talk. Tell us how the dal took it.",
  // Link-only surface: reached from the PDP reviews band and review-request
  // emails, never from search. Kept out of app/sitemap.ts and the nav for the
  // same reason.
  robots: { index: false, follow: false }
};

const NEXT_STEPS = [
  "We read it. All of it. Small operation, strong opinions about dal.",
  "We match it to a real order. Real bowls only, no invented aunties.",
  "It goes up, stars and all: praise, complaints and the three-star fence sitters together."
];

export default function ReviewPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream review-band" data-nav-hero>
        <div className="review-shell">
          <header className="review-hero">
            <p className="eyebrow">FROM YOUR TABLE</p>
            <h1>How did the dal take it?</h1>
            <p className="review-hero__lede">
              Two minutes, stars to spoon count. We publish{" "}
              <CopyHighlight>the good and the bad</CopyHighlight>, once we have
              matched your review to a real order.
            </p>
          </header>
          {/* ReviewForm reads ?stars= and ?order= prefills from the URL. */}
          <Suspense fallback={null}>
            <ReviewForm />
          </Suspense>
        </div>
      </section>

      <section className="section section--gold section--bordered review-next">
        <div className="review-shell">
          <p className="eyebrow">AFTER YOU PRESS SEND</p>
          <h2>Where your review goes</h2>
          <ol className="review-next__steps">
            {NEXT_STEPS.map((step, index) => (
              <li className="sticker-card review-next__step" key={step}>
                <span className="review-next__num" aria-hidden="true">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SubpageFooter />
    </main>
  );
}
