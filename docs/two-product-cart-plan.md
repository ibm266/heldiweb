# Plan: Khana and Chai on one ladder, in one basket, through one checkout

Written 2 Sep 2026 for execution by a coding model. **Simplified 4 Sep 2026 to
singles and pairs only** (see P1): five Shopify variants instead of twenty-seven,
one set of presents per order, and a two-choice picker. The phase structure is
unchanged; every "27" below became a 5. Companion files:
NEXT_STEPS.md §1c (the decision, in status form), the Heldi Price Book
(claude.ai/code/artifact/bee7cef4-bc72-48bb-b4a7-e4f1bddbfd9c, the working and the
rate card), docs/launch-runbook.md (Shopify mechanics), docs/go-live-checklist.md
(the gate), BRAND.md §11.3 (price-change map), PLAYBOOK.md §7 (analytics contract),
docs/free-gift-cart-plan.md (the last cart rework, same shape as this one). Work the
phases in order; each ends with a checkpoint. Phase 0 can ship on its own this week.
Phase 1 produces the variant GIDs that Phase 2 needs.

House rules that apply to every phase: no em dashes in any copy string (grep the
diff for `—` before finishing); all money from `lib/pricing.ts` integer pence, never
hard-coded; components call `track()` from `lib/analytics.ts` only and keep the
load-bearing event names; every `app/api/` route calls `guard()` first; run
`npm run brand-lint && npm run typecheck && npm run build` before declaring a phase
done; verify the drawer and both product pages at 375 and 1280.

## 0. What this changes, in one screen

Today the shop sells one product through three fixed bundles. `lib/pricing.ts`
holds Khana tiers (One pouch £30 / The pair £55 / The full table £80, each with a
struck-through RRP), `packPouches` repacks a pouch count into those tiers, the cart
holds at most one line per tier, the family codes take 10% off single and pair only,
and the waitlist is promised 20% off. Chai has a page (`/shop/chai`, shipped 1 Sep)
but no price, no variant and no add-to-basket path, because none of the above has a
product dimension: one Khana plus one Chai would repack into a pair of Khana.

After this plan:

| | Today | After |
|---|---|---|
| Price on the page | Launch price with RRP struck through | RRP as the anchor: one pouch is £35, and from two up the RRP is struck through beside the price with the bundle saving named |
| Ladder | £30 / £55 / £80 for 1 / 2 / 3 Khana | £35 RRP a pouch less £5 off the second, any mix, up to a pair: £35 / £65 |
| Shopify | "Heldi Khana", 3 tier variants + Sample | One product "Heldi pouches", 5 fixed-price size-and-mix variants (`HELDI-K1C1` = 1 Khana + 1 Chai); Sample stays its own product |
| Basket | One Khana pouch line, stepped one at a time | Two pouch counts (Khana, Chai) mapped to one variant line; two steppers, one price |
| Family codes | 10%, single and pair only, no per-customer limit | 15%, any quantity, one use per customer, printed on the site |
| Waitlist reward | 20% (`PEHLEAAP`), promised in 8 places | 25% founders code for close friends + the first 100 joiners, one use each; `PEHLEAAP` never created |
| Email after launch | Nothing | Free first-order postage for an email; a shipping discount, so it stacks with a family code |
| Presents | Jar per pouch (cap 2) + dabba on a full table, every order | One set per order: 1 pouch a jar, 2 pouches a jar and a tote. No dabba. First order only (see D2 for run 1) |
| Samples | One Khana sachet, £5 | Khana sachet £5, Chai sachet £5, pair pack (one of each) £8. Outside the ladder, in no code, no presents |
| Stock | Shopify `totalInventory: 80` on one tier variant, decrements the wrong thing | Variants untracked; the site keeps a pouch count per product from the orders webhook and the pickers refuse what stock cannot cover |

Revenue at the assumed run-1 mix is about £14.2k of £16.7k all-RRP; every public
price stays at or above 49% landed margin. The reasoning is in the Price Book; this
document is only the build.

## 1. Decisions (locked, do not relitigate)

From the Price Book and NEXT_STEPS §1c, 2 Sep 2026:

- **P1. Ladder. SIMPLIFIED 4 Sep 2026 to singles and pairs.** `price(n) = 3500 +
  3000 * (n - 1)` pence for `1 <= n <= 2`, counted across Khana and Chai together.
  Chai 250g is priced identically to Khana 300g. **Two is the ceiling**, so there are
  exactly five things a customer can buy: one Khana, one Chai, two Khana, two Chai,
  or one of each. The pickers stop there ("email us for more"). The low ceiling is
  the point: it keeps Shopify at five variants, keeps the picker to two choices, and
  makes "one set of presents per order" true by construction rather than by a cap.
  Raising it later is one constant (`MAX_POUCHES`) plus the extra Shopify variants;
  nothing else in the model changes. Revisit on feedback.
  **Restated and built 4 Sep 2026** as RRP minus a bundle discount, which is the same
  arithmetic (`3500n - 500(n - 1)`) told as a story a customer can follow: one pouch
  is the £35 RRP, and every pouch after it is £5 less. `lib/pricing.ts` section 1 now
  holds it as three parameters (`RRP_PENCE`, `BUNDLE_DISCOUNT_PENCE`, `MAX_POUCHES`)
  with `ladderPence`, `rrpPence`, `bundleSavingPence`, `perPouchPence` and
  `nextPouchPence` derived from them, and `npm run pricing-check` asserts the card.
  Chai parity was re-confirmed the same day; it is load-bearing, because a different
  Chai price collapses "one price per total pouch count" and with it the variant set.
