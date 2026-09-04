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

## 1b. Put Heldi Chai on the shop line

The Chai product page ships at [`/shop/chai`](app/shop/chai/page.tsx) as a
**browsable, joinable page, not a buyable one**: gallery, positioning, the
BREW / COOL / STIR method, the statutory block and a waitlist CTA. It carries
no prices, no bundle tiers, no add-to-basket and no reviews, because none of
those exist for Chai yet. Everything that turns it into a second SKU is below,
and almost all of it is a decision rather than code.

The one-line reason there is no nutrition table on the page: **Chai's numbers
are not just provisional, they are contradicted**, and the reasoning is written
out in full at the top of `components/shop/chai-data.ts`. Khana's figures are
provisional but uncontradicted, which is why the site publishes those.

### Decisions only you can make

- [ ] **Is Chai in the next run at all, and is Dahi ahead of it?** HeldiPM's newest decision log (`context/product-gates.md`) still carries the Gate-2 line *"Chai spices not ordered this run"* and the Gate-3 line *"Chai market potentially larger, parked for behaviour not demand"*, and `data/project-status.json` names a two-SKU launch of **Khana and Dahi**, with Chai deferred. The August work resumed Chai development (testing day 16 Aug, print round 13 on 19 Aug, COGS 25 Aug) but no gate entry un-parks it, and the website has never heard of Dahi. The page as shipped does not depend on this answer. Every item below does
- [x] **Which formulation.** Decided 3 Sep 2026: the COGS `chai-current` blend (250 g pouch, no salt, 85:15 whey to plain micellar casein, 10% coconut sugar, ginger-led spices with 2% black pepper). The site carries it in `components/shop/chai-data.ts`; the round-13 print files still encode the earlier recipe and need re-emitting. Earlier note kept for the record: two were live and they disagreed. The pack artwork (HeldiPM `design/pouch-v2/CHAI-NUTRITION.md`, 18 Aug 2026) is 53.9% whey isolate / 13.5% micellar casein / 15% coconut sugar with a cardamom-led spice block. The COGS model (`lib/cogs/constants.ts`, `chai-current`, 25 Aug 2026) is 53.7% / 18.2% / 10% with a ginger-led block plus **2% black pepper**, which appears on no label anywhere. The print-ready PDFs on disk encode the older one. Nothing else on this list can be answered until one of them wins
- [x] **Net weight and mugs per pouch.** 250 g and 31 level tablespoons, from the COGS decision (site constants updated 3 Sep 2026; the print files still say 100 g). Earlier note: the print files say 100g and "around 12 servings"; the COGS model says a 250g pouch; HeldiPM's own pouch-v2 README calls 100g *"a placeholder for the sample"* and asks for a filled pouch to be weighed. The site currently states 100g / 12 mugs, from `CHAI_POUCH_GRAMS` and `CHAI_MUGS_PER_POUCH` in `components/shop/chai-data.ts`, because that is the pack in the product photography. Weigh a filled pouch and change those two constants together
- [x] **The serving size, and whether "5g per mug" survives.** It survives: 8 g is a LEVEL tablespoon (Mihir weighed a level spoon at 7 to 8 g, a heaped one at 12 to 14 g) and the calculation gives 5.1 g at the whey certificate's 87.3%. The site says "level tablespoon" everywhere Chai is spooned (`CHAI_SERVING_SPOON`). The roundel can come back onto the site's pack shots now; they were rendered without it. Earlier note: Every protein number hangs off the whey purity, and there are three figures in play. The pack table assumes 93.5% because that is what Khana's table implies. The Arla certificate of analysis behind `lib/cogs/constants.ts` says **87.3% as-is**, and at 87.3% an 8g spoonful of the pack formulation gives about **4.7g**, below even the 4.9g failure case the nutrition spec's own sensitivity note describes. If the certificate wins, the serving moves to 9g or the claim softens, and **the front-of-pack roundel, the back-of-pack claims strip and the print PDFs all have to be re-rendered**, because every one of them shows "5g PROTEIN PER MUG". The four site shots in `public/images/shop/chai-*.webp` already have the roundel removed, so they do not publish a figure the page withholds; they will need re-rendering again if the roundel comes back with a settled number
- [x] **The price ladder.** Settled 4 Sep 2026: Chai is priced identically to Khana, £35 a pouch with £5 off the second, and £5 a sachet. Parity is load-bearing, because a different Chai price collapses "one price per total pouch count" and with it the five-variant checkout. In `lib/pricing.ts` §1. Earlier note kept for the record: There was no agreed Chai price anywhere. `lib/cogs/constants.ts` carries £35 / £65 / £95 flagged `TIER_PRICES_PROVISIONAL.chai = true` and says outright *"Chai has no agreed pricing of its own and mirrors Khana for now"*; the only Chai price ever named is a **£20 entry point** for the 100g pouch in `data/project-status.json`, and it is recorded as parked. Note the COGS Khana ladder (£35/£65/£95) does not match the locked one in `lib/pricing.ts` (£35/£70/£105), so "mirror Khana" would mirror an error
- [x] **Does Chai get a Sample?** Yes, decided 4 Sep 2026. Three sample SKUs: `HELDI-SAMPLE` (Khana) £5, `HELDI-SAMPLE-CHAI` £5 and `HELDI-SAMPLE-PAIR` £8, a fixed one-of-each pack at £2 off the two singles. Prices are in `lib/pricing.ts` §2 and asserted by `npm run pricing-check`; the Shopify product is plan Phase 1 step 1b. The sachet shot is already rendered in the gitignored `public/images/originals/pre-webp/shop/chai-sample.png`. Still open: weigh the pair pack, because two sachets have never been weighed together and a parcel rate instead of a Large Letter would eat the margin. The Chai sachet is gated on the same blend sign-off as the Chai pouch
- [ ] **Do Chai pouches earn the free jar and the masala dabba, the 20% waitlist code, and the 10% family codes?** Today they would silently earn **nothing**: `khanaPouchCount`, `giftingEligiblePenceForLines` and `waitlistEligiblePenceForLines` in `lib/commerce/catalog.ts` all key off Khana's SKUs
- [ ] **"Organic".** The printed back-of-pack strip says `ORGANIC SPICES`. Organic is a certified term in the UK, Heldi holds no certification, and `lib/cogs/constants.ts` records that no organic ground clove exists to buy, so one Chai spice cannot be organic even in principle. It is deliberately absent from the website; it has to come off the pack or the certification has to happen
- [ ] **"England" or "the UK".** Khana's "What's inside" accordion says the blend is *"Blended and packed in England"*; the Chai pack footer and the Chai page both say *"the UK"*. Both can be true and the UK is the safer superset, but two products should not describe the same co-packer two ways. Pick one and make Khana match
- [ ] **The casein line in Our story.** `app/our-story/page.tsx` lists casein in the trial menu as *"turned dal to cement"*, and Chai is a whey-and-casein blend. True of dal and not of hot milk, but a reader on both pages will notice. Decide whether that line gains a clause

