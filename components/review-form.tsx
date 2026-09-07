"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  DISH_SUGGESTIONS,
  STAR_CAPTIONS,
  TBSP_OPTIONS,
  WENT_WELL_CHIPS,
  WENT_WRONG_CHIPS
} from "@/components/review-form-data";
import { track } from "@/lib/analytics";
import {
  MEDIA_MAX_LABEL,
  REVIEW_LIMITS,
  REVIEW_MEDIA_ACCEPT,
  REVIEW_MEDIA_TYPES
} from "@/lib/review-submissions";
import { reviewProteinGrams } from "@/lib/reviews";

// "uploading" is its own state because the photo or video goes straight to
// storage before the form itself is sent, and a phone video on a slow
// connection makes that the longest part of the wait by far.
type SendState = "idle" | "uploading" | "sending" | "sent" | "failed";

function starsFromParam(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
}

function megabytes(bytes: number): string {
  return `${Math.max(0.1, Math.round((bytes / 1024 / 1024) * 10) / 10)}MB`;
}

export function ReviewForm() {
  // Review-request emails link here with the tapped stars and the order
  // number already in the URL, so the page picks up mid-thought. Nothing is
  // recorded from the URL alone: email scanners follow links, humans submit.
  const params = useSearchParams();
  const [rating, setRating] = useState(() => starsFromParam(params.get("stars")));
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");

  const [wentWell, setWentWell] = useState<string[]>([]);
  const [wentWrong, setWentWrong] = useState<string[]>([]);
  const [dish, setDish] = useState("");
  const [tbsp, setTbsp] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<SendState>("idle");

  const branch = rating === 0 ? null : rating <= 3 ? "wrong" : "well";
  const branchChips = branch === "wrong" ? WENT_WRONG_CHIPS : WENT_WELL_CHIPS;
  const branchSelection = branch === "wrong" ? wentWrong : wentWell;

  function toggleChip(value: string) {
    const setSelection = branch === "wrong" ? setWentWrong : setWentWell;
    setSelection((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  }

  function onMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setMedia(null);
      setMediaError(null);
      return;
    }
    if (!(file.type in REVIEW_MEDIA_TYPES)) {
      setMedia(null);
      setMediaError(
        "We cannot upload that file type. Choose a JPG, PNG, WebP, HEIC, MP4, MOV or WebM file."
      );
      event.target.value = "";
      return;
    }
    if (file.size > REVIEW_LIMITS.mediaMaxBytes) {
      setMedia(null);
      setMediaError(
        `This file is ${megabytes(file.size)}. The limit is ${MEDIA_MAX_LABEL}. Choose a smaller photo or shorter video.`
      );
      event.target.value = "";
      return;
    }
    setMedia(file);
    setMediaError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendState === "uploading" || sendState === "sending") return;

    if (rating === 0) {
      setFormError("Choose a star rating from 1 to 5.");
      return;
    }
    if (tbsp === null) {
      setFormError(
        "Choose how many heaped tablespoons you stirred into the dish."
      );
      return;
    }
    setFormError(null);

    const body = new FormData();
    body.set("rating", String(rating));
    body.set("dish", dish.trim());
    body.set("tablespoons", String(tbsp));
    body.set("text", text.trim());
    body.set("name", name.trim());
    body.set("location", location.trim());
    body.set("email", email.trim());
    body.set("orderNumber", orderNumber.trim());
    body.set("consent", consent ? "yes" : "");
    body.set("website", honeypot);
    for (const value of branchSelection) {
      body.append(branch === "wrong" ? "wentWrong" : "wentWell", value);
    }

    try {
      // The file goes browser to Supabase, never through our own server:
      // Vercel rejects request bodies over 4.5MB, which is smaller than most
      // phone videos. The server mints a signed URL for a path it chooses, we
      // PUT the file there, then the form carries only that path.
      if (media) {
        setSendState("uploading");
        const mint = await fetch("/api/reviews/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: media.type, bytes: media.size })
        });
        if (!mint.ok) throw new Error(`mint ${mint.status}`);
        const { path, signedUrl } = (await mint.json()) as {
          path: string;
          signedUrl: string;
        };

        // signedUrl carries its own token, so no Supabase client and no keys
        // are needed in the browser.
        const upload = await fetch(signedUrl, {
          method: "PUT",
          headers: { "content-type": media.type, "x-upsert": "false" },
          body: media
        });
        if (!upload.ok) throw new Error(`upload ${upload.status}`);
        body.set("mediaPath", path);
      }

      setSendState("sending");
      const response = await fetch("/api/reviews", { method: "POST", body });
      if (!response.ok) throw new Error(String(response.status));
      track("review_submitted", {
        rating,
        tablespoons: tbsp,
        hasMedia: Boolean(media)
      });
      setSendState("sent");
    } catch {
      setSendState("failed");
    }
  }

  if (sendState === "sent") {
    const happy = rating >= 4;
    return (
      <div className="review-form-card review-form-card--success" role="status">
        <p className="eyebrow">
          {happy ? "REVIEW RECEIVED" : "STRAIGHT FEEDBACK RECEIVED"}
        </p>
        <h2>
          {happy
            ? "Thank you for telling us."
            : "Thank you for being straight with us."}
        </h2>
        <p>
          {happy
            ? "Your review is in our queue. We read every submission and check any order details before deciding whether to publish it."
            : "Your review is in our queue. Critical feedback is read alongside every other submission, and we check any order details before deciding whether to publish it."}
        </p>
        <Link className="pill-link" href="/shop">
          Back to the shop &#8594;
        </Link>
      </div>
    );
  }

  return (
    <form className="review-form-card review-form" onSubmit={onSubmit}>
      <fieldset className="review-field">
        <legend className="review-field__label">Star rating (required)</legend>
        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={`review-star${rating >= value ? " is-filled" : ""}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="rating"
                value={value}
                required
                checked={rating === value}
                onChange={() => setRating(value)}
              />
              <span aria-hidden="true">★</span>
              <span className="sr-only">
                {value === 1 ? "1 star" : `${value} stars`}
              </span>
            </label>
          ))}
        </div>
        <p className="review-stars__caption" aria-live="polite">
          {rating === 0
            ? "Choose the rating that matches your experience."
            : STAR_CAPTIONS[rating]}
        </p>
      </fieldset>

      {branch ? (
        <fieldset className="review-field">
          <legend className="review-field__label">
            {branch === "wrong" ? "What did not work?" : "What worked well?"}
          </legend>
          <div
            className="review-chips"
            role="group"
            aria-label={
              branch === "wrong" ? "What did not work" : "What worked well"
            }
          >
            {branchChips.map((chip) => {
              const selected = branchSelection.includes(chip.value);
              return (
                <button
                  key={chip.value}
                  type="button"
                  className={`truth-chip${selected ? " is-active" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleChip(chip.value)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <p className="review-field__hint">
            {branch === "wrong"
              ? "Choose any problems that fit, or leave them blank."
              : "Choose any that fit, or leave them blank."}
          </p>
        </fieldset>
      ) : null}

      <div className="review-field">
        <label className="review-field__label" htmlFor="review-dish">
          What did you stir it into? (required)
        </label>
        <input
          id="review-dish"
          type="text"
          list="review-dish-options"
          required
          maxLength={REVIEW_LIMITS.dishMax}
          placeholder="For example: dal tadka, kadhi or Sunday rajma"
          autoComplete="off"
          value={dish}
          onChange={(event) => setDish(event.target.value)}
        />
        <datalist id="review-dish-options">
          {DISH_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <fieldset className="review-field">
        <legend className="review-field__label">
          How many heaped tablespoons did you use? (required)
        </legend>
        <div
          className="review-chips"
          role="radiogroup"
          aria-label="Number of heaped tablespoons stirred in"
        >
          {TBSP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={tbsp === option.value}
              className={`truth-chip${tbsp === option.value ? " is-active" : ""}`}
              onClick={() => setTbsp(option.value)}
            >
              {option.label}
              <span className="review-chip__note">{option.note}</span>
            </button>
          ))}
        </div>
        <p className="review-field__hint" aria-live="polite">
          {tbsp === null
            ? "Count heaped tablespoons, not level ones."
            : `That adds ${reviewProteinGrams(tbsp)}g of protein to the whole dish${
                tbsp === 4 ? " or more" : ""
              }.`}
        </p>
      </fieldset>

      <div className="review-field">
        <label className="review-field__label" htmlFor="review-text">
          Tell us what happened (required)
        </label>
        <textarea
          id="review-text"
          required
          minLength={REVIEW_LIMITS.textMin}
          maxLength={REVIEW_LIMITS.textMax}
          rows={4}
          placeholder={
            branch === "wrong"
              ? "What went wrong? What did you notice, and when?"
              : "What worked, what did not, and did anyone notice a difference?"
          }
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="review-field">
        <span className="review-field__label" id="review-media-label">
          Photo or video of the dish (optional)
        </span>
        <label className={`review-upload${media ? " has-file" : ""}`}>
          <input
            className="sr-only"
            type="file"
            accept={REVIEW_MEDIA_ACCEPT}
            aria-labelledby="review-media-label"
            aria-describedby="review-media-hint"
            onChange={onMediaChange}
          />
          <span aria-hidden="true">
            {media
              ? `${media.name} · ${megabytes(media.size)}`
              : "Choose a photo or video"}
          </span>
        </label>
        {media ? (
          <button
            type="button"
            className="review-upload__remove"
            onClick={() => {
              setMedia(null);
              setMediaError(null);
            }}
          >
            Remove file
          </button>
        ) : null}
        {mediaError ? (
          <p className="review-field__error" role="alert">
            {mediaError}
          </p>
        ) : null}
        <p className="review-field__hint" id="review-media-hint">
          Your written review is enough. You can also add one JPG, PNG, WebP,
          HEIC, MP4, MOV or WebM file up to {MEDIA_MAX_LABEL}. If we publish
          your review, we may publish this file with it.
        </p>
      </div>

      <div className="review-form__pair">
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-name">
            Your name (required)
          </label>
          <input
            id="review-name"
            type="text"
            required
            maxLength={REVIEW_LIMITS.nameMax}
            placeholder="Priya M."
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="review-field__hint">
            If the review is published, this name appears exactly as typed. A
            first name and initial are enough.
          </p>
        </div>
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-location">
            Town or city (optional)
          </label>
          <input
            id="review-location"
            type="text"
            maxLength={REVIEW_LIMITS.locationMax}
            placeholder="Leicester"
            autoComplete="address-level2"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <p className="review-field__hint">
            If the review is published, this may appear beside your name.
          </p>
        </div>
      </div>

      <div className="review-form__pair">
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-email">
            Email (required)
          </label>
          <input
            id="review-email"
            type="email"
            required
            maxLength={REVIEW_LIMITS.emailMax}
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="review-field__hint">
            We do not publish this. We use it to check your order and, if
            needed, contact you about your review.
          </p>
        </div>
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-order">
            Order number (optional)
          </label>
          <input
            id="review-order"
            type="text"
            maxLength={REVIEW_LIMITS.orderNumberMax}
            placeholder="#1042"
            autoComplete="off"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
          />
          <p className="review-field__hint">
            Find it in your confirmation email. If you add one, we check it
            before showing a verified badge.
          </p>
        </div>
      </div>

      {/* Honeypot: humans never see it, bots fill it, the API bins it. */}
      <div className="review-form__trap" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <label className="review-consent">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I give Heldi permission to publish my review, name, star rating, town
          or city, and any photo or video I add. (required)
        </span>
      </label>

      {formError ? (
        <p className="review-field__error" role="alert">
          {formError}
        </p>
      ) : null}
      {sendState === "failed" ? (
        <p className="review-field__error" role="alert">
          We could not submit your review. Please try again. If it still does
          not work, email info@heldi.co.uk with your feedback.
        </p>
      ) : null}

      <button
        className="button button--pill review-form__submit"
        type="submit"
        disabled={sendState === "uploading" || sendState === "sending"}
      >
        {sendState === "uploading"
          ? "Uploading your photo or video…"
          : sendState === "sending"
            ? "Submitting review…"
            : "Submit review"}
      </button>

      <p className="review-form__legal">
        Every submission is reviewed before publication. Critical reviews are
        welcome. We do not publish your email or order number. Your consent
        lets us publish the details listed above, but does not guarantee
        publication.
      </p>
    </form>
  );
}