- **P2. RRP is the anchor, and the bundle discount is shown. REVISED 4 Sep 2026.**
  The launch price goes: no compare-at on any pouch variant, no "Launch prices. Not
  forever prices." block, and nothing that implies today's price is temporary. What
  replaces it is not a bare number. From two pouches up the page shows the RRP struck
  through beside the price and names the saving ("£70 £65, you save £5"); at one pouch
  there is no saving, so there is no strikethrough. This reverses the original P2, and
  the reason it is allowed where the launch price was not: £35 is a price a customer
  can actually buy a single pouch at right now, so the comparison is real rather than
  a reference to a price nobody was ever charged. That is the line the CMA and the
  DMCC draw, and the old launch price sat on the wrong side of it. (The £0 presents
  keep their compare-at; that is their stated worth, not a former price.)
- **P3. Codes.** ACHABETA / RISHTA / SHABASH: 15% off pouch variants only, any
  quantity, one use per customer, one code per order, printed in the gifting band.
  Founders: 25% off pouch variants, one code per person, for close friends and the
  first 100 waitlist joiners, sent in the launch email. Welcome: free shipping on the
  first order for an email, issued after launch, the one discount that combines with
  a product discount. Nothing else combines. No code ever touches the Sample.
- **P4. Presents. SIMPLIFIED 4 Sep 2026: one set per order.** `HELDI-JAR` (£0,
  compare-at £8) and a new `HELDI-TOTE` (£0, compare-at to set, tote costs about £1).
  By total pouches: **1 → 1 jar; 2 → 1 jar + 1 tote.** That is the whole table. Never
  two jars, never a set per pouch. `HELDI-DABBA` is unpublished and its worth line,
  cap and nudge leave the code. The tote's stated worth is still unquoted (D6) and is
  the one thing here that cannot ship as it stands.
- **P4b. Samples. AGREED 4 Sep 2026.** Three ways to buy the 3-serving trial
  sachet: `HELDI-SAMPLE` (Khana) £5, `HELDI-SAMPLE-CHAI` £5, and
  `HELDI-SAMPLE-PAIR` £8, a fixed one-of-each pack at £2 off the two singles.
  The pair is a curated pack, not a mix, so there is no two-Khana sample and the
  mix SKU parser never runs over a sample line. Samples stay outside the pouch
  ladder, outside every discount code, earn no presents, and do not count toward
  `MAX_POUCHES`. They ship free on their own because Heldi absorbs the Large
  Letter. **Open: weigh the pair pack.** Two sachets have never been weighed
  together, and if the pack fails the Large Letter thickness the parcel rate eats
  the margin. The Chai sachet is gated on the same NEXT_STEPS §1b gates as the
  Chai pouch, and its shot already exists at
  `public/images/originals/pre-webp/shop/chai-sample.png`.
- **P5. Shopify shape.** One product, "Heldi pouches", 5 variants, prices from P1,
  inventory untracked on all of them. The site picks the variant from the two pouch
  counts. Reporting and stock come from the orders webhook, not Shopify analytics.
- **P6. Pages stay separate.** `/shop` is Khana, `/shop/chai` is Chai. Each page
  defaults its own product to one pouch. Chai stays unsellable until the gates in
  NEXT_STEPS §1b clear (formulation, nutrition table, label, gluten result); this plan
  builds the path and leaves it switched off for Chai.

Build decisions this plan makes (mine; overrule in the phase that uses them):

- **D1. The SKU is the key, not the option values.** `HELDI-K{k}C{c}` with
  `k + c = n`. Everything in code that needs the two counts parses the SKU
  (`parseMixSku`), which the Storefront cart line already carries; nothing reads
  `selectedOptions`, so the option shape in Shopify admin is free. Recommendation:
  **one option, "Mix", with 5 values** ("1 Khana", "1 Chai", "2 Khana", "2 Chai",
  "1 Khana + 1 Chai") rather than §1c's two options (Pouches 1–2, Khana 0–2). Three
  reasons: the heldi-shopify MCP `create_variants` takes one option per variant;
  a two-option grid creates invalid combinations that have to be deleted by hand;
  and the checkout line then reads "Heldi pouches, 1 Khana + 1 Chai, £65", which a
  customer understands without doing arithmetic. If the two-option shape is
  preferred, build it in admin instead; the code does not change.
- **D2. Presents go in every order for run 1.** The headless cart cannot see a
  customer's order history before checkout, and a checkout that lists a free jar has
  to ship one. Nearly every run-1 order is a first order. Gating waits for a
  customer-account signal (NEXT_STEPS §5). The pick-pack sheet is the truth for what
  goes in the box; if a repeat customer is spotted by eye, the jar still ships.
