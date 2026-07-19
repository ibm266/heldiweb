"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { updateConsent } from "@/lib/analytics";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";

// Fixed-bottom consent card, mounted site-wide from the root layout. Shows
// until the visitor answers once; answering anywhere (here or the cookies
// page panel) hides it via the consent change event. Non-modal by design:
// browsing continues under anonymous counting until a choice is made.

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

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

  if (!visible) return null;

  function choose(analytics: boolean) {
    updateConsent({ statistics: true, analytics, marketing: false });
    setVisible(false);
  }

  return (
    <aside className="consent-banner" role="region" aria-label="Analytics choices">
      <p className="consent-banner__title">A quick word about counting.</p>
      <p className="consent-banner__body">
        Right now we just count visits, no cookies. Say yes and we can remember
        you between visits.
      </p>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="button button--pill"
          onClick={() => choose(true)}
        >
          Count me in
        </button>
        <button
          type="button"
          className="button button--pill button--outline"
          onClick={() => choose(false)}
        >
          Just the basics
        </button>
      </div>
      <Link className="consent-banner__link" href="/legal/cookies">
        How we measure
      </Link>
    </aside>
  );
}
