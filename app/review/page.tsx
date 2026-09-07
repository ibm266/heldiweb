import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { ReviewForm } from "@/components/review-form";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";

export const metadata: Metadata = {
  title: "Leave a review · Heldi",
  description:
    "Leave an honest Heldi review: stars, dish, spoon count and what happened at your table.",
  // Link-only surface: reached from the PDP reviews band and review-request
  // emails, never from search. Kept out of app/sitemap.ts and the nav for the
  // same reason.
  robots: { index: false, follow: false }
};

const NEXT_STEPS = [
  "Your review joins our queue, where straight feedback matters just as much as praise. Your email and order number stay off the site.",
  "If you include an order number, our team checks it by hand before choosing whether to add a verified badge.",
  "If we publish your review, it may include the details named in your consent: your review, star rating, dish, spoon count, name, town or city, and any photo or video you add."
];

export default function ReviewPage() {
  return (
    <main>
      <SubpageNav tone="cream" />

      <section className="section section--cream review-band" data-nav-hero>
        <div className="review-shell">
          <header className="review-hero">
            <p className="eyebrow">FROM YOUR TABLE</p>
            <h1>How did Heldi get on in your kitchen?</h1>
            <p className="review-hero__lede">
              Tell us what worked, what did not and what you cooked. We want{" "}
              <CopyHighlight>the version you would tell your family</CopyHighlight>,
              not a polished answer.
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
          <h2>What happens next</h2>
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
