// Client-side analytics. Components call track(); events fan out to
// window.dataLayer (kept so any future tag manager can consume them without
// code changes) and, once initAnalytics() has run, to PostHog. PostHog is
// reached only through the same-origin /ingest proxy (next.config.ts), which
// keeps the CSP at 'self' and out of ad-blocker lists. What runs is decided
// by the consent record (lib/consent.ts):
//   statistics off  - PostHog never initialises; dataLayer only.
//   statistics only - anonymous: memory persistence, no cookies, the id
//                     rotates per page load (DUAA statistical posture).
//   analytics on    - persistent id + session replay + heatmaps.

import posthog from "posthog-js";
import {
  captureFirstTouch,
  clearPersistedFirstTouch,
  firstTouchSuperProps,
  promoteFirstTouch
} from "./attribution";
import {
  hasConsent,
  writeConsent,
  type ConsentChoices,
  type ConsentRecord
} from "./consent";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

let initialised = false;

export function track(event: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
  if (initialised) posthog.capture(event, props);
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props);
  }
}

// Called from <AnalyticsBoot /> right after hydration (pre-hydration init
// breaks hydration: posthog-js injects scripts into the React-managed DOM),
// and again by updateConsent() if measurement is switched on mid-visit.
// Idempotent; a missing key (CI, fresh clones) degrades to dataLayer-only.
export function initAnalytics(): void {
  if (typeof window === "undefined" || initialised) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !hasConsent("statistics")) return;

  captureFirstTouch();
  const identified = hasConsent("analytics");
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    capture_heatmaps: identified,
    // These would need external scripts we refuse to load; declining them
    // outright saves the futile load attempts. (Web vitals could be bundled
    // like the recorder if ever wanted.)
    disable_surveys: true,
    capture_dead_clicks: false,
    capture_performance: { web_vitals: false },
    persistence: identified ? "localStorage+cookie" : "memory",
    // Replay never starts on its own; consent flips it on below.
    disable_session_recording: true,
    // posthog-js normally injects <script> tags (remote config, recorder)
    // next to the document's first script, which here is a React-managed
    // JSON-LD tag: the injection corrupts hydration. So no external loading;
    // the recorder ships as our own lazy chunk (startReplay below).
    disable_external_dependency_loading: true
  });
  posthog.register(firstTouchSuperProps());
  initialised = true;
  if (identified) void startReplay();
}

// The session-replay recorder is ~110KB gzipped, so it loads as a lazy
// same-origin chunk only once someone has opted in. It must be the
// posthog-recorder entrypoint: the SDK's recording module waits for the
// initSessionRecording extension, which the legacy dist/recorder never
// registers.
async function startReplay(): Promise<void> {
  try {
    await import("posthog-js/dist/posthog-recorder");
    posthog.startSessionRecording();
  } catch {
    // Replay is an enhancement; never let it break the page.
  }
}

// Single entry point for the banner and the choices panel: persists the
// record, reconfigures PostHog, and emits consent_updated on whichever side
// of the change an event can still be sent.
export function updateConsent(choices: ConsentChoices): void {
  if (!choices.statistics) track("consent_updated", { ...choices });
  const record = writeConsent(choices);
  applyConsentToPosthog(record);
  if (choices.statistics) track("consent_updated", { ...choices });
}

function applyConsentToPosthog(record: ConsentRecord): void {
  if (typeof window === "undefined") return;

  if (!record.statistics) {
    clearPersistedFirstTouch();
    if (initialised) {
      posthog.stopSessionRecording();
      posthog.opt_out_capturing();
      posthog.reset();
    }
    scrubPosthogStorage();
    return;
  }

  if (!initialised) {
    initAnalytics();
    if (!initialised) return;
  } else if (posthog.has_opted_out_capturing()) {
    posthog.opt_in_capturing();
  }

  if (record.analytics) {
    // Switching persistence keeps the current distinct_id, so the
    // pre-consent part of this visit joins the persistent person.
    posthog.set_config({
      persistence: "localStorage+cookie",
      capture_heatmaps: true
    });
    promoteFirstTouch();
    void startReplay();
  } else {
    posthog.stopSessionRecording();
    // reset() while the persisted store is still attached, so it gets
    // cleared; only then swap to memory.
    posthog.reset();
    posthog.set_config({ persistence: "memory" });
    clearPersistedFirstTouch();
    scrubPosthogStorage();
  }
}

// Belt and braces for downgrades: whatever posthog's own reset leaves
// behind, no ph_* storage may survive a withdrawal of consent.
function scrubPosthogStorage(): void {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("ph_")) window.localStorage.removeItem(key);
    }
    for (const entry of document.cookie.split(";")) {
      const name = entry.split("=")[0]?.trim();
      if (name?.startsWith("ph_")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  } catch {
    // Best-effort.
  }
}

// Read by the checkout handoff to stitch the Shopify-hosted checkout to this
// visit; null while PostHog is not running (no key, or full opt-out).
export function analyticsIds(): { distinctId: string; sessionId: string } | null {
  if (!initialised) return null;
  return {
    distinctId: posthog.get_distinct_id(),
    sessionId: posthog.get_session_id()
  };
}