- **D3. `PEHLEAAP` is never created.** The four people on the list today are inside
  the first 100, so the 25% founders code honours the 20% promise with room to spare.
  The site copy changes now (Phase 0) so nobody is promised 20% again.
- **D4. Welcome postage is one static code, once per customer, for run 1.** Klaviyo
  can only mint unique codes through its Shopify integration, which is not connected
  (zero coupons, zero flows on 2 Sep 2026). A static shipping code leaks at most
  £3.55 per single-pouch order and nothing on pairs and above, which already ship
  free. Revisit with Klaviyo unique codes when the integration exists.
- **D5. Founders codes are one Shopify discount with many codes.** "Founders 25%"
  as a `DiscountCodeBasic` with a code per person: `SHUKRIYA-<NAME>` for close
  friends, and one per first-100 joiner generated from the waitlist table in
  `joined_at` order. Each code: usage limit 1, once per customer. The launch email
  mail-merges the code from a Klaviyo profile property. Needs either an admin CSV
  import or a new MCP tool (`discountRedeemCodeBulkAdd`); the MCP server is ours.
- **D6. Tote worth.** `EXTRA_VALUE_PENCE.tote` proposed at 600 (£6) pending the
  quote. It is a stated worth on a free item, so it must be defensible against the
  tote's retail price once one exists.
- **D7. Analytics names stay.** `view_item`, `add_to_cart`, `tier_selected`,
  `begin_checkout`, `savings_displayed`, `purchase` and the gifting events keep their
  names. `tier_selected` now carries `tier` = the mix SKU (`HELDI-K2C1`) so the
  "bundle interest" tile keeps reading; `add_to_cart`, `begin_checkout` and
  `purchase` gain `pouches`, `khana` and `chai` number props. Additive props are
  safe; renames are not (PLAYBOOK §7).
- **D8. The stepper cap is total pouches, per basket, two.** Adding a Khana when
  the basket already holds two pouches is refused with a one-line note, not a silent
  clamp.

## 2. Phase 0: copy that is true today (ships alone, waitlist mode)

Nothing here needs Shopify or the cart. It stops the site promising things the
decision has withdrawn, and it can go out this week.

1. `lib/pricing.ts`: `WAITLIST_OFFER` becomes `{ percent: 25, firstJoiners: 100 }`
   and loses `code` and `windowDays` (the code strings live in Shopify and the
   launch email only). Do not touch `TIERS`, `GIFTING` or the gift constants yet;
   Phase 2 replaces them together.
2. Rewrite the eight "20% off your first order" surfaces to "the first 100 to join
   get 25% off at launch" (wording per surface, number from `WAITLIST_OFFER`):
   `components/heldi-homepage.tsx` (ticker `TICKER_COPY_WAITLIST`, the hero incentive
   near line 284, the final CTA near line 1396), `components/waitlist-popup.tsx`,
   `components/waitlist-form.tsx` (success line), `components/site-faqs.ts` (launch
   FAQ), `components/shop/buy-box.tsx` (waitlist shipping note),
   `components/shop/chai-buy-box.tsx` (promise line). The live-mode ticker line
   "LAUNCH PRICES ON NOW" goes too; "AUNTIES & UNCLES PAY LESS" stays.
3. Klaviyo template `VnY8iQ` ("Waitlist welcome") still says "20% off your first
   order... on top of launch prices (£30 for a pouch instead of £35)". Both halves
   are now false. Rewrite to the first-100 / 25% promise and RRP; the
   heldi-email-writer skill's locked prices and "no stacking" rule change to match
   (free postage is the one thing that stacks).
4. Chai pouch facts: `components/shop/chai-data.ts` `CHAI_POUCH_GRAMS` 100 → 250
   and `CHAI_MUGS_PER_POUCH` 12 → 31 (250 / 8, rounded down), with the header note
   updated: the Price Book settles the retail pouch at 250g; the 100g print artwork
   is the sample. Everything else in §1b stays gated.
