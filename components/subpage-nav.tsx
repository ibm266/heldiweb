"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/cart/cart-icon";
import { useCart } from "@/components/cart/cart-context";
import { DevModeToggle } from "@/components/cart/dev-mode-toggle";
import { useNavScrollState } from "@/components/use-nav-scroll-hide";
import { useWaitlistPopup } from "@/components/waitlist-popup";

const IMAGE_VERSION = "ink-blue-4";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
}

/** @deprecated Tone no longer colours the nav shell — hero pad owns the colour. */
export type NavTone = "gold" | "cream" | "ink";

export function SubpageNav({ tone: _tone = "gold" }: { tone?: NavTone }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { hidden: scrollHidden } = useNavScrollState();
  const { mode } = useCart();
  const { open: openWaitlist } = useWaitlistPopup();
  const navHidden = scrollHidden && !menuOpen;

  useEffect(() => {
    if (!menuOpen) return;

    function closeMenu() {
      setMenuOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menuOpen]);

  return (
    <div className={`nav-shell${navHidden ? " nav-shell--hidden" : ""}`}>
      <div className="nav-menu-toggle">
        <button
          className="nav-burger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="nav-burger-bar" aria-hidden="true" />
          <span className="nav-burger-bar" aria-hidden="true" />
          <span className="nav-burger-bar" aria-hidden="true" />
        </button>
      </div>
      <nav className="nav nav--subpage" aria-label="Main navigation">
        <Link href="/" aria-label="Heldi home" className="nav-home">
          <span className="nav-brand">
            <Image
              className="nav-elephant-logo nav-elephant-logo--face-in"
              src={imageSrc("/images/elephant-large-transparent.webp")}
              alt=""
              width={2048}
              height={2048}
              sizes="32px"
            />
            <Image
              className="heldi-logo"
              src={imageSrc("/images/heldi-wordmark.webp")}
              alt="Heldi"
              width={1934}
              height={609}
              sizes="140px"
            />
            <Image
              className="nav-elephant-logo"
              src={imageSrc("/images/elephant-large-transparent.webp")}
              alt=""
              width={2048}
              height={2048}
              sizes="32px"
            />
          </span>
        </Link>
        <div className="nav-links nav-links--desktop">
          <Link href="/#how">How it works</Link>
          <Link href="/truth">The truth</Link>
          <Link href="/our-story">Our story</Link>
          <Link href="/heldi-living">Heldi Living</Link>
          <Link href="/inside-the-pouch">Inside the pouch</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/shop">Shop</Link>
          {mode !== "live" ? (
            <button
              className="nav-join"
              type="button"
              onClick={() => openWaitlist("popup-nav")}
            >
              Join waitlist
            </button>
          ) : null}
          <DevModeToggle variant="menu" />
        </div>
        <div
          className={`nav-links nav-links--mobile${menuOpen ? " is-open" : ""}`}
          id="nav-menu"
        >
          <Link href="/#how" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link href="/truth" onClick={() => setMenuOpen(false)}>The truth</Link>
          <Link href="/our-story" onClick={() => setMenuOpen(false)}>Our story</Link>
          <Link href="/heldi-living" onClick={() => setMenuOpen(false)}>Heldi Living</Link>
          <Link href="/inside-the-pouch" onClick={() => setMenuOpen(false)}>Inside the pouch</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          {mode !== "live" ? (
            <button
              className="nav-links__cta"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openWaitlist("popup-menu");
              }}
            >
              Join waitlist
            </button>
          ) : null}
          <DevModeToggle variant="menu" />
        </div>
      </nav>
      <div className="nav-cart">
        <CartIcon />
      </div>
    </div>
  );
}

export function FooterLegal() {
  // The shipping policy lists delivery rates, so its page and this link sit
  // behind the live flag with every other price on the site.
  const { mode } = useCart();
  return (
    <>
      <nav className="footer-legal" aria-label="Legal">
        <Link href="/faq">FAQ</Link>
        <Link href="/ways-to-use">Ways to use</Link>
        <Link href="/inside-the-pouch">Inside the pouch</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/returns">Returns</Link>
        {mode === "live" ? <Link href="/legal/shipping">Shipping</Link> : null}
        <Link href="/legal/cookies">Cookies</Link>
        <Link href="/legal/cookies#analytics-choices">Analytics choices</Link>
        <Link href="/preview">Preview</Link>
        <a href="mailto:info@heldi.co.uk">info@heldi.co.uk</a>
      </nav>
      <span className="footer-company">
        Heldi LTD · 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ
      </span>
    </>
  );
}

export function SubpageFooter() {
  return (
    <footer>
      <Image
        className="heldi-logo heldi-logo--footer heldi-logo--on-dark"
        src={imageSrc("/images/heldi-wordmark.webp")}
        alt="Heldi"
        width={1934}
        height={609}
        sizes="120px"
      />
      <span>© 2026 Heldi · Made in the UK · They shake, we stir</span>
      <FooterLegal />
    </footer>
  );
}
