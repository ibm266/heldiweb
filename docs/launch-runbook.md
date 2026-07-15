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
- [ ] **Product**: one product, "Heldi Khana", with four variants. The numbers
  come from `lib/pricing.ts` and must match it exactly (BRAND.md §10):

  | Variant | SKU | Price | Compare-at | Weight |
  |---|---|---|---|---|
  | One pouch | `HELDI-KHANA-300` | £30.00 | £35.00 | 0.40 kg |
  | The pair | `HELDI-KHANA-300-X2` | £55.00 | £70.00 | 0.80 kg |
  | The full table | `HELDI-KHANA-300-X3` | £80.00 | £105.00 | 1.30 kg |
  | Sample Trio | `HELDI-SAMPLE` | £5.00 | (none) | 0.10 kg |

  Each bundle is its own variant/SKU on purpose: the cart UI thinks in pouches
  and repacks a basket to the cheapest tier mix (`packPouches` in
  `lib/pricing.ts`), so a basket holds at most one line per tier. Weights are
  estimates for shipping brackets; adjust to real packed weights when known,
  keeping the Sample Trio under the Large Letter threshold.
- [ ] **The included items** (a refillable table jar with every pouch, the
  masala dabba with the full table): treat them as part of the bundle variant,
  not separate line items. The site UI already presents them ("Includes ...
  Free"), Shopify does not need to know they exist, and the pick-pack sheet
  simply says what goes in each SKU's box. (Zero-priced auto-added line items
  need a cart-transform app; revisit post-launch if warehouse picking demands
  it.)
- [ ] **Tax**: Settings → Taxes and duties → UK: food supplements are
  standard-rated at 20% VAT. Prices above are VAT-inclusive; tick "All prices
  include tax".
- [ ] **Shipping** (Settings → Shipping and delivery), mirroring `SHIPPING` in
  `lib/pricing.ts`:
  - General profile (the three pouch variants): rate "Royal Mail Tracked 48"
    £3.55 with a price condition "orders under £40", plus rate "Free shipping"
    £0.00 with condition "orders £40 and up".
  - Second profile containing only the Sample Trio variant, with a single Free
    rate. Shopify sums rates across profiles, so a sample alone ships free
    while a sample plus an under-£40 pouch order still charges £3.55. This is
    the behaviour the cart drawer already displays.
- [ ] **Discount codes** (mirroring `GIFTING` in `lib/pricing.ts`): two codes,
  `ACHABETA` and `SHABASH`, identical rules, two codes so we can see who is
  buying:
  - Type: amount off products, 10%.
  - Applies to: specific variants → One pouch and The pair only (never The
    full table, never the Sample Trio).
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

- [ ] Admin → Settings → Apps and sales channels → Develop apps → Create app
  ("Heldi storefront").
- [ ] Configuration → Storefront API: enable scopes
  `unauthenticated_read_product_listings`, `unauthenticated_read_checkouts`,
  `unauthenticated_write_checkouts`.
- [ ] Install the app, reveal the **Storefront API access token** (public
  token, but treat it as config, not code).
- [ ] Local: copy `.env.example` to `.env.local`, set `SHOPIFY_STORE_DOMAIN`
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

- [ ] In `lib/commerce/catalog.ts`, replace the four `PLACEHOLDER` GIDs
  (`KHANA_VARIANT_ID`, `KHANA_DOUBLE_VARIANT_ID`, `KHANA_TRIPLE_VARIANT_ID`,
  `SAMPLE_VARIANT_ID`) and the product `id`, matching by SKU, not by title.
  Nothing else in the file changes; per NEXT_STEPS, components and pages are
  untouched at connect time.
- [ ] `npm run brand-lint && npm run typecheck && npm run build`.

## Phase 4: Verify the cart end to end (still test mode)

Run `npm run dev` with the Phase 2 `.env.local` and work through:

- [ ] `/shop`: add One pouch → drawer opens with the real variant, launch price
  £30 with £35 struck through.
- [ ] Step the pouch count 1 → 2 → 3 → 4 with the +/− stepper and confirm the
  repack: 2 shows The pair £55, 3 shows The full table £80, 4 shows two lines
  (full table + one pouch, £110).
- [ ] Sample Trio adds as its own line; a sample-only basket shows Free
  shipping; adding a pouch under £40 shows £3.55.
- [ ] Apply `ACHABETA` on a single-pouch basket: 10% off £30; the free-shipping
  meter recalculates on the discounted total (£27 basket shows £13 away).
- [ ] Apply a gifting code on a full-table-only basket: rejected, and the
  drawer shows "This one's already our best price."
- [ ] Checkbox and code lock each other out ("Already sorted. One discount per
  order.").
- [ ] Checkout button opens Shopify checkout with the same lines and totals.
- [ ] Kill the env vars and confirm the site falls back cleanly: provider
  `mock` still works, provider `shopify` without a token answers 503 from
  `/api/cart/*` (expected, that is the guard).

## Phase 5: Domain

- [ ] Point `shop.heldi.co.uk` at Shopify (Settings → Domains → connect
  existing domain; add the CNAME at the DNS host) so checkout shows a Heldi
  domain instead of `*.myshopify.com`.
- [ ] Confirm the checkout URL returned by the cart (drawer button) uses it.

## Phase 6: The real test order

- [ ] Switch Shopify Payments out of test mode.
- [ ] Place a real order (One pouch, gifting code, a real card) end to end:
  card charged, confirmation email received and reads correctly, order appears
  in admin with the right shipping rate, tracking number flows once fulfilled.
- [ ] Refund the test order in admin; confirm the refund email.
- [ ] Walk the returns path once on paper against `docs/legal/returns` so
  support answers match reality.

## Phase 7: Launch day

- [ ] Vercel → `NEXT_PUBLIC_COMMERCE_MODE=live` (Production) → redeploy.
- [ ] Smoke checklist, phone and desktop (PLAYBOOK.md §1.6): hero CTA reads
  "Shop now"; floating mobile CTA links to /shop; the waitlist final-CTA
  section is gone; PDP button adds to basket; checkout completes; the /shop
  Product schema now includes the AggregateOffer (view source).
- [ ] Ticker: remove "LAUNCHING AUTUMN 2026", keep "LAUNCH PRICES ON NOW"
  (`TICKER_COPY` in `components/heldi-homepage.tsx`).
- [ ] Watch the first orders in Shopify admin; email replies come from
  info@heldi.co.uk.
- [ ] **Rollback**: flip `NEXT_PUBLIC_COMMERCE_MODE` back to `waitlist` and
  redeploy. The site returns to waitlist behaviour in one deploy; no code
  changes involved.

## Phase 8: After the launch period

When launch pricing ends (BRAND.md §11.5): set each tier's `launchPence` equal
to its `rrpPence` in `lib/pricing.ts` (kills every strikethrough at once),
mirror the same prices in Shopify admin **on the same day**, remove "LAUNCH
PRICES ON NOW" from the ticker and the "Launch prices. Not forever prices."
block in `components/shop/buy-box.tsx`, and re-run the finishing gate.

## Standing rule from here on

Prices, shipping and discount rules now live in **two systems**. Any change to
`lib/pricing.ts` must be mirrored in Shopify admin (and vice versa) in the same
sitting, plus the copy surfaces in BRAND.md §11.3. The site displays what
`pricing.ts` says; Shopify charges what admin says; they must never disagree.
