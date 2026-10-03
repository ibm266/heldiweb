"use client";

import { Analytics } from "@vercel/analytics/next";
import { vercelBeforeSend } from "@/lib/analytics";

// Vercel Web Analytics: cookieless page views, sent to Vercel's same-origin
// /_vercel/insights endpoint, so the CSP's 'self' already covers the script
// and the beacon. It loads its script after hydration, into <head>, so it
// does not hit the JSON-LD hydration problem PostHog has (PLAYBOOK.md §7).
// The root layout mounts this only on Vercel: anywhere else the package
// fetches a debug script from va.vercel-scripts.com, which the CSP blocks.
// The consent check and URL scrubbing live in lib/analytics.ts.
export function VercelAnalytics() {
  return <Analytics beforeSend={vercelBeforeSend} />;
}
