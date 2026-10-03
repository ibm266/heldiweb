"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

// Between 900 and 1139px the desktop nav cannot fit all seven links and the
// join pill on one row (it needs about 1,005px and gets 812 to 936), so these
// three fold into a "More" disclosure there; the CSS that swaps them is the
// "Nav More" block in globals.css. From 1140px up they show inline instead,
// from the desktop link lists in heldi-homepage.tsx and subpage-nav.tsx,
// which mark them .nav-links__foldable. Change a link here and change it in
// both of those lists too.
const FOLDED_NAV_LINKS = [
  { href: "/our-story", label: "Our story" },
  { href: "/inside-the-pouch", label: "Inside the pouch" },
  { href: "/faq", label: "FAQ" }
] as const;

export function NavMore() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function close() {
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    function onFocusIn(event: FocusEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div className="nav-more" ref={rootRef}>
      <button
        ref={toggleRef}
        className="nav-more__toggle"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        More
        <svg
          className="nav-more__chevron"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path
            d="M1.5 3.5 5 7l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="nav-more__panel" id={panelId} hidden={!open}>
        {FOLDED_NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
