# Heldi launch runbook: Shopify connect to first order

The complete path from today's state (waitlist mode, mock cart) to taking real
money, written so any person or model can execute it step by step. Companion to
NEXT_STEPS.md (which tracks status) and BRAND.md §10/§11 (which own the facts).
Work through the phases in order; each ends with a checkpoint.

**Orientation, before touching anything.** The storefront UI is finished and
runs against a mock cart. Two env switches control everything
(`lib/commerce/config.ts`):

| | `NEXT_PUBLIC_COMMERCE_PROVIDER` | `NEXT_PUBLIC_COMMERCE_MODE` |
|---|---|---|
| Today | `mock` (local cart, no Shopify) | `waitlist` (browse only, join-waitlist CTAs) |
| Testing the store | `shopify` | `waitlist` (cart works, checkout reachable, CTAs still waitlist on public pages) |
| Launch | `shopify` | `live` (Shop now CTAs, checkout on) |

**Reviewing both modes before launch.** The env `NEXT_PUBLIC_COMMERCE_MODE` sets
what every visitor sees, but a reviewer needs to see both. The footer `Preview`
link opens `/preview`: enter the `PREVIEW_PASSWORD` (server-only env var, set it in
Vercel) and that one browser can flip waitlist and selling mode from the nav pill,
leaving everyone else on the deployed setting. The unlock also sets a cookie that
opens the shipping-policy page, which is otherwise hidden in waitlist mode (it lists
rates). "Lock preview" clears it.

The client/server plumbing is already implemented: `lib/commerce/shopify-provider.ts`
(client) posts to the route handlers in `app/api/cart/` (server), which run the
GraphQL documents in `lib/commerce/shopify/queries.ts` via
`lib/commerce/shopify/client.ts`. Until the env vars exist the handlers answer
503 and nothing breaks. What remains is Shopify-side setup, real IDs, and
verification. The Storefront API version is pinned in `client.ts`
(`API_VERSION`); Shopify versions are supported for 12 months, so bump it
(and re-run Phase 4) roughly yearly.

---

## Phase 1: Build the store in Shopify admin

- [ ] Create the Shopify store (Basic plan is enough to start). Set the store
  currency to GBP before creating products; it cannot be changed after the
  first sale.
- [ ] Settings → General: business name Heldi Ltd, address (must match the
  footer in `components/subpage-nav.tsx` and the legal docs).
- [x] **Product**: one product, "Heldi Khana", with four variants. The numbers
  come from `lib/pricing.ts` and must match it exactly (BRAND.md §10). Done
  16 Jul 2026 via the heldi-shopify MCP tools: product
  `gid://shopify/Product/15790466957695`, handle `heldi-khana`, option
  "Bundle", ACTIVE; the 8 old products are archived. Weights and stock still
  need setting in admin (the API tools do not cover them):

  | Variant | SKU | Price | Compare-at | Weight |
  |---|---|---|---|---|
  | One pouch | `HELDI-KHANA-300` | £30.00 | £35.00 | 0.40 kg |
  | The pair | `HELDI-KHANA-300-X2` | £55.00 | £70.00 | 0.80 kg |
  | The full table | `HELDI-KHANA-300-X3` | £80.00 | £105.00 | 1.30 kg |
  | Sample | `HELDI-SAMPLE` | £5.00 | (none) | 0.10 kg |

  Each bundle is its own variant/SKU on purpose: the cart UI thinks in pouches
  and repacks a basket to the cheapest tier mix (`packPouches` in
  `lib/pricing.ts`), so a basket holds at most one line per tier. Weights are
  estimates for shipping brackets; adjust to real packed weights when known,
  keeping the Sample under the Large Letter threshold.
- [x] **The included items** (refillable table jar, masala dabba) ship as
  their own £0.00 Shopify products the storefront adds to the cart
  automatically, so Shopify checkout lists them as FREE lines with a thumbnail
  (superseding the earlier "part of the bundle variant" plan). Products
  `HELDI-JAR` (compare-at £8) and `HELDI-DABBA` (compare-at £15), created
  19 Jul 2026; compare-at prices mirror `EXTRA_VALUE_PENCE`. The cart caps them
  at 2 jars + 1 dabba per order (`GIFT_CAPS` in `lib/pricing.ts`) and a
  server-side clamp (`lib/commerce/shopify/gift-policy.ts`) re-enforces the cap
  on every mutation. Admin steps that the Storefront API depends on: publish
  both to the **Headless channel this token uses** (not Online Store), untrack
  their inventory, set the SKUs and upload images. Until they are published the
  Storefront API answers "merchandise does not exist" for their variants and no
  gift line appears. The pick-pack sheet still says what physically goes in each
  box.
