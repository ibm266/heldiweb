"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// Initialises PostHog after hydration. It must not run earlier: posthog-js
// injects its config script next to the document's first <script>, which is
// a React-managed JSON-LD tag, and pre-hydration injection makes React see a
// mismatched tree. Mounted BEFORE {children} in the root layout so this
// effect flushes ahead of any page effect that calls track().
export function AnalyticsBoot() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