### Product facts the site cannot publish until the blend is signed off

All of these are gated on the formulation decision above, and all of them must
come from **analysis of the finished blend**, not from calculating the recipe.
Getting them wrong on pack is a false declaration under FIC Regulation
1169/2011, not a copy fix. Same rule as Khana (BRAND.md §11.1).

- [x] The **nutrition declaration**, calculated 3 Sep 2026 by `scripts/nutrition-calc.mjs` from the recipe and each ingredient's own analysis (FIC Art 31(4) allows it; Khana's table is on the same basis). `CHAI_NUTRITION_ROWS` in `chai-data.ts`, rendered in the Nutrition accordion and the shared nutrition modal. Still to do: send the finished blend for analysis and paste the analysed rows over the calculated ones
- [x] The **ingredients list with percentages**, in descending order, with QUID on the two milk proteins (`CHAI_FORMULA`)
- [x] The **protein per serving**: 5.1 g per 8 g level tablespoon, 64 g per 100 g; the pack and marketing prose say 5 g (`CHAI_PROTEIN_MARKETING_GRAMS`), declaration-adjacent surfaces say 5.1 g, the Chai equivalent of Khana's 10 vs 10.9 rule
- [x] The **amino acid profile**, calculated from the supplier whey profile and the published bovine casein composition, each scaled by its share of the protein (`CHAI_AMINO_ROWS`); the modal is now product-driven and Chai has it. Replace the casein half with the supplier's amino sheet when one exists
- [ ] **A gluten result.** "Gluten free" is a legally defined claim (under 20mg/kg, Reg 828/2014) and Chai's spices come from a different supplier to Khana's, so the badge is deliberately absent from the Chai page until this blend is tested. Add it to `CHAI_PILLS` in `components/shop/chai-data.ts` when the result lands
- [~] **A lactose figure.** Calculated at about 1.4 g per 100 g (0.1 g a mug) from the whey certificate and the casein spec, and stated as a figure on the Chai page. Not a test, so no "lactose-free" badge until one is done
- [ ] **Shelf life.** Khana publishes an 18-month best-before in two places; HeldiPM's Gate 4 records *"shelf-life 9-12 months usable"* and Chai has no stability data at all. The Chai page says "a best-before on the base" with no number until it does

