"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { prepareCheckoutHandoff } from "@/lib/checkout-handoff";
import {
  FREE_PAIR_SKU,
  SAMPLE_CHAI_SKU,
  SAMPLE_PAIR_SKU,
  SAMPLE_SKU,
  SERVINGS_PER_POUCH,
  imageForCounts,
  includedItemsForGiftLines,
  isGiftLine,
  isMixLine,
  pouchCounts,
  pouchPenceForCounts
} from "@/lib/commerce/catalog";
import { COMMERCE_PROVIDER } from "@/lib/commerce/config";
import { formatMoney, formatPence, moneyToPence } from "@/lib/commerce/money";
import type { IncludedItem } from "@/lib/commerce/types";
import { CHAI_MUGS_PER_POUCH } from "@/components/shop/chai-data";
import {
  GIFTING,
  MAX_POUCHES,
  SAMPLE_PRICE_PENCE,
  SHIPPING,
  bundleSavingPence,
  giftingAudienceForCode,
  isFoundersCode,
  isGiftingCode,
  rrpPence
} from "@/lib/pricing";
import { useCart } from "./cart-context";
import { FreeShippingMeter } from "./free-shipping-meter";

// One discount per order — the reason the code field or the checkbox is
// locked once the other has applied the gifting discount.
const ONE_DISCOUNT_HINT = "Already sorted. One discount per order.";
// Shown when the basket holds only excluded items (triple blocks, samples).
const BEST_PRICE_HINT = "This one's already our best price.";

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
    error,
    mode,
    giftingMethod,
    applyGifting,
    removeGifting,
    closeCart,
    notice,
    setPouchCounts,
    updateQuantity,
    removeItem,
    applyDiscount
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const lastTrackedSavings = useRef<number | null>(null);

  const lines = cart?.lines ?? [];
  const appliedCodes = cart?.discountCodes ?? [];

  // The basket holds ONE pouch line whose variant encodes both counts, but it
  // renders as one row per product so each can be stepped on its own. The
  // group line under them carries the price, because the price belongs to the
  // pair rather than to either pouch.
  const mixLines = lines.filter((line) => isMixLine(line));
  // The free lines render as struck-out "Free" rows under the pouch group,
  // never as normal rows with a stepper or a remove button.
  const giftLines = lines.filter((line) => isGiftLine(line));
  const giftUnitCount = giftLines.reduce((sum, line) => sum + line.quantity, 0);
  const giftItems = includedItemsForGiftLines(lines);
  const otherLines = lines.filter(
    (line) => !isMixLine(line) && !isGiftLine(line)
  );
  const { khana, chai, pouches: pouchCount } = pouchCounts(lines);
  const pouchTotalPence = mixLines.reduce(
    (sum, line) => sum + moneyToPence(line.cost.totalAmount),
    0
  );
  // RRP is what the same pouches cost bought one at a time. Shown struck
  // through from two pouches up, where there is a real saving; at one pouch
  // the RRP IS the price, so there is nothing to strike.
  const pouchRrpPence = pouchCount > 0 ? rrpPence(pouchCount) : 0;
  const bundleSaving = pouchCount > 0 ? bundleSavingPence(pouchCount) : 0;
  // One pouch price divided evenly: every pouch in a pair costs the same, so
  // the per-meal and per-mug figures come off the same share.
  const perPouchPence = pouchCount > 0 ? Math.round(pouchTotalPence / pouchCount) : 0;
  const perMealPence = Math.round(perPouchPence / SERVINGS_PER_POUCH);
  const perMugPence = Math.round(perPouchPence / CHAI_MUGS_PER_POUCH);

  const totalPence = cart ? moneyToPence(cart.cost.totalAmount) : 0;

  // Two components of the saving now, each on its own summary line, summing to
  // the "You're saving" headline. There is no launch saving any more: the price
  // is the price. Discount: whatever a code took off, worked out as the
  // pre-discount full price minus the cart total (Shopify allocates code
  // discounts into the lines, so subtotal - total reads as zero and cannot be
  // used). Free: the worth of every £0 line, the jar and tote that come with a
  // pair and the trial pair if they claimed one, struck out on their own rows
  // and counted toward the total too.
  const fullPricePence = lines.reduce(
    (sum, line) => sum + moneyToPence(line.merchandise.price) * line.quantity,
    0
  );
  const discountPence = Math.max(0, fullPricePence - totalPence);
  const giftWorthPence = giftItems.reduce((sum, item) => sum + item.valuePence, 0);
  // The claimed trial pair is a £0 line the shopper chose rather than one the
  // cart added, so it is not a "gift" row, but its £8 is a real saving and the
  // drawer says so. Without this the basket shows a free thing worth nothing.
  const freePairLine = lines.find(
    (line) => line.merchandise.sku === FREE_PAIR_SKU
  );
  const freePairWorthPence = freePairLine
    ? moneyToPence(
        freePairLine.cost.compareAtAmount ?? { amount: "8.00", currencyCode: "GBP" }
      ) * freePairLine.quantity
    : 0;
  const savingsPence = discountPence + giftWorthPence + freePairWorthPence;
  const discountCodeLabel =
    appliedCodes.find((entry) => entry.applicable)?.code ?? null;

  // Gifting discount state. The stored method only counts while the code is
  // actually on the cart.
  const eligiblePence = pouchPenceForCounts(lines);
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

  // Shipping, recalculated after discounts. Sachets on their own ship free
  // (Heldi absorbs the Large Letter rate), which includes a claimed trial pair:
  // a free thing must not arrive with a postage charge attached.
  const SACHET_SKUS = [SAMPLE_SKU, SAMPLE_CHAI_SKU, SAMPLE_PAIR_SKU, FREE_PAIR_SKU];
  const sampleOnly =
    lines.length > 0 &&
    lines.every((line) => SACHET_SKUS.includes(line.merchandise.sku ?? ""));
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
    // basket_savings_total is the headline saving; the split rides alongside
    // it. launch_savings is gone because launch pricing is, and dropping a
    // prop is safe where renaming an event would not be: the dashboard tile
    // reads the total (PLAYBOOK §7).
    track("savings_displayed", {
      basket_savings_total: savingsPence / 100,
      discount_savings: discountPence / 100,
      gift_worth: giftWorthPence / 100,
      free_pair_worth: freePairWorthPence / 100
    });
  }, [isOpen, savingsPence, discountPence, giftWorthPence, freePairWorthPence]);

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
  // A code can be inapplicable for two different reasons, and telling a
  // first-100 claimer their real code is "invalid" because their basket is a
  // free sachet is the wrong one. If the code is one of ours and the basket
  // simply has no pouches to discount yet, say that instead.
  const codeIsOurs =
    lastCode &&
    (isGiftingCode(lastCode.code) || isFoundersCode(lastCode.code));
  const rejectionMessage =
    lastCode && isGiftingCode(lastCode.code) && pouchCount > 0
      ? BEST_PRICE_HINT
      : codeIsOurs && pouchCount === 0
        ? `${lastCode.code} is saved. It comes off as soon as there is a pouch in the basket.`
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

        {/* Sits above the lines and outside the empty/filled branch, because
            the commonest failure is the very first add: the basket is still
            empty, and without this the shopper is told nothing at all. */}
        {error ? (
          <p className="cart-drawer__error" role="alert">
            {error}
          </p>
        ) : null}
        {/* A refusal, not a failure: the basket is already right and nothing
            was written, so it gets a quieter treatment than the error above
            and a status role rather than an alert. */}
        {notice ? (
          <p className="cart-drawer__notice" role="status">
            {notice}
          </p>
        ) : null}

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
              {[
                { key: "khana", count: khana, title: "Heldi Khana", unit: `${formatPence(perMealPence)} a meal` },
                { key: "chai", count: chai, title: "Heldi Chai", unit: `${formatPence(perMugPence)} a mug` }
              ]
                .filter((row) => row.count > 0)
                .map((row) => {
                  const image = imageForCounts(
                    row.key === "khana" ? row.count : 0,
                    row.key === "chai" ? row.count : 0
                  );
                  // Step this product only, leaving the other where it is.
                  const step = (next: number) =>
                    setPouchCounts({
                      khana: row.key === "khana" ? next : khana,
                      chai: row.key === "chai" ? next : chai
                    });
                  return (
                    <li className="cart-line" key={row.key}>
                      <Image
                        className="cart-line__image"
                        src={image.url}
                        alt={image.altText}
                        width={72}
                        height={72}
                        sizes="72px"
                      />
                      <div className="cart-line__details">
                        <p className="cart-line__title">{row.title}</p>
                        <p className="cart-line__variant">
                          {row.count} {row.count === 1 ? "pouch" : "pouches"} · {row.unit}
                        </p>
                        <div className="qty-stepper">
                          <button
                            type="button"
                            onClick={() => step(row.count - 1)}
                            disabled={isPending}
                            aria-label={`One ${row.title} pouch fewer`}
                          >
                            −
                          </button>
                          <span aria-live="polite">{row.count}</span>
                          <button
                            type="button"
                            onClick={() => step(row.count + 1)}
                            disabled={isPending || pouchCount >= MAX_POUCHES}
                            aria-label={`One ${row.title} pouch more`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-line__pricing">
                        <span className="cart-line__price">
                          {formatPence(perPouchPence * row.count)}
                        </span>
                        <button
                          className="cart-line__remove"
                          type="button"
                          onClick={() => step(0)}
                          disabled={isPending}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              {pouchCount > 0 ? (
                <li className="cart-line cart-line--total" key="pouch-total">
                  <div className="cart-line__details">
                    <p className="cart-line__title">
                      {pouchCount} {pouchCount === 1 ? "pouch" : "pouches"}
                    </p>
                    {pouchCount < MAX_POUCHES ? (
                      <p className="cart-line__nudge">
                        A second pouch is {formatPence(perPouchPence - bundleSavingPence(2))}, and the parcel ships free.
                      </p>
                    ) : null}
                  </div>
                  <div className="cart-line__pricing">
                    {bundleSaving > 0 ? (
                      <s className="cart-line__compare">{formatPence(pouchRrpPence)}</s>
                    ) : null}
                    <span className="cart-line__price">{formatPence(pouchTotalPence)}</span>
                  </div>
                  {/* The presents sit under the group, not under either pouch
                      row: they are earned by the order, not by one product. */}
                  {giftItems.length > 0 ? <IncludedList items={giftItems} /> : null}
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
              {freePairWorthPence > 0 ? (
                <p className="cart-drawer__saving-line">
                  <span>Sample pair, on us</span>
                  <span>{"−"}{formatPence(freePairWorthPence)}</span>
                </p>
              ) : null}
              {discountPence > 0 ? (
                <p className="cart-drawer__saving-line">
                  <span>
                    Discount{discountCodeLabel ? ` (${discountCodeLabel})` : ""}
                  </span>
                  <span>{"−"}{formatPence(discountPence)}</span>
                </p>
              ) : null}
              {giftWorthPence > 0 ? (
                <p className="cart-drawer__saving-line">
                  <span>Free gifts</span>
                  <span>{"−"}{formatPence(giftWorthPence)}</span>
                </p>
              ) : null}
              {savingsPence > 0 ? (
                <p className="cart-drawer__savings-row">
                  <span>You&apos;re saving</span>
                  <strong>{formatPence(savingsPence)}</strong>
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
                      // Paid units only; the free gift lines don't count.
                      // Pouches plus sachets, never the free lines: the gifts
                      // are not something the shopper chose to buy.
                      item_count: pouchCount + otherLines.reduce((sum, line) => sum + line.quantity, 0),
                      pouches: pouchCount,
                      khana,
                      chai,
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
