# Plan: gifts as real cart lines, capped, with an honest savings breakdown

Written 19 Jul 2026 for execution by a coding model (Opus 4.8). Companion files:
NEXT_STEPS.md (status), docs/launch-runbook.md (Shopify connect), BRAND.md §11
(fact map), PLAYBOOK.md §7 (analytics contract). Work the phases in order; each
ends with a checkpoint. Phase 0 blocks everything else (it produces the two
variant GIDs the code needs).

House rules that apply to every phase: no em dashes in any copy string (grep the
diff for `—` before finishing); all money from `lib/pricing.ts` integer pence,
never hard-coded; components call `track()` from `lib/analytics.ts` only; run
`npm run brand-lint` and `npm run build` before declaring victory; verify the
drawer and PDP at 375 and 1280.

## 0. What this fixes

Three problems, one root cause: the free items (refillable table jars, masala
dabba) are display-only. They are computed client-side from the pouch count
(`includedItemsForPouches` in `lib/commerce/catalog.ts`) and drawn as
strikethrough rows; no cart line exists for them.

**Problem 1: the discount saving is invisible.** The drawer's summary shows one
aggregate "You're saving" figure (`cart-drawer.tsx` ~line 117):
`savingsPence = Σ line (compareAtAmount − totalAmount) + max(0, subtotal − total)`.
Against the live store this conflates two different savings, and the worked
example shows why it reads wrongly. One pouch + ACHABETA: Shopify's 10% code is
a product discount, so the allocation lands on the line. Line total £27.00,
compare-at £35.00, so line savings = £8.00; subtotal equals total, so the
second term is £0. The drawer says "You're saving £8.00" directly under a jar
row that says "£8.00 Free". The £3.00 discount and the £5.00 launch saving are
both in that number, but the screen reads as "the saving is the free jar".
There is no row anywhere saying what the code took off.

**Problem 2: checkout omits the gifts.** The Shopify store has only the Khana
product (4 variants) and the three gifting codes; no jar or dabba products
exist (verified against the live store 19 Jul 2026). The customer is promised
jars and a dabba in the drawer, then sees a checkout with only pouch bundles.

**Problem 3: the gifts iterate without bound.** Today: one jar per pouch, one
dabba per full-table block. Six pouches promises 6 jars + 2 dabbas. The
business rule is now a per-order cap.

## 1. Decisions (locked, do not relitigate)

**D1. Gifts become real Shopify products priced £0.00** with compare-at prices
equal to their worth (£8.00 jar, £15.00 dabba, mirroring `EXTRA_VALUE_PENCE`).
The site adds/removes their cart lines automatically. No discount machinery is
involved in making them free, so the "one discount per order" story and the
existing `DiscountCodeBasic` codes are untouched, and Shopify checkout shows
the lines as FREE with the product image.

**D2. Per-order caps: 2 jars, 1 dabba.** For a basket of `p` pouches:
jars = `p <= 0 ? 0 : min(p, 2)`; dabba = `packPouches(p).triple > 0 ? 1 : 0`.

| pouches | jars | dabba |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 1 | 0 |
| 2 | 2 | 0 |
| 3 | 2 | 1 |
| 4 | 2 | 1 |
| 5 | 2 | 1 |
| 6+ | 2 | 1 |

Deliberate consequence: **The full table now ships 2 jars, not 3.** Its
Includes panel, the drawer rows and the pick-pack change accordingly. The
bundle photo (`khana-bundle-3.webp`) still shows three jars; photos are
AI-generated placeholders slated for reshoot (NEXT_STEPS "Placeholders"), so
only the alt text changes now (Phase 3), not the image.

**D3. The site cart is the source of truth for gift quantities**; a server-side
clamp in the /api/cart handlers is defence in depth (Phase 4). Shoppers never
edit gift lines directly (no steppers, no remove button, and Shopify checkout
cannot edit lines).

**D4. The summary gets explicit rows.** Launch saving, discount and free-gift
worth each become a separate labelled row; "You're saving" is the headline and
equals their sum. (Amended 19 Jul 2026: the gift worth is now included in the
headline as its own "Free gifts" line, so a one-pouch + ACHABETA basket reads
"You're saving £16" = £5 + £3 + £8. The gift worth also stays struck out on the
item rows.) The Total row always shows the real amount charged, never the
gift-inclusive saving.