### Code, when Chai becomes buyable

Nothing here is needed for the page as it stands. It is the list of what the
"waitlist page" becomes when there is a price.

- [ ] `lib/pricing.ts`: `TIERS` and `TIER_ORDER` have no product dimension, and neither does `packPouches`. A Chai tier added to the same SKU space means one Khana plus one Chai repacks into a pair of Khana
- [ ] `lib/commerce/catalog.ts`: `TIER_VARIANT_IDS`, `SAMPLE_VARIANT_ID` and `TIER_SKUS` are single Khana constants; `khanaPouchCount`, `linesForPouchCount`, `cartItemCount` and both eligibility helpers follow them
- [ ] Merge `components/shop/chai-buy-box.tsx` back into `components/shop/buy-box.tsx` as one product-driven component. The shared pieces are already shared: `pdp-accordion.tsx` is the shell both use, and `statutory-statements.tsx` takes the serving and allergen as props precisely so a second SKU cannot inherit Khana's 12g portion
- [ ] Make reviews product-aware before showing any on `/shop/chai`: `lib/reviews-store.ts` selects no product column, `ReviewGallery` falls back to a placeholder set when there are none (BRAND.md §12 forbids seeding those on a new surface), and `PROTEIN_GRAMS_PER_TBSP` in `lib/reviews.ts` computes a reviewer's added grams from Khana's 10.1g
- [ ] Add the `AggregateOffer` block to the Chai product schema in `app/shop/chai/page.tsx`, in the same `COMMERCE_MODE === "live"` shape `/shop` uses
- [ ] Decide whether `GiftingBand` belongs on the Chai page. It is live-mode only and its copy is written around single pouches and 2-packs of Khana
- [ ] The statutory block on the homepage and `/faq` passes Khana's 12g portion and "Contains milk (whey)". With two products on sale it needs a form that covers both, or the block moves onto each product's own surface
- [x] **Shop front, 2 Sep 2026 (evening).** `/shop` is now the two-pouch listing (`app/shop/page.tsx` + `components/shop/pouch-picker.tsx`) and Khana's product page moved to **`/shop/khana`** (`app/shop/khana/page.tsx`, share card beside it). The nav's "Shop" link, the "Shop now" CTAs, the cart's "keep shopping" link and the legacy Shopify redirects all land on the listing; the homepage range band's Khana card links straight to `/shop/khana`. Chai is reached from the listing, the range band, the how-it-works "In the mug" card, the menus' "To finish" line, the Khana page description, Our story, the sitemap and two homepage FAQs. **Note for `docs/two-product-cart-plan.md`:** where it says `app/shop/page.tsx` for Khana's buy box, read `app/shop/khana/page.tsx`. Still to check once PostHog has traffic: any saved insight that filters pageviews on the `/shop` path now sees the listing, not the PDP (`view_item` is unaffected)
- [ ] `public/llms.txt` describes a one-product line ("One spoonful adds about 10g of complete protein") and would misdescribe a two-product range

### Shopify