5. The dabba leaves the copy: `docs/legal/terms-and-conditions.md` ("jars or the
   masala dabba"), `docs/legal/shipping-policy.md` and
   `docs/legal/returns-refunds-policy.md` ("jars, masala dabba") become "jars or
   the tote". The drawer nudge and the gift helpers go in Phase 3, not here.

Checkpoint: `grep -rn "20%" app components lib` finds only `chai-data.ts` (the
"20% of energy from protein" claim rule); brand-lint, typecheck, build pass; the
homepage, popup, FAQ and both product pages read the new promise at 375 and 1280.

## 3. Phase 1: Shopify (blocks Phase 2; needs the 5 GIDs)

Via the heldi-shopify MCP where it can, admin where it cannot. The current
"Heldi Khana" product and its three codes stay ACTIVE until launch day; the new
product is built DRAFT beside it.

1. `create_product` title "Heldi pouches", status DRAFT, options
   `[{ name: "Mix", values: [...5 values...] }]` (D1), description one brand-voice
   line, tags `["pouches"]`. Then `create_variants` with all 5: `optionName: "Mix"`,
   `optionValue` per D1, `price` from P1 by `n`, `sku: HELDI-K{k}C{c}`, no
   `compareAtPrice`. Record every variant GID against its SKU.

   The valid set, for the record (n = k + c):

   | n | price | SKUs |
   |---|---|---|
   | 1 | £35 | K1C0, K0C1 |
   | 2 | £65 | K2C0, K1C1, K0C2 |

   Five variants, and `npm run pricing-check` prints exactly this list.

1b. Samples (P4b). The Sample is currently a fourth variant of "Heldi Khana",
   which is archived on launch day, so it needs its own home first. Create
   `create_product` "Heldi samples", status DRAFT, one option "Sachet" with three
   values ("Khana", "Chai", "Khana + Chai"), then `create_variants`: `HELDI-SAMPLE`
   £5, `HELDI-SAMPLE-CHAI` £5, `HELDI-SAMPLE-PAIR` £8, no compare-at, inventory
   untracked. Keep the existing `HELDI-SAMPLE` SKU string: the orders webhook and
   `lib/commerce/catalog.ts` both key off it. Publish to the Headless channel and
   leave it on the Sample shipping profile, which is unchanged.
2. `create_product` "Heldi tote", status ACTIVE, price "0.00", tag
   `gift-with-order`; `set_price` compare-at per D6. Rename the jar product to
   "Refillable table jar" (`update_product`; the checkout line and the confirmation
   email print the Shopify title). Set `HELDI-DABBA` to ARCHIVED.
3. Admin checklist (no MCP tool covers these; hand over as a to-do list if not done,
   never silently skip): SKUs `HELDI-JAR` and `HELDI-TOTE` on the gift variants (both
   `sku: null` today); **untrack inventory** on all 5 pouch variants and both gifts;
   publish "Heldi pouches", the jar and the tote to the **Headless channel the
   Storefront token uses** and remove the gifts from Online Store; product images
   (`public/images/shop/khana-1.webp`, `chai-1.webp`, `gift-jar-gold.webp`, a tote
   shot); variant weights (0.4kg per pouch, additive) so Click & Drop labels are
   right.
4. Discounts. `create_discount_code` cannot set once-per-customer or
   `combinesWith`, so either extend the MCP server (`~/Projects/heldi-shopify-mcp`,
   ours) or do these in admin:
   - Delete the three 10% codes; recreate ACHABETA, RISHTA, SHABASH as 15% product
     discounts on the 5 pouch variants, usage once per customer, combines with
     **shipping discounts only**.
   - "Founders 25%": product discount on the 5 variants, codes per D5, each usage
     limit 1 and once per customer, combines with shipping discounts only.
   - "Welcome postage": free-shipping discount, code per D4, once per customer,
     combines with **product discounts only**, UK only.
   - The Sample, the jar and the tote appear in no discount's product list.
5. Shipping profiles (admin): the general profile now holds the 5 pouch variants
   plus both gifts (Tracked 48 £3.55 under £40, free at £40 and over); the Sample
   profile is unchanged. With the ladder, only a single pouch ever pays postage.

Checkpoint: a Storefront `cartCreate` with `HELDI-K1C0` + jar returns £35 and
£0.00 with no userErrors; `HELDI-K1C1` + jar + tote returns £65; `SHABASH` on
`K1C0` gives £29.75 and the welcome code on top leaves `discountCodes` with both
`applicable: true`; `SHABASH` on a Sample-only cart is not applicable. Do not start
Phase 2 until this passes.

## 4. Phase 2: the model (`lib/pricing.ts`, `lib/commerce/catalog.ts`, the mock)

`lib/pricing.ts`: **partly built 4 Sep 2026.** Section 1 (the ladder), section 4
(the three code classes) and the `npm run pricing-check` gate are in, added beside
the July model rather than replacing it so the build stayed green. What is left here
is the deletion, once the callers below stop reading it.
- Delete `TierId`, `Tier`, `TIERS`, `TIER_ORDER`, `FEATURED_TIER`,
  `tierSavingsPence`, `PouchPacking`, `packPouches`. Already added:
  ```ts
  export const MAX_POUCHES = 2;
  export const FIRST_POUCH_PENCE = 3500;
  export const NEXT_POUCH_PENCE = 3000;
  export function ladderPence(pouches: number): number   // 0 for 0, throws above MAX
  export function nextPouchPence(pouches: number): number // what one more costs (3500 at 0, else 3000)
  ```
- ~~`GIFTING.percent` 15; the three codes unchanged. Add `FOUNDERS`, `isFoundersCode`, `WELCOME_POSTAGE`, `isWelcomeCode`~~ **done 4 Sep**, plus `isProductDiscountCode` so the drawer and the mock classify a code the same way. Note `GIFTING.percent` is now 15 while Shopify still holds three 10% codes: every surface reading it is live-mode gated, but the codes must be rebuilt before the mode flips. Still to do: delete `WAITLIST_OFFER`, `isWaitlistCode` and `waitlistDiscountPence`, which waits on the Phase 0 copy sweep because eight surfaces still render the 20% promise.
- ~~Presents~~ **done 4 Sep**: `GIFT_CAPS` is `{ jars: 1, totes: 1 }` and `presentsForPouches(n)` returns `{ jars: n >= 1 ? 1 : 0, totes: n >= 2 ? 1 : 0 }`, one set per order. `EXTRA_VALUE_PENCE` gained `tote: 600`, which is PROVISIONAL and must not ship (D6). `giftCountsForPouches` survives only as the retired jar/dabba shape the cart still calls; it now returns the jar and never the dabba, so the old wiring can only under-give. Every remaining dabba reference goes when the cart moves to `presentsForPouches`.
- `SHIPPING` unchanged.

`lib/commerce/catalog.ts`:
- Replace the tier constants with `MIX_SKU_PREFIX`, `mixSku(k, c)`, `parseMixSku(sku): { khana, chai, pouches } | null`, `MIX_VARIANT_IDS: Record<string, string>` (SKU → GID from Phase 1), `mixVariantIdFor(k, c)`, `isMixSku`.
- One sellable product `heldi-pouches` in `PRODUCTS` with the 5 variants (price from `ladderPence`, `compareAtPrice: null`, `image` chosen by the mix: Khana shots for c = 0, Chai shots for k = 0, a mixed shot otherwise, falling back to the majority product). The Sample stays a variant of a small `sample` product or of `heldi-pouches`; keep whichever makes `findVariantById` simplest, but its SKU stays `HELDI-SAMPLE`.
- Two **display** products for the pages, `khana` and `chai` (title, legal name, lede, images, `sellable` flag), returned by `getProduct(handle)`; the buy box reads display facts from these and prices from the ladder. `CHAI_SELLABLE = false` lives here (or `lib/commerce/config.ts`), read by the buy box, the drawer and the server clamp.
- Cart helpers rewritten on the SKU: `pouchCounts(lines): { khana, chai, pouches }` replaces `khanaPouchCount`; `mixLineForCounts(k, c): CartLineInput | null` replaces `linesForPouchCount`; `giftLinesForPouchCount(n)` and `includedItems*` follow the new caps and add the tote (`TOTE_THUMB`, `isToteGiftLine`); `cartItemCount` counts pouches from the SKU plus Sample quantity, never gifts; `giftingEligiblePenceForLines` becomes `pouchPenceForLines` (every pouch variant at its price; family, founders and welcome codes all key off it; the Sample is excluded); delete `waitlistEligiblePenceForLines`; `khanaImageForPouches` → `imageForCounts(k, c)`.
- `lib/commerce/types.ts`: `ProductHandle` gains `"heldi-pouches" | "tote"`, loses `"masala-dabba"`.

`lib/commerce/mock-provider.ts`: `materialize` recomputes prices from the ladder;
codes: at most one applicable **product** code (family or founders, on the pouch
pence) and at most one applicable **shipping** code (`isWelcomeCode`, always
applicable when a pouch line exists); `totalAmount` excludes shipping as Shopify's
does. A `shippingDiscountApplied` boolean is not in the Shopify shape, so the drawer
derives it from `discountCodes` (below). Storage key bumps to `heldi_cart_v2` so old
tier carts are dropped rather than mis-priced.

`scripts/pricing-check.mjs` **built 4 Sep 2026** (there is no test runner; a plain
script run by hand and in the finishing gate). It imports the real `lib/pricing.ts`
through Node's `--experimental-strip-types`, so it cannot drift from what the site
uses, and it states the agreed rate card as literals so changing a parameter fails
loudly. It asserts the ladder table, the 5 SKUs are unique and every
`(k, c)` with `1 <= k + c <= 6` resolves to a GID, `giftCountsForPouches` matches
P4, `parseMixSku(mixSku(k, c))` round-trips, and 15% / 25% of each ladder step
equals the rate card (£29.75 / £26.25, £55.25 / £48.75, £80.75 / £71.25,
£106.25 / £93.75, £131.75 / £116.25, £157.25 / £138.75).

Checkpoint: the script passes; `npm run typecheck` fails only in the components
Phase 3 and 4 will rewrite (list them in the commit message).

## 5. Phase 3: the basket (`cart-context.tsx`, `cart-drawer.tsx`, the clamp)

`components/cart/cart-context.tsx`:
- `setPouchCount(n)` / `addPouches(n)` become `setPouchCounts({ khana, chai })` and
  `addPouches({ khana?, chai? })`. The managed lines are: the one mix variant line
  (any line whose SKU `isMixSku`) plus the gift lines. Target = `mixLineForCounts`
  ∪ `giftLinesForPouchCount(k + c)`; the same additions/updates/removals diff as
  today, so changing a count replaces the variant line rather than editing its
  quantity. Refuse `k + c > MAX_POUCHES` and `chai > 0 && !CHAI_SELLABLE` before
  any mutation, returning `false` with a drawer message ("Two pouches is the most
  one order can carry. Email us for more.").
- `reconcileGiftLines` runs on the new counts; it also collapses two mix lines into
  one if a cart mutated outside the site ever holds both.
- Gifting method logic: `applyGifting` replaces any existing **product** code
  (`isGiftingCode || isFoundersCode`) and leaves a welcome code alone;
  `removeGifting` likewise. `applyDiscount` for an unknown string is unchanged.

`components/cart/cart-drawer.tsx`:
- Replace the single "khana-pouches" row with a **Pouches group**: one row per
  product with pouches > 0 (image, "Heldi Khana" / "Heldi Chai", a stepper, and
  "£X per meal" / "£X a mug" from the ladder share), a group line "3 pouches, £95"
  with "one more is £30" while at a single, and the presents list under the group.
  Mobile: rows stack, group line under them. Wide: the same, the drawer is narrow
  at both widths; no second layout needed, but verify the two-stepper row fits
  at 375.
- Summary rows: "Discount (CODE)" (product code, from `fullPricePence - totalPence`
  as today), "Free gifts" (worth of jar and tote lines), "You're saving" = their
  sum. **Delete "Launch saving"** and every `compareAt` read on pouch lines.
  Shipping row: `0` when `sampleOnly`, or total ≥ £40, or an applicable welcome code
  is on the cart; add the row "Free postage (WELCOME)" as text, not money, when the
  welcome code is the reason. The Sample nudge stays and now bites on every
  single-pouch basket (£35 + £5 = £40).
- The gifting checkbox locks when any applicable **product** code is on the cart
  (this closes the go-live item about the 20% code + checkbox stacking); the code
  field never locks for the welcome code. `BEST_PRICE_HINT` now only appears on a
  Sample-only basket. Remove the dabba nudge; add "Two pouches ship free, and add a
  tote" at one pouch (copy per BRAND §6, one easter egg per surface, the drawer
  already has none). With the ceiling at two this nudge is the only upsell there is,
  so it earns its place.
- `begin_checkout`: `item_count` = pouches + samples (from `cartItemCount`),
  `pouches`, plus `khana` and `chai` (D7). The handler, the 1200ms race and
  `window.location.assign` do not move (PLAYBOOK §7 rule 4).
- `savings_displayed`: `basket_savings_total` = discount + gift worth;
  `launch_savings` is dropped from the props (additive removal is safe, the tile
  reads the total).

`components/cart/cart-icon.tsx`: unchanged; it calls `cartItemCount`.

Server clamp: rename `lib/commerce/shopify/gift-policy.ts` to `cart-policy.ts`,
`enforceCartPolicy(cart)`: gift caps from the parsed pouch total; remove any mix
line with `chai > 0` while `!CHAI_SELLABLE`; remove mix lines beyond the first
(keep the one with the larger pouch count); reject `pouches > MAX_POUCHES`. Wire it
into **all** of create, add-lines, update-lines and remove-lines (remove-lines is
the go-live gap). Cap array lengths on those routes and `attributes` mirroring
`MAX_CODES` (another go-live item, same files, do it here). Do not delete the saved
cart id on a non-404 GET failure (go-live item; `shopify-provider.ts` +
`cart-context.tsx` mount effect).

Checkpoint (mock, `npm run dev`, dev-toggle to live): step Khana 0→1→2→3, add Chai
1→2, watch the single mix line's SKU walk K1C0 → K2C0 → K1C1 → K0C2 and the
gift lines hold 1 jar / 1 jar + tote; try a third pouch and read
the refusal; remove all pouches and confirm gifts vanish; Sample alone has no gifts
and ships free; SHABASH on one pouch reads Discount −£5.25, Total £29.75, Shipping
£3.55; add WELCOME and shipping reads Free; the checkbox is locked while SHABASH is
on and free while only WELCOME is on.

## 6. Phase 4: one buy box for two pages

Replace `components/shop/buy-box.tsx` and the CTA half of
`components/shop/chai-buy-box.tsx` with one `PouchBuyBox({ product })` where
`product` is the `khana` or `chai` display product. The gallery, pills, legal name,
lede, nutrition link, accordions and statutory block stay per product (Chai keeps
`chai-accordions.tsx`, `chai-data.ts` and its steps band); only the pricing and
add-to-basket column is shared.

- Own product picker 1–2 (radio cards keep the
  `option-card` look and the `tier_selected` event, now with `tier` = the SKU).
  A second, quieter row "Add [other product] to the same parcel" 0–1, hidden while
  the other product is not sellable (Chai today) and hidden on the Chai page while
  Chai itself is not sellable. Combined cap two. With only two rungs this is a pair
  of radio cards, not a stepper.
- Price block: the ladder total for the selection, "£X each after the first" as the
  story, per-meal (Khana, 25 meals a pouch at 12g) or per-mug (Chai, 31 mugs at 8g)
  under it. **No `Rrp`, no `LAUNCH PRICES`, no "below RRP", no BEST VALUE flag**;
  per-pouch price only falls, so there is no tier to flag.
- Size: the "300g pouch / Sample" radio stays on Khana; Chai has no sample and shows
  no size row. Includes panel from `includedItemsForPouches(k + c)`.
- CTA: live and sellable → "Add to basket, £95" calling
  `addPouches({ khana, chai })`; live and not sellable (Chai) → the existing
  "Shop Heldi Khana" link; waitlist → "Join waitlist". The waitlist shipping note
  already reads the first-100 promise from Phase 0.
- `add_to_cart` fires only after the write lands (as today) with
  `format`, `pouches`, `khana`, `chai`, `value`.
- `app/shop/page.tsx` and `app/shop/chai/page.tsx` `AggregateOffer`: `lowPrice`
  £5 (Sample) on Khana, £35 on Chai; `highPrice` £185; `availability` from the
  stock read in Phase 5 (until then leave InStock and note it).
- Delete `gifting-popup.tsx` copy about "single pouches and 2-packs"; the band and
  popup say "15% off, any number of pouches, one code per order". The band keeps
  printing the codes (P3).
- `components/range-section.tsx` (the homepage two-pouch band being built on
  2 Sep): its Chai card says "a page and no price, in either commerce mode".
  Drive that line off `CHAI_SELLABLE` so the card flips with the flag rather
  than by hand.

Mobile / wide spec (PLAYBOOK §1.3): Mobile: gallery, then the picker cards two
across, the add-the-other row as one line with a stepper, price block, CTA sticky
above the fold via the existing floating CTA suppression. Wide: sticky gallery,
picker three across, the add-the-other row inline with the price block.

Checkpoint: both pages at 375 and 1280; `view_item`, `tier_selected`, `add_to_cart`
in the dev console with the new props; the Khana page adds K2C0 and the drawer
shows one Khana row at 2; with `CHAI_SELLABLE` flipped true in dev the Khana page
offers "Add Chai" and adds K2C1.

## 7. Phase 5: stock kept by the site

Supabase (shared `heldi-dev` database: apply SQL by hand in the dashboard, never
`db push`): migration `0005_create_orders.sql` with `orders` (`shopify_order_id`
bigint PK, `order_number`, `created_at`, `email_hash`, `khana_pouches`,
`chai_pouches`, `samples`, `total_pence`, `discount_codes text[]`, `raw jsonb`) and
`stock_levels` (`product text PK` in `khana | chai | sample`, `starting int`,
`adjust int`, `updated_at`) seeded from the run-1 counts (Price Book: 253 Khana,
262 Chai; confirm against the batch sheet). A view `stock_available` = starting +
adjust − sum of sold from `orders`.

`app/api/webhooks/shopify-orders/route.ts`: after the signature check, upsert the
order row by `shopify_order_id` (idempotent; Shopify retries for 48h), deriving the
counts by `parseMixSku` over `line_items[].sku` and `HELDI-SAMPLE`. The PostHog
`purchase` event gains `pouches`, `khana`, `chai` (D7) and `item_count` becomes
pouches + samples rather than a sum of line quantities (one mix line is one
quantity today). Keep the always-200 rule; log and continue if the Supabase write
fails.

`app/api/stock/route.ts` (GET, `checkRate()` per CLAUDE.md, cached 60s): returns
`{ khana, chai, sample }` available. The buy box and the drawer cap each picker at
availability and show "Only 3 Khana left" under 10; at zero the product's page
shows a sold-out state ("Run 2 is coming. Tell me when it lands." with the waitlist
form, `placement: "sold-out-khana"`), the add-the-other row hides, and the schema
`availability` reads `OutOfStock`. Oversell between two simultaneous checkouts is
accepted for run 1 and corrected by hand.

Checkpoint: replay Shopify's "Send test notification" and a hand-built payload with
`HELDI-K2C1`; the `orders` row shows 2 / 1; `/api/stock` drops by the same; set
`adjust` to drive Khana to 2 and watch the picker refuse 3.

## 8. Phase 6: docs, gates, verification

Docs in the same commit as the code they describe:
- `NEXT_STEPS.md` §1: rewrite the Shopify bullets (one product, 5 variants, codes
  at 15% / 25% / welcome, jar + tote, dabba archived); §1c becomes "built, see
  docs/two-product-cart-plan.md" with the open decisions that remain (D2 gating,
  D4 unique codes, D6 tote worth); §1b's "Code, when Chai becomes buyable" shrinks
  to flipping `CHAI_SELLABLE` and the product facts.
