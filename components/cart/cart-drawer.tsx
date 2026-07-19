"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { prepareCheckoutHandoff } from "@/lib/checkout-handoff";
import {
  SAMPLE_SKU,
  SERVINGS_PER_POUCH,
  giftingEligiblePenceForLines,
  includedItemsForPouches,
  khanaImageForPouches,
  khanaPouchCount,
  tierForSku
} from "@/lib/commerce/catalog";
import { COMMERCE_PROVIDER } from "@/lib/commerce/config";
import { formatMoney, formatPence, moneyToPence } from "@/lib/commerce/money";
import type { CartLine, IncludedItem } from "@/lib/commerce/types";
import {
  GIFTING,
  SAMPLE_PRICE_PENCE,
  SHIPPING,
  TIERS,
  giftingAudienceForCode,
  isGiftingCode
} from "@/lib/pricing";
import { useCart } from "./cart-context";
import { FreeShippingMeter } from "./free-shipping-meter";

// One discount per order — the reason the code field or the checkbox is
// locked once the other has applied the gifting discount.
const ONE_DISCOUNT_HINT = "Already sorted. One discount per order.";
// Shown when the basket holds only excluded items (triple blocks, samples).
const BEST_PRICE_HINT = "This one's already our best price.";

// Launch savings on a line: the RRP total minus what's actually charged.
function lineSavingsPence(line: CartLine): number {
  if (!line.cost.compareAtAmount) return 0;
  return Math.max(
    0,
    moneyToPence(line.cost.compareAtAmount) - moneyToPence(line.cost.totalAmount)
  );
}

