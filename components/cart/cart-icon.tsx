"use client";

import { cartItemCount } from "@/lib/commerce/catalog";
import { useCart } from "./cart-context";

export function CartIcon({ className = "" }: { className?: string }) {
  const { cart, mode, openCart } = useCart();

  if (mode !== "live") return null;

  // Pouches count one by one (a full table is 3), matching the drawer's
  // pouch stepper rather than the underlying bundle lines.
  const count = cartItemCount(cart?.lines ?? []);

  return (
    <button
      className={`cart-icon${className ? ` ${className}` : ""}`}
      type="button"
      onClick={openCart}
      aria-label={`Open basket${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
      {count > 0 ? (
        <span className="cart-icon__badge" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </button>
  );
}
