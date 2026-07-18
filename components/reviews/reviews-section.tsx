import Link from "next/link";
import type { ReactNode } from "react";
import type { Review } from "@/lib/reviews";
import { ReviewGallery } from "./review-gallery";
import { ReviewLeaderboard } from "./review-leaderboard";

type ReviewsSectionProps = {
  id?: string;
  /** Section background, matching the site's cream/gold band rhythm. */
  tone?: "cream" | "gold";
  eyebrow?: string;
  heading?: string;
  lede?: ReactNode;
  showLeaderboard?: boolean;
  /** Link to the /review capture form; on for the PDP, off elsewhere. */
  submitCta?: boolean;
  /** Published reviews; omit to fall back to the placeholder gallery. */
  reviews?: Review[];
};

// Full-width reviews band: media-only review gallery plus, optionally, the
// spoonful leaderboard. Dropped into the homepage and the shop page.
export function ReviewsSection({
  id = "reviews",
  tone = "cream",
  eyebrow = "FROM REAL TABLES",
  heading = "Stirred in. Tasted. Reviewed.",
  lede = (
    <>
      Every review comes with a photo or a video and a spoon count, so you can
      see exactly how much protein made it into the bowl.
    </>
  ),
  showLeaderboard = false,
  submitCta = false,
  reviews
}: ReviewsSectionProps) {
  return (
    <section className={`section section--${tone} section--bordered`} id={id}>
      <div className="reviews">
        <header className="reviews__header">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{heading}</h2>
          <p className="reviews__lede">{lede}</p>
        </header>

        <ReviewGallery reviews={reviews} />

        {showLeaderboard ? <ReviewLeaderboard /> : null}

        {submitCta ? (
          <p className="reviews__submit-cta">
            <Link className="pill-link" href="/review">
              Stirred one in already? Leave a review &#8594;
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
