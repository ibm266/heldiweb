# Heldi — Next steps to a fully functioning store

What's left between the current site (waitlist mode, mock cart) and taking real orders.
Ordered by priority. Tick things off as they land.

## 1. Connect Shopify (makes "buy" real)

The whole storefront UI is built and runs on a mock cart. To take money:

- [ ] Create the Shopify store; add the Khana product with two variants (300g pouch / Sample sachet) at £35 / £5
- [ ] Configure quantity-break automatic discounts in Shopify admin: 2 pouches → £65, 3 pouches → £95 (the site only *displays* these; Shopify is the source of truth for what's charged)
- [ ] Configure the free-gift tiers (gold jar / silver jar / masala dabba) — as free-gift automatic discounts or zero-priced line items added by discount
- [ ] Shipping profile: free over £40, £2.75 Large Letter (sample), £3.55 Small Parcel (pouches), Royal Mail Tracked 48
- [ ] VAT: food supplements are standard-rated 20% in the UK — check tax settings
- [ ] Create a custom app → Storefront API access token
- [ ] Point a subdomain (e.g. `shop.heldi.co.uk`) at Shopify so checkout shows the Heldi domain
- [ ] Set env vars on Vercel + `.env.local`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`
- [ ] Implement the `/api/cart/*` route handlers and flesh out `lib/commerce/shopify-provider.ts` (the GraphQL documents are ready in `lib/commerce/shopify/queries.ts`)
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
- [ ] Send the "free jar with your first order" promise in the confirmation

## 3. Legal pages (required before selling)

- [ ] Privacy policy
- [ ] Terms & conditions
- [ ] Returns / refund policy (UK distance-selling rules require this; Shopify checkout links to it)
- [ ] Business address in the site footer
- [ ] Cookie banner — only needed once analytics with cookies is added (see below)

## 4. Launch-window polish

- [ ] Analytics: Plausible/Fathom (cookieless, no banner) or GA4 (needs consent banner) + Shopify conversion tracking
- [ ] `og:image` social cards — links shared on WhatsApp/Instagram currently render bare
- [ ] Contact email in the footer (support has to go somewhere)
- [ ] Styled 404 page (Next default currently serves)
- [ ] Convert the ~2MB product PNGs in `public/images/shop/` to WebP (~halves page weight)
- [ ] Favicon / app icons check

## 5. Post-launch (don't build yet)

- [ ] Klaviyo flows: abandoned checkout (3 emails) + post-purchase (4 emails) — full programme is specified in the heldi-email-writer skill
- [ ] Review collection — start ~50 orders in, not at launch
- [ ] Subscriptions — deliberately out of scope for launch
- [ ] Reorder nudges, richer PDP content (video, press) as they become real

## Placeholders to revisit before launch

- Product photography is AI-generated (Higgsfield) — replace with real shots when the physical product exists
- Gift values (£8 jars / £15 dabba) are placeholders in `GIFT_TIERS` in `lib/commerce/catalog.ts`
- Servings per pouch is 25 (300g ÷ 12g serving, per the nutrition declaration) — constant `SERVINGS_PER_POUCH` in `catalog.ts`
- "Khana" is a placeholder product name — one constant + copy strings to change
- Launch sale is configured in `lib/commerce/config.ts` (`SALE`) — flip `active` and mirror it in Shopify admin
- Mock discount code `HELDI10` exists only for testing the cart UI
