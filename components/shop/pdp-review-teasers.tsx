"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PLACEHOLDER_REVIEWS,
  reviewProteinGrams,
  type Review,
  type ReviewMedia
} from "@/lib/reviews";

type VideoReview = Review & { media: Extract<ReviewMedia, { kind: "video" }> };

const TEASER_COUNT = 3;

function isVideoReview(review: Review): review is VideoReview {
  return review.media.kind === "video";
}

function Stars({ rating }: { rating: number }) {
  return (
    <p
      className="pdp-review-pop__stars"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rating ? "is-filled" : undefined}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </p>
  );
}

function VideoReviewModal({
  review,
  onClose
}: {
  review: VideoReview;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const grams = reviewProteinGrams(review.tablespoons);

  useEffect(() => {
    panelRef.current?.focus();
    void videoRef.current?.play().catch(() => undefined);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="pdp-review-pop-overlay" onClick={onClose}>
      <div
        className="pdp-review-pop"
        role="dialog"
        aria-modal="true"
        aria-label={`Video review by ${review.author}`}
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pdp-review-pop__header">
          <p className="eyebrow">VIDEO REVIEW</p>
          <button
            className="pdp-review-pop__close"
            type="button"
            onClick={onClose}
            aria-label="Close video review"
          >
            ×
          </button>
        </header>
        <video
          ref={videoRef}
          className="pdp-review-pop__video"
          src={review.media.src}
          poster={review.media.poster}
          controls
          playsInline
          preload="metadata"
        />
        <div className="pdp-review-pop__body">
          {review.rating ? <Stars rating={review.rating} /> : null}
          <p className="pdp-review-pop__spoons">
            {review.tablespoons} heaped tbsp into {review.dish}
            <span> · +{grams}g protein</span>
          </p>
          <p className="pdp-review-pop__text">{review.text}</p>
          <p className="pdp-review-pop__byline">
            <strong>{review.author}</strong>
            {review.location ? <span> · {review.location}</span> : null}
            {review.verified ? (
              <span className="pdp-review-pop__verified">VERIFIED</span>
            ) : null}
            {review.stock ? (
              <span className="pdp-review-pop__verified">HELDI KITCHEN</span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PdpReviewTeasers() {
  const teasers = useMemo(
    () => PLACEHOLDER_REVIEWS.filter(isVideoReview).slice(0, TEASER_COUNT),
    []
  );
  const [openReview, setOpenReview] = useState<VideoReview | null>(null);

  function seeMoreReviews() {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  }

  if (teasers.length === 0) return null;

  return (
    <div className="pdp-review-teasers">
      <div className="pdp-review-teasers__summary">
        <p className="pdp-review-teasers__count">200+ five star reviews</p>
        <p
          className="pdp-review-teasers__stars"
          role="img"
          aria-label="5 out of 5 stars"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} aria-hidden="true">
              ★
            </span>
          ))}
        </p>
      </div>
      <ul className="pdp-review-teasers__grid">
        {teasers.map((review) => (
          <li key={review.id}>
            <button
              type="button"
              className="pdp-review-teaser"
              aria-label={`Play video review by ${review.author}`}
              onClick={() => setOpenReview(review)}
            >
              <Image
                src={review.media.poster}
                alt=""
                width={240}
                height={240}
                sizes="(max-width: 899px) 30vw, 120px"
              />
              <span className="pdp-review-teaser__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M8 5.2v13.6L19 12z" fill="currentColor" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="pdp-review-teasers__more"
        onClick={seeMoreReviews}
      >
        See more reviews
      </button>
      {openReview ? (
        <VideoReviewModal
          review={openReview}
          onClose={() => setOpenReview(null)}
        />
      ) : null}
    </div>
  );
}