- [ ] Create the **Heldi Chai** product with variants mirroring whatever `lib/pricing.ts` ends up carrying, SKUs in the `HELDI-CHAI-*` shape, and the images from `public/images/shop/chai-*.webp`. Then replace the placeholder GIDs the same way Khana's were on 16 Jul 2026
- [ ] Two **archived** Chai products still sit in the store from the pre-bundle catalogue: `heldi-for-chai` at £20 and `heldi-chai-tadka-sample` at £4 (the archived trio SKUs alongside them are not Chai-specific). Leave them archived or delete them, but do not reuse their GIDs: they are on the old one-variant model
- [ ] Add Chai to the shipping profile and the VAT setting alongside Khana
- [ ] Klaviyo's catalog is still empty (§5), so a second product is one more reason to verify that integration rather than read the metric list as proof of it

### Assets

- [x] Product photography, both pouches, reshot 3 Sep 2026 on **GPT Image 2** from the HeldiPM print fronts (`design/pouch-v2/print/heldi-*-FRONT-sRGB.png`): every shop shot, both solos, the range tiles, the hero pair, the jar shot, the comparison cut-out and all four share cards come from one batch with one Khana solo as the shared set, so the whole range is one premium matte pouch on one table. Both roundels ("10g PROTEIN PER BOWL", "5g PROTEIN PER MUG") are on the pouches now that both figures are published. The recipe is in the product-shot memory note and `scripts/` has nothing to run: re-shoot from Higgsfield with the same references. Masters in the gitignored `public/images/originals/pre-webp/`, the 2 Sep nano-banana set archived beside them
- [x] Share card art: `assets/og/pouch-chai.png`, wired through the new `OG_ART_FILES` map in `components/og/card.tsx` so a third SKU cannot silently ship Khana's pouch
- [x] **Khana reshot on the navy v2 pouch, 2 Sep 2026.** Every Khana pouch image on the site now carries the HeldiPM round-14 front (navy ground, gold wordmark and elephant, 10g roundel, KHANA / PROTEIN POWDER / for Indian food): the four `/shop` scenes and the Sample sachet in `public/images/shop/`, the hero cut-out and the jar shot in `public/images/variants/ink-blue/` (IMAGE_VERSION `ink-blue-10`), the homepage range tile, the comparison-table cut-out and the share-card art in `assets/og/pouch.png`. Same method as Chai: nano_banana_pro with the print front as reference and the old shot as the scene reference. Gold-pack masters archived in the gitignored `public/images/originals/pre-webp/shop/archive-gold-pack/`. Still showing the gold pack: the stir-gallery and ways-to-use videos and any blog heroes that include a pouch
- [x] **Chai on the homepage, 2 Sep 2026 (evening).** Beyond the range band: a "To finish · Masala chai" line on every menu card (uncounted, outlined pill, `CHAI_TO_FINISH` in `menu-gallery.tsx`), a fourth how-it-works card "In the mug" (the `mug` method in `ways-to-use-methods.tsx`, strip art `public/images/ways-to-use/mug-strip.webp` + `public/videos/ways-to-use/mug-strip.mp4`, made to `fable/ways-to-use-strips/STYLE.md`; the desktop grid went 3-up to 2×2), a sixth stir-gallery card "Masala chai" that plays a stir but shows "Chai, figure to follow" instead of grams (`masala-chai.webp` + `masala-chai-stir.mp4`), a "Hot drinks" row in Heldi vs the shaker, one line each in the pouch section, the parents audience card, the final CTA and the popup, and a second FAQ ("Can I put Khana in my chai?"). Every one of them is figure-free until Chai's declaration lands; when it does, the menu pill, the stir counter and the ways note are the three places a number goes
- [ ] All of it is AI-generated, like Khana's. Replace with real photography when the physical product exists

## 1c. Pricing decided 2 Sep 2026 (NOT built yet — notes for the rework)

**The build plan, phased with checkpoints, is [docs/two-product-cart-plan.md](docs/two-product-cart-plan.md).** Work it in order; Phase 0 (copy only) can ship this week.

