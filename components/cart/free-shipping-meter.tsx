"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce/config";
import { formatPence, moneyToPence } from "@/lib/commerce/money";
import type { Cart } from "@/lib/commerce/types";

export function FreeShippingMeter({ cart }: { cart: Cart }) {
  const thresholdPence = FREE_SHIPPING_THRESHOLD * 100;
  const totalPence = moneyToPence(cart.cost.totalAmount);
  const unlocked = totalPence >= thresholdPence;
  const progress = Math.min(totalPence / thresholdPence, 1) * 100;

  return (
    <div className="shipping-meter" aria-live="polite">
      <p className="shipping-meter__label">
        {unlocked
          ? "You’ve unlocked free UK shipping"
          : `${formatPence(thresholdPence - totalPence)} away from free UK shipping`}
      </p>
      <div
        className="shipping-meter__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progress towards free shipping"
      >
        <div
          className={`shipping-meter__fill${unlocked ? " shipping-meter__fill--full" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
