"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track, updateConsent } from "@/lib/analytics";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";

// Centred consent modal, mounted site-wide from the root layout. Shows until
// the visitor answers once; answering anywhere (here or the cookies page
// panel) hides it via the consent change event. Escape and backdrop clicks
// dismiss without recording a choice, so it returns on the next full page
// load. Suppressed on /legal/* so the policy it links to stays readable.

const COPY = {
  title: "Cookies. Yes or no?",
  body: "Yes lets us remember your browser and see what is working on the site and what is not, so we can fix it. No means we just count visits anonymously, with nothing stored on your device. Your basket is saved either way.",
  accept: "Accept all",
  decline: "Only necessary",
  more: "How we measure, in detail"
} as const;

export function ConsentModal() {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const open = visible && !(pathname?.startsWith("/legal/") ?? false);

  // localStorage is client-only, so visibility is decided after mount; the
  // extra render is the cost of avoiding a hydration mismatch (same pattern
  // as the cart hydration).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!readConsent()) setVisible(true);
    function onConsentChange() {
      if (readConsent()) setVisible(false);
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Focus, Escape, Tab trap and scroll lock while open. Keyed on `open`, not
  // `visible`: navigating to /legal/* has to release the scroll lock.
  useEffect(() => {
    if (!open) return;

    track("consent_modal_shown");
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // No write: consent stays null, so the modal returns on the next
        // full page load.
        track("consent_modal_dismissed");
        setVisible(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href]"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function dismiss() {
    track("consent_modal_dismissed");
    setVisible(false);
  }

  function choose(analytics: boolean) {
    updateConsent({ statistics: true, analytics, marketing: false });
    setVisible(false);
  }

  return (
    <div className="consent-overlay" onClick={dismiss}>
      <div
        className="consent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-modal-title"
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="consent-modal__title" id="consent-modal-title">
          {COPY.title}
        </h2>
        <p className="consent-modal__body">{COPY.body}</p>
        <div className="consent-modal__actions">
          <button
            type="button"
            className="button button--pill"
            onClick={() => choose(true)}
          >
            {COPY.accept}
          </button>
          <button
            type="button"
            className="button button--pill button--outline"
            onClick={() => choose(false)}
          >
            {COPY.decline}
          </button>
        </div>
        <Link className="consent-modal__link" href="/legal/cookies">
          {COPY.more}
        </Link>
      </div>
    </div>
  );
}