// Items that ship free with the pouches (jars, masala dabba), their worth
// struck out. Mirrors the Includes panel on the product page.
function IncludedList({ items }: { items: IncludedItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="cart-line__included">
      {items.map((item) => (
        <li key={item.title}>
          <Image src={item.image} alt="" width={24} height={24} sizes="24px" />
          <span>{item.title}</span>
          <s>{formatPence(item.valuePence)}</s>
          <strong>Free</strong>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const {
    cart,
    isOpen,
    isPending,
    mode,
    giftingMethod,
    applyGifting,
    removeGifting,
    closeCart,
    setPouchCount,
    updateQuantity,
    removeItem,
    applyDiscount
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const lastTrackedSavings = useRef<number | null>(null);

  const lines = cart?.lines ?? [];
  const appliedCodes = cart?.discountCodes ?? [];

  // The pouch tiers render as one row the shopper steps a pouch at a time;
  // the underlying bundle lines repack behind it. Everything else (the
  // Sample) keeps its own line.
  const khanaLines = lines.filter((line) => tierForSku(line.merchandise.sku) !== null);
  const otherLines = lines.filter((line) => tierForSku(line.merchandise.sku) === null);
  const pouchCount = khanaPouchCount(lines);
  const khanaTotalPence = khanaLines.reduce(
    (sum, line) => sum + moneyToPence(line.cost.totalAmount),
    0
  );
  const khanaComparePence = khanaLines.reduce(
    (sum, line) =>
      sum + moneyToPence(line.cost.compareAtAmount ?? line.cost.totalAmount),
    0
  );
  const khanaName =
    pouchCount === 1
      ? TIERS.single.name
      : pouchCount === 2
        ? TIERS.double.name
        : pouchCount === 3
          ? TIERS.triple.name
          : `${pouchCount} pouches`;
  const perMealPence =
    pouchCount > 0
      ? Math.round(khanaTotalPence / (pouchCount * SERVINGS_PER_POUCH))
      : 0;

  const subtotalPence = cart ? moneyToPence(cart.cost.subtotalAmount) : 0;
  const totalPence = cart ? moneyToPence(cart.cost.totalAmount) : 0;

  // Running savings: launch pricing on each line plus any gifting discount.
  const savingsPence =
    lines.reduce((sum, line) => sum + lineSavingsPence(line), 0) +
    Math.max(0, subtotalPence - totalPence);

  // Gifting discount state. The stored method only counts while the code is
  // actually on the cart.
  const eligiblePence = giftingEligiblePenceForLines(lines);
  const giftingApplied = appliedCodes.some(
    (entry) => entry.applicable && isGiftingCode(entry.code)
  );
  const activeMethod = giftingApplied ? (giftingMethod ?? "code") : null;
  const noEligibleItems = lines.length > 0 && eligiblePence === 0;
  const checkboxLockedByCode = activeMethod === "code";
  const checkboxDisabled = noEligibleItems || checkboxLockedByCode;
  const checkboxHint = noEligibleItems
    ? BEST_PRICE_HINT
    : checkboxLockedByCode
      ? ONE_DISCOUNT_HINT
      : null;
  const codeFieldLocked = activeMethod === "checkbox";

  // Shipping, recalculated after discounts. A Sample on its own ships
  // free (Heldi absorbs the Large Letter rate).
  const sampleOnly =
    lines.length > 0 && lines.every((line) => line.merchandise.sku === SAMPLE_SKU);
  const shippingPence =
    sampleOnly || totalPence >= SHIPPING.freeOverPence ? 0 : SHIPPING.standardPence;
  const showSampleNudge =
    !sampleOnly &&
    shippingPence > 0 &&
    totalPence + SAMPLE_PRICE_PENCE >= SHIPPING.freeOverPence;

  // Close on Escape and keep focus inside the drawer while open.
  useEffect(() => {
    if (!isOpen) return;

    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), a[href]"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen || savingsPence <= 0) return;
    if (lastTrackedSavings.current === savingsPence) return;
    lastTrackedSavings.current = savingsPence;
    track("savings_displayed", { basket_savings_total: savingsPence / 100 });
  }, [isOpen, savingsPence]);

  if (mode !== "live" || !isOpen) return null;

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || codeFieldLocked) return;
    const audience = giftingAudienceForCode(trimmed);
    if (audience) {
      if (eligiblePence > 0) {
        track("gifting_discount_applied", { method: "code", audience });
      }
      await applyGifting("code", audience);
    } else {
      await applyDiscount(trimmed);
    }
    setCode("");
  }

  async function toggleGiftingCheckbox(checked: boolean) {
    if (checked) {
      track("gifting_discount_applied", { method: "checkbox" });
      await applyGifting("checkbox");
    } else {
      await removeGifting();
    }
  }

  const lastCode = appliedCodes[appliedCodes.length - 1];
  const showCodeRejected = lastCode && !lastCode.applicable;
  const rejectionMessage =
    lastCode && isGiftingCode(lastCode.code)
      ? BEST_PRICE_HINT
      : lastCode
        ? `“${lastCode.code}” isn’t a valid code`
        : null;

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <div
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your basket"
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer__header">
          <h2>Your basket</h2>
          <button
            className="cart-drawer__close"
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
          >
            ×
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your basket is empty.</p>
            <a className="button button--pill" href="/shop" onClick={closeCart}>
              Browse the shop
            </a>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {pouchCount > 0 ? (
                <li className="cart-line" key="khana-pouches">
                  <Image
                    className="cart-line__image"
                    src={khanaImageForPouches(pouchCount).url}
                    alt={khanaImageForPouches(pouchCount).altText}
                    width={72}
                    height={72}
                  />
                  <div className="cart-line__details">
                    <p className="cart-line__title">
                      {khanaLines[0].merchandise.product.title}
                    </p>
                    <p className="cart-line__variant">
                      {khanaName} · {formatPence(perMealPence)} per meal
                    </p>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() => setPouchCount(pouchCount - 1)}
                        disabled={isPending}
                        aria-label="One pouch fewer"
                      >
                        −
                      </button>
                      <span aria-live="polite">{pouchCount}</span>
                      <button
                        type="button"
                        onClick={() => setPouchCount(pouchCount + 1)}
                        disabled={isPending}
                        aria-label="One pouch more"
                      >
                        +
                      </button>
                    </div>
                    {pouchCount % 3 === 2 ? (
                      <p className="cart-line__nudge">
                        One more pouch adds a free masala dabba.
                      </p>
                    ) : null}
                  </div>
                  <div className="cart-line__pricing">
                    {khanaComparePence > khanaTotalPence ? (
                      <s className="cart-line__compare">
                        {formatPence(khanaComparePence)}
                      </s>
                    ) : null}
                    <span className="cart-line__price">
                      {formatPence(khanaTotalPence)}
                    </span>
                    <button
                      className="cart-line__remove"
                      type="button"
                      onClick={() => setPouchCount(0)}
                      disabled={isPending}
                    >
                      Remove
                    </button>
                  </div>
                  <IncludedList items={includedItemsForPouches(pouchCount)} />
                </li>
              ) : null}
              {otherLines.map((line) => {
                const lineImage =
                  line.merchandise.image ?? line.merchandise.product.images[0];
                return (
                <li className="cart-line" key={line.id}>
                  {lineImage ? (
                    <Image
                      className="cart-line__image"
                      src={lineImage.url}
                      alt={lineImage.altText}
                      width={72}
                      height={72}
                    />
                  ) : null}
                  <div className="cart-line__details">
                    <p className="cart-line__title">{line.merchandise.product.title}</p>
                    <p className="cart-line__variant">{line.merchandise.title}</p>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        disabled={isPending}
                        aria-label={`Reduce quantity of ${line.merchandise.product.title}`}
                      >
                        −
                      </button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        disabled={isPending}
                        aria-label={`Increase quantity of ${line.merchandise.product.title}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-line__pricing">
                    {line.cost.compareAtAmount ? (
                      <s className="cart-line__compare">
                        {formatMoney(line.cost.compareAtAmount)}
                      </s>
                    ) : null}
                    <span className="cart-line__price">
                      {formatMoney(line.cost.totalAmount)}
                    </span>
                    <button
                      className="cart-line__remove"
                      type="button"
                      onClick={() => removeItem(line.id)}
                      disabled={isPending}
                    >
                      Remove
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>

            {cart && !sampleOnly ? <FreeShippingMeter cart={cart} /> : null}

            <div
              className={`cart-gifting${checkboxDisabled ? " cart-gifting--disabled" : ""}`}
              title={checkboxHint ?? undefined}
            >
              <input
                id="gifting-checkbox"
                type="checkbox"
                checked={activeMethod === "checkbox"}
                disabled={checkboxDisabled || isPending}
                onChange={(event) => toggleGiftingCheckbox(event.target.checked)}
              />
              <label htmlFor="gifting-checkbox">
                This one&apos;s for the parents. Aunties and uncles count
                too, even when you&apos;re buying for yourself.{" "}
                {GIFTING.percent}% off, from our family to yours.
              </label>
              {checkboxHint ? (
                <p className="cart-gifting__hint">{checkboxHint}</p>
              ) : null}
            </div>

            <form
              className="discount-field"
              onSubmit={submitCode}
              title={codeFieldLocked ? ONE_DISCOUNT_HINT : undefined}
            >
              <label className="sr-only" htmlFor="discount-code">
                Discount code
              </label>
              <input
                id="discount-code"
                type="text"
                placeholder="Discount code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
                disabled={codeFieldLocked}
              />
              <button
                className="button button--square"
                type="submit"
                disabled={isPending || codeFieldLocked || code.trim() === ""}
              >
                Apply
              </button>
            </form>
            {appliedCodes
              .filter((entry) => entry.applicable)
              .map((entry) => (
                <p className="discount-field__applied" key={entry.code}>
                  Code <strong>{entry.code}</strong> applied
                </p>
              ))}
            {showCodeRejected && rejectionMessage ? (
              <p className="discount-field__error" role="alert">
                {rejectionMessage}
              </p>
            ) : null}

            <div className="cart-drawer__summary">
              {savingsPence > 0 ? (
                <p className="cart-drawer__savings-row">
                  <span>You&apos;re saving</span>
                  <strong>{formatPence(savingsPence)}</strong>
                </p>
              ) : null}
              {cart && subtotalPence !== totalPence ? (
                <p className="cart-drawer__subtotal-row">
                  <span>Subtotal</span>
                  <s>{formatMoney(cart.cost.subtotalAmount)}</s>
                </p>
              ) : null}
              <p className="cart-drawer__shipping-row">
                <span>Shipping</span>
                <span>{shippingPence === 0 ? "Free" : formatPence(shippingPence)}</span>
              </p>
              {showSampleNudge ? (
                <p className="cart-drawer__nudge">
                  Add a Sample and shipping&apos;s on us
                </p>
              ) : null}
              <p className="cart-drawer__total-row">
                <span>Total</span>
                <strong>{cart ? formatMoney(cart.cost.totalAmount) : "—"}</strong>
              </p>
              <p className="cart-drawer__shipping-note">
                Shipping is finalised at checkout.
              </p>
              {COMMERCE_PROVIDER === "mock" ? (
                <>
                  <button className="button button--pill cart-drawer__checkout" type="button" disabled>
                    Checkout
                  </button>
                  <p className="cart-drawer__mock-note">
                    Checkout opens at launch. The store isn’t connected yet.
                  </p>
                </>
              ) : (
                <a
                  className="button button--pill cart-drawer__checkout"
                  href={cart?.checkoutUrl ?? "#"}
                  onClick={async (event) => {
                    if (!cart) return;
                    // Modified clicks (new tab etc.) keep native behaviour.
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                      return;
                    }
                    event.preventDefault();
                    const applied = appliedCodes
                      .filter((entry) => entry.applicable)
                      .map((entry) => entry.code);
                    const audience =
                      applied
                        .map((entry) => giftingAudienceForCode(entry))
                        .find((match) => match !== null) ?? null;
                    track("begin_checkout", {
                      value: totalPence / 100,
                      currency: "GBP",
                      item_count: cart.totalQuantity,
                      pouches: pouchCount,
                      discount_codes: applied.join(","),
                      ...(audience ? { gifting_audience: audience } : {})
                    });
                    // The attribute write stitches the journey but must never
                    // cost the sale: capped at 1200ms, and navigation runs
                    // regardless (the orders webhook still counts revenue).
                    try {
                      await Promise.race([
                        prepareCheckoutHandoff(cart),
                        new Promise((resolve) => setTimeout(resolve, 1200))
                      ]);
                    } catch {
                      // Best-effort.
                    }
                    window.location.assign(cart.checkoutUrl);
                  }}
                >
                  Checkout
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
