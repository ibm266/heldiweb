"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { useCart } from "@/components/cart/cart-context";
import { GIFTING, type GiftingAudience } from "@/lib/pricing";
import { GiftingCodePicker } from "./gifting-code-picker";

// Family-discount popup shown right after something lands in the basket:
// the same offer as the gifting band, condensed, with the who's-buying
// picker. Renders above the cart drawer (which opens at the same time), so
// body scroll locking is left to the drawer.
export function GiftingPopup({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { applyGifting } = useCart();

  useEffect(() => {
    track("gifting_popup_shown");
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
        <h2>We can&apos;t charge family full price.</h2>
        <p>
          Buying for your parents, or are you the auntie or uncle here for
          your own dal? Tell us who&apos;s buying and take {GIFTING.percent}%
          off single pouches and 2-packs.
        </p>
        <GiftingCodePicker surface="popup" onApply={applyToBasket} />
        <p className="gifting__small">
          One code per order. Applied at checkout. We don&apos;t check. We
          trust you :)
        </p>
      </div>
    </div>
  );
}
