"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CopyHighlight } from "@/components/copy-highlight";
import { GIFTING } from "@/lib/pricing";
import { GiftingCodePicker } from "./gifting-code-picker";

// Full-width ink band giving the gifting discount its own spotlight. The
// who's-buying picker swaps between the three codes (ACHABETA for the kids,
// RISHTA for uncle and aunty, SHABASH for the aunties and uncles) and copies
// the chosen one. `showShopCta` adds a "Shop now" button for placements
// away from the shop page. Discount codes stay out of sight until the shop
// is live, so the whole band sits behind the mode flag.
export function GiftingBand({ showShopCta = false }: { showShopCta?: boolean }) {
  const { mode } = useCart();
  if (mode !== "live") return null;
  return (
    <section className="section section--ink gifting" id="gifting">
      <div className="gifting__copy section-copy section-copy--dark">
        <h2>
          We can&apos;t charge{" "}
          <CopyHighlight>aunties and uncles</CopyHighlight> full price.
          <br />
          We&apos;d{" "}
          <CopyHighlight>never hear the end of it.</CopyHighlight>
        </h2>
        <p>
          Choose who you&apos;re buying for, then copy their code for{" "}
          {GIFTING.percent}% off every pouch in the order.
        </p>
        <p>
          Use it for a family gift or for your own kitchen. Parents, aunties
          and uncles all count.
        </p>
        <GiftingCodePicker defaultAudience="beta" surface="band" />
        <p className="gifting__small">
          One code per order, one use each. Applied at checkout.
        </p>
        {showShopCta ? (
          <Link className="button button--pill gifting__cta" href="/shop">
            Shop now
          </Link>
        ) : null}
      </div>
    </section>
  );
}
