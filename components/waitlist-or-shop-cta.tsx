"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";

// Page CTA that follows the launch flag: "Join waitlist" until selling is
// live, then "Shop now". Keeps every page's call to action in step with the
// commerce mode without each page needing its own logic. In waitlist mode it
// opens the site-wide popup so the visitor signs up in place, rather than
// being sent to the homepage form.
export function WaitlistOrShopCta({
  className = "button button--pill"
}: {
  className?: string;
}) {
  const { mode } = useCart();
  const { open } = useWaitlistPopup();

  if (mode === "live") {
    return (
      <Link className={className} href="/shop">
        Shop now
      </Link>
    );
  }

  return (
    <button
      className={className}
      type="button"
      data-floating-cta-suppress
      onClick={() => open("popup-page-cta")}
    >
      Join waitlist
    </button>
  );
}
