"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";

// Page CTA that follows the launch flag: "Join waitlist" until selling is
// live, then "Shop now". Keeps every page's call to action in step with the
// commerce mode without each page needing its own logic.
export function WaitlistOrShopCta({
  className = "button button--pill"
}: {
  className?: string;
}) {
  const { mode } = useCart();
  return mode === "live" ? (
    <Link className={className} href="/shop">
      Shop now
    </Link>
  ) : (
    <Link className={className} href="/#join">
      Join waitlist
    </Link>
  );
}