- `BRAND.md` §11.3 (price / tier / discount map: ladder, codes, presents, the
  webhook as the stock source), §11.5 if launch-state copy moved, §5 mechanics
  ("never type £30" still holds; the delivery FAQ exception stays).
- `docs/launch-runbook.md` Phase 1 (product table → the 5 variants, tote, codes),
  Phase 3 (GIDs by SKU), Phase 4 (verification list below), Phase 6.5 (webhook now
  also writes stock).
- `docs/go-live-checklist.md`: the inventory-tracking decision (line 151) is
  superseded by Phase 5; the shipping-profile line names the 5 variants; the
  gifting-checkbox, remove-lines clamp, array-cap and cart-id items are closed by
  Phase 3; the sold-out item by Phase 5.
- `public/llms.txt` if it states prices; the heldi-email-writer skill's price and
  stacking rules; the pick-pack sheet in HeldiPM (`design/batch_sheet.py`) drops
  the dabba and adds the tote.

Gates: `npm run brand-lint` (no new warnings), `npm run typecheck`, `npm run build`,
`npm run pricing-check`, grep the diff for `—`.

Verification matrix, mock first, then `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`
against the DRAFT product (Storefront can cart a draft product only on the channel
it is published to; publish, test, keep the old Khana product live until launch):

