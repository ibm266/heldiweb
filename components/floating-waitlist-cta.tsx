"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { useWaitlistPopup } from "@/components/waitlist-popup";

// Mobile-only floating "Join waitlist" button, shown site-wide in waitlist
// mode so a visitor can sign up from wherever they are. Opens the popup.
// Hidden while the popup is open, on utility pages, and whenever a section
// that carries its own join CTA is in view. Those sections are tagged
// [data-floating-cta-suppress] (hero, footer CTA, menus, truth, page CTA
// bands, the shop buy box) so the floating button never doubles up with an
// in-place one.
const HIDDEN_PREFIXES = ["/legal", "/preview", "/review"];

export function FloatingWaitlistCta() {
  const { mode } = useCart();
  const { open, isOpen } = useWaitlistPopup();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [suppressed, setSuppressed] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");
    function sync() {
      setIsMobile(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onUtilityPage = HIDDEN_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );
  const active = mode !== "live" && isMobile && !onUtilityPage;

  useEffect(() => {
    if (!active) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-floating-cta-suppress]")
    );

    // Suppress the floating button whenever a section carrying its own join
    // CTA sits within the middle of the viewport, so the two never double up.
    const evaluate = () => {
      const margin = window.innerHeight * 0.15;
      const anyInView = targets.some((target) => {
        const rect = target.getBoundingClientRect();
        return rect.top < window.innerHeight - margin && rect.bottom > margin;
      });
      setSuppressed(anyInView);
    };

    // A timeout, not rAF: the first evaluation must run even before the next
    // paint so the button appears without waiting on a frame.
    const initial = window.setTimeout(evaluate, 0);
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);

    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [active, pathname]);

  if (!active || suppressed || isOpen) return null;

  return (
    <button
      className="floating-cta"
      type="button"
      onClick={() => open("popup-floating")}
    >
      Join waitlist
    </button>
  );
}