- [ ] **Tax**: Settings → Taxes and duties → UK: food supplements are
  standard-rated at 20% VAT. Prices above are VAT-inclusive; tick "All prices
  include tax".
- [ ] **Shipping** (Settings → Shipping and delivery), mirroring `SHIPPING` in
  `lib/pricing.ts`:
  - General profile (the three pouch variants): rate "Royal Mail Tracked 48"
    £3.55 with a price condition "orders under £40", plus rate "Free shipping"
    £0.00 with condition "orders £40 and up".
  - Second profile containing only the Sample variant, with a single Free
    rate. Shopify sums rates across profiles, so a sample alone ships free
    while a sample plus an under-£40 pouch order still charges £3.55. This is
    the behaviour the cart drawer already displays.
- [x] **Discount codes** (mirroring `GIFTING` in `lib/pricing.ts`): three codes,
  `ACHABETA`, `RISHTA` and `SHABASH`, identical rules, three codes so we can
  see who is buying. Done 16 Jul 2026, scoped to the One pouch and The pair
  variant GIDs:
  - Type: amount off products, 10%.
  - Applies to: specific variants → One pouch and The pair only (never The
    full table, never the Sample).
  - Combinations: none. Usage: no per-customer limit, no end date (review
    after the launch period).
- [ ] Settings → Policies: paste the reviewed texts from `docs/legal/` (fill
  the `[TBC]`s first; see NEXT_STEPS §3).
- [ ] Settings → Payments: activate Shopify Payments, complete KYC. Enable
  test mode for now.
- [ ] Markets: United Kingdom only.

**Checkpoint**: product page in admin shows 4 variants with strikethrough
compare-at prices; a draft order with 4 pouches charges £110 (£80 + £30) before
discounts and ships free.

## Phase 2: Storefront API access

- [x] Get a **Storefront API access token** (public token, but treat it as
  config, not code). Shopify retired admin-created custom apps in Jan 2026,
  so the old Develop-apps path no longer exists. Two current routes:
  - Recommended: install Shopify's free **Headless** sales channel from the
    App Store, create a storefront in it and copy its public access token.
    Remember to publish the product to that channel, or the Storefront API
    cannot see it.
  - Alternative: a Dev Dashboard app with the `unauthenticated_*` scopes on
    a released version (install re-approval needed), then mint a token via
    the Admin API `storefrontAccessTokenCreate` mutation.
