"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistOffer } from "@/components/waitlist-offer-context";
import { WAITLIST_CONSENT_COPY } from "@/lib/waitlist";

// The site's single waitlist entry point: a collapsed "Join waitlist" button
// that expands into an email field with the weekly-letter opt-in. Lives in the
// hero, the footer CTA and (pre-expanded) the waitlist popup, so it is shared
// rather than duplicated. In live mode it degrades to a "Shop now" link.
//
// `id` names the DOM field (and its honeypot). `placement` is what the API and
// the waitlist_signup analytics event record; it defaults to `id` so existing
// call sites keep their placement, while the popup can pass a distinct one.
export function WaitlistForm({
  joined,
  onJoin,
  id,
  buttonStyle = "square",
  startExpanded = false,
  placement
}: {
  joined: boolean;
  onJoin: () => void;
  id: string;
  buttonStyle?: "square" | "pill";
  startExpanded?: boolean;
  placement?: string;
}) {
  const [expanded, setExpanded] = useState(startExpanded);
  const [wantsLetter, setWantsLetter] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mode } = useCart();
  const offer = useWaitlistOffer();
  const placementValue = placement ?? id;

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketingOptIn: wantsLetter,
          placement: placementValue,
          website: String(data.get("website") ?? "")
        })
      });
      if (!response.ok) throw new Error(`waitlist ${response.status}`);
      track("waitlist_signup", { placement: placementValue, marketing_opt_in: wantsLetter });
      onJoin();
    } catch {
      setStatus("error");
    }
  }

  const buttonClassName =
    buttonStyle === "pill" ? "button button--pill" : "button button--square";

  if (mode === "live") {
    return (
      <Link className={buttonClassName} href="/shop">
        Shop now
      </Link>
    );
  }

  if (joined) {
    // One line for everyone. The form never tells a joiner whether they made
    // the first hundred (BRAND.md §11.9), so it needs nothing from the API.
    return (
      <p className="waitlist-success" role="status">
        {offer.success}
      </p>
    );
  }

  return (
    <form
      className={`waitlist-form${expanded ? " waitlist-form--expanded" : ""}`}
      onSubmit={submit}
    >
      {expanded ? (
        <>
          <label className="sr-only" htmlFor={id}>
            Email address
          </label>
          <input
            ref={inputRef}
            id={id}
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={status === "sending"}
          />
          <button
            className={buttonClassName}
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Joining…" : "Join waitlist"}
          </button>
          {/* Honeypot: humans never see it, bots fill it, the API bins it. */}
          <div className="waitlist-form__trap" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>
          <label className="waitlist-consent">
            <input
              type="checkbox"
              name="letter"
              checked={wantsLetter}
              disabled={status === "sending"}
              onChange={(event) => setWantsLetter(event.target.checked)}
            />
            <span>{WAITLIST_CONSENT_COPY}</span>
          </label>
          <p className="waitlist-smallprint">
            Unsubscribe anytime.{" "}
            <Link href="/legal/privacy">Privacy policy</Link> and{" "}
            <Link href="/legal/terms#waitlist-offer">offer terms</Link>.
          </p>
          {status === "error" ? (
            <p className="waitlist-error" role="alert">
              We couldn&apos;t add you to the list. Try again in a moment.
            </p>
          ) : null}
        </>
      ) : (
        <button
          className={buttonClassName}
          type="button"
          onClick={() => setExpanded(true)}
        >
          Join waitlist
        </button>
      )}
    </form>
  );
}
