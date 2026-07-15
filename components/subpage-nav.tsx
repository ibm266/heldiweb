"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/cart/cart-icon";
import { DevModeToggle } from "@/components/cart/dev-mode-toggle";
import { useNavScrollState } from "@/components/use-nav-scroll-hide";

const IMAGE_VERSION = "ink-blue-3";
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
        <a href="/" aria-label="Heldi home" className="nav-home">
          <span className="nav-brand">
            <Image
              className="nav-elephant-logo nav-elephant-logo--face-in"
              src={imageSrc("/images/elephant-large-transparent.png")}
              alt=""
              width={2048}
              height={2048}
            />
            <Image
              className="heldi-logo"
              src={imageSrc("/images/heldi-wordmark.png")}
              alt="Heldi"
              width={1934}
              height={609}
              sizes="140px"
            />
            <Image
              className="nav-elephant-logo"
              src={imageSrc("/images/elephant-large-transparent.png")}
              alt=""
              width={2048}
              height={2048}
            />
          </span>
        </a>
        <div className="nav-links nav-links--desktop">
          <a href="/#how">How it works</a>
          <a href="/truth">The truth</a>
          <a href="/our-story">Our story</a>
          <a href="/heldi-living">Heldi Living</a>
          <a href="/inside-the-pouch">Inside the pouch</a>
          <a href="/faq">FAQ</a>
          <a href="/shop">Shop</a>
          <DevModeToggle variant="menu" />
        </div>
        <div
          className={`nav-links nav-links--mobile${menuOpen ? " is-open" : ""}`}
          id="nav-menu"
        >
          <a href="/#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="/truth" onClick={() => setMenuOpen(false)}>The truth</a>
          <a href="/our-story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="/heldi-living" onClick={() => setMenuOpen(false)}>Heldi Living</a>
          <a href="/inside-the-pouch" onClick={() => setMenuOpen(false)}>Inside the pouch</a>
          <a href="/faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="/shop" onClick={() => setMenuOpen(false)}>Shop</a>
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
  return (
    <>
      <nav className="footer-legal" aria-label="Legal">
        <a href="/faq">FAQ</a>
        <a href="/inside-the-pouch">Inside the pouch</a>
        <a href="/legal/terms">Terms</a>
        <a href="/legal/privacy">Privacy</a>
        <a href="/legal/returns">Returns</a>
        <a href="/legal/shipping">Shipping</a>
        <a href="/legal/cookies">Cookies</a>
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
        src={imageSrc("/images/heldi-wordmark.png")}
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