| Basket | Code | Lines at checkout | Total | Shipping |
|---|---|---|---|---|
| K1C0 | none | Heldi pouches 1 Khana £35, jar FREE | £35.00 | £3.55 |
| K1C0 | SHABASH | same | £29.75 | £3.55 |
| K1C0 | SHABASH + WELCOME | same | £29.75 | Free |
| K1C0 + Sample | none | + Sample £5 | £40.00 | Free |
| K1C1 | none | 1 Khana + 1 Chai, jar + tote FREE | £65.00 | Free |
| K2C0 | SHUKRIYA-x | 2 Khana, jar + tote | £48.75 | Free |
| K0C2 | ACHABETA | 2 Chai, jar + tote | £55.25 | Free |
| Sample only | SHABASH | Sample | £5.00, code not applicable | Free |
| Sample pair only | none | 1 Khana + 1 Chai sachet | £8.00 | Free |
| K1C0 + Sample pair | none | 1 Khana £35, pair £8, jar FREE | £43.00 | Free |
| Sample pair | SHABASH | pair | £8.00, code not applicable | Free |
| K2C0 then + 1 | | refused, message shown | | |

Also: `begin_checkout` and `purchase` carry `pouches` / `khana` / `chai`; the
PostHog "bundle interest" tile still populates from `tier`; stale `heldi_cart_v1`
carts are dropped cleanly on first load; 375 and 1280 for the drawer and both
pages.

