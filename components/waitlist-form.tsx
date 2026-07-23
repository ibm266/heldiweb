"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import { WAITLIST_CONSENT_COPY } from "@/lib/waitlist";
import { WAITLIST_OFFER } from "@/lib/pricing";

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
    return (
      <p className="waitlist-success" role="status">
        You&apos;re on the list, {WAITLIST_OFFER.percent}% off saved for launch
        day. Tell your mum we said hi.
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
            <Link href="/legal/privacy">Privacy policy</Link>
          </p>
          {status === "error" ? (
            <p className="waitlist-error" role="alert">
              That did not go through. Give it one more try.
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