- [x] Local: copy `.env.example` to `.env.local`, set `SHOPIFY_STORE_DOMAIN`
  (the `*.myshopify.com` domain), `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and
  `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`. Leave mode as `waitlist`.
- [ ] Vercel: add the same three env vars (Production + Preview).

## Phase 3: Real IDs into the code

- [ ] Fetch the real GIDs. Quickest check once Phase 2 is done:

  ```bash
  curl -s "https://YOUR-STORE.myshopify.com/api/2026-01/graphql.json" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Storefront-Access-Token: TOKEN" \
    -d '{"query":"{ products(first: 5) { edges { node { id handle variants(first: 5) { edges { node { id sku } } } } } } }"}' | python3 -m json.tool
  ```

- [x] In `lib/commerce/catalog.ts`, replace the four `PLACEHOLDER` GIDs
  (`KHANA_VARIANT_ID`, `KHANA_DOUBLE_VARIANT_ID`, `KHANA_TRIPLE_VARIANT_ID`,
  `SAMPLE_VARIANT_ID`) and the product `id`, matching by SKU, not by title.
  Nothing else in the file changes; per NEXT_STEPS, components and pages are
  untouched at connect time. Done 16 Jul 2026.
- [x] `npm run brand-lint && npm run typecheck && npm run build`.

## Phase 4: Verify the cart end to end (still test mode)

Run `npm run dev` with the Phase 2 `.env.local` and work through the list. The
PDP only renders its add-to-basket button in live mode, so flip the dev-only
mode toggle in the nav first (dev builds only; the env stays `waitlist`).
Verified 16 Jul 2026 against the live store:

- [x] `/shop`: add One pouch → drawer opens with the real variant, launch price
  £30 with £35 struck through.
- [x] Step the pouch count 1 → 2 → 3 → 4 with the +/− stepper and confirm the
  repack: 2 shows The pair £55, 3 shows The full table £80, 4 shows one
  aggregated pouch row at £110 (£140 struck); the underlying cart holds two
  lines (full table + one pouch), which is what checkout shows.
- [ ] Confirm the free gift lines follow the per-order caps as you step: 1
  pouch → 1 jar, 2 → 2 jars, 3 → 2 jars + 1 dabba, and 4+ stays at 2 jars + 1
  dabba (never 3+ jars or 2 dabbas). The drawer shows them as struck-out "Free"
  rows with no stepper or remove control, and the nav badge counts pouches
  only, not the gifts. (Needs the gift products published to this token's
  channel first; see Phase 3.)
- [x] Sample adds as its own line; a sample-only basket shows Free
  shipping; adding a pouch under £40 shows £3.55.
- [x] Apply `ACHABETA` on a single-pouch basket: 10% off £30; the free-shipping
  meter recalculates on the discounted total (£27 basket shows £13 away).
- [ ] With `ACHABETA` on a single pouch, the drawer summary shows three
  separate lines, "Launch saving −£5.00", "Discount (ACHABETA) −£3.00" and
  "Free gifts −£8.00", summing to a bold "You're saving £16.00" (the free jar's
  worth counts toward the total). The Total is still £27.00.
- [x] Apply a gifting code on a full-table-only basket: rejected, and the
  drawer shows "This one's already our best price." (Shopify keeps the code
  attached to the cart, so it starts discounting if an eligible line is
  added later; the drawer then shows it as applied, which is correct.)
- [x] Checkbox and code lock each other out ("Already sorted. One discount per
  order.").
- [x] Checkout button opens Shopify checkout with the same lines and totals.
- [ ] The gift jar and dabba appear on the Shopify checkout as their own lines
  priced FREE, with an image, and the totals still match the drawer.
- [ ] Kill the env vars and confirm the site falls back cleanly: provider
  `mock` still works, provider `shopify` without a token answers 503 from
  `/api/cart/*` (expected, that is the guard).

## Phase 5: Domain

Current state (16 Jul 2026): the apex `heldi.co.uk` already points at Shopify
and serves both checkout and an old Online Store theme storefront; `www`
redirects to it. Checkout URLs from the cart already read `heldi.co.uk`. That
leaves no home for the Next.js site on the apex, so before launch:

- [ ] Decide the split: apex `heldi.co.uk` → Vercel (the site),
  `shop.heldi.co.uk` → Shopify (checkout), per the original plan. Move the
  DNS records and set the Shopify primary domain to the subdomain.
- [ ] Until then, hide the old theme storefront (Online Store → Preferences →
  password protection, or remove the theme content) so visitors to the apex
  do not see stale products or prices.
- [ ] Confirm the checkout URL returned by the cart (drawer button) uses the
  intended domain after the move.

## Phase 6: The real test order

- [ ] Switch Shopify Payments out of test mode.
- [ ] Place a real order (One pouch, gifting code, a real card) end to end:
  card charged, confirmation email received and reads correctly, order appears
  in admin with the right shipping rate, tracking number flows once fulfilled.
- [ ] Refund the test order in admin; confirm the refund email.
- [ ] Walk the returns path once on paper against `docs/legal/returns` so
  support answers match reality.

## Phase 6.5: Analytics connect (PostHog pixel + orders webhook)

The storefront side ships with the site (consent modal, events, checkout
attribute stitching in `lib/checkout-handoff.ts`). These steps join the
Shopify-hosted checkout to it. Order matters: key first, then pixel, then
webhook.

- [x] Create the PostHog project: done 19 Jul 2026 ("Heldi storefront" on EU
  Cloud, project 227787, timezone Europe/London). Discard client IP **on**,
  replay **on** with all inputs masked, authorized URLs set
  (heldi.co.uk + localhost 3000/3999).
- [x] Set `NEXT_PUBLIC_POSTHOG_KEY` (the project's `phc_...` key) in
  `.env.local` and on Vercel (Production + Preview) → redeploy. Done 19 Jul
  2026; the key is baked into the snippet below.
- [ ] Shopify admin → Settings → Customer events → **Add custom pixel**, name
  it `Heldi PostHog`, paste the snippet below as-is, **Connect**.
- [ ] Shopify admin → Settings → Notifications → Webhooks → **Create
  webhook**: event `Order creation`, format JSON, URL
  `https://heldi.co.uk/api/webhooks/shopify-orders`, API version `2026-01`
  (matches `lib/commerce/shopify/client.ts`). Copy the signing secret shown
  at the bottom of the webhooks page into Vercel as `SHOPIFY_WEBHOOK_SECRET`
  → redeploy.
- [ ] Click **Send test notification** on the webhook: expect HTTP 200 and a
  `purchase` event in PostHog → Activity with a `shopify-order-...`
  distinct id (the test payload carries no `_heldi_ph_id`).
- [ ] Stitching check (the Shopify Pixel Helper does not work for headless
  storefronts; this manual check is the test): dev-toggle the site to live
  against the store, add a pouch, click Checkout, and confirm in PostHog →
  Activity that `checkout_started` arrives with the **same** distinct id as
  the storefront `$pageview`s just before it.
- [ ] During the Phase 6 test order: confirm the `purchase` event lands
  stitched (`stitched: true`) with the right `value` and any discount code.
- [x] Funnels and dashboard: done 19 Jul 2026. Pinned dashboard **"Heldi:
  the customer journey"** (https://eu.posthog.com/project/227787/dashboard/832830)
  holds visitors per day, first-touch sources, the waitlist funnel, signups
  by form, bundle interest, the purchase funnel, and revenue by gifting
  audience. The purchase tiles fill once the store is live.

The custom pixel (paste as-is; the key is the live project's public
write-only key). It posts straight to PostHog EU (the pixel runs on
Shopify's origin, so our `/ingest` proxy does not apply); losses to
checkout-side ad blockers are fine because the webhook is the revenue source
of truth:

```js
const HOST = "https://eu.i.posthog.com";
const KEY = "phc_D8J5eFkcRoWsJJVcDXf6fCA4EAdhU5dh9dhPeSBWmThK"; // same project key as the site

function attr(checkout, key) {
  const hit = (checkout.attributes || []).find((a) => a.key === key);
  return hit ? hit.value : null;
}

function send(name, event) {
  const checkout = event.data && event.data.checkout;
  if (!checkout) return;
  let firstTouch = {};
  try { firstTouch = JSON.parse(attr(checkout, "_heldi_utm") || "{}"); } catch (e) {}
  fetch(HOST + "/i/v0/e/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      api_key: KEY,
      event: name,
      distinct_id: attr(checkout, "_heldi_ph_id") || ("anon-checkout-" + event.clientId),
      properties: {
        $session_id: attr(checkout, "_heldi_ph_session") || undefined,
        value: checkout.totalPrice ? Number(checkout.totalPrice.amount) : undefined,
        currency: checkout.currencyCode,
        item_count: (checkout.lineItems || []).reduce(function (n, li) { return n + (li.quantity || 0); }, 0),
        discount_codes: (checkout.discountApplications || []).map(function (d) { return d.title; }).join(","),
        first_touch_source: firstTouch.source,
        first_touch_medium: firstTouch.medium,
        first_touch_campaign: firstTouch.campaign,
        source: "shopify_pixel"
      },
      timestamp: new Date().toISOString()
    })
  }).catch(function () {});
}

["checkout_started", "checkout_contact_info_submitted", "checkout_shipping_info_submitted",
 "payment_info_submitted", "checkout_completed"].forEach(function (name) {
  analytics.subscribe(name, function (event) { send(name, event); });
});
```

## Phase 7: Launch day

- [ ] Vercel → `NEXT_PUBLIC_COMMERCE_MODE=live` (Production) → redeploy.
- [ ] Smoke checklist, phone and desktop (PLAYBOOK.md §1.6): hero CTA reads
  "Shop now"; floating mobile CTA links to /shop; the waitlist final-CTA
  section is gone; PDP button adds to basket; checkout completes; the /shop
  Product schema now includes the AggregateOffer (view source); PostHog →
  Activity shows `$pageview` → `add_to_cart` → `begin_checkout` →
  `checkout_started` → `purchase` under one person.
- [ ] Waitlist mode hides every price and discount surface; confirm the flip
  brought them all back (no code changes involved): PDP prices, launch-price
  block and shipping note; the gifting band with the three codes on /shop and
  the homepage; "How much is delivery?" on /faq; /legal/shipping resolves and
  the footer shows the Shipping link; the ticker now reads "LAUNCH PRICES ON
  NOW  •  AUNTIES & UNCLES PAY LESS" and has dropped "LAUNCHING AUTUMN 2026"
  (both automatic, `TICKER_COPY_LIVE` in `components/heldi-homepage.tsx`).
- [ ] Watch the first orders in Shopify admin; email replies come from
  info@heldi.co.uk.
- [ ] **Rollback**: flip `NEXT_PUBLIC_COMMERCE_MODE` back to `waitlist` and
  redeploy. The site returns to waitlist behaviour in one deploy; no code
  changes involved.

## Phase 8: After the launch period

When launch pricing ends (BRAND.md §11.5): set each tier's `launchPence` equal
to its `rrpPence` in `lib/pricing.ts` (kills every strikethrough at once),
mirror the same prices in Shopify admin **on the same day**, remove "LAUNCH
PRICES ON NOW" from `TICKER_COPY_LIVE` in `components/heldi-homepage.tsx` and
the "Launch prices. Not forever prices." block in
`components/shop/buy-box.tsx`, and re-run the finishing gate.

## Standing rule from here on

Prices, shipping and discount rules now live in **two systems**. Any change to
`lib/pricing.ts` must be mirrored in Shopify admin (and vice versa) in the same
sitting, plus the copy surfaces in BRAND.md §11.3. The site displays what
`pricing.ts` says; Shopify charges what admin says; they must never disagree.
