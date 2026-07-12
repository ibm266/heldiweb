# Heldi Front-End & D2C Launch Plan

## Context
The Heldi homepage (Next.js, [components/heldi-homepage.tsx](components/heldi-homepage.tsx)) is a pre-launch marketing shell that will become the front end of a headless Shopify store. An audit found strong design/copy craft but gaps in conversion plumbing, shareability, intro performance, and content transparency. This plan sequences all audit fixes plus launch nice-to-haves for a new UK D2C food-supplement brand.

## Phase 1 — Stop the bleeding (do now, ~1 day)
1. **Wire the waitlist to Klaviyo**
   - New `app/api/waitlist/route.ts` calling Klaviyo Subscribe Profiles API with private key from `.env.local`; double opt-in on.
   - Update `WaitlistForm` (heldi-homepage.tsx:348-415): POST to the route; add loading + error states; persist `joined` in `localStorage`; add one-line consent copy under input.
2. **Shareability + SEO plumbing**
   - `app/icon.png` + `app/apple-icon.png` (elephant badge), `app/opengraph-image.png` (1200×630 pouch-on-gold).
   - Extend `metadata` in [app/layout.tsx](app/layout.tsx) with `openGraph` + `twitter`.
   - Render `FAQPage` + `Organization` JSON-LD from the existing `FAQS` array.
3. **Analytics**: Plausible or Fathom snippet in layout.tsx (no cookie banner needed); Klaviyo onsite snippet.

## Phase 2 — Intro & performance (~1 day)
4. Gate elephant intro to first visit via `sessionStorage`; reuse the existing reduced-motion skip path (heroReveal effect, heldi-homepage.tsx:484-597). Add a "Skip" button calling `finishReveal`.
5. Replace JS chroma-key canvas (heldi-homepage.tsx:34-98, 512-573) with transparent video: `elephant-run-alpha.webm` (VP9) + HEVC-alpha mp4 fallback for Safari. Delete the canvas pipeline.
6. Asset purge: delete unused `heldi-hero-v3/v4.mp4` (46MB), re-export 5.7MB poster as ~100KB JPEG, remove duplicate `public/images/originals/`, move `hero-video/` and `stir-gallery-video/` working dirs out of deploy path (`.gitignore`).
7. Small craft fixes: FAQ open/close animation via `grid-template-rows 0fr→1fr`; carousel dots drop `role="tab"` for `aria-current`; footer text to `--dark-muted`.

## Phase 3 — Content depth (pre-launch)
8. "What's inside" section: ingredient list, per-tbsp nutrition, lactose/vegetarian substantiation.
9. Founder story block above final CTA (payoff for the nani hook).
10. **Verify the 10g-protein-per-tbsp figure** by weighing the actual blend/spoon; every number on the page inherits from it.
11. Remaining stir-gallery videos (chana masala, raita, kadhi already in public/videos/stir-gallery — wire into `DISHES` in [components/stir-gallery.tsx](components/stir-gallery.tsx)).

## Phase 4 — Headless Shopify integration (launch)
12. `lib/shopify.ts`: thin typed Storefront API GraphQL client (no Hydrogen).
13. Routes: `/products/[handle]`, `/cart`; homepage stays static/ISR.
14. Shopify hosted checkout via Cart API `checkoutUrl` redirect (outsources payments/VAT/compliance surface).
15. Product facts (nutrition, serving size, claims) in Shopify metafields; site renders claims from that single source.
16. Launch swap: `WaitlistForm`/`#join` CTAs → "Buy now" (single chokepoint already exists).

## Phase 5 — UK D2C nice-to-haves (post-launch, prioritized)
- **Reviews**: Judge.me or Okendo + Trustpilot; seed via launch-list follow-up email.
- **Klaviyo flows**: abandoned checkout + post-purchase (already scoped in brand skills).
- **Referral**: simple "give a sample, get £5" (ReferralCandy or Shopify referrals) — desi word-of-mouth is the channel.
- **Sample sachets / trial size** as low-risk first purchase; also the referral currency.
- **Blog + AI-SEO**: "honest truth" educational pieces (protein in Indian food) targeting AI-search citations; FAQ schema groundwork from Phase 1 feeds this.
- **Delivery clarity**: Royal Mail tracked, cutoff times, free-shipping threshold on PDP + announcement bar.
- **Post-purchase survey** ("how did you hear about us") — KnoCommerce or a Klaviyo form.
- **Festival moments**: Diwali/Raksha Bandhan gifting bundles (gold jar already exists as an asset).
- **WhatsApp broadcast channel** for launch-day + recipes (audience-native).
- **Payment options**: PayPal + Shop Pay at minimum; consider Klarna/Clearpay later (fits ~£25+ AOV).
- **Press/founder kit page**: photos, story, product shots for journalists/creators.
- Subscriptions: deliberately deferred (per brand strategy) until repeat-rate data exists.

## Compliance (tracked, not designed here — user confirmed it's coming)
Privacy policy + GDPR consent, cookie policy (only if GA4/Meta pixel added), T&Cs, company name/address in footer, UK food-supplement labelling rules, and required nutrition/claims wording on pack and site.

## Verification
- Waitlist: submit a real email → appears in Klaviyo list; error state on network failure; success persists on reload.
- Meta: share URL in WhatsApp → card renders; favicon in tab; validate JSON-LD with Google Rich Results test.
- Intro: first visit plays with skip button; reload skips; CPU profile shows no canvas work; Safari + Chrome alpha video both transparent.
- Payload: `du -sh public/` before/after; Lighthouse mobile run.
- Shopify: test order end-to-end through hosted checkout in Shopify test mode.