Decided in HeldiPM with the Price Book (claude.ai/code/artifact/bee7cef4-bc72-48bb-b4a7-e4f1bddbfd9c),
which holds the working, the COGS and the run maths. The mechanics were settled the same evening: fixed-price size-and-mix variants, no discount app (see "Shopify shape"). Nothing below is implemented; every
bullet is a change to make when the shop is rebuilt for two products. Until then the
site still carries the July model (launch prices with a struck-through RRP, Khana tier
variants, 10% gifting codes on single and pair, 20% waitlist code).

**The structure**

- **Ladder:** £35 for the first pouch, **£30 for every pouch after it**, counted across
  Khana and Chai together. So £65 / £95 / £125 / £155 / £185 for 2–6, any mix. Per-pouch
  price only ever falls; there is no repacking into "table + one". RRP is the price on the
  page from day one — no launch price, no compare-at, no "Launch prices. Not forever
  prices." framing.
- **Family codes** ACHABETA / RISHTA / SHABASH: **15%** (was 10%), any quantity (was single
  and pair only), one use per customer, one code per order. Printed on the site in the
  gifting band as today — deliberately not gated.
- **Founders code: 25%** ("the family 15% plus an extra 10%", written as one straight code,
  not 15% then 10%) for close friends and the **first 100 waitlist joiners**, one use each.
  Replaces the 20% `PEHLEAAP` promise: **remove "20% off" from the eight places it appears**
  (ticker, homepage ×3, popup, form, FAQ, Chai buy box) — only 4 people have ever seen it.
- **After launch, an email gets free postage on the first order.** A Shopify *shipping*
  discount, one use, set to combine with product discounts, so it stacks with a family
  code (a single pouch on SHABASH then reads "£29.75 delivered"). Optional extra pop-up
  lead magnets: a free Khana + Chai taster while sachets last (cap 200), and the 1994
  recipes as a PDF.
- **Presents, first order only:** 1 pouch → 1 jar; 2 → 1 jar + tote (tote ≈ £1 each, to
  be sourced); 3+ → 2 jars + tote. **No dabba** (never ordered — delete or unpublish
  `HELDI-DABBA`). The first 50 waitlist joiners also get a taster pack posted before launch.
- **Chai** 250 g is priced identically to Khana 300 g at every level.

**Shopify shape — decided 2 Sep 2026 (evening): size × mix variants, no discount app**

- **One product, "Heldi pouches", with two options: Pouches (1–6) and Khana (0–6).** Only the
  27 valid combinations exist as variants (Khana ≤ Pouches; the rest are Chai). Each variant
  is priced from the ladder — 1: £35, 2: £65, 3: £95, 4: £125, 5: £155, 6: £185 — so the
  "£30 for every pouch after the first" rule lives in the variant prices, not in a discount.
  SKUs in the shape `HELDI-K2C1` (2 Khana + 1 Chai). No compare-at anywhere.
- The frontend does what `packPouches` does today, one step further: the basket keeps a
  pouch count per product (k Khana, c Chai) and maps `(k + c, k)` to the one variant ID. Any
  change to either count replaces the line. Checkout shows one line, "Heldi pouches —
  3 pouches / 2 Khana", at £95, which is what the customer expects to see.