**D5. Gift products stay out of `getProducts()`**, the PDP gallery, and the
/shop AggregateOffer schema. Detection in code is by variant GID constant
(SKU string as fallback), same pattern as `TIER_VARIANT_IDS`.

**D6. Naming.** Products "Refillable table jar" and "Masala dabba"; SKUs
`HELDI-JAR` and `HELDI-DABBA`; catalog handles `table-jar` and `masala-dabba`
(no site routes for them).

## 2. Phase 0: Shopify store changes

Do this first; the variant GIDs feed Phase 1. The heldi-shopify MCP server is
connected in this project (memory: `~/Projects/heldi-shopify-mcp`).

1. Create the two products via MCP (they default to DRAFT; make them ACTIVE):
   - `create_product` title "Refillable table jar", status ACTIVE, price "0.00",
     description one short brand-voice line (e.g. "The stainless jar that lives
     on the dinner table, filled from the Heldi pouch. Ships free with every
     order."). Then `set_price` on its variant: price "0.00", compareAtPrice "8.00".
   - `create_product` title "Masala dabba", status ACTIVE, price "0.00",
     description in the same register. Then `set_price`: price "0.00",
     compareAtPrice "15.00".
   - Record both variant GIDs from the responses. These are `JAR_VARIANT_ID`
     and `DABBA_VARIANT_ID` in Phase 1.
2. Admin UI checklist (the MCP has no tools for these; whoever executes must do
   them in Shopify admin or explicitly hand them to Mihir as a to-do list, not
   silently skip):
   - Set SKUs on the default variants: `HELDI-JAR`, `HELDI-DABBA`.
   - Inventory: **untrack quantity** for both ("Track quantity" off). This is
     the classic gotcha: a tracked variant with 0 stock passes `cartLinesAdd`
     but blocks at checkout.
   - Sales channels: publish both products to the **same channel the Storefront
     token uses** (the Headless channel from runbook Phase 2) and remove them
     from the Online Store channel so no one can reach a buyable £0 page on the
     legacy theme store. If `cartLinesAdd` later fails with "merchandise not
     found" or an invalid-merchandise userError, this publication step is the
     cause.
   - Upload product images so checkout shows thumbnails: use the repo files
     `public/images/shop/gift-jar-gold.webp` and
     `public/images/shop/gift-masala-dabba.webp`.
   - Weights: set rough shipping weights when doing the Khana ones (already an
     open NEXT_STEPS item); nothing here depends on it.
3. Checkpoint: verify the variants are purchasable through the Storefront API
   before writing any site code. Run a small script (env in `.env.local`:
   `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, API version
   2026-01, same endpoint as `lib/commerce/shopify/client.ts`) that calls
   `cartCreate` with one jar line and asserts the returned cart has the line at
   £0.00 with no userErrors. Repeat for the dabba. Do not proceed until this
   passes.

## 3. Phase 1: pricing.ts and catalog.ts

`lib/pricing.ts`:
- Add near `packPouches`:
  ```ts
  // Per-order caps on the free items. "For now": limited jar stock at
  // launch; raise the caps here and the cart, PDP and pick-pack follow.
  export const GIFT_CAPS = { jars: 2, dabbas: 1 } as const;

  export function giftCountsForPouches(pouches: number): { jars: number; dabbas: number }
  ```
  implementing the D2 table (use `packPouches` for the dabba test, clamp with
  `GIFT_CAPS`). Every other jar/dabba computation in the repo must flow from
  this one function.
- Leave `TIERS` jars/dabbas fields as the physical per-bundle numbers; the caps
  are applied in the helpers below. Leave `EXTRA_VALUE_PENCE` as-is but extend
  its comment: the Shopify compare-at prices on HELDI-JAR / HELDI-DABBA mirror
  these values; change both together.

`lib/commerce/types.ts`: widen `ProductHandle` to
`"khana" | "table-jar" | "masala-dabba"`. In `lib/commerce/shopify/client.ts`
fix the `as "khana"` cast in `mapLine` to the widened type.

`lib/commerce/catalog.ts`:
- Add `JAR_VARIANT_ID` and `DABBA_VARIANT_ID` constants with the real GIDs from
  Phase 0, plus product GIDs. Add `GIFT_SKUS = { jar: "HELDI-JAR", dabba: "HELDI-DABBA" }`.
- Add a `GIFT_PRODUCTS: Product[]` list (handles per D6, titles per D6, images
  `JAR_THUMB` / `DABBA_THUMB` with alt text, one variant each: price £0.00 via
  `penceToMoney(0)`, `compareAtPrice` from `EXTRA_VALUE_PENCE`). Keep it
  **separate from `PRODUCTS`**: `getProducts`/`getProduct` return `PRODUCTS`
  only (D5). Extend `findVariantById` and `findProductByVariantId` to search
  both lists (this is what makes the mock provider price the gift lines).
- Add:
  ```ts
  export function isGiftVariantId(id: string): boolean
  export function isGiftLine(line: Pick<CartLine, "merchandise">): boolean  // GID first, GIFT_SKUS fallback
  // The gift lines a basket of `pouches` pouches should hold (D2 caps applied).
  export function giftLinesForPouchCount(pouches: number): CartLineInput[]
  ```
  `giftLinesForPouchCount` maps `giftCountsForPouches` onto the variant IDs,
  omitting zero-quantity entries.
- Apply the caps to the display helpers so the PDP agrees with the cart:
  - `includedItemsForQuantity(variant, quantity)`: clamp jars to
    `GIFT_CAPS.jars` and dabbas to `GIFT_CAPS.dabbas` (buying 1 × full table
    then shows "2 refillable table jars" + "1 masala dabba").
  - `includedItemsForPouches(pouches)`: reimplement on top of
    `giftCountsForPouches`.
- `cartItemCount`: skip gift lines (`isGiftLine`) so the nav badge counts only
  paid items.
- `TIER_IMAGES.triple` alt text: the photo shows three jars but the bundle now
  ships two, so make the alt count-free: "The full table bundle: three Heldi
  Khana pouches with table jars and a masala dabba". Keep it short; do not
  regenerate the photo (out of scope, §9).

Checkpoint: `npm run build` passes; unit-check `giftCountsForPouches` against
the D2 table (a quick script or test file is fine).

## 4. Phase 2: cart-context gift sync

`components/cart/cart-context.tsx`:
- `setPouchCount` is the single choke point for pouch changes (the drawer
  stepper and the buy box both funnel into it). Extend its diff to cover gifts:
  target lines = `linesForPouchCount(pouches)` ∪ `giftLinesForPouchCount(pouches)`;
  current lines considered = tier lines ∪ gift lines (`isGiftLine`). The
  existing additions/updates/removals batching then handles everything,
  including removing gifts when pouches hit 0. Keep the early return when
  nothing changed.
- Stale carts: carts persisted before this change (and any cart mutated outside
  the site) can hold wrong gift lines. After the mount-effect `getCart`
  resolves, compare the cart's gift lines against
  `giftLinesForPouchCount(khanaPouchCount(lines))`; on mismatch run one
  corrective mutation through the same diff logic. Exactly one attempt, errors
  swallowed with a `console.warn`; never loop, never block hydration.
- No other path needs changes: `addItem` is only used for the Sample,
  `updateQuantity`/`removeItem` are only reachable for non-tier, non-gift lines
  in the UI.

Checkpoint (mock provider, `npm run dev`): step pouches 0→1→2→3→4→6→0 in the
drawer and watch localStorage/cart state hold exactly the D2 quantities at
every step; add a Sample alone and confirm no gifts appear.

## 5. Phase 3: drawer UI, badge, summary rows, analytics

`components/cart/cart-drawer.tsx`:
- Partition `lines` three ways: tier lines (as today), gift lines
  (`isGiftLine`), other lines. Gift lines must not render as normal rows (no
  stepper, no Remove); render them through the existing `IncludedList` visual,
  but **sourced from the real lines**: title from quantity + noun (reuse the
  pluralisation currently in `buildIncludedItems`; keyed by variant, not by
  parsing titles), worth = line `cost.compareAtAmount` with
  `EXTRA_VALUE_PENCE × quantity` as fallback. Drop the
  `includedItemsForPouches(pouchCount)` call here; the cart is now the truth.
  Add a tiny helper in catalog.ts (e.g. `includedItemsForGiftLines(lines)`)
  rather than inlining the mapping in the component.
- Dabba nudge: the condition `pouchCount % 3 === 2` overpromises once the cap
  exists (at 5 pouches the shopper already has the dabba). Change to
  `pouchCount === 2`. Copy unchanged.
- Summary block. Compute in integer pence:
  ```
  fullPricePence    = Σ all lines  moneyToPence(merchandise.price) × quantity   // gifts contribute 0
  launchSavingsPence = Σ tier lines only  (moneyToPence(compareAtAmount) − price × quantity), floored at 0
  discountPence     = max(0, fullPricePence − totalPence)
  savingsPence      = launchSavingsPence + discountPence
  ```
  Do **not** derive the discount from `subtotal − total` (Shopify allocates
  product-code discounts into the lines, so subtotal can equal total; the mock
  models it cart-level; the formula above is correct for both) and do **not**
  include gift lines in `launchSavingsPence` (their compare-at worth would leak
  into the headline, recreating problem 1 in a new form).
  Rows, in order, each only when its amount > 0:
  1. `Launch saving` with `−£X` (the RRP strikethrough money, both providers)
  2. `Discount (CODE)` with `−£Y` where CODE is the first applicable code on
     the cart (e.g. ACHABETA). This is the new line the whole change exists for.
  3. `You're saving` with `£(X+Y)` in bold (keep the existing class/row)
  4. Shipping row, sample nudge, Total row: unchanged.
  Delete the old subtotal strikethrough row (superseded by rows 1 and 2, and
  its condition never fires against live Shopify anyway). Use the existing
  `−` glyph already used by the steppers for the minus; **no em dashes**.
- Analytics (PLAYBOOK §7 is the contract; nothing gets renamed):
  - `savings_displayed`: `basket_savings_total` keeps its current meaning and
    value (launch + discount, unchanged arithmetic). Optionally add
    `launch_savings` and `discount_savings` number props (additive props are
    safe; renames are not).
  - `begin_checkout`: `item_count` must keep meaning "paid units". Now that
    `cart.totalQuantity` includes gift lines, pass
    `cart.totalQuantity − Σ gift line quantities`. `value`, `currency`,
    `pouches`, `discount_codes`, `gifting_audience` unchanged.
  - Touch nothing else in the checkout click handler: the
    `prepareCheckoutHandoff` race, the 1200ms timeout, and
    `window.location.assign` stay exactly as they are (§7 rule 4).
- `sampleOnly` and the shipping meter need no changes (£0 lines do not move
  totals; the reconcile guarantees gifts never exist without pouches).

`components/shop/buy-box.tsx`: no code change expected; the Includes panel goes
through `includedItemsForQuantity`, which Phase 1 capped. Verify The full table
shows "2 refillable table jars" and "1 masala dabba" with worth struck out.

Checkpoint (mock): run the whole matrix in §7 below at 375 and 1280.

## 6. Phase 4: server-side clamp (hardening, small)

New `lib/commerce/shopify/gift-policy.ts` with
`enforceGiftPolicy(cart: Cart): Promise<Cart>`: using `khanaPouchCount` and
`giftLinesForPouchCount` (both importable server-side from catalog.ts), check
the mapped cart after each mutation; if a gift line exceeds its cap, or gifts
exist with zero pouches, issue the corrective
`cartLinesUpdate`/`cartLinesRemove` via `shopifyFetch` and return the corrected
cart. On any error return the uncorrected cart (the clamp must never fail a
legitimate request). Wire it into the `create`, `add-lines` and `update-lines`
route handlers after `unwrapMutation`. This closes the "POST the £0 jar variant
straight at /api/cart/add-lines" hole and the free-jar-only order.

Checkpoint: `curl` the add-lines route with jar quantity 5 on a one-pouch cart;
response cart holds 1 jar. Add a jar to an empty cart; response holds none.

## 7. Phase 5: docs, lint, full verification

Docs (same commit as the code):
- NEXT_STEPS.md §1: rewrite the included-items line (the old decision "part of
  the bundle variant, Shopify does not model them" is reversed): gifts are £0
  products HELDI-JAR / HELDI-DABBA added by the site, capped 2 jars + 1 dabba
  per order, compare-at mirrors `EXTRA_VALUE_PENCE`. Add unchecked admin boxes
  for anything from Phase 0 step 2 that was handed over rather than done.
- docs/launch-runbook.md: update the included-items decision where it appears,
  and add "gift lines show as FREE at checkout" to the Phase 4 end-to-end
  verification list.
- BRAND.md §11.3: add a bullet: jar/dabba worth (`EXTRA_VALUE_PENCE`) and caps
  (`GIFT_CAPS`) repeat in the Shopify compare-at prices and the pick-pack
  sheet; grep terms `jar`, `dabba`, `GIFT_CAPS`.

Gates: `npm run brand-lint` (fix errors, review warnings), `npm run build`,
grep the diff for `—`.

Verification matrix, mock provider first, then `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`
against the live store (this is the same end-to-end pass that validated the
connect on 16 Jul; rerun it):
1. Pouch stepping 0→6→0: gift lines match the D2 table at every count; badge
   counts pouches + samples only; drawer shows gifts as included rows with no
   controls.
2. Worked numbers, one pouch + ACHABETA: rows read Launch saving −£5.00,
   Discount (ACHABETA) −£3.00, You're saving £8.00, Total £27.00, Shipping
   £3.55. The pair + SHABASH: −£15.00, −£5.50, £20.50, Total £49.50, free
   shipping. The full table: Launch saving −£25.00, no discount row (code not
   applicable, BEST_PRICE_HINT behaviour unchanged), You're saving £25.00.
3. Remove the code: discount row disappears, headline drops accordingly.
4. Sample only: no gifts, free shipping, no savings rows.
5. Stale-cart migration: seed a cart, strip its gift lines via devtools (or a
   pre-change build), reload; hydration reconcile restores them once.
6. Live checkout handoff: click Checkout, land on Shopify checkout, see the jar
   and dabba lines at FREE with images; totals match the drawer; complete
   runbook Phase 4 checks.
7. Analytics: dev console shows `[analytics] savings_displayed` and
   `[analytics] begin_checkout` with the expected props; a `POST /ingest/e/`
   succeeds.
8. Both breakpoints (375, 1280) for the drawer summary and the PDP Includes
   panel; the two-layout contract (PLAYBOOK §1) applies to the new rows.

## 8. Acceptance criteria

- [ ] Shopify holds HELDI-JAR and HELDI-DABBA at £0.00 (compare-at £8.00 /
      £15.00), untracked inventory, published to the Storefront token's
      channel, not on Online Store, with images.
- [ ] Gift cart lines exist iff pouches > 0, quantities per the D2 table, in
      mock and live modes, surviving reload and stale carts.
- [ ] Shopify checkout lists the gifts as FREE.
- [ ] Drawer summary shows Launch saving and Discount (CODE) as separate rows;
      headline equals their sum; gift worth appears only on item rows.
- [ ] Caps hold against direct /api/cart abuse (Phase 4 clamp).
- [ ] Badge, `item_count`, `basket_savings_total` semantics unchanged
      (paid-units and launch+discount respectively).
- [ ] PDP Includes for The full table says 2 jars + 1 dabba.
- [ ] brand-lint, build, em-dash grep, 375/1280 checks all pass; NEXT_STEPS,
      runbook and BRAND §11.3 updated.

## 9. Out of scope (do not drift into these)

- Jar colour choice (gold/silver) as a shopper-facing option; the pick-pack
  decides colours.
- Regenerating `khana-bundle-3.webp` (three jars in shot); photos are
  placeholders awaiting real product photography. Alt text only.
- Any change to the gifting discount codes, their eligibility, or the
  one-discount rule.
- Klaviyo, subscriptions, reviews, the domain split.
