"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";
import { GIFTING } from "@/lib/pricing";

// Full-width ink band giving the gifting discount its own spotlight. The
// code chip copies ACHABETA to the clipboard and briefly confirms.
// `showShopCta` adds a "Shop now" button for placements away from the shop
// page.
export function GiftingBand({ showShopCta = false }: { showShopCta?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    []
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(GIFTING.code);
    } catch {
      // Clipboard can be unavailable (permissions, http); the visible code
      // itself is still there to type out.
    }
    setCopied(true);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }

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
          Sunday? Use code {GIFTING.code} at checkout for {GIFTING.percent}%
          off. It&apos;s our way of saying thank you for being the one who
          sorts things out for the family.
        </p>
        <p>We trust you :)</p>
        <button
          type="button"
          className="gifting__chip"
          onClick={copyCode}
          aria-label={`Copy discount code ${GIFTING.code}`}
        >
          <span aria-live="polite">
            {copied ? "Copied. Good beta." : GIFTING.code}
          </span>
        </button>
        <p className="gifting__small">
          {GIFTING.percent}% off single pouches and 2-packs when gifting to
          family. One code per order. Applied at checkout.
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