- **Six is the ceiling.** The picker stops at six per product line combined; over six the
  ladder would need a second line (7 = 6 + 1 is £220 against the rule's £215). Either cap at
  six with "email us for more" or accept the £5. Decided: cap at six.
- **Inventory is the one real cost.** A "3 pouches / 2 Khana" variant does not decrement
  Khana stock. Untrack inventory on all 27 variants and keep the pouch count in the site
  (Supabase, decremented by the orders webhook already planned at
  `/api/webhooks/shopify-orders`, which has the variant SKU and can add k and c), and let
  the buy box refuse counts the stock cannot cover. At 515 pouches this is watchable by hand
  in run 1; it is the thing to automate for run 2.
- **Reporting** follows the same webhook: Shopify's own analytics show units of
  "3 pouches / 2 Khana", so pouches per product per week come from the site's order table,
  not from Shopify reports.
- Codes: family 15% and founders 25% are product discounts on the one product; the Sample is
  a separate product and stays out of every code. The welcome code is a free-shipping
  discount issued per person by Klaviyo.
- `HELDI-TOTE` as a third £0.00 present product alongside `HELDI-JAR`; delete or unpublish
  `HELDI-DABBA`. Presents keyed to the pouch count as today.
- A third product later (Dahi) is the same model with three counts: 83 variants for six
  pouches, still inside Shopify's limit, and the mapping function is the only code that grows.

**Code that changes (do not touch until the Shopify product exists)**

- `lib/pricing.ts`: `TIERS`/`TIER_ORDER`/`packPouches` become a ladder function
  (`35 + 30 * (n - 1)`, n ≤ 6) and a `(pouches, khana) → variant` lookup; `launchPence ===
  rrpPence` and no strikethrough; `GIFTING.percent` 15, scope any quantity;
  `WAITLIST_OFFER` 25% for the first 100 joiners; `giftCountsForPouches` → jar / jar + tote /
  2 jars + tote, and `GIFT_CAPS.dabbas` 0.
- `lib/commerce/catalog.ts`: one product, 27 variants with real GIDs; `khanaPouchCount`
  becomes a per-product count read back from the variant's option values; `linesForPouchCount`,
  both eligibility helpers and the gift helpers key off the total.
- `lib/commerce/cart-context.tsx` and `lib/commerce/shopify/gift-policy.ts`: the managed
  line is one variant chosen from `(k + c, k)`; gift lines keyed to `k + c`; **first-order
  gating** — open question: the headless cart cannot see a customer's order history before
  checkout, so either presents go in every order for run 1 (almost all are first orders
  anyway) or gating waits for a customer-account signal. Decide before building.
- `components/shop/buy-box.tsx` / `chai-buy-box.tsx`: merge into one product-driven buy box
  with a quantity picker per product and a running price ("3 pouches, £95 — one more is £30");
  each page defaults its own product to 1.
- Copy: `gifting-band.tsx` / `gifting-popup.tsx` (15%, any quantity), `site-faqs.ts`
  (delivery FAQ, waitlist FAQ), `heldi-homepage.tsx` ticker and waitlist lines,
  `waitlist-popup.tsx`, `waitlist-form.tsx`, `chai-buy-box.tsx` waitlist line,
  `public/llms.txt`. BRAND.md §5 (mechanics) and §11.3 need the same edit; the
  heldi-email-writer skill's locked prices and "no stacking" rule need updating
  (free-shipping welcome code is the one thing that stacks).
- `docs/launch-runbook.md` and `docs/go-live-checklist.md`: variant and code setup steps;
  the go-live inventory notes (§149–151) are superseded by the webhook count above.

**Why (short):** the July model stacked a launch sale with the waitlist code, taking the
public floor to 28–39% off. Charging RRP and discounting only through codes keeps every
public price at or above 49% landed margin, keeps the aunties' visible code, and gives the
post-launch email something that stacks without being a percentage. Revenue at the assumed
run-1 mix is about £14.2k of £16.7k all-RRP; the pricing detail and the evidence are in
the Price Book.

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
  - **DKIM exists and is verified. Corrected 4 Sep 2026, this reverses the 28 Jul finding.**
    The earlier check looked for `kl._domainkey` and `kl2._domainkey`, which is not this
    account's selector. Klaviyo issued **`km1`** and **`km2`**, and both
    `km1._domainkey.heldi.co.uk` and `km2._domainkey.heldi.co.uk` resolve to
    `...klaviyodns.com`. The API agrees: sending domain `3373127` reports
    `status: active` with all four DNS records `verified: true`, dated 23 Jul 2026.
    Nothing to add in Google Cloud DNS. No DNS work stands between the account and a send
    except the apex SPF below
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
- Chai's pouch weight (100g) and mugs per pouch (12) are the print-file figures and are contradicted by the COGS model's 250g — constants `CHAI_POUCH_GRAMS` and `CHAI_MUGS_PER_POUCH` in `components/shop/chai-data.ts`, and §1b above
- The two product pages show two pack generations: Chai is the v2 terracotta pouch, Khana's shots are still the older gold pouch — reshoot Khana on the navy v2 pouch (§1b)
- All pricing (RRP, launch prices, gifting discount, shipping) lives in `lib/pricing.ts` — after the launch period, set each tier's launch price equal to its RRP there and mirror the change in Shopify admin
