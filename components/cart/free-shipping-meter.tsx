"use client";

import { formatPence, moneyToPence } from "@/lib/commerce/money";
import type { Cart } from "@/lib/commerce/types";
import { SHIPPING } from "@/lib/pricing";

export function FreeShippingMeter({ cart }: { cart: Cart }) {
  const thresholdPence = SHIPPING.freeOverPence;
  // Post-discount total, so the meter recalculates after the gifting code.
  const totalPence = moneyToPence(cart.cost.totalAmount);
  const unlocked = totalPence >= thresholdPence;
  const progress = Math.min(totalPence / thresholdPence, 1) * 100;

  return (
    <div className="shipping-meter" aria-live="polite">
      <p className="shipping-meter__label">
        {unlocked
          ? "Your order now ships free in the UK."
          : `Add ${formatPence(thresholdPence - totalPence)} more for free UK shipping.`}
      </p>
      <div
        className="shipping-meter__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progress towards free UK shipping"
      >
        <div
          className={`shipping-meter__fill${unlocked ? " shipping-meter__fill--full" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
