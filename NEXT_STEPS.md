# Heldi — Next steps to a fully functioning store

What's left between the current site (waitlist mode, mock cart) and taking real orders.
Ordered by priority. Tick things off as they land.

**Three documents, three jobs.** This file tracks *status*: what is done, what is
next, and why. [docs/launch-runbook.md](docs/launch-runbook.md) holds the
*mechanics*: the exact Shopify admin clicks, API scopes and cart verification
steps, in phases. [docs/go-live-checklist.md](docs/go-live-checklist.md) is the
*gate*: the single list to read top to bottom in the days before flipping
`NEXT_PUBLIC_COMMERCE_MODE=live`, covering the things the runbook does not
(product and fulfilment reality, legal sign-off, email, site quality, SEO,
monitoring, and the launch-day order of operations with a rollback). When they
disagree, the runbook wins on mechanics and the checklist wins on whether you
are allowed to launch at all.

## 1. Connect Shopify (makes "buy" real)

The whole storefront UI is built and runs on a mock cart. To take money,
work through [docs/launch-runbook.md](docs/launch-runbook.md), which turns
this list into exact admin clicks, API scopes and verification steps:

- [x] Create the Shopify store; add the Khana product with four variants mirroring `lib/pricing.ts` — One pouch (£30, compare-at £35), The pair (£55, compare-at £70), The full table (£80, compare-at £105), Sample (£5). Each bundle is its own variant/SKU; the cart UI thinks in pouches and repacks the lines to the cheapest tier mix (`packPouches` in `lib/pricing.ts`), so a basket holds at most one line per tier — e.g. 4 pouches is 1 × The full table + 1 × One pouch. Done 16 Jul 2026; stock and variant weights still to set in admin
- [x] Create the ACHABETA, RISHTA and SHABASH discount codes (same rules, three codes so we can see who's buying — kids for parents, kids for uncle/aunty, aunties/uncles buying for themselves): 10% off, applies to the One pouch and The pair variants only (never The full table or the Sample), one discount per order, no stacking
- [ ] Create the waitlist launch code **`PEHLEAAP`** (`WAITLIST_OFFER` in `lib/pricing.ts`): 20% off, applies to all three pouch variants (One pouch, The pair, The full table) but **never the Sample**, one use per customer, combines with nothing, expires 14 days after launch. This is the reward the launch email hands the waitlist; the site only ever shows the percentage, never the code. (MCP `create_discount_code` if its params cover one-use-per-customer + expiry, else Shopify admin.) Do this at launch prep, not before the shop is live
- [x] Included items now ship as real £0.00 Shopify products the site adds to the cart automatically (`HELDI-JAR` "Refillable table jar", compare-at £8; `HELDI-DABBA` "Masala dabba", compare-at £15), so they show as FREE lines with a thumbnail at Shopify checkout. Capped at 2 jars + 1 dabba per order (`GIFT_CAPS` in `lib/pricing.ts`); compare-at prices mirror `EXTRA_VALUE_PENCE`. Created 19 Jul 2026. The pick-pack sheet still says what physically goes in each box (this reverses the earlier "part of the bundle variant, Shopify does not model them" decision)
- [ ] Publish the two gift products to the **Headless sales channel the Storefront token uses**, and remove them from the Online Store channel, so the cart can add them but no one can reach a buyable £0 page on the legacy theme. Until this is done the Storefront API answers "merchandise does not exist" for their variants (verified 19 Jul 2026), so gift lines will not appear in a real cart
- [ ] Untrack inventory on both gift variants (Track quantity off) or a 0-stock variant passes `cartLinesAdd` but blocks at checkout
- [ ] Set the gift variant SKUs (`HELDI-JAR`, `HELDI-DABBA`) and upload their images (`public/images/shop/gift-jar-gold.webp`, `public/images/shop/gift-masala-dabba.webp`) so checkout shows a thumbnail
- [ ] Shipping profile: free over £40, £3.55 Small Parcel (pouches), Royal Mail Tracked 48; Sample ships free (we absorb the £2.75 Large Letter rate)
- [ ] VAT: food supplements are standard-rated 20% in the UK — check tax settings
- [x] Storefront API access token (custom apps are gone since Jan 2026; see runbook Phase 2 for the Headless-channel route)
- [~] Sort the domain split: the apex `heldi.co.uk` now serves Vercel (the old Shopify theme is gone), so this is done for the waitlist site. Two follow-ups remain: (a) **primary-domain mismatch** — Vercel currently 308-redirects the apex to `www.heldi.co.uk`, but `SITE_URL`, the sitemap, robots.txt and every canonical tag point at the bare apex, so canonicals resolve to a redirect. **Decided 26 Jul 2026: the apex wins**, so no code changes; the one remaining action is a Vercel dashboard click, set the primary domain to `heldi.co.uk` so `www` redirects to it instead of the other way round. Until that flips, every one of the 21 sitemap URLs is a redirect to a page whose canonical points back at the redirect, and Search Console files them as "Page with redirect" rather than indexing them. (b) point `shop.heldi.co.uk` at Shopify when the store goes live (runbook Phase 5)
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

Code-complete as of 20 Jul 2026. `WaitlistForm` posts to `/api/waitlist`, which
stores the signup in Supabase (`public.waitlist`) and, when the Klaviyo env vars
exist, subscribes them there too. Supabase is the system of record; Klaviyo is a
downstream copy, so nothing is ever lost to a vendor.

Platform decision: **Klaviyo from day one** (free to 250 profiles, and it already
powers the post-launch flows in §5, so there is no migration later). Its one gap
is that it cannot natively email new blog posts on a schedule; `/feed.xml` plus
`scripts/send-weekly-letter.mjs` close that (see §4).

Consent model, per ICO/PECR: joining the waitlist is consent for the launch email
only. The separate unticked checkbox adds the weekly letter and offers. The exact
sentence shown is stored on the row (`consent_copy`) as evidence, and re-joining
never silently revokes an earlier opt-in.

Still to do, and all of it is account work only you can do:

- [~] **Apply `supabase/migrations/0002_create_waitlist.sql` and `0003_create_sent_campaigns.sql`** by pasting them into the Supabase dashboard SQL editor. Read `supabase/migrations/README.md` first: this project shares a database with another app, so `supabase db push` and especially `supabase migration repair` must not be run here. **`0002` is proven applied** (verified 28 Jul 2026): the Klaviyo subscribe at `app/api/waitlist/route.ts:123` only runs after the Supabase write succeeds, and two real signups reached Klaviyo on 25 Jul, so the insert must have been accepted. **`0003` is still unverified**, and only a look in the Supabase dashboard can confirm it
- [x] Create the Klaviyo account and two lists: "Waitlist" and "Weekly letter" — done, verified via API 22 Jul 2026 (Waitlist `Staq52`, Weekly letter `U6jLSH`)
- [x] Double opt-in is a per-list setting. Suggested: on for the weekly letter, off for the waitlist so the launch email reaches everyone who asked. Set exactly this way (Waitlist single opt-in, Weekly letter double)
- [ ] **Urgent, do this before the DNS work: the weekly-letter list is armed to send today, from a domain with no Klaviyo DKIM.** `U6jLSH` is double opt-in, and `lib/klaviyo.ts:30-35` adds it whenever the marketing box is ticked on the site. Klaviyo sends its own confirmation email automatically on a double opt-in list, so a stranger ticking that box right now triggers a production send with no flow and no approval. It has not fired yet (zero `Received Email` events in the account, ever), but the path is live and `scripts/backfill-waitlist-to-klaviyo.mjs` would fan it out in bulk if run. Either switch `U6jLSH` to single opt-in, or stop passing the newsletter list, until the sending domain is authenticated
- [x] Create a private API key (scopes: `lists:write`, `profiles:write`, `subscriptions:write`, plus `campaigns:write` for the weekly send) and set `KLAVIYO_PRIVATE_API_KEY`, `KLAVIYO_WAITLIST_LIST_ID`, `KLAVIYO_NEWSLETTER_LIST_ID` in `.env.local` and on Vercel. **Done, and verified live 28 Jul 2026**: the key is set locally and all four `KLAVIYO_*` vars are on Vercel (Production + Preview). Two real signups reached Klaviyo on 25 Jul 2026 carrying `$source: "heldi.co.uk waitlist (popup-floating)"`, the exact string built at `app/api/waitlist/route.ts:122`, so the whole path is live. `KLAVIYO_BASE_CAMPAIGN_ID` is the one variable still empty (see §4)
- [~] Authenticate the sending domain (SPF/DKIM) in Klaviyo before any send, and set a real reply-to. **Half done. Checked against the authoritative nameservers 28 Jul 2026** (this supersedes the 22 Jul note, which was wrong on two of three counts):
  - `_dmarc.heldi.co.uk` → `v=DMARC1; p=none`. **Exists.**
  - `send.heldi.co.uk` → CNAME to `klaviyodns.com`, and its SPF `v=spf1 include:spf.klaviyodns.com ~all` resolves. **Exists.**
  - `kl._domainkey.send.heldi.co.uk` and `kl2._domainkey.send.heldi.co.uk` → **nothing. The Klaviyo DKIM records were never added.** Somebody started the dedicated sending domain, got the `send.` record in, and stopped. Read the two account-specific CNAME targets from Klaviyo → Settings → Domains and add them in Google Cloud DNS, then Verify
  - The apex `heldi.co.uk` has **no `v=spf1` record at all**, despite Google Workspace mail running on `info@heldi.co.uk`. Add `v=spf1 include:_spf.google.com ~all`
  - Do not tighten DMARC past `p=none` until the DKIM records verify, or Heldi's own Workspace mail starts failing
  - Sender check: Klaviyo's default sender is `info@heldi.co.uk` (the apex), not `send.heldi.co.uk`. Once DKIM lands, confirm the From address is authorised on the verified sending domain, or Klaviyo keeps using shared infrastructure and the dedicated domain buys nothing
- [ ] Run `node --env-file=.env.local scripts/backfill-waitlist-to-klaviyo.mjs --dry`, then for real, to sweep up everyone who joined before the account existed
- [~] Welcome flow in Klaviyo, triggered by "added to Waitlist list". The copy now leads with the waitlist reward: **20% off the first order** (`WAITLIST_OFFER`), landing in the launch email, plus launch prices and the jar-with-every-order promise. The "Waitlist welcome" template (`VnY8iQ`) carries it and its card/button corners are rounded to match the site. **Correction, 28 Jul 2026: there IS a flow API now**, so this no longer has to be hand-built in the UI. The Klaviyo MCP exposes `create_flow`, which takes a full definition (list/metric/segment/date triggers; `send-email`, `time-delay`, `conditional-split`, `update-profile`, `list-update` and more), plus `update_flow` to set a flow live. Three caveats before relying on it: nothing in the API forces a flow to be valid (`template_id`, `subject_line` and `from_email` are all optional, so a malformed create followed by a status flip is a live flow sending empty email, always review at `klaviyo.com/flow/{id}/edit` first); **no endpoint appends a step to an existing flow or changes its trigger**, so a correction means delete and recreate; and one trigger per flow, always. **Left to do:** fix the list split below, then build the flow (trigger = list `Staq52`, action = `send-email` using template `VnY8iQ`), review it in the UI, then set it live. Welcome emails run ~80% open, so this is worth more than the newsletter
- [ ] **Fix the list split before building any flow.** Of the 11 profiles in the account, **9 sit on `XQfBFE` "Email List"** (a Klaviyo default nobody chose) and only 2 are on `Staq52`. A welcome flow triggered on `Staq52` would reach two people and permanently skip the other nine, because a list-triggered flow only fires on future additions. The nine also make the four "Engaged" segments read as populated when genuine engagement is zero, since those segments key on `XQfBFE`. Move the nine, then rebuild the segments against `Staq52`
- [ ] **Cap the welcome flow at two emails, and treat that as a consent limit rather than a style choice.** The join copy promises "One email the day we launch", so `Staq52` consent is scoped to exactly that; a four or five email series to people who agreed to one launch email is a consent mismatch. Ongoing contact is what the separate weekly-letter tick (`U6jLSH`) buys, and that list currently has zero members. There is a cost argument too: on the free tier the 500-sends-a-month ceiling binds well before the 250-profile cap, and a five-email series breaches it at roughly 90 signups where two emails absorb about three times as many
- [ ] **Create the 20% coupon object in Klaviyo.** Template `VnY8iQ` promises a code that has no coupon behind it anywhere in Klaviyo (verified 28 Jul 2026: zero coupons in the account). Needs `PEHLEAAP` to exist in Shopify first (§1)
- [ ] Draft the **launch announcement** campaign to the Waitlist list (`Staq52`) — the email that actually carries the `PEHLEAAP` code, RRP + launch prices, the free jar/dabba, free shipping over £40, and one line on the family codes. Keep it a **draft** until launch day. The heldi-email-writer skill drafts the copy
- [ ] **Fix the heldi-email-writer skill source** (lives outside this repo): its locked figures say the full table ships **3 jars** — the site ships **2** (the `GIFT_CAPS` cap; per-tier jars/dabbas fields have been removed from `lib/pricing.ts`). Also add the waitlist 20% offer to the skill's pricing block so drafted emails match `WAITLIST_OFFER`. Until fixed, any email the skill drafts can overpromise a jar

## 3. Legal pages (required before selling)

Drafts live in [docs/legal/](docs/legal/README.md) — solicitor review needed,
plus the `[TBC]` values (company number, VAT number, contact email).

- [x] Privacy policy — drafted (`docs/legal/privacy-policy.md`)
- [x] Terms & conditions — drafted (`docs/legal/terms-and-conditions.md`)
- [x] Returns / refund policy — drafted (`docs/legal/returns-refunds-policy.md`)
- [x] Shipping policy — drafted (`docs/legal/shipping-policy.md`)
- [x] Cookie policy — drafted (`docs/legal/cookie-policy.md`)
- [~] Fill in `[TBC]`s and get solicitor review (now also covers the PostHog processor entry and the consent model). `[TBC]`s filled 22 Jul 2026: company number 17179772 in privacy + terms, VAT clause removed (Heldi LTD not VAT registered), dispatch time set in shipping. The internal "DRAFT / not legal advice" banners were rendering on the live `/legal/*` pages and have been removed. **Solicitor review of all five documents is still outstanding**
- [x] Build the site pages (e.g. `/legal/*`) and link them in the footer — done: `app/legal/[slug]/page.tsx` renders the drafts, `FooterLegal` links them
- [ ] Add the policies in Shopify admin (Settings → Policies)
- [x] Business address in the site footer — done, "Heldi LTD · 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ" in `FooterLegal`
- [x] Cookie banner — shipped as the centred consent modal: anonymous counting by default (DUAA statistical purposes, opt-out on /legal/cookies), "Accept all" opts into full measurement + session replay, "Only necessary" keeps the anonymous counting

## 4. Launch-window polish

- [x] Analytics: PostHog EU behind `lib/analytics.ts` (same-origin `/ingest` proxy, hybrid consent: anonymous by default, replay on opt-in). Storefront events + checkout stitching are code-complete; the two launch-day Shopify admin steps (custom pixel, orders webhook) live in §1 and runbook Phase 6.5. PostHog EU project created and live: `NEXT_PUBLIC_POSTHOG_KEY` is set locally and on Vercel production, the `/ingest` proxy answers 200 in prod (verified 22 Jul 2026)
- [x] `og:image` social cards — done: every route (and every blog post) ships a branded card rendered at build from `components/og/card.tsx`
- [x] Contact email in the footer (support has to go somewhere) — done, `info@heldi.co.uk` in `FooterLegal` (components/subpage-nav.tsx), on every page
- [x] `/feed.xml` — RSS 2.0 of every published Heldi Living post, with autodiscovery in `app/layout.tsx`. Feeds the weekly email and helps content discovery generally
- [ ] Weekly letter automation. Klaviyo has no native "email my new blog posts" feature, so this follows Klaviyo's own recommended pattern: build one base campaign in the admin whose content block is a Web Feed pointed at `https://heldi.co.uk/feed.xml`, then `scripts/send-weekly-letter.mjs` clones and sends it whenever a post newer than the last send appears (`public.sent_campaigns` stops double sends, so running it daily is safe). To finish: build the base campaign, set `KLAVIYO_BASE_CAMPAIGN_ID`, verify with `--dry`, then schedule it weekly (GitHub Action or Vercel cron). Until then a weekly clone-and-send in the Klaviyo UI takes ten minutes. Note the send path is untested against a live account, since none existed when it was written. **Status 28 Jul 2026:** `KLAVIYO_BASE_CAMPAIGN_ID` is the one genuinely empty Klaviyo variable, and it could not resolve anyway because the account holds **zero campaigns**, so `scripts/send-weekly-letter.mjs:33-39` (which clones a base campaign by ID) cannot run yet. The recipient list `U6jLSH` also has **zero members**, so there is nobody to send to until the join form starts converting the opt-in tick
- [x] Styled 404 page — done: `app/not-found.tsx` in brand voice with pill-links home
- [x] Convert the ~2MB product PNGs in `public/images/shop/` to WebP. Done July 2026 as part of the wider asset pass (BRAND §15 state of play): shop/blog/variant PNGs are WebP, the intro film is 1.0MB, `/shop` thumbnails go through `next/image`, and the dormant video-hero film is local-only
- [x] Favicon / app icons check — `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` all present (Next.js file-based icon convention)
- [ ] /ways-to-use comic strips: "The pot" ships as the animated pouch-style test strip (clean art, HTML captions, one horizontal video for all viewports). Five methods remain (dahi, table jar, takeaway, freezer stash, rotis) — locked art direction and prompts in `fable/ways-to-use-strips/STYLE.md`

## 5. Post-launch (don't build yet)

- [ ] Klaviyo flows: abandoned checkout (3 emails) + post-purchase (4 emails). The full programme is specified in the heldi-email-writer skill. The account and the waitlist/weekly-letter lists already exist from §2, so this is flow-building only, no migration. Food and drink abandoned-cart emails run around 52% open and 3.7% conversion, which makes this the biggest single revenue lever post-launch. Post-purchase matters most for Heldi specifically: nobody has bought a whey-protein spice blend before, so if the pouch sits unopened there is no second order and no review
- [ ] **Verify the Klaviyo Shopify integration is actually connected** (Klaviyo → Integrations, then Shopify admin → Apps), because order events feed every flow above. **Do not read the Shopify-keyed metrics in the account as evidence that it is.** Checked 28 Jul 2026: `Checkout Started RYnVaz`, `Placed Order RrZ8Tk`, `Ordered Product SegGcK`, `Fulfilled Order SBpXMc`, `Cancelled Order Ter2pP` and `Refunded Order XYFCiD` all exist under integration `0eMvjm`, but they were created inside a three-second window on 20 Jul interleaved with Klaviyo-keyed and API-keyed metrics, which is the signature of account provisioning rather than an install. The decisive tell is that `get_catalog_items` returns **empty** while Shopify has `Heldi Khana` ACTIVE with four variants since 16 Jul; a healthy integration populates the catalog on install, independently of orders. The real proof of connection is a populated catalog plus a test-order event, not the metric list
- [ ] **Fire `Added to Cart` from site code.** This is the one event genuinely lost to the headless setup and it has no other source. `Viewed Product` is also orphaned but is close to worthless with a single product. Everything else arrives free: `Placed Order` and friends come from Shopify's server-side webhooks, and **`Checkout Started` also comes free**, because `components/cart/cart-drawer.tsx:556` sends the buyer to Shopify's own hosted checkout, which is a Shopify surface. Implementation is a new `app/api/klaviyo/track/route.ts` calling `guard()` first with its own `RATE_RULES` entry sized near `cart` (60/min), not near `waitlist` (5/min)
- [ ] **Stitch Klaviyo identity through checkout**, which is what makes post-purchase fire against a known profile. `lib/checkout-handoff.ts:24-28` already writes three cart attributes at checkout click; a fourth (`_heldi_kl_id`) rides along in one line, arrives as `note_attributes` on the order, and is read by `app/api/webhooks/shopify-orders/route.ts:64-67`, which is already HMAC-verified and already dedupes Shopify's retries. That webhook has the order email and the browsing id in the same payload, so it is where the Klaviyo identify belongs
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
