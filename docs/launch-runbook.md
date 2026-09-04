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
  server-side clamp (`lib/commerce/shopify/cart-policy.ts`) re-enforces the cap
  on every mutating cart route. Admin steps that the Storefront API depends on: publish
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

## Phase 1b: Discounts, shipping and the free-pair gate

Step by step, in this order. After every step run:

```
npm run storefront-check
```

It reads the **live Storefront API**, not the admin screen, and prints a pass or
fail per item. The admin screen lies by omission: a product can be ACTIVE and
still invisible to the Storefront, and a variant can look stocked and still be
untracked. Work until the script prints "The store matches lib/pricing.ts."

Already passing as of 4 Sep 2026: all four products published to the Headless
channel, eleven variants visible with images, inventory untracked on the eight
paid variants, a real cart for a pair plus both presents totalling £65.00 with a
working checkout URL, and the old tier product and masala dabba archived.

---

### Step 1. Rebuild the three family codes at 15%

They exist at **10%**, scoped to two variants on the now-archived "Heldi Khana"
product, so they discount nothing a customer can buy. The script reports
`SHABASH exists but is NOT applicable to a pair`.

**1.1** Discounts → find `ACHABETA`, `RISHTA`, `SHABASH` → delete all three.
Deleting rather than editing, because the old ones carry a product scope that
no longer exists and it is easier to see a clean one is right.

**1.2** For each of the three names in turn, Discounts → Create discount →
**Amount off products**:

| Field | Set it to |
|---|---|
| Discount code | `ACHABETA` (then `RISHTA`, then `SHABASH`) |
| Method | Discount code |
| Value | **Percentage**, `15` |
| Applies to | **Specific products** → **Heldi pouches** |
| | Leave every variant of it ticked. Do NOT add Heldi samples, the free pair, the jar or the tote |
| Minimum purchase requirements | **No minimum** |
| Customer eligibility | All customers |
| Maximum discount uses | tick **Limit to one use per customer** |
| Combinations | tick **Shipping discounts**. Leave *Product discounts* and *Order discounts* unticked |
| Active dates | Start today, no end date |

The **Combinations** row is the one that is wrong today and the reason
`WELCOME` could never ride alongside a family code.

Three codes for one rate so the order data says who is buying: ACHABETA (kids
sorting out their parents), RISHTA (buying for uncle and aunty), SHABASH (the
aunties and uncles sorting themselves out). They are printed openly on the site
and the checkout popup offers them, so treat them as public.

**Check**: the script's family line should read
`SHABASH takes 15% off: £55.25`.

---

### Step 2. Replace WELCOME with a free-shipping discount

**The fixed £4.99 amount-off version is not right, and it fails in the one case
it exists for.** Measured against the live store on 4 Sep 2026:

| Basket | With the £4.99 amount-off WELCOME |
|---|---|
| Single pouch, £35 | total £39.99 → £35.00, postage still £4.99. Nets out by luck |
| Pair, £65, already free postage | total £65.00 → **£60.01**. Gives away £4.99 of product margin on an order that had free postage anyway |
| **The £0 free trial pair** | code reads **not applicable**, buyer is charged **£4.99**. The launch email says postage is on us, and this charges them |

An amount-off discount reduces the goods, not the postage, so on a £0 order
there is nothing for it to reduce. It can also push a basket back under the £50
threshold and cost you the postage as well as the £4.99.

**2.1** Discounts → delete the existing `WELCOME`.

**2.2** Create discount → **Free shipping**:

| Field | Set it to |
|---|---|
| Discount code | `WELCOME` |
| Countries | United Kingdom |
| Shipping rates | Apply to all rates (or exclude Express if you would rather not give that away) |
| Minimum purchase requirements | **No minimum** |
| Customer eligibility | All customers |
| Maximum discount uses | tick **Limit to one use per customer** |
| Combinations | tick **Product discounts** |
| Active dates | Start today, no end date |

Free shipping is its own discount class in Shopify, which is exactly why it is
the one thing that stacks with a family or founders code. `isWelcomeCode` in
`lib/pricing.ts` and the launch-email claim link both assume that.

**Check**: the script's `WELCOME is applicable` line still passes, and a single
pouch with WELCOME quotes **£0.00 postage** rather than £4.99 off the goods.

---

### Step 3. Arm the first-100 gate

**This is the one with money attached.** The whole "free for the first hundred"
mechanism is inventory-gated: there is no code and no cart rule, just one
variant that closes itself when the hundredth goes. The script currently
reports `Shopify allowed 250 free pairs: tracking is OFF`.

On **`HELDI-SAMPLE-PAIR-FREE`** only (Products → Heldi sample pair, on us):

1. Inventory → tick **Track quantity**
2. **Untick** "Continue selling when out of stock"
3. Set **Available: 100** at the shipping location

It is the only variant in the store that should have tracking on, which is easy
to get backwards while untracking the other eight.

The site already caps the *basket* at one free pair: the drawer offers no "+"
on that row, and `lib/commerce/shopify/cart-policy.ts` clamps the line to
quantity 1 server side (verified: a crafted request for five came back as one).
Nothing in the site limits how many *people* claim one. Only this does.

**Check**: `Shopify refuses 250 free pairs, so the variant is tracked`.

---

### Step 4. Put the samples on £0 postage

Right now a £5 sachet, the £8 pair pack and the **£0 free trial pair** are every
one of them charged **£4.99**.

**4.1** Settings → Shipping and delivery → Custom shipping rates → **Create new
profile**, name it `Heldi samples`.

