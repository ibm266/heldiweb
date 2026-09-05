"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import {
  GIFTING,
  giftingAudienceForCode,
  type GiftingAudience
} from "@/lib/pricing";
import { GiftingCodePicker } from "./gifting-code-picker";

// Family-discount popup shown right after something lands in the basket:
// the same offer as the gifting band, condensed, with the who's-buying
// picker. Renders above the cart drawer (which opens at the same time), so
// body scroll locking is left to the drawer.
export function GiftingPopup({
  onClose,
  heading,
  onSkip,
  skipLabel
}: {
  onClose: () => void;
  /** Override the headline when the popup is answering a different question,
   *  e.g. the checkout prompt rather than the post-add nudge. */
  heading?: string;
  /** Shown as a plain text button under the picker. The checkout prompt uses
   *  it to continue without a code: a popup that interrupts a paid checkout
   *  must always have a visible way past it, or it is a dark pattern. */
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [ownCode, setOwnCode] = useState("");
  const { applyGifting, applyDiscount, isPending } = useCart();

  useEffect(() => {
    track("gifting_popup_shown", { surface: onSkip ? "checkout" : "add_to_cart" });
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function applyToBasket(audience: GiftingAudience) {
    track("gifting_discount_applied", { method: "popup", audience });
    await applyGifting("code", audience);
    onClose();
  }

  // The way out for someone holding a better code than the one being offered.
  // A founders code is 25% against the family 15%, and only one product
  // discount applies per basket, so a popup that ONLY offered the family rate
  // would talk a founder into the worse of the two.
  async function applyOwnCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = ownCode.trim();
    if (!trimmed) return;
    // A family code typed by hand still goes through applyGifting, so the
    // audience is recorded the same way as picking the card would have.
    const audience = giftingAudienceForCode(trimmed);
    const applied = audience
      ? await applyGifting("code", audience)
      : await applyDiscount(trimmed);
    track("gifting_own_code_applied", { applied });
    setOwnCode("");
    // Only close on success. A rejected code should leave the popup up, or the
    // shopper never learns it did not take; the drawer shows why.
    if (applied) onClose();
  }

  return (
    <div className="gifting-pop-overlay" onClick={onClose}>
      <div
        className="gifting-pop"
        role="dialog"
        aria-modal="true"
        aria-label="Family discount"
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="gifting-pop__close"
          type="button"
          onClick={onClose}
          aria-label="Close family discount"
        >
          ×
        </button>
        <p className="eyebrow eyebrow--gold">IN THE FAMILY?</p>
        <h2>{heading ?? "We can\u2019t charge family full price."}</h2>
        <p>
          The friends-and-family rate, for the mums, dads, aunties and
          uncles. Buying it for them, or are you one of them yourself? Pick
          who you&apos;re buying for and take {GIFTING.percent}% off, however
          many pouches you take.
        </p>
        <GiftingCodePicker surface="popup" onApply={applyToBasket} />
        <p className="gifting__small">
          One code per order, one use each. Applied at checkout. We
          don&apos;t check. We trust you :)
        </p>
        <form className="gifting-pop__own" onSubmit={applyOwnCode}>
          <label htmlFor="gifting-own-code">
            Already have a code? Put it in here instead.
          </label>
          <div className="gifting-pop__own-row">
            <input
              id="gifting-own-code"
              type="text"
              name="discount-code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Your code"
              value={ownCode}
              onChange={(event) => setOwnCode(event.target.value)}
            />
            <button type="submit" disabled={isPending || ownCode.trim() === ""}>
              Apply
            </button>
          </div>
        </form>

        {onSkip ? (
          <button
            type="button"
            className="gifting-pop__skip"
            onClick={() => {
              track("gifting_popup_skipped");
              onSkip();
            }}
          >
            {skipLabel ?? "No thanks, carry on"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
