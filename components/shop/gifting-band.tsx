"use client";

import Link from "next/link";
import { CopyHighlight } from "@/components/copy-highlight";
import { GIFTING } from "@/lib/pricing";
import { GiftingCodePicker } from "./gifting-code-picker";

// Full-width ink band giving the gifting discount its own spotlight. The
// who's-buying picker swaps between the two codes (ACHABETA for the kids,
// SHABASH for the aunties and uncles) and copies the chosen one.
// `showShopCta` adds a "Shop now" button for placements away from the shop
// page.
export function GiftingBand({ showShopCta = false }: { showShopCta?: boolean }) {
  return (
    <section className="section section--ink gifting" id="gifting">
      <div className="gifting__copy section-copy section-copy--dark">
        <h2>
          We can&apos;t charge{" "}
          <CopyHighlight>aunties and uncles</CopyHighlight> full price.
          <br />
          We&apos;d{" "}
          <CopyHighlight>never hear the end of it</CopyHighlight>.
        </h2>
        <p>
          Buying Heldi for your mum, dad, or the auntie who fed you every
          Sunday? Or are you the auntie or uncle, here for your own dal?
          Either way it&apos;s {GIFTING.percent}% off. Tell us who&apos;s
          buying, copy your code, and use it at checkout. It&apos;s our way
          of saying thank you, whether you&apos;re the one who sorts things
          out for the family or the one who&apos;s been doing it for decades.
        </p>
        <p>
          We can&apos;t check, and we&apos;re not brave enough to ask the
          aunty WhatsApp group. We trust you :)
        </p>
        <GiftingCodePicker defaultAudience="beta" surface="band" />
        <p className="gifting__small">
          {GIFTING.percent}% off single pouches and 2-packs, whether
          it&apos;s a gift or for your own kitchen. One code per order.
          Applied at checkout.
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
