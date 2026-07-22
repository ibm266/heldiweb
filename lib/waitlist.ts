// Shared contract between the waitlist form (heldi-homepage.tsx) and its API
// route (app/api/waitlist/route.ts). The consent sentence lives here so the
// copy shown on screen and the copy recorded against the Supabase row can
// never drift apart: the stored sentence is the evidence of what was agreed.

export const WAITLIST_CONSENT_COPY =
  "Also send me Heldi Living each week: honest protein reading, recipes and the occasional offer.";

export const WAITLIST_EMAIL_MAX = 254;

// Deliberately loose (same shape the review form accepts): the real proof of
// an address is a delivered email, not a regex.
export const WAITLIST_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistPayload = {
  email: string;
  marketingOptIn: boolean;
  /** Which form captured them: hero-email, footer-email, ... */
  placement: string;
  /** Honeypot. Humans never see the field; a filled value means a bot. */
  website?: string;
};
