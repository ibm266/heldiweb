# Heldi — Next steps to a fully functioning store

What's left between the current site (waitlist mode, mock cart) and taking real orders.
Ordered by priority. Tick things off as they land.

## 1. Connect Shopify (makes "buy" real)

The whole storefront UI is built and runs on a mock cart. To take money,
work through [docs/launch-runbook.md](docs/launch-runbook.md), which turns
this list into exact admin clicks, API scopes and verification steps:

- [ ] Create the Shopify store; add the Khana product with four variants mirroring `lib/pricing.ts` — One pouch (£30, compare-at £35), The pair (£55, compare-at £70), The full table (£80, compare-at £105), Sample Trio (£5). Each bundle is its own variant/SKU; the cart UI thinks in pouches and repacks the lines to the cheapest tier mix (`packPouches` in `lib/pricing.ts`), so a basket holds at most one line per tier — e.g. 4 pouches is 1 × The full table + 1 × One pouch
- [ ] Create the ACHABETA and SHABASH discount codes (same rules, two codes so we can see who's buying — kids gifting vs. aunties/uncles buying for themselves): 10% off, applies to the One pouch and The pair variants only (never The full table or the Sample Trio), one discount per order, no stacking
- [ ] Configure the included items (a refillable table jar with every pouch, masala dabba with the 3-pack) as zero-priced line items added automatically
- [ ] Shipping profile: free over £40, £3.55 Small Parcel (pouches), Royal Mail Tracked 48; Sample Trio ships free (we absorb the £2.75 Large Letter rate)
- [ ] VAT: food supplements are standard-rated 20% in the UK — check tax settings
- [ ] Create a custom app → Storefront API access token
- [ ] Point a subdomain (e.g. `shop.heldi.co.uk`) at Shopify so checkout shows the Heldi domain
- [ ] Set env vars on Vercel + `.env.local`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`
- [x] Implement the `/api/cart/*` route handlers and flesh out `lib/commerce/shopify-provider.ts` — done: handlers live in `app/api/cart/`, the server-side client and Cart mapping in `lib/commerce/shopify/client.ts`; they answer 503 until the env vars exist
- [ ] Replace the placeholder GIDs in `lib/commerce/catalog.ts` with real Product/Variant IDs
- [ ] Place a real test order end-to-end (card, shipping rate, confirmation email)
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
- [ ] Fill in `[TBC]`s and get solicitor review
- [ ] Build the site pages (e.g. `/legal/*`) and link them in the footer
- [ ] Add the policies in Shopify admin (Settings → Policies)
- [ ] Business address in the site footer
- [ ] Cookie banner — only needed once analytics with cookies is added (see below)

## 4. Launch-window polish

- [ ] Analytics: Plausible/Fathom (cookieless, no banner) or GA4 (needs consent banner) + Shopify conversion tracking
- [x] `og:image` social cards — done: every route (and every blog post) ships a branded card rendered at build from `components/og/card.tsx`
- [ ] Contact email in the footer (support has to go somewhere)
- [x] Styled 404 page — done: `app/not-found.tsx` in brand voice with pill-links home
- [ ] Convert the ~2MB product PNGs in `public/images/shop/` to WebP (~halves page weight)
- [ ] Favicon / app icons check

## 5. Post-launch (don't build yet)

- [ ] Klaviyo flows: abandoned checkout (3 emails) + post-purchase (4 emails) — full programme is specified in the heldi-email-writer skill
- [ ] Review collection — start ~50 orders in, not at launch
- [ ] Subscriptions — deliberately out of scope for launch
- [ ] Reorder nudges, richer PDP content (video, press) as they become real

## Placeholders to revisit before launch

- Product photography is AI-generated (Higgsfield) — replace with real shots when the physical product exists
- Servings per pouch is 25 (300g ÷ 12g serving, per the nutrition declaration) — constant `SERVINGS_PER_POUCH` in `catalog.ts`
- "Khana" is a placeholder product name — one constant + copy strings to change
- All pricing (RRP, launch prices, gifting discount, shipping) lives in `lib/pricing.ts` — after the launch period, set each tier's launch price equal to its RRP there and mirror the change in Shopify admin
