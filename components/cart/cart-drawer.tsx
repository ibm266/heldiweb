"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { giftsForQuantity } from "@/lib/commerce/catalog";
import { COMMERCE_PROVIDER } from "@/lib/commerce/config";
import { formatMoney, formatPence, moneyToPence } from "@/lib/commerce/money";
import type { CartLine } from "@/lib/commerce/types";
import { useCart } from "./cart-context";
import { FreeShippingMeter } from "./free-shipping-meter";

function LineSavings({ line }: { line: CartLine }) {
  if (!line.cost.compareAtAmount) return null;
  const savedPence =
    moneyToPence(line.cost.compareAtAmount) - moneyToPence(line.cost.totalAmount);
  if (savedPence <= 0) return null;
  return (
    <p className="cart-line__savings">
      {line.quantity > 1 ? "Bundle price applied, " : ""}
      you save {formatMoney({ amount: (savedPence / 100).toFixed(2), currencyCode: "GBP" })}
    </p>
  );
}

// Free gifts that ship with this line (jars, masala dabba), shown with
// their value struck out. Mirrors the Includes panel on the product page.
function LineGifts({ line }: { line: CartLine }) {
  const gifts = giftsForQuantity(line.merchandise, line.quantity);
  if (gifts.length === 0) return null;
  return (
    <ul className="cart-line__gifts">
      {gifts.map((gift) => (
        <li key={gift.title}>
          <img src={gift.image} alt="" />
          <span>
            {gift.title}
            {gift.note ? (
              <span className="cart-line__gift-note"> ({gift.note})</span>
            ) : null}
          </span>
          <s>{formatPence(gift.valuePence)}</s>
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
    closeCart,
    updateQuantity,
    removeItem,
    applyDiscount
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

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
        "button, input, a[href]"
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

  if (mode !== "live" || !isOpen) return null;

  const lines = cart?.lines ?? [];
  const appliedCodes = cart?.discountCodes ?? [];

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setCodeError(null);
    await applyDiscount(trimmed);
    setCode("");
  }

  const lastCode = appliedCodes[appliedCodes.length - 1];
  const showCodeRejected = codeError === null && lastCode && !lastCode.applicable;

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
              {lines.map((line) => (
                <li className="cart-line" key={line.id}>
                  {line.merchandise.product.images[0] ? (
                    <Image
                      className="cart-line__image"
                      src={line.merchandise.product.images[0].url}
                      alt={line.merchandise.product.images[0].altText}
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
                    <LineSavings line={line} />
                    <button
                      className="cart-line__remove"
                      type="button"
                      onClick={() => removeItem(line.id)}
                      disabled={isPending}
                    >
                      Remove
                    </button>
                  </div>
                  <LineGifts line={line} />
                </li>
              ))}
            </ul>

            {cart ? <FreeShippingMeter cart={cart} /> : null}

            <form className="discount-field" onSubmit={submitCode}>
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
              />
              <button
                className="button button--square"
                type="submit"
                disabled={isPending || code.trim() === ""}
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
            {showCodeRejected ? (
              <p className="discount-field__error" role="alert">
                “{lastCode.code}” isn’t a valid code
              </p>
            ) : null}

            <div className="cart-drawer__summary">
              {cart &&
              moneyToPence(cart.cost.subtotalAmount) !==
                moneyToPence(cart.cost.totalAmount) ? (
                <p className="cart-drawer__subtotal-row">
                  <span>Subtotal</span>
                  <s>{formatMoney(cart.cost.subtotalAmount)}</s>
                </p>
              ) : null}
              <p className="cart-drawer__total-row">
                <span>Total</span>
                <strong>{cart ? formatMoney(cart.cost.totalAmount) : "—"}</strong>
              </p>
              <p className="cart-drawer__shipping-note">
                Shipping and any launch discounts are finalised at checkout.
              </p>
              {COMMERCE_PROVIDER === "mock" ? (
                <>
                  <button className="button button--pill cart-drawer__checkout" type="button" disabled>
                    Checkout
                  </button>
                  <p className="cart-drawer__mock-note">
                    Checkout opens at launch — the store isn’t connected yet.
                  </p>
                </>
              ) : (
                <a
                  className="button button--pill cart-drawer__checkout"
                  href={cart?.checkoutUrl ?? "#"}
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
