// Showcase mode: renders unconfirmed placeholder content that must never
// reach a customer.
//
// Some sections are designed before the real data exists (the review gallery
// and the IPL leaderboard were built against invented reviewers so the layout
// could be judged). Publishing invented reviews is a banned practice under the
// DMCC Act 2024, enforceable by the CMA, so none of it may appear on the
// public site. Deleting it would lose work that is still needed, so instead it
// is gated here.
//
// This is a build-time flag, not a cookie, on purpose. A cookie check has to
// call cookies(), which opts the whole route out of static rendering; the
// homepage and /shop are the two pages least able to afford that (lib/legal.ts
// takes the cookie route precisely because it only costs one rarely-hit slug).
// A NEXT_PUBLIC_ value is inlined at build time instead, so the gated branch is
// dead code in a production build and the pages stay static.
//
// Where it is on:
//   local dev            NEXT_PUBLIC_SHOWCASE_MODE=on in .env.local
//   the showcase deploy  the same var set on a Vercel Preview environment,
//                        which gives a stable link to share with a reviewer
//   production           unset. Always. Nothing gated by this may ever ship.
//
// Anything hidden behind this flag is a launch blocker in
// docs/go-live-checklist.md: it has to be replaced with real data or deleted,
// not merely left switched off.

export const SHOWCASE_MODE = process.env.NEXT_PUBLIC_SHOWCASE_MODE === "on";
