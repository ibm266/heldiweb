"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGE_VERSION = "ink-blue-3";
const IMAGE_BASE = "/images/variants/ink-blue";

function imageSrc(path: string) {
  const file = path.replace(/^\/images\//, "");
  return `${IMAGE_BASE}/${file}?v=${IMAGE_VERSION}`;
}

export function SubpageNav() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="nav nav--subpage" aria-label="Main navigation">
      <a href="/" aria-label="Heldi home" className="nav-home">
        <Image
          className="heldi-logo heldi-logo--on-dark"
          src={imageSrc("/images/heldi-wordmark.png")}
          alt="Heldi"
          width={1934}
          height={609}
          sizes="140px"
        />
        <span className="nav-elephant-badge">
          <Image
            className="nav-elephant-logo"
            src={imageSrc("/images/elephant-large-transparent.png")}
            alt="Heldi"
            width={2048}
            height={2048}
          />
        </span>
      </a>
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
      <div
        className={`nav-links nav-links--subpage${menuOpen ? " is-open" : ""}`}
        id="nav-menu"
      >
        <a href="/#how" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="/truth" onClick={() => setMenuOpen(false)}>The truth</a>
        <a href="/our-story" onClick={() => setMenuOpen(false)}>Our story</a>
        <a href="/heldi-living" onClick={() => setMenuOpen(false)}>Heldi Living</a>
      </div>
    </nav>
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
    </footer>
  );
}