## 9. Launch-day order (replaces the product half of runbook Phase 7)

1. Phase 5 stock seeded from the physical count, not the batch plan.
2. Set "Heldi pouches" ACTIVE; set "Heldi Khana" (the tier product) to ARCHIVED
   after confirming no open carts reference its variants (the reconcile drops them
   anyway).
3. Founders codes generated and merged into Klaviyo profiles; the launch email goes
   out; the welcome pop-up is switched on the day after (P3: founders is the reason
   to be on the list before launch, welcome is the reason after).
4. Flip `NEXT_PUBLIC_COMMERCE_MODE=live`. The rest of the checklist is unchanged.

## 10. Acceptance criteria

- [ ] Shopify holds "Heldi pouches" with 5 untracked variants priced £35 / £65 by
      size, SKUs `HELDI-K{k}C{c}`, no compare-at; `HELDI-JAR` and `HELDI-TOTE` at £0
      with stated worth; `HELDI-DABBA` archived; all published to the Headless
      channel.
- [ ] Shopify holds "Heldi samples" with 3 untracked variants: `HELDI-SAMPLE` £5,
      `HELDI-SAMPLE-CHAI` £5, `HELDI-SAMPLE-PAIR` £8. No sample is in any
      discount's product list, none earns a present, and none counts toward the
      two-pouch cap.