**4.2** Add products to it: **Heldi samples** (all three variants) and **Heldi
sample pair, on us**.

**4.3** Under United Kingdom, remove any inherited rate and add one rate:
name `Royal Mail Large Letter`, price **£0.00**, no conditions.

Heldi absorbs the Large Letter (`SHIPPING.sampleLetterPence`, £2.75).

#### What happens when a sachet is in a cart with a pouch

Shopify works out a rate **per profile** and **adds them together**. A pouch
sits in the General profile and a sachet in the Samples profile, so:

| Basket | General profile | Samples profile | Charged |
|---|---|---|---|
| Sachet alone | not represented | £0.00 | **£0.00** |
| One pouch | £4.99 | not represented | **£4.99** |
| One pouch plus a sachet | £4.99 | £0.00 | **£4.99** |
| A pair plus a sachet | £0.00 (over £50) | £0.00 | **£0.00** |

So a sachet never *adds* postage to a basket that already has some, and never
carries any of its own. That is the whole point of the separate profile.

**One thing to watch, and the script tests it.** The General profile's
"free over £50" condition is evaluated against the items *in that profile*, not
the whole cart. So £45 of pouches plus £8 of samples is a £53 cart but only £45
of General items, and may still be charged. If the script's
`one pouch plus a sachet` line comes back at anything other than £4.99, that is
what has happened.

**Check**: the three sample lines in the script flip to £0.00, and
`one pouch plus a sachet (£40.00) ships £4.99` still passes.

---

### Step 5. Two small ones

**5.1** The jar variant has **no SKU**. Set it to `HELDI-JAR` (`GIFT_SKUS.jar`).
The site matches gifts by variant GID first so nothing is broken today, but the
Phase 5 orders webhook derives counts from `line_items[].sku` and will not see
it.

**5.2** The tote's compare-at is live at **£6.00**, which `lib/pricing.ts` says
outright "IS PROVISIONAL and must not ship": a stated worth on a free item has
to be defensible against a real retail price. Settle a figure or clear the
compare-at.

---

### Step 6. The founders codes, at launch

Not now: these are generated when the launch email goes out, one per person,
prefix `SHUKRIYA-` (`FOUNDERS.friendPrefix`). Same shape as the family codes but
**25%**, and **Maximum uses: 1 in total** rather than one per customer.

Note the consequence of the £50 threshold: a pair at 25% is **£48.75**, which
falls under it. **Every founders code should go out with `WELCOME` beside it**
in the same email, or its holder pays £4.99 postage on the best basket they
could build.

---

### Do heavier baskets need a higher postage rate?

**Changed 4 Sep 2026: the two-pouch ceiling is gone.** `MAX_POUCHES` is now 24
and a customer can order any number. This needed no Shopify change, because a
big basket is not a bigger variant, it is **more lines out of the same five**:
five pouches is two `HELDI-K2C0` lines plus one `HELDI-K1C0`, and Shopify
charges what those add up to.

The consequence for pricing is that the £5 bundle saving applies **per pair**
rather than to every additional pouch. Verified against real carts:

| Pouches | Lines | Charged |
|---|---|---|
| 1 | K1C0 | £35 |
| 2 | K2C0 | £65 |
| 3 | K2C0 + K1C0 | £100 |
| 4 | K2C0 x2 | £130 |
| 5 | K2C0 x2 + K1C0 | £165 |
| 24 | K2C0 x12 | £780 |

Three pouches is £100, not the £95 the old per-pouch formula gave. That is the
deliberate trade for needing no Shopify work: there is no three-pouch variant
that could be sold at £95.

**Postage still needs no new rate.** Every basket of two or more is at least
£65, which clears the £50 free-shipping threshold, so the only basket that ever
pays postage is a single pouch. Heavier orders ship free already.

**Worth doing anyway: set the variant weights.** They are still unset, and the
free jar and tote add real weight to a parcel. If you ever add a weight-based
rate, or a courier prices on weight, these are the numbers it would need:

| Variant | Weight |
|---|---|
| `HELDI-K1C0`, `HELDI-K0C1` | 0.40 kg |
| `HELDI-K2C0`, `HELDI-K0C2`, `HELDI-K1C1` | 0.80 kg |
| the three sachets | 0.05 kg |
| `HELDI-JAR` | 0.25 kg |
| `HELDI-TOTE` | 0.15 kg |

Estimates from the pack spec, not weighed. Weigh a filled parcel before
relying on them, especially a twelve-pair order.

### Shipping rates: the repo now matches Shopify

Probed 4 Sep 2026: £35, £40, £43 and £45 baskets are all charged £4.99; £50 and
above ship free. `lib/pricing.ts` said £3.55 and free over £40, so every surface
reading it was quoting a rate checkout would not honour. It is now **£4.99 /
free over £50** and `npm run pricing-check` asserts it. There is also an
**Express £6.99** option in the profile that the site knows nothing about;
harmless, but the drawer's estimate will never mention it.

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
  **Use the apex, not the `www.` host.** The reasoning here is unchanged since
  25 Jul 2026, only the direction is: register whichever host answers directly,
  because a POST that has to follow a 308 depends on Shopify honouring the
  redirect on POST, and the HMAC is computed over the raw body, so a redirect
  hop is a free chance to break signature verification. That host used to be
  `www.`; since 26 Jul 2026 the apex serves Vercel Production and `www.`
  308-redirects to it, so the apex is the one to register. Verify with
  `curl -sI https://heldi.co.uk/` before registering: it must answer 200, not
  a redirect.
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
