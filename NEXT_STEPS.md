# Heldi — Next steps to a fully functioning store

What's left between the current site (waitlist mode, mock cart) and taking real orders.
Ordered by priority. Tick things off as they land.

## 1. Connect Shopify (makes "buy" real)

The whole storefront UI is built and runs on a mock cart. To take money,
work through [docs/launch-runbook.md](docs/launch-runbook.md), which turns
this list into exact admin clicks, API scopes and verification steps:

- [x] Create the Shopify store; add the Khana product with four variants mirroring `lib/pricing.ts` — One pouch (£30, compare-at £35), The pair (£55, compare-at £70), The full table (£80, compare-at £105), Sample (£5). Each bundle is its own variant/SKU; the cart UI thinks in pouches and repacks the lines to the cheapest tier mix (`packPouches` in `lib/pricing.ts`), so a basket holds at most one line per tier — e.g. 4 pouches is 1 × The full table + 1 × One pouch. Done 16 Jul 2026; stock and variant weights still to set in admin
- [x] Create the ACHABETA, RISHTA and SHABASH discount codes (same rules, three codes so we can see who's buying — kids for parents, kids for uncle/aunty, aunties/uncles buying for themselves): 10% off, applies to the One pouch and The pair variants only (never The full table or the Sample), one discount per order, no stacking
- [x] Included items now ship as real £0.00 Shopify products the site adds to the cart automatically (`HELDI-JAR` "Refillable table jar", compare-at £8; `HELDI-DABBA` "Masala dabba", compare-at £15), so they show as FREE lines with a thumbnail at Shopify checkout. Capped at 2 jars + 1 dabba per order (`GIFT_CAPS` in `lib/pricing.ts`); compare-at prices mirror `EXTRA_VALUE_PENCE`. Created 19 Jul 2026. The pick-pack sheet still says what physically goes in each box (this reverses the earlier "part of the bundle variant, Shopify does not model them" decision)
- [ ] Publish the two gift products to the **Headless sales channel the Storefront token uses**, and remove them from the Online Store channel, so the cart can add them but no one can reach a buyable £0 page on the legacy theme. Until this is done the Storefront API answers "merchandise does not exist" for their variants (verified 19 Jul 2026), so gift lines will not appear in a real cart
- [ ] Untrack inventory on both gift variants (Track quantity off) or a 0-stock variant passes `cartLinesAdd` but blocks at checkout
- [ ] Set the gift variant SKUs (`HELDI-JAR`, `HELDI-DABBA`) and upload their images (`public/images/shop/gift-jar-gold.webp`, `public/images/shop/gift-masala-dabba.webp`) so checkout shows a thumbnail
- [ ] Shipping profile: free over £40, £3.55 Small Parcel (pouches), Royal Mail Tracked 48; Sample ships free (we absorb the £2.75 Large Letter rate)
- [ ] VAT: food supplements are standard-rated 20% in the UK — check tax settings
- [x] Storefront API access token (custom apps are gone since Jan 2026; see runbook Phase 2 for the Headless-channel route)
- [ ] Sort the domain split: `heldi.co.uk` currently serves an old Shopify theme store and checkout; move the apex to Vercel and point `shop.heldi.co.uk` at Shopify (runbook Phase 5)
- [ ] Set env vars on Vercel (`.env.local` done): `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`
- [ ] Set `PREVIEW_PASSWORD` on Vercel before any consultant review. The footer `/preview` link lets a reviewer flip one browser between waitlist and selling mode (unset = the page shows but nothing unlocks)
- [x] Implement the `/api/cart/*` route handlers and flesh out `lib/commerce/shopify-provider.ts` — done: handlers live in `app/api/cart/`, the server-side client and Cart mapping in `lib/commerce/shopify/client.ts`; they answer 503 until the env vars exist
- [x] Replace the placeholder GIDs in `lib/commerce/catalog.ts` with real Product/Variant IDs — done 16 Jul 2026, cart verified end to end against the live store (runbook Phase 4)
- [ ] Place a real test order end-to-end (card, shipping rate, confirmation email)
- [ ] Add the "Heldi PostHog" custom pixel in Shopify admin (Settings → Customer events) so checkout steps join the analytics funnel (runbook Phase 6.5)
- [ ] Register the orders/create webhook pointing at `/api/webhooks/shopify-orders` and set `SHOPIFY_WEBHOOK_SECRET` on Vercel (runbook Phase 6.5)
- [ ] Launch day: flip `NEXT_PUBLIC_COMMERCE_MODE=live`

Only `catalog.ts`, `shopify-provider.ts`, new `app/api/cart/` routes and env change at connect
time — nothing under `components/` or `app/shop/`.

## 2. Waitlist form → real email capture

`WaitlistForm` in `components/heldi-homepage.tsx` currently stores nothing — submissions are
lost. This is the most valuable fix while the site is pre-launch.

- [ ] Pick the platform (Klaviyo recommended — it also powers the post-launch email flows)
- [ ] Wire the form to it (API route or client SDK), with success/error states
- [ ] Confirmation email: launch prices and the jar-with-every-order promise

## 3. Legal pages (required before selling)

Drafts live in [docs/legal/](docs/legal/README.md) — solicitor review needed,
plus the `[TBC]` values (company number, VAT number, contact email).

- [x] Privacy policy — drafted (`docs/legal/privacy-policy.md`)
- [x] Terms & conditions — drafted (`docs/legal/terms-and-conditions.md`)
- [x] Returns / refund policy — drafted (`docs/legal/returns-refunds-policy.md`)
- [x] Shipping policy — drafted (`docs/legal/shipping-policy.md`)
- [x] Cookie policy — drafted (`docs/legal/cookie-policy.md`)
- [ ] Fill in `[TBC]`s and get solicitor review (now also covers the PostHog processor entry and the consent model)
- [x] Build the site pages (e.g. `/legal/*`) and link them in the footer — done: `app/legal/[slug]/page.tsx` renders the drafts, `FooterLegal` links them
- [ ] Add the policies in Shopify admin (Settings → Policies)
- [ ] Business address in the site footer
- [x] Cookie banner — shipped as the consent banner: anonymous counting by default (DUAA statistical purposes, opt-out on /legal/cookies), "Count me in" opts into full measurement + session replay

## 4. Launch-window polish

- [x] Analytics: PostHog EU behind `lib/analytics.ts` (same-origin `/ingest` proxy, hybrid consent: anonymous by default, replay on opt-in). Storefront events + checkout stitching are code-complete; the two launch-day Shopify admin steps (custom pixel, orders webhook) live in §1 and runbook Phase 6.5. Still needed once: create the PostHog EU project and set `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local` + Vercel
- [x] `og:image` social cards — done: every route (and every blog post) ships a branded card rendered at build from `components/og/card.tsx`
- [ ] Contact email in the footer (support has to go somewhere)
- [x] Styled 404 page — done: `app/not-found.tsx` in brand voice with pill-links home
- [x] Convert the ~2MB product PNGs in `public/images/shop/` to WebP. Done July 2026 as part of the wider asset pass (BRAND §15 state of play): shop/blog/variant PNGs are WebP, the intro film is 1.0MB, `/shop` thumbnails go through `next/image`, and the dormant video-hero film is local-only
- [ ] Favicon / app icons check
- [ ] /ways-to-use comic strips: "The pot" ships as the animated pouch-style test strip (clean art, HTML captions, one horizontal video for all viewports). Five methods remain (dahi, table jar, takeaway, freezer stash, rotis) — locked art direction and prompts in `fable/ways-to-use-strips/STYLE.md`

## 5. Post-launch (don't build yet)

- [ ] Klaviyo flows: abandoned checkout (3 emails) + post-purchase (4 emails) — full programme is specified in the heldi-email-writer skill
- [ ] Review collection — start ~50 orders in, not at launch. The capture side is built:
  `/review` (link-only, noindex) posts to `/api/reviews`, submissions land in the
  `heldi-dev` Supabase project (`public.reviews` + private `review-media` bucket,
  status pending; schema in `supabase/migrations/`). Still to do when it starts:
  Klaviyo review-request email linking `/review?stars=…&order=…` and a moderation
  pass (check order in Shopify, set rows to published)
- [ ] Subscriptions — deliberately out of scope for launch
- [ ] Reorder nudges, richer PDP content (video, press) as they become real

## Placeholders to revisit before launch

- Product photography is AI-generated (Higgsfield) — replace with real shots when the physical product exists
- Servings per pouch is 25 (300g ÷ 12g serving, per the nutrition declaration) — constant `SERVINGS_PER_POUCH` in `catalog.ts`
- "Khana" is a placeholder product name — one constant + copy strings to change
- All pricing (RRP, launch prices, gifting discount, shipping) lives in `lib/pricing.ts` — after the launch period, set each tier's launch price equal to its RRP there and mirror the change in Shopify admin
