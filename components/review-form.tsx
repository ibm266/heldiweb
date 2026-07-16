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
  REVIEW_LIMITS,
  REVIEW_MEDIA_ACCEPT,
  REVIEW_MEDIA_TYPES
} from "@/lib/review-submissions";
import { reviewProteinGrams } from "@/lib/reviews";

type SendState = "idle" | "sending" | "sent" | "failed";

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
        "That file type will not work here. JPG, PNG, WebP, HEIC, MP4, MOV or WebM."
      );
      event.target.value = "";
      return;
    }
    if (file.size > REVIEW_LIMITS.mediaMaxBytes) {
      setMedia(null);
      setMediaError(
        `That one is ${megabytes(file.size)}. The limit is 50MB; a shorter clip works.`
      );
      event.target.value = "";
      return;
    }
    setMedia(file);
    setMediaError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendState === "sending") return;

    if (rating === 0) {
      setFormError("Stars first. Everything else hangs off them.");
      return;
    }
    if (tbsp === null) {
      setFormError("Tell us the spoon count; the leaderboard runs on it.");
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
    if (media) body.set("media", media);

    setSendState("sending");
    try {
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
        <p className="eyebrow">{happy ? "RECEIVED" : "RECEIVED, AND READ"}</p>
        <h2>{happy ? "Shabash. That made our week." : "Taken seriously."}</h2>
        <p>
          {happy
            ? "We match every review to a real order before it goes up, so give us a day or two. If you added a photo or video, the wall of bowls awaits."
            : "The founder reads every one of these, usually the same evening. If something was wrong with your order, keep an eye on your inbox: we will put it right."}
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
        <legend className="review-field__label">Stars first</legend>
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
            ? "Tap a star. We publish fives and ones alike."
            : STAR_CAPTIONS[rating]}
        </p>
      </fieldset>

      {branch ? (
        <fieldset className="review-field">
          <legend className="review-field__label">
            {branch === "wrong" ? "What went wrong?" : "What earned it?"}
          </legend>
          <div
            className="review-chips"
            role="group"
            aria-label={branch === "wrong" ? "What went wrong" : "What earned it"}
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
              ? "Tap everything that applies. This is the part we act on."
              : "Tap everything that applies. We keep score."}
          </p>
        </fieldset>
      ) : null}

      <div className="review-field">
        <label className="review-field__label" htmlFor="review-dish">
          What did it go into?
        </label>
        <input
          id="review-dish"
          type="text"
          list="review-dish-options"
          required
          maxLength={REVIEW_LIMITS.dishMax}
          placeholder="dal tadka, kadhi, Sunday rajma"
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
          Heaped tablespoons stirred in
        </legend>
        <div
          className="review-chips"
          role="radiogroup"
          aria-label="Heaped tablespoons stirred in"
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
            ? "Heaped, not level. We know the difference."
            : `That is +${reviewProteinGrams(tbsp)}g protein into the pot${
                tbsp === 4 ? ", at least" : ""
              }.`}
        </p>
      </fieldset>

      <div className="review-field">
        <label className="review-field__label" htmlFor="review-text">
          Say it like you would at the table
        </label>
        <textarea
          id="review-text"
          required
          minLength={REVIEW_LIMITS.textMin}
          maxLength={REVIEW_LIMITS.textMax}
          rows={4}
          placeholder={
            branch === "wrong"
              ? "Straight talk. What happened, and when?"
              : "Who ate it? Did anyone notice? Would nani approve?"
          }
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="review-field">
        <span className="review-field__label" id="review-media-label">
          Photo or video of the bowl
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
            {media ? `${media.name} · ${megabytes(media.size)}` : "Tap to add one"}
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
            Remove it
          </button>
        ) : null}
        {mediaError ? (
          <p className="review-field__error" role="alert">
            {mediaError}
          </p>
        ) : null}
        <p className="review-field__hint" id="review-media-hint">
          Pics or it didn&apos;t simmer. Reviews with a photo or video go up on
          the wall; words alone still count, they just stay off the gallery.
        </p>
      </div>

      <div className="review-form__pair">
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-name">
            Your name
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
            First name and an initial is plenty. Printed exactly as typed.
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
          <p className="review-field__hint">We are not coming for dinner.</p>
        </div>
      </div>

      <div className="review-form__pair">
        <div className="review-field">
          <label className="review-field__label" htmlFor="review-email">
            Email
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
            Never published. Used to match your order and to reply.
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
            On your confirmation email. Earns the verified badge.
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
        <span>Happy for Heldi to publish this review, name, stars and all.</span>
      </label>

      {formError ? (
        <p className="review-field__error" role="alert">
          {formError}
        </p>
      ) : null}
      {sendState === "failed" ? (
        <p className="review-field__error" role="alert">
          That did not go through. Try again in a minute, or email
          info@heldi.co.uk and say it there. The founder answers.
        </p>
      ) : null}

      <button
        className="button button--pill review-form__submit"
        type="submit"
        disabled={sendState === "sending"}
      >
        {sendState === "sending" ? "Sending…" : "Send the review"}
      </button>

      <p className="review-form__legal">
        We publish genuine reviews, good and bad, once we have matched them to
        an order. We never pay for praise, and we never edit beyond trimming a
        surname. Your email stays private.
      </p>
    </form>
  );
}
