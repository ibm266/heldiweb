"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistOffer } from "@/components/waitlist-offer-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";

// Page CTA that follows the launch flag: "Join waitlist" until selling is
// live, then "Shop now". Keeps every page's call to action in step with the
// commerce mode without each page needing its own logic. In waitlist mode it
// opens the site-wide popup so the visitor signs up in place, rather than
// being sent to the homepage form.
//
// In waitlist mode it also says why to join: the waitlist offer, as one line
// under the button, in the same words as every other surface
// (lib/waitlist-offer.ts, BRAND.md §11.9). Pass `perk={false}` where the button
// sits in a row of links and a sentence has no place, such as the nav at the
// foot of a blog post.
export function WaitlistOrShopCta({
  className = "button button--pill",
  perk = true
}: {
  className?: string;
  perk?: boolean;
}) {
  const { mode } = useCart();
  const { open } = useWaitlistPopup();
  const offer = useWaitlistOffer();

  if (mode === "live") {
    return (
      <Link className={className} href="/shop">
        Shop now
      </Link>
    );
  }

  const button = (
    <button
      className={className}
      type="button"
      data-floating-cta-suppress
      onClick={() => open("popup-page-cta")}
    >
      Join waitlist
    </button>
  );

  if (!perk) return button;

  return (
    <div className="waitlist-cta">
      {button}
      <p className="waitlist-cta-perk">{offer.sentence}</p>
    </div>
  );
}