- [ ] Family codes at 15% on pouches only, once per customer, combining with
      shipping discounts only; a founders discount at 25% with per-person codes;
      a welcome free-shipping discount that combines with product discounts only.
- [ ] `lib/pricing.ts` is the only place the ladder, the percentages, the caps and
      the worths live; `scripts/pricing-check.mjs` passes.
- [ ] A basket holds at most one pouch variant line, chosen from `(khana, chai)`,
      capped at two, with gift lines that match P4 in mock and live modes, surviving
      reload, stale carts and hand-crafted requests (server clamp on all four
      routes).
- [ ] Chai cannot be added anywhere while `CHAI_SELLABLE` is false, including via
      `/api/cart/*`.
- [ ] No pouch price anywhere is struck through; no "launch price" copy remains;
      no "20% off" copy remains; the Klaviyo welcome template matches.
- [ ] The drawer, both product pages and the schema read the same numbers as the
      rate card; the verification matrix passes against the live store.
- [ ] The orders webhook writes an idempotent order row and the stock endpoint,
      pickers and sold-out state follow it.
- [ ] Event names unchanged; `tier_selected` keeps `tier`; `add_to_cart`,
      `begin_checkout`, `purchase` carry `pouches`, `khana`, `chai`.
- [ ] NEXT_STEPS, BRAND §11.3, runbook, go-live checklist, legal drafts and the
      email skill updated in the same commits.

## 11. Out of scope (do not drift into these)

- Chai's product gates (formulation, nutrition table, label, gluten, organic): this
  plan builds the switch; NEXT_STEPS §1b decides when it flips.
- First-order gating of presents (D2), Klaviyo unique welcome codes (D4), the
  Klaviyo flows themselves, the referral scheme, subscriptions, customer accounts.
- Refund and cancellation webhooks adjusting stock (hand-adjust `stock_levels.adjust`
  in run 1).
- A third product (Dahi): the same model with three counts; `mixSku` is the only
  code that grows.
- Reshooting Khana on the navy v2 pouch, and any change to the reviews, the blog,
  or the domain split.
