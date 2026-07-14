import type { ReactNode } from "react";
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
  showLeaderboard = false
}: ReviewsSectionProps) {
  return (
    <section className={`section section--${tone} section--bordered`} id={id}>
      <div className="reviews">
        <header className="reviews__header">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{heading}</h2>
          <p className="reviews__lede">{lede}</p>
        </header>

        <ReviewGallery />

        {showLeaderboard ? <ReviewLeaderboard /> : null}
      </div>
    </section>
  );
}
