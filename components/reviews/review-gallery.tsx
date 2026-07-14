"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  PLACEHOLDER_REVIEWS,
  reviewProteinGrams,
  type Review
} from "@/lib/reviews";

const FILTERS = [
  { id: "all", label: "All bowls" },
  { id: "image", label: "Photos" },
  { id: "video", label: "Videos" }
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const PROGRAMMATIC_SCROLL_MS = 900;

function Stars({ rating }: { rating: number }) {
  return (
    <p
      className="review-card__stars"
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

export function ReviewGallery({
  reviews = PLACEHOLDER_REVIEWS
}: {
  reviews?: Review[];
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [active, setActive] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const railRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const scrollFlagTimer = useRef<number | undefined>(undefined);
  const isProgrammaticScroll = useRef(false);

  const shown = useMemo(
    () => reviews.filter((review) => filter === "all" || review.media.kind === filter),
    [reviews, filter]
  );

  function pausePlaying() {
    if (!playingId) return;
    videoRefs.current.get(playingId)?.pause();
    setPlayingId(null);
  }

  function selectFilter(id: FilterId) {
    if (id === filter) return;
    pausePlaying();
    setFilter(id);
    setActive(0);
    railRef.current?.scrollTo({ left: 0 });
  }

  function toggleVideo(review: Review) {
    const video = videoRefs.current.get(review.id);
    if (!video) return;
    if (playingId === review.id) {
      video.pause();
      return;
    }
    if (playingId) videoRefs.current.get(playingId)?.pause();
    void video.play().catch(() => setPlayingId(null));
  }

  function scrollToIndex(index: number) {
    const rail = railRef.current;
    const clamped = Math.max(0, Math.min(shown.length - 1, index));

    if (rail) {
      const card = rail.children[clamped] as HTMLElement | undefined;
      if (card) {
        isProgrammaticScroll.current = true;
        window.clearTimeout(scrollFlagTimer.current);
        scrollFlagTimer.current = window.setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, PROGRAMMATIC_SCROLL_MS);

        const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
        let target: number;
        if (clamped === 0) {
          // First/last cards cannot be centered — scroll to the rail edge.
          target = 0;
        } else if (clamped === shown.length - 1) {
          target = maxScroll;
        } else {
          target = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
          target = Math.max(0, Math.min(maxScroll, target));
        }
        rail.scrollTo({ left: target, behavior: "smooth" });
      }
    }

    setActive(clamped);
  }

  function onRailScroll() {
    if (isProgrammaticScroll.current) return;
    const rail = railRef.current;
    if (!rail) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const edgeSlop = 8;
    let best = 0;

    // At the extremes the first/last card never reaches the viewport center,
    // so a pure center-distance pick wrongly sticks on the neighbour.
    if (maxScroll > edgeSlop && rail.scrollLeft <= edgeSlop) {
      best = 0;
    } else if (maxScroll > edgeSlop && rail.scrollLeft >= maxScroll - edgeSlop) {
      best = rail.children.length - 1;
    } else {
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let bestDist = Infinity;

      Array.from(rail.children).forEach((child, index) => {
        const card = child as HTMLElement;
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
    }

    setActive((current) => (current === best ? current : best));
  }

  return (
    <div className="review-gallery">
      <div className="review-gallery__filters" role="group" aria-label="Filter reviews">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`review-filter${filter === entry.id ? " is-active" : ""}`}
            aria-pressed={filter === entry.id}
            onClick={() => selectFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="review-gallery__rail" ref={railRef} onScroll={onRailScroll}>
        {shown.map((review) => {
          const playing = playingId === review.id;
          const grams = reviewProteinGrams(review.tablespoons);

          return (
            <article
              key={review.id}
              className="review-card"
              aria-label={`Review by ${review.author}`}
            >
              <div className="review-card__media">
                {review.media.kind === "video" ? (
                  <>
                    <video
                      ref={(node) => {
                        if (node) videoRefs.current.set(review.id, node);
                        else videoRefs.current.delete(review.id);
                      }}
                      src={review.media.src}
                      poster={review.media.poster}
                      playsInline
                      preload="none"
                      controls={playing}
                      onPlay={() => setPlayingId(review.id)}
                      onPause={() =>
                        setPlayingId((current) =>
                          current === review.id ? null : current
                        )
                      }
                      onEnded={() =>
                        setPlayingId((current) =>
                          current === review.id ? null : current
                        )
                      }
                    />
                    {!playing ? (
                      <button
                        type="button"
                        className="review-card__play"
                        aria-label={`Play video: ${review.media.alt}`}
                        onClick={() => toggleVideo(review)}
                      >
                        <span aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="22" height="22">
                            <path d="M8 5.2v13.6L19 12z" fill="currentColor" />
                          </svg>
                        </span>
                      </button>
                    ) : null}
                  </>
                ) : (
                  <Image
                    src={review.media.src}
                    alt={review.media.alt}
                    width={640}
                    height={640}
                    sizes="(max-width: 899px) 78vw, 320px"
                  />
                )}
                {review.stock ? (
                  <span className="review-card__stock-tag">HELDI KITCHEN</span>
                ) : null}
                <span className="review-card__protein">+{grams}g protein</span>
              </div>

              <div className="review-card__body">
                {review.rating ? <Stars rating={review.rating} /> : null}
                <p className="review-card__spoons">
                  {review.tablespoons} heaped tbsp into {review.dish}
                </p>
                <p className="review-card__text">{review.text}</p>
                <p className="review-card__byline">
                  <strong>{review.author}</strong>
                  {review.location ? <span>· {review.location}</span> : null}
                  {review.verified ? (
                    <span className="review-card__verified">VERIFIED</span>
                  ) : null}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="review-gallery__dots" role="tablist" aria-label="Reviews">
        {shown.map((review, index) => (
          <button
            key={review.id}
            type="button"
            role="tab"
            className={`review-gallery__dot${index === active ? " is-active" : ""}`}
            aria-label={`Review ${index + 1} of ${shown.length}`}
            aria-selected={index === active}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>

      <p className="review-gallery__sample-note">
        Sample reviews shown while the review form is being built.
      </p>
    </div>
  );
}
