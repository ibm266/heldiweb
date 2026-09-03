# Heldi go-live checklist

**What this is.** The gate. Read it top to bottom before anything flips to live. If a line in the STOP section is unticked, Heldi does not open for orders.

**How it relates to the other docs.**
- `docs/launch-runbook.md` owns the step-by-step Shopify mechanics (Phases 1 to 8). This document does not repeat those instructions, it links to them by phase and records whether the outcome is actually true.
- `NEXT_STEPS.md` tracks general operational state and ideas. It is a working list, not a gate, and several of its lines are stale (noted below).
- `docs/security.md` owns the rate-limit table and the Vercel dashboard work.
- `BRAND.md` §11 owns the change-impact map. `PLAYBOOK.md` owns the build rules.

**Status of this document.** Built from six domain audits plus live probes of the repo, Vercel, Shopify, Supabase, DNS and production HTTP, all run on 28 July 2026. Ticked lines carry their evidence. Nothing here was assumed.

**Progress log.** Items completed since the audit are ticked in place with the date and the evidence, so this file stays the single record rather than needing a separate changelog. Completed 28 July 2026: the placeholder reviews and the IPL leaderboard were quarantined behind showcase mode; the invented "200+ five star reviews" was replaced with a count derived from real data; the VERIFIED badge was made conditional on a matched order; four false product facts were corrected; jar copy was resolved to gold only; "MOST POPULAR" became "BEST VALUE"; and a two working day reply promise was published.

**Key.** `[x]` done with evidence. `[~]` partly done. `[ ]` outstanding. Every outstanding line names who does it: **(Mihir, dashboard)**, **(Mihir, real world)**, or **(code)**.

---

## STOP: hard blockers

Selling is unlawful, technically impossible, or reputationally fatal until every one of these is ticked.

- [~] **Physical pouches exist.** Confirmed 28 Jul 2026: the blending run is **not booked**, hoped for within two weeks. Until it is confirmed, the launch date is a lead time and not a date, and Shopify's `totalInventory: 80` is a typed number rather than stock on a shelf. Needs: run date, quantity, co-packer name. **(Mihir, real world)**
- [~] **The free gifts physically exist.** Confirmed 28 Jul 2026: **jars exist. Masala dabbas do not, and the dabba may be dropped or swapped for something else.** That matters because the dabba is contractually promised on the PDP for a full-table order (`components/shop/buy-box.tsx`), so it is a promise the site is making about a product that does not exist. Decide before selling: source it, swap it, or remove it from the offer and from `GIFT_CAPS` in `lib/pricing.ts`. If it is swapped, the change-impact list is the same one BRAND.md §11 uses for any gift change. **(Mihir, real world, then code)**
- [~] **Food business registration with the local authority.** Confirmed 28 Jul 2026: **not registered**, and the plan is to register once production is confirmed. Read the sequencing carefully, because it is the one item that can silently set the launch date: registration is required under Reg 852/2004 Art 6(2) at least **28 days before trading**, so the clock starts at registration, not at production. Registering the day production is confirmed puts the earliest lawful trading day four weeks later. It is free and takes minutes, so there is no cost to filing it early. **(Mihir, real world)**
- [ ] **Lot coding, date marking and a written recall procedure.** The site publishes "Every pouch has an 18-month best-before date, printed on the base" (`components/site-faqs.ts:205`). Nothing defines who applies the code or the date. No withdrawal or recall procedure exists anywhere in the repo, and Reg 178/2002 Arts 18 and 19 require both traceability and a recall route. One page is enough. **(Mihir, real world)**
- [~] **Royal Mail business account is live.** Confirmed 28 Jul 2026: not set up yet, will be. Needed before the first dispatch, not before launch day, but every published rate in `lib/pricing.ts:112-119` and `docs/legal/shipping-policy.md` assumes it. **(Mihir, real world)**
  Tracked 48 is not a counter service: every rate in `lib/pricing.ts:112-119` and every line of `docs/legal/shipping-policy.md` assumes a Click and Drop or OBA account.
- [ ] **Solicitor has reviewed all five documents in `docs/legal/`.** Still outstanding per `docs/legal/README.md:23` and `NEXT_STEPS.md:74`. See §2 for the specific questions to put to them. **(Mihir, real world)**
- [x] **The formulation is confirmed, and every spice reference on the site matches it. Done 3 Sep 2026.** Khana is the eight-ingredient spiced blend: whey protein isolate (MILK) 94%, cumin 1.7%, sunflower lecithin 1.5%, coriander 1.25%, fine sea salt 0.75%, garam masala 0.5%, Kashmiri chilli 0.2%, turmeric 0.1%. `FORMULA` and both tables in `components/shop/nutrition-data.ts` were regenerated from it by `scripts/nutrition-calc.mjs`, and the `BRAND.md` §11.1 touch list was worked in one pass: the /inside-the-pouch hero, lede, spice and salt paragraphs and its OG card now say eight ingredients rather than four; the ingredients and ultra-processed FAQs name all eight; the comparison table's Flavours row names the real spices again after being deliberately vague through the reformulation. Two `BRAND.md` §13 drift items closed with it. **The pouch film print order is still the binding deadline for the artwork.**
- [ ] **Showcase mode is off in Production, and everything it hides has been resolved.** `NEXT_PUBLIC_SHOWCASE_MODE` gates the placeholder review gallery and the IPL leaderboard (`lib/showcase.ts`). Off is the safe state, but "switched off" is not "done": before launch each gated section must either have real moderated reviews behind it or be deleted. Confirm the variable is absent from Vercel **Production** (Preview may keep it). **(Mihir, dashboard, then code)**
- [ ] **Fake social proof is off the site.** Three separate breaches of the DMCC Act 2024 banned-practice list, enforceable by the CMA without going to court: the literal string `200+ five star reviews` plus a 5-star block (`components/shop/pdp-review-teasers.tsx:135-146`), eight invented reviewers with towns and VERIFIED badges (`lib/reviews.ts:47-178`), seven invented leaderboard standings (`lib/reviews.ts:190-198`). The file's own header at `lib/reviews.ts:7-10` says none of it may ship. **(code)**
- [x] **False product facts are corrected. Done 28 Jul 2026, all four:** the comparison Flavours row no longer names turmeric and garam masala (now "Warm spices you already cook with", deliberately vague while the formulation moves); "Every Heldi order ships with a refillable jar" is now "Every pouch order", so the £5 Sample no longer implies a free jar; "90% whey protein isolate" is now 94% in both places it appeared, ending the conflation between the pouch being 94.15% isolate and the isolate itself being about 90% protein; and two live indexed blog posts no longer quote protein figures for "Heldi Chai" and "Heldi Dahi", which do not exist.
- [~] **Mandatory food information is on the commercial surfaces. Mostly done 28 Jul 2026.** Fixed: MILK is now emphasised inside the ingredients list itself in all three places it appears, which is what FIC Art 21(1) actually requires (a separate "contains milk" line elsewhere does not satisfy it); the statutory statements moved into one shared `components/shop/statutory-statements.tsx` and now render on `/shop`, the homepage and `/faq`, carrying the food-supplement designation, the recommended daily portion (12g, from the `SERVING_GRAMS` constant so nothing parses prose, and worded gram-first so the spoon reads as the approximation it is), do-not-exceed, not-a-substitute, keep-out-of-reach and contains-milk; a descriptive legal name ("Whey protein isolate blend with warm spices. Food supplement.") now sits under the PDP H1; and the ingredients FAQ carries "contains naturally occurring sugars". Verified rendering at 375 and 1280 with no horizontal scroll.
  **Still open, two items:** the Sample's net quantity in grams is declared nowhere and needs the fill confirmed first (3 x 12g = 36g?); and "No added sugar" still appears as a bare badge on the PDP pill row and the homepage, where there is no room for the qualifier, so decide whether the badge goes or the qualifier sits adjacent to it. **(Mihir confirms the fill and the badge call, then code)**
- [~] **The model cancellation form exists.** Added to `docs/legal/returns-refunds-policy.md` 28 Jul 2026 in the CCR Sch 3 Part B form, with a line making clear the customer does not have to use it. That closes the on-site half. **Still open, and it is the half that carries the risk:** it has to reach the customer in a durable medium, which means pasting it into the Shopify order confirmation notification. Until that is done the extended cancellation window argument is still live. **(Mihir, dashboard, Settings → Notifications)**
- [~] **Struck prices are labelled as RRP.** Done in code 28 Jul 2026 via a single `Rrp` helper in `components/shop/buy-box.tsx`, so every strikethrough on the PDP now reads "RRP £35" rather than a bare £35, and "Save £5.00" became "£5.00 below RRP". Verified live: **six** strikethroughs on `/shop`, all labelled. That was one more than the audit found, because the free gift rows struck the jar's £8 and the dabba's £15 with no label either, and those have never been sold at those figures. **Still open:** mirror the decision in Shopify's compare-at fields so the hosted checkout tells the same story. **(Mihir, dashboard)**
- [ ] **Pack artwork is regenerated from live data before it goes to print.** `fable/compliance-requirements.md:33-63` carries a retired seven-ingredient blend and stale nutrition figures, and it is not the eight-ingredient blend confirmed on 3 Sep 2026 either. The live declaration is 84.1g protein per 100g and 10.1g per 12g serving. Anything printed from the old file is a false nutrition declaration and a false ingredients list. **(Mihir, real world + code)**
- [ ] **ICO data protection fee paid and registration number added to the privacy policy.** Tier 1, £52, or £40 by direct debit. A legal duty with a fixed monetary penalty for non-payment. Five minutes at ico.org.uk. **(Mihir, dashboard)**
- [~] **VAT position confirmed and Shopify agrees with it.** Confirmed 28 Jul 2026: **not VAT registered, and staying that way for now.** Heldi LTD is not VAT registered, so it must not charge or appear to charge VAT (VATA 1994 s.67). **The runbook's Phase 1 tax instruction is wrong as written** and must not be followed: do not tick "All prices include tax", do not enter a UK VAT registration. Target state is £0.00 tax on the test checkout. **(Mihir with accountant, then dashboard)**
- [ ] **Shopify can actually take an order.** Shipping rates configured (nothing exists today, so checkout says no shipping available), Shopify Payments out of test mode with KYC done, a **business** bank account in the name Heldi LTD for payout, all five policies pasted into Settings → Policies, and the Online Store password removed. Runbook Phase 1 and Phase 6. **(Mihir, dashboard)**
- [ ] **One real test order placed with a real card, end to end.** Zero orders have ever existed. Runbook Phase 6. **(Mihir, dashboard)**
- [x] **Cart failures are visible to the shopper. Done 28 Jul 2026.** `runMutation` now catches, logs the real cause to the console for us, and sets a plain message the drawer renders with `role="alert"`; the drawer opens either way, so the commonest failure (the very first add, when the basket is still empty) can no longer be silent. Two related bugs fell out of the same change: every cart write now resolves to whether it landed, so `applyGifting` no longer records a discount Shopify rejected, and `add_to_cart` no longer fires and the button no longer flashes "Added" on a failed add, which had been inflating the PostHog conversion count. Verified by stubbing `/api/cart/*` to 502: error shown, button unchanged, zero events fired; and on the happy path one event, one line, no error.
- [~] **Vercel spend cap set.** Confirmed 28 Jul 2026: **on a paid plan**, so the commercial-use restriction does not apply and this is no longer a blocker. Remaining action is smaller: set a spending limit that pauses projects, so a traffic spike or a scripted attack on `/ingest` cannot run up an open-ended bill. **(Mihir, dashboard)**

---

## 1. Product and fulfilment reality

Nobody has audited this. The whole site assumes a product, stock, a packer and a postal route.

- [ ] Blending run: booked or completed? Date, quantity, co-packer name. If not booked, launch is a lead time and not a date. **(Mihir, real world)**
- [ ] Lot code format agreed with the packer, and who applies it. **(Mihir, real world)**
- [ ] The 18-month best-before is substantiated by stability data, not assumed. **(Mihir, real world)**
- [x] **The whey purity is settled, 3 Sep 2026, and the serving is solved rather than
  guessed.** Arla certificate 0000672935 (batch FF25466001, the one in hand) reports
  **92.66% protein in DRY MATTER at 4.13% moisture**, which is **88.83% as-is**. Every
  earlier figure in the repo was a misreading of that one document in one direction or
  the other: `scripts/nutrition-calc.mjs` carried 87.3% (the spec's worst-case moisture,
  conservative), and `nutrition-data.ts` implied 92.06% (the dry-matter number used as
  as-is, too high). At 94% whey the blend is **84.06 g protein per 100 g**, so 10.0 g of
  protein needs **11.90 g** and the serving is **12 g, delivering 10.09 g**. 12 g also
  divides the 300 g pouch into exactly 25 servings, and it holds under the unsettled
  formulation question (the 4-ingredient FORMULA needs 11.93 g for the same 10 g). The
  certificate's own bulk density, 0.42 g/cm³, corroborates the spoon independently: a
  heaped 15 ml tablespoon lands at 11 to 13 g. The script is corrected; the site's
  per-100g table is not, and waits on the formulation below.
- [x] **Which Khana formulation is real: answered 3 Sep 2026, the eight-ingredient garam
  masala blend.** The site now carries it and the §11.1 sweep is done. For the record, the
  choice moved fat from 4.3 to 2.4 g/100g (lecithin 4% down to 1.5%) and left protein
  essentially where it was, which is why the 12 g serving was safe to settle first.
- [~] **Chai now carries MPC85 and the corrected whey, 3 Sep 2026.** `chai-data.ts` was
  regenerated: the ingredients list, legal name and allergen sentence all say **milk
  protein concentrate** rather than micellar casein, and the declaration moved on energy
  (1521 to 1532 kJ), fat (2.2 to 2.1), saturates (0.8 to 0.7), carbohydrate (18.5 to
  19.3), sugars (10.7 to 11.6) and lactose (**1.4 to 2.2 g/100g**, the one that matters).
  Protein stayed at 64.0 g/100g and 5.1 g a mug because the whey rising to 88.83% and the
  MPC falling to 80.75% very nearly cancel. **Still open:** get Bacarel's own spec sheet
  for the MPC and replace the typical values with it, because 80.75% is the industry dry
  basis convention rather than a measured figure for this product. **(Mihir, supplier)**
- [x] **Decided 3 Sep 2026: no finished-product analysis for the first run.** The
  declaration is the calculation in `scripts/nutrition-calc.mjs`, which FIC Reg 1169/2011
  Art 31(4)(b) permits as a basis in its own right ("average values based on the
  manufacturer's calculation from the known average values of the ingredients used"). It
  is a legal basis, not a stopgap. What has to be true for it to hold:
    - **The tolerance is the safety margin, and it is generous here.** For protein above
      40 g/100g the GB guidance allows ±8 g, so a declared 84.1 survives an analysed
      result anywhere from about 76 to 92. Even the worst batch Arla's spec permits
      (90% protein in DM at 6% moisture) computes to 80.1 g/100g. Salt is the tighter
      row: declared 1.2 g/100g against a ±0.375 g band once it is above 1.25.
    - **The certificate is the evidence.** Arla 0000672935 goes in the product technical
      file with the spice specs, the recipe as actually blended, and the batch records.
      Without it the calculation has no basis and the s.21 Food Safety Act 1990 due
      diligence defence has nothing to stand on. Get a certificate for every new whey
      delivery and re-run the script if the protein moves.
    - **Recalculate rather than assume when a supplier changes.** A different whey lot at
      a different moisture changes the declaration.
  Revisit if a retailer, an insurer or a co-packer asks for analysis, which they may.
  **(Mihir, decided)**
- [ ] **Name the garam masala's supplier, and check it for allergens.** Two jobs, one
  email, and the site is currently short an answer on both.
    - ~~**The supplier.**~~ Answered 3 Sep 2026: **Buy Whole Foods Online**. The page had
      claimed "every spice we blend comes from Spice Entice", which was never true of the
      garam masala; it now credits Spice Entice for the four single spices (cumin,
      coriander, chilli, turmeric) and Buy Whole Foods Online for the garam masala. Named
      without a link, the same way Special Ingredients is handled on that page.
    - **The allergens.** Garam masala is a compound ingredient at 0.5%. FIC Annex VII
      Part E lets a compound ingredient under 2% be named without breaking out its
      components, **but allergens are never exempt**. Commercial garam masala sometimes
      carries mustard, and occasionally nuts, both Annex II allergens that would have to
      appear emphasised in the ingredients list and would change every "Contains milk
      (whey)" line on the site. Same question for the Kashmiri chilli if it is a
      compound product rather than straight ground chilli. **(Mihir, supplier)**
- [ ] **Get a labelling consultant to rule on QUID for Chai specifically.** Khana is
  straightforward: its spices are flavouring at 0.1 to 1.7%, so Annex VIII Part A(4)
  exempts them and only the whey's 94% is published. Chai is arguable, because the
  spices characterise it, `CHAI_LEGAL_NAME` says "chai spices", and ginger at 6.77% is
  not a small quantity. If the ruling goes against us the fix is a percentage on the
  spice total or a legal name that stops naming them. Cheap to ask, expensive to
  reprint. **(Mihir)**
- [ ] **Record how the 12g serving was arrived at, and keep the record.** The gram is
  the declared portion and the whole per-serving column hangs off it, but the spoon it
  describes is not a defined measure: a heaped tablespoon of this powder runs roughly 10
  to 14g between one hand and the next. Nobody certifies a tablespoon and no register
  says what one weighs, so what has to exist is evidence the number was chosen honestly
  rather than flatteringly. Half of that evidence now exists: 12g was solved for 10g of
  protein against the Arla certificate, and the certificate's bulk density of 0.42 g/cm³
  puts a heaped 15 ml tablespoon at 11.3 to 12.6g independently. The bench weighing is
  the missing half. Weigh five to ten heaped spoonfuls on a 0.1g scale, from a
  full pouch **and** a half-empty one (powder settles and spoons differently as it goes
  down), with two different tablespoons; write down the date, the spread and why 12.5
  was picked out of it. The middle of a measured spread is defensible; the top of it is
  not. 12 sits at the bottom of the 12 to 14g already weighed, which is the safe end:
  a customer's real spoonful then carries slightly more than declared, not less. This lives in the product technical file with the COAs, not in the repo, and it
  is what a s.21 Food Safety Act 1990 due diligence defence would rest on. Same exercise
  for Chai's 8g level spoon, where the existing "7 to 8g" note is the draft of it.
  **(Mihir, real world)**
- [ ] **Get the pack artwork checked by a food labelling consultant before the film
  print order**, not before launch. The print run is the irreversible spend and it
  carries the ingredients list, the nutrition declaration and the portion. **(Mihir)**
- [ ] Finished-product gluten test (not a supplier assurance). Cumin is a spice with a cross-contamination history and the claim ships on six surfaces. **(Mihir, real world)**
- [ ] "Blended and packed in England, with every batch tested" (`app/inside-the-pouch/page.tsx:9`, which is page metadata and therefore in Google's snippet) is substantiated, or reworded. What the page shows at `:59-98` is Arla's ingredient COA, not a finished-blend test. **(Mihir, then code)**
- [ ] The ℮ mark on the pack: only lawful if the packer runs and records the average quantity system (Weights and Measures (Packaged Goods) Regs 2006). If not, drop it and declare a plain minimum net quantity. **(Mihir, real world)**
- [ ] Jar and dabba: supplier, unit cost, quantity ordered, delivery date. **(Mihir, real world)**
- [ ] Sample is a second pack format (36g), needing its own fill, seal, lot code, artwork and net quantity. If it is not ready, decide now not to sell it on day one rather than let a £5 SKU hold up the store. **(Mihir)**
- [ ] Where is stock physically stored? That address is the food establishment and is what goes on the registration form. If the packer dispatches, then "We pack every order ourselves" (`components/site-faqs.ts:185`, `:200`) is wrong copy. **(Mihir, real world)**
- [ ] Weigh and box one real full-table order. `docs/legal/shipping-policy.md:18` publishes "up to 2kg, Small Parcel, £3.55". Three pouches alone are estimated at 1.30 kg (runbook Phase 1) before two steel jars and a dabba. The parcel is probably out of the Small Parcel bracket and the published line is then false. This measurement is also the input for Shopify variant weights. **(Mihir, real world)**
- [ ] Pick-pack sheet written. `BRAND.md:449`, `docs/free-gift-cart-plan.md:66` and `docs/launch-runbook.md:75` all refer to it as existing. It does not exist. It must carry the gift counts: 1 pouch to 1 jar, 2 to 2 jars, 3 to 2 jars plus 1 dabba, 4 or more to still 2 jars plus 1 dabba (`lib/pricing.ts:88-99`). **(code)**
- [ ] Packaging materials in hand: boxes, void fill, tape, label printing, and a decision on posting steel alongside a foil pouch. **(Mihir, real world)**
- [ ] Dispatch promise reviewed. `docs/legal/shipping-policy.md:24` publishes "within 1 working day, and within 2 working days at the latest" for a one-person operation. Decide what happens at 30 orders in a day. A softer published promise costs nothing and cannot be breached. **(Mihir, then code)**
- [~] Product liability insurance in place. Confirmed 28 Jul 2026: not yet, will be set up. Must be in force before the first parcel leaves, not before launch day. Heldi LTD is strictly liable as own-brander under CPA 1987, and `docs/legal/terms-and-conditions.md:74-76` correctly does not limit liability for personal injury. **(Mihir, real world)**
- [ ] UK IPO word-mark search on "Heldi" and on the product name. A conflict found after the film is printed is a rebrand plus scrapped stock. Same deadline as the naming decision: the print order. **(Mihir, real world)**
- [ ] Unit economics modelled once. There is no COGS figure anywhere in the repo. Worst case at launch: full table £80, minus 20% (£64), minus free shipping on a probably-oversized parcel, minus 2 jars and a dabba, minus roughly £1.32 of Shopify fees, minus 900g of Arla isolate and three pouches. Ten minutes in a spreadsheet. **(Mihir with accountant)**

---

## 2. Legal and regulatory

### Already done, do not re-ask

- [x] All `[TBC]` placeholders filled. The only three "TBC" hits in the repo are prose about the placeholders (`NEXT_STEPS.md:67`, `:74`, `docs/launch-runbook.md:99`).
- [x] Company number 17179772 live at `docs/legal/terms-and-conditions.md:7-8` and `docs/legal/privacy-policy.md:8`, consistent, no conflicting number anywhere.
- [x] Registered address identical across all five policies, `docs/legal/README.md:37-38` and `components/subpage-nav.tsx:167`.
- [x] Core CCR 2013 obligations present: 14-day cancellation, sealed-goods carve-out correctly cited to reg 28(3)(a) and correctly conditioned on the seal, refund timing and amount, faulty-goods route under CRA 2015, complaints route, governing law.
- [x] The three authorised protein claims are used verbatim in 16 places with no paraphrase. Grep for prohibited claim vocabulary across `app/`, `components/`, `content/`, `lib/` returns nothing.
- [x] No fake `aggregateRating` in any structured data. `app/shop/page.tsx:32-51` carries no rating and no review property.
- [x] Waitlist consent evidence is stored alongside the row (`lib/waitlist.ts:1-7`), weekly letter is a separate unticked opt-in (`components/waitlist-form.tsx:128-137`). Better than most brands. Tell the solicitor about it rather than having them rebuild it.
- [x] All four processors named in the privacy policy and they match what the code calls (`docs/legal/privacy-policy.md:34-39`).

### Solicitor brief

- [ ] Send all five `docs/legal/*.md` files plus these four specific questions. A generic ecommerce review will not surface them. **(Mihir, real world)**
  1. Is Heldi legally a **food supplement** (Food Supplements (England) Regs 2003, which apply to products sold in dose form) or an ordinary food? A 300g resealable pouch spooned into a pot is arguably not that form, which pulls in the full FIC set instead. Recommendation: comply with both, nothing is lost by over-declaring.
  2. The reference-pricing question (£35 RRP against £30 launch, never charged).
  3. The six badge claims, especially "all natural" and "no added sugar".
  4. The cookie consent model at `lib/consent.ts:1-11` and `:36-40`, which defaults statistics to on under the Data (Use and Access) Act 2025 statistical-purposes provision, with PostHog persistence set to `"memory"` (`lib/analytics.ts:71`) so nothing is written to the device. Confirm the reading.

### Food information (fix before selling)

- [ ] Emphasise milk inside the ingredients list wherever the list appears: `components/shop/nutrition-data.ts:5-6`, `app/inside-the-pouch/page.tsx:25`, `components/site-faqs.ts:158`. FIC Art 21(1) requires it in the list itself, and a separate "contains milk" elsewhere does not satisfy it. `fable/compliance-requirements.md:60-68` already specifies "Whey Protein Isolate (MILK)", so this is drift from the project's own spec. **(code)**
- [ ] One shared statutory-statements component rendered on every commercial surface: food supplement designation, recommended daily portion, do not exceed it, not a substitute for a varied and balanced diet, keep out of reach of children, contains milk. Today the block exists only at `app/faq/page.tsx:56-61`, with a partial version at `components/truth-page.tsx:510-514`. `BRAND.md` §12 already requires it to be reachable from every commercial surface. **(code)**
- [ ] Declare the Sample's net quantity in grams (3 x 12g = 36g ℮, if that is the fill). It appears nowhere. **(code, after Mihir confirms the fill)**
- [ ] Add "contains naturally occurring sugars" wherever "no added sugar" appears (`components/heldi-homepage.tsx:177`, `:353`, `components/shop/buy-box.tsx:42`, `components/shop/product-accordions.tsx:21`, `:74`, `components/home-faqs.ts:50`, `:55`, `components/site-faqs.ts:158`), or drop the claim. **(code)**
- [ ] Add a descriptive legal name near the H1 at `components/shop/buy-box.tsx:181`, for example "Whey protein isolate blend with warm spices. Food supplement." (not "with cumin": the blend is eight ingredients as of 3 Sep 2026) One line, and it also discharges the supplement designation. **(code)**
- [ ] "All natural" decision. Whey **isolate** is produced by industrial microfiltration or ion exchange and sunflower lecithin, now 1.5%, is functioning as an emulsifier. This is the weakest claim on the site. `components/site-faqs.ts:158` already says something defensible ("no sweeteners, no preservatives, no fillers"). Decide before the pouch artwork goes to print, because it retires `all-natural.png`. **(Mihir, then code)**
- [ ] Origin. "Made in the UK" (`components/subpage-nav.tsx:184`, `components/heldi-homepage.tsx:1401`, ticker at `:138`, `:140`) against Arla whey at 94% triggers the primary-ingredient origin rule (retained Reg 2018/775). Confirm Arla's actual sourcing, then either state the whey's origin or keep the safer process statement "Blended and packed in England". **(Mihir, then code)**
- [ ] Rewrite "Is it safe for kids? Yes" (`components/home-faqs.ts:43-45`). It opens unqualified, sits on the same page as a "keep out of reach of children" warning, and unlike the pregnancy and medication answers it never hands off to a GP or health visitor, which `BRAND.md` §7 requires. **(code)**
- [ ] Add a rule to `BRAND.md` §12: the "98%" and "lactose-free" travel together, always, in every ad, badge and social crop. The qualifier is what keeps the claim lawful. **(code)**

### Consumer law and disclosure

- [ ] Add the company number to `FooterLegal` (`components/subpage-nav.tsx:166-168`) and to Shopify store details. **(code + Mihir, dashboard)**
- [ ] Add one ADR sentence to `docs/legal/terms-and-conditions.md:87-93` (ADR Regs 2015 reg 19). Do not reference the EU ODR platform, it closed in July 2025. **(code)**
- [ ] Change the VAT wording at `docs/legal/terms-and-conditions.md:40` from "include VAT where applicable" to a plain statement that Heldi LTD is not VAT registered and no VAT is charged. Add a NEXT_STEPS note to revisit at the £90k threshold. **(code)**
- [ ] Fix the free-shipping wording: `docs/legal/shipping-policy.md:16` says "over £40", the code gives free shipping **at** £40.00 (`SHIPPING.freeOverPence: 4000`, `>=` at `components/cart/cart-drawer.tsx:159`). Say "£40 and over". **(code)**
- [ ] Decide the real returns address. `docs/legal/returns-refunds-policy.md:5-6` and `:19-20` send returned food to a formation agent in Covent Garden, which cannot receive or inspect it. Either state a real address or say one is issued on request. **(Mihir, then code)**
- [ ] Add a review-submissions row to the privacy policy collection table (`docs/legal/privacy-policy.md:17-25`). `/review` is live and collecting name, location, email, order number and media (`components/review-form.tsx:113-124`), and Supabase is already named as storing it at `:38`, so the processor list knows about a category the table does not. **(code)**
- [ ] Add a privacy link to the review form and widen the consent wording to name location and media. `grep -n "privacy" components/review-form.tsx` returns nothing today. Art 13 UK GDPR requires the notice at the point of collection. `components/waitlist-form.tsx:138-141` is the model. **(code)**
- [ ] Add the four missing storage keys to `docs/legal/cookie-policy.md:36-42`: `heldi_curtain_seen_v1`, `heldi_mode_override`, `heldi_preview_unlocked`, and the `heldi_preview` **cookie** set server-side at `app/api/preview-unlock/route.ts:55`. All are strictly necessary, none needs consent, but the table presents itself as complete. **(code)**
- [ ] Replace AI-generated product photography with real shots before the first sale. `NEXT_STEPS.md:130` records it. The bundle renders are the highest risk because they depict specific counts of jars and a dabba that the customer is contractually promised. **(Mihir, real world)**

---

## 3. Commerce and Shopify

Store `jfz4qx-4u.myshopify.com`, GBP, GB. Product `gid://shopify/Product/15790466957695`, handle `heldi-khana`.

### Already done, do not re-ask

- [x] All four variant prices and compare-at prices match `lib/pricing.ts` exactly, verified live through the Storefront API: `HELDI-KHANA-300` 30.00/35.00, `-X2` 55.00/70.00, `-X3` 80.00/105.00, `HELDI-SAMPLE` 5.00/null. The 8 old products are ARCHIVED. Runbook Phase 1 and Phase 3.
- [x] All six variant GIDs at `lib/commerce/catalog.ts:34-37, 58-61` resolve live.
- [x] **Both gift products ARE published to the Headless channel.** `refillable-table-jar` and `masala-dabba`, `publishedAt 2026-07-19`, both `availableForSale: true`, both resolve by GID through the Storefront token. `NEXT_STEPS.md:16-17` is stale and the runbook's "merchandise does not exist" warning no longer applies.
- [x] Gift inventory is already untracked. `availableForSale: true` plus `currentlyNotInStock: false` while Admin reports `totalInventory: 0` is only possible with tracking off.
- [x] Gifting codes exist and are correct: `ACHABETA`, `RISHTA`, `SHABASH`, all ACTIVE, 10% off the 2 pouch variants, `combinesWith` all false, zero uses.
- [x] Domain split done both halves. Primary domain is `shop.heldi.co.uk` (301 from the myshopify host with `x-redirect-reason: primary_domain_redirection`), apex resolves to Vercel and `https://heldi.co.uk/checkouts/cn/test` returns 404. Runbook Phase 5 boxes 1 and 2.
- [x] Shopify env vars on Vercel Production and Preview: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `NEXT_PUBLIC_COMMERCE_PROVIDER`. `NEXT_STEPS.md:23` is stale. Runbook Phase 2.
- [x] Production is genuinely wired to Shopify. `GET https://heldi.co.uk/api/cart/get?cartId=<nonexistent>` returns 200 `null`, not the 503 an unconfigured store gives.
- [x] Gift-count logic matches the spec (`giftCountsForPouches`, `lib/pricing.ts:88-98`). No code change needed, only live verification.

### Before the store can take money

- [ ] **Shipping rates.** General profile (three pouch variants plus both gifts): "Royal Mail Tracked 48" £3.55 with condition £0.00 to **£39.99**, plus "Free shipping" £0.00 with condition £40.00 and up. Note the boundary, `pricing.ts` gives free shipping **at** £40.00. Second profile containing **only** the Sample variant with one free rate, so sample-alone is free and sample plus a sub-£40 pouch order is still £3.55. **(Mihir, dashboard, Settings → Shipping and delivery)**
- [ ] **Shopify Payments activated**, KYC complete, out of test mode, paying into a business account named Heldi LTD. A personal-account name mismatch is the most common launch-week stall. **(Mihir, dashboard)**
- [ ] **Tax collects £0.00.** No UK VAT registration entered, and confirm on the test checkout that the tax line reads £0.00. If it does not, either untick "Charge tax on this product" per variant or set a 0% UK override. Do **not** follow `docs/launch-runbook.md:77-79` as written. **(Mihir, dashboard, Settings → Taxes and duties)**
- [ ] **All five policies pasted into Settings → Policies.** Empty fields mean the hosted checkout, the last screen before the customer is bound, shows no refund, privacy, terms or shipping policy at all. **(Mihir, dashboard)**
- [ ] **Markets restricted to United Kingdom.** Partial evidence it is already right (presentment currencies are GBP-only, shop country GB) but shipping zones are a separate setting. **(Mihir, dashboard)**
- [ ] **Business name and address in admin match the site footer** ("Heldi LTD, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ", `components/subpage-nav.tsx:167`). **(Mihir, dashboard)**
- [ ] **Test order placed and completed with a real card.** Runbook Phase 6, all four boxes. **(Mihir, dashboard)**

### Catalog quality

- [ ] **Upload product images. No product has a single image, including Heldi Khana itself.** Live query returns `featuredImage: null` and zero images on all three products. Consequences: grey placeholder boxes on the Shopify checkout, the order confirmation email and the admin order screen; and the **Sample line renders with no thumbnail at all** in the cart drawer under the Shopify provider, because `mapLine` builds the image from `featuredImage` (`lib/commerce/shopify/client.ts:119-152`). Source files already exist at `public/images/shop/`: `khana-1.webp`, `sample.webp`, `gift-jar-gold.webp`, `gift-masala-dabba.webp`. **(Mihir, dashboard)**
- [ ] **Set gift SKUs** to `HELDI-JAR` and `HELDI-DABBA`. Both return `sku: null` today, so the `GIFT_SKUS` fallback at `lib/commerce/catalog.ts:63` is dead code and every report shows a blank SKU. Detection still works because `isJarGiftLine`/`isDabbaGiftLine` check the GID first. **(Mihir, dashboard)**
- [ ] **Set variant weights.** All six read `weight: 0.0`. Rates are price-conditioned so checkout is not blocked, but Click and Drop label generation will be wrong. Use the real measured weights from §1, not the runbook's estimates. **(Mihir, dashboard)**
- [ ] **Rename the jar** from "Refillable Heldi Table Jar" to match the site's "Refillable table jar" (`lib/commerce/catalog.ts:164`). Shopify's title is what appears on the checkout line and the confirmation email. **(Mihir, dashboard)**
- [ ] **Decide inventory tracking on the Khana variants.** Admin shows `totalInventory: 80` but each tier is its own SKU, so selling one "full table" consumes three physical pouches and decrements only that variant. Either untrack all four and manage stock by hand at launch volumes, or add a bundle sync app. **(Mihir, dashboard)**
- [ ] **Remove both gift products from the Online Store channel**, keep them on Headless. Otherwise the £0.00 gift pages become publicly buyable the moment the password comes off. Verify afterwards that the Storefront `node()` lookup still resolves them. **(Mihir, dashboard)**

### Cart and checkout code

- [ ] Handle a sold-out variant. `availableForSale` is fetched (`lib/commerce/shopify/queries.ts:45, 194`) and mapped (`lib/commerce/shopify/client.ts:147`) but read by zero UI code: the static catalog hard-codes `availableForSale: true` (`lib/commerce/catalog.ts:139, 148, 175, 196`) and `app/shop/page.tsx:47` hard-codes schema `availability: InStock`. Today a sold-out tier still shows, still prices, still lets you press the button, and the shopper sees nothing. Minimum: disable the option and CTA on the flag, and drive schema availability off the same flag. **(code)**
- [ ] Lock the gifting checkbox whenever **any** applicable code is on the cart, not just a gifting one. `checkboxDisabled` at `components/cart/cart-drawer.tsx:140-151` only checks for gifting codes, so with the 20% waitlist code applied the shopper can tick the box, `applyGifting` appends a 10% code (`cart-context.tsx:304-316`), and because every Shopify code has `combinesWith: false` they can silently land on the worse discount. This hits exactly the launch-week audience. **(code)**
- [ ] Wrap `app/api/cart/remove-lines/route.ts:21` in `enforceGiftPolicy`. It is the one cart route without the clamp, so a crafted sequence can strip the pouch lines, leave the free jars and dabba, and go straight to `checkoutUrl` for a £0 order of free goods. One line. **(code)**
- [ ] Move or dual-fire `track("add_to_cart")`. It fires **before** the mutation at `components/shop/buy-box.tsx:120`, so PostHog counts adds that never happened. **(code)**
- [ ] Cap array lengths on `add-lines`, `update-lines`, `remove-lines` and `attributes` routes, mirroring `MAX_CODES = 5` in `app/api/cart/discount-codes/route.ts:14`. Today only the 4.5MB body limit stops one request forwarding thousands of lines to Shopify. **(code)**
- [ ] Do not delete the saved cart id on a transient error. `lib/commerce/shopify-provider.ts:29-31` returns null on any non-ok GET and `components/cart/cart-context.tsx:146-148` then removes `CART_ID_KEY`. One 502 on refresh and the shopper's basket is gone with no recovery. A 404 and a 502 need different handling. **(code)**

### Verify with your own eyes before launch (runbook Phase 4)

- [ ] Add to basket works and the drawer opens with the right lines. **(Mihir)**
- [ ] Gift lines attach at the right counts: 1 pouch to 1 jar, 2 to 2 jars, 3 to 2 jars plus 1 dabba, 4 or more unchanged. **(Mihir)**
- [ ] The three-line savings summary is correct. **(Mihir)**
- [ ] **Re-check the checkout URL host.** Phase 4 was ticked on 16 July, when the apex still served Shopify. The primary domain has moved since. The `checkoutUrl` should now read `shop.heldi.co.uk/checkouts/...`. **(Mihir)**
- [ ] Gifts appear on the Shopify checkout **with an image** (blocked until the images are uploaded). **(Mihir)**

---

## 4. Email and Klaviyo

Klaviyo account `V9JqrE`. Lists: Waitlist `Staq52` (single opt-in), Weekly letter `U6LSH` (double opt-in). One template, "Waitlist welcome" `VnY8iQ`.

- [x] `KLAVIYO_PRIVATE_API_KEY`, `KLAVIYO_WAITLIST_LIST_ID` and `KLAVIYO_NEWSLETTER_LIST_ID` are set locally and on Vercel Production and Preview. Waitlist signups are reaching Klaviyo, verified 25 July.
- [x] `_dmarc.heldi.co.uk` publishes `v=DMARC1 p=none`. `send.heldi.co.uk` CNAMEs to klaviyodns.com and its SPF resolves.

### Sending domain (do this before any campaign)

- [ ] **Klaviyo DKIM is missing.** `kl._domainkey.send.heldi.co.uk` and `kl2._domainkey.send.heldi.co.uk` resolve to nothing. Without DKIM the launch email lands in spam and burns the domain's reputation on its first send. Get the two CNAME values from Klaviyo → Settings → Domains and add them at the DNS host. **(Mihir, dashboard)**
- [ ] **The apex has no SPF record at all**, despite Google Workspace mail on info@heldi.co.uk. Add `v=spf1 include:_spf.google.com ~all` to `heldi.co.uk`. **(Mihir, dashboard)**
- [ ] Once DKIM and SPF are live and a few campaigns have sent cleanly, consider moving DMARC to `p=quarantine`. Post-launch. **(Mihir, dashboard)**

### Klaviyo build

- [ ] **Zero flows exist.** Build the waitlist welcome flow triggered on list `Staq52`, using template `VnY8iQ`. Today someone joins the waitlist and hears nothing. **(Mihir, dashboard)**
- [ ] **The Shopify integration is not connected.** `get_catalog_items` returns empty while Shopify has an ACTIVE product with 4 variants. That is why there is no back-in-stock, no browse-abandon and no Shopify order data in Klaviyo. Connect it after the store is live. **(Mihir, dashboard)**
- [ ] **9 of the 11 profiles sit on an unused Klaviyo default list `XQfBFE`, not on `Staq52`.** They did not come from the site form (Supabase has only 2 waitlist rows). Decide whether they get the launch email and move them if so. **(Mihir, dashboard)**
- [ ] Launch campaign drafted, proofed, and its audience confirmed. **(Mihir, dashboard)**
- [ ] **`PEHLEAAP` does not exist in Shopify.** `list_discounts` returns only the three gifting codes. Every waitlist surface promises it and so does template `VnY8iQ`. Create it: 20% off, the three pouch variant GIDs only (never `HELDI-SAMPLE`), one use per customer, combines with nothing, plus a **total usage cap** sized to the list, plus an end date. **(Mihir, dashboard)**
- [ ] Note that `PEHLEAAP` is already public in the shipped JavaScript, despite the comment at `lib/pricing.ts:165-166`. `WAITLIST_OFFER` is one object literal imported into client components, so the whole object ships (`grep -rl PEHLEAAP .next/static` matches a browser-served chunk). If it must be private, rename it at creation and let the email carry the real string. Otherwise the per-customer limit plus the total cap is the mitigation. **(Mihir, or code)**

### What the waitlist has been told

- [ ] **The 14-day window is disclosed nowhere.** `WAITLIST_OFFER.windowDays: 14` (`lib/pricing.ts:167-171`) is rendered on zero surfaces, while the percentage is rendered on six. What waitlisters are actually told is "we hold 20% off your first order for you" (`components/site-faqs.ts:213`), unqualified. Either surface the window in the waitlist copy now, or carry the deadline only in the launch email and honour late claims by hand. **(code, then Mihir)**
- [ ] **The offer excludes the Sample and the copy never says so.** Same six surfaces promise "20% off your first order"; `lib/pricing.ts:163` and `BRAND.md:455` exclude `HELDI-SAMPLE`. **(code)**

### Shopify's own customer emails (the most-read copy Heldi will publish)

- [ ] Review the **order confirmation**. It is the CCR reg 16 durable-medium document and is where the model cancellation form must be attached. **(Mihir, dashboard, Settings → Notifications)**
- [ ] Review the **shipping confirmation**. `docs/legal/returns-refunds-policy.md:46` and `terms-and-conditions.md:60` both start a 10-working-day clock from it. **(Mihir, dashboard)**
- [ ] Review the **abandoned checkout email**. It is on by default and will start emailing real customers in stock Shopify wording with no logo. **(Mihir, dashboard)**
- [ ] Brand the checkout: logo and accent colour, and confirm **guest checkout is permitted** (Shopify's new customer accounts can force a first-time buyer into an email-code login, which is a real conversion drop). **(Mihir, dashboard, Settings → Checkout)**

### The weekly letter

- [ ] Base campaign with a Web Feed block pointed at `https://heldi.co.uk/feed.xml` built, and `KLAVIYO_BASE_CAMPAIGN_ID` set. `scripts/send-weekly-letter.mjs:38` cannot run without it. **(Mihir, dashboard)**
- [ ] Bank 6 to 8 posts before launch. The consent copy promises "each week" (`lib/waitlist.ts:7`). Publishing history: 7 posts on one day in May, 2 on one day in July, nothing in the 14 days since. The script only fires on a new post, so with nothing new everyone who ticked that box hears from Heldi zero times. **(Mihir, real world)**

### The decision nobody has made

- [ ] **Decide whether to launch to this list, or to spend the weeks before launch building one.** 2 waitlist rows in Supabase, 11 Klaviyo profiles, 0 members on the weekly letter. The 20% code, the "one email the day we launch" and the whole `WAITLIST_OFFER` construct currently address roughly two people. Fixing DKIM, building the flow and drafting the campaign are all necessary and all worthless against an audience of two. This changes the launch date, so make it deliberately. **(Mihir)**

---

## 5. Site quality, accessibility and performance

### Already done, do not re-ask

- [x] `npm run build`, `npm run typecheck` and `npm run brand-lint` all pass. 62 routes, 0 errors. brand-lint's 3 warnings are 5 code comments, 1 FAQ string, and the dormant hero video variant that `app/page.tsx:45` never selects.
- [x] No horizontal page scroll at 375px. Verified live on `/shop`: `documentElement.scrollWidth === clientWidth === 375`.
- [x] Asset budgets met. Tracked `public/` is 14.76MB across 59 files, largest shipped asset 1.28MB. The two over-budget warnings are gitignored and never deploy.
- [x] Zero raw `<img>`. All photos WebP. Only the hero curtain preloads eagerly (1.03MB, inside the 2MB target).
- [x] First-load transfer inside budget: `/` about 1.45MB against a 4MB ceiling, `/shop` about 0.4MB against 3MB. LCP elements correct and preloaded on both buyer pages.
- [x] Reduced motion handled in 11 CSS blocks plus 6 `matchMedia` mirrors, including the hero curtain and the cart drawer.
- [x] Waitlist form error handling is correct and is the model the cart should copy (`components/waitlist-form.tsx:65-67`).

### Fix before launch

- [ ] Cart error handling. See STOP. **(code)**
- [ ] Add `app/error.tsx` and `app/global-error.tsx`. Neither exists, so an unhandled render error gives an unstyled white page reading "Application error", with no nav and no way back to the shop. **(code)**
- [ ] Focus ring on cream surfaces. The global ring is `outline: 3px solid #fff` (`app/globals.css:55-58`), which measures **1.13:1** on cream against the 3:1 WCAG 1.4.11 requirement. Sixteen piecemeal overrides exist but **not for the cart drawer**, so inside the basket every focus ring is invisible: close, both steppers, both Remove links, the gifting checkbox, Apply and Checkout. Same for `.pdp__cta`, `.pdp__thumb`, `.pdp__nutrition-link`, `.pdp-review-teasers__more` and `.nutri-modal`. **(code)**
- [ ] Touch targets on the buyer path. `.qty-stepper button` is **24x24px** (`app/globals.css:6390-6391`) and `.cart-line__remove` has a hit box about 13px tall. `PLAYBOOK.md` §1.3 rule 5 sets 36px. These are the quantity and remove controls in the basket on a phone. **(code)**
- [ ] Darken `--muted` (`#8a8378`, **3.31:1** on cream against a 4.5:1 requirement). Used on the compliance disclaimer at `app/globals.css:6077`, `.truth-sources`, `.review-form__legal`, `.nutri-footnote` and every struck-out compare-at price. Roughly `#6f695f` clears it. **(code)**
- [ ] Render the one-discount hint as visible text at `components/cart/cart-drawer.tsx:431`. It is currently `title=` only, so on a phone the shopper sees a dead input with no explanation. The sibling case at `:423` already does it correctly. **(code)**
- [ ] Restore focus on modal close. Five overlays move focus in and never restore it (`cart-drawer.tsx:169`, `consent-modal.tsx:49`, `waitlist-popup.tsx:95`, `nutrition-modal.tsx:16`, `gifting-popup.tsx:20`). WCAG 2.4.3. **(code)**
- [ ] Trap Tab in `components/shop/nutrition-modal.tsx:14-27` and `components/shop/gifting-popup.tsx:18-25`. Both handle Escape only. Copy `cart-drawer.tsx:171-190`. The nutrition modal is on the buyer path. **(code)**
- [ ] Add a skip link. WCAG 2.4.1 is Level A and the homepage has 7 or more nav links before content. One anchor plus about 8 lines of CSS. **(code)**
- [ ] `aria-live="polite"` on `.cart-drawer__summary`. Only the quantity numbers announce today, so a screen reader user hears "3" and nothing about the new total (`cart-drawer.tsx:502-505`). **(code)**
- [ ] Add `sizes="72px"` to the two cart line images (`cart-drawer.tsx:285-291`, `:350-357`). brand-lint does not catch fixed-size images. **(code)**

### Worth doing, not gates

- [ ] Lazy-load posthog-js. `lib/analytics.ts:12` is a static import in the root layout, so a 264KB raw / 87KB gzip chunk downloads for every visitor including those who decline. The replay recorder is already lazy at `:92`, so the same `await import()` in `initAnalytics()` moves the core out too. **(code)**
- [ ] `preload="none"` on `components/shop/pdp-review-teasers.tsx:94`, the only video in the repo that deviates. **(code)**
- [ ] Delete the dead `heroLayout="video"` branch, or make brand-lint error rather than warn on a referenced-but-untracked asset. `components/heldi-homepage.tsx:35-36` hard-references a 29.5MB video that is one prop away from production. **(code)**
- [ ] `<html lang="en-GB">` in `app/layout.tsx:50`. **(code)**

---

## 6. SEO and domain

### Already done, do not re-ask

- [x] **The apex/www mismatch is fixed.** `https://heldi.co.uk/` returns 200, `https://www.heldi.co.uk/` returns 308 to the apex with the path preserved, and all 21 sitemap URLs return `200` with zero redirects. `NEXT_STEPS.md:22` sub-item (a) is stale, and so is the P0 at `docs/seo-plan.md` §1, §4 and §10 item 1.
- [x] `shop.heldi.co.uk` already points at Shopify. `NEXT_STEPS.md:22` sub-item (b) is stale too.
- [x] Google Search Console domain property verified (`google-site-verification=SSVUZ9BMhtAEzcaEYCS5gbdgE8KraywDwQXxI_ULJ1s` on the apex TXT).
- [x] Canonicals correct and self-referential on every indexable route. Every route ships a distinct og:image, all returning 200 at 1200x630.
- [x] All 11 JSON-LD blocks parse. `lib/json-ld.ts` escapes correctly, so tag breakout is not possible.
- [x] `/preview` and `/review` are `noindex, nofollow` and absent from the sitemap. Sitemap contents correct at 21 URLs. Legacy Shopify redirect map live (`next.config.ts:76-108`), 5 shapes spot-checked.
- [x] robots.txt, `/feed.xml` and `/llms.txt` all serve correctly.

### Before or at launch

- [ ] **Keep `shop.heldi.co.uk` out of the index.** `https://shop.heldi.co.uk/robots.txt` already serves `Allow: /`. The moment the password comes off, Shopify serves product, collection and policy pages that duplicate and compete with `heldi.co.uk/shop`. Fix in admin: publish products to the Headless channel only, or add `noindex` to `theme.liquid`. Re-check with `curl https://shop.heldi.co.uk/products/heldi-khana` after launch. **(Mihir, dashboard)**
- [ ] Fix the launch Product schema price floor. `app/shop/page.tsx:41-49` will emit `lowPrice: "5.00"` from `SAMPLE_PRICE_PENCE`, so Google can render "Heldi Khana £5.00 to £80.00". Use `TIERS.single.launchPence` instead and leave the sample out of the range. **(code)**
- [ ] Delete the `images` key at `app/heldi-living/[slug]/page.tsx:35`. It overrides the branded 1200x630 card that the repo already generates, shipping a 1024x1024 WebP instead, which WhatsApp and LinkedIn handle poorly. One line. **(code)**
- [ ] Set up Bing Webmaster Tools with the one-click import from Search Console. ChatGPT search and Copilot both run on the Bing index. The highest-leverage 20 minutes in this section. **(Mihir, dashboard)**
- [ ] Rewrite brand-first titles: `app/layout.tsx:29`, `app/shop/page.tsx:15`, `app/ways-to-use/page.tsx:12`, `app/inside-the-pouch/page.tsx:7`, `app/faq/page.tsx:9`. `/truth` is the model done right. Meta descriptions are already good, so this is titles only. **(code)**
- [ ] Update `public/llms.txt`. It contains an em dash on line 3 (outside brand-lint's scan path) and says "Launching autumn 2026; currently taking waitlist signups", which is wrong on launch day. **(code)**

### Post-launch

- [ ] Submit the sitemap in Search Console. Expect 22 URLs (21 plus `/legal/shipping`, which appears once the mode flips). **(Mihir, dashboard)**
- [ ] Request indexing on `/` and `/shop`. These are the two pages whose content materially changes at launch. **(Mihir, dashboard)**
- [ ] Run the Rich Results Test against the live `/shop`. This is the only moment the `AggregateOffer` branch has ever rendered in production. **(Mihir, dashboard)**
- [ ] Start Google Merchant Center (approval takes days) and a Trustpilot profile. Trustpilot is also the honest route to a real aggregate rating later. **(Mihir, dashboard)**
- [ ] Nice, not gates: BreadcrumbList schema, named AI crawlers in `app/robots.ts`, IndexNow, author E-E-A-T (`app/heldi-living/[slug]/page.tsx:59` says only "Mihir"), a real `dateModified`. **(code + Mihir)**

---

## 7. Content and brand truth

### Must be fixed before checkout opens

- [x] `200+ five star reviews` is gone. The summary now counts five-star reviews from the data actually rendered (`components/shop/pdp-review-teasers.tsx`), so it cannot assert a number that is not true, and it hides itself at zero. Done 28 Jul 2026.
- [x] `PLACEHOLDER_REVIEWS` and `PLACEHOLDER_STANDINGS` are quarantined behind showcase mode. No component imports them directly any more; everything reads `displayReviews()` / `displayStandings()` in `lib/reviews.ts`, which return real reviews first, placeholders only when `NEXT_PUBLIC_SHOWCASE_MODE=on`, and empty otherwise. `ReviewsSection` removes the entire band when both are empty, so a production build shows no invented reviewer, no VERIFIED chip and no leaderboard. Done 28 Jul 2026.
- [ ] **Decide how the friends, family and tester reviews are labelled.** Plan as of 28 Jul is 10 to 20 reviews before launch from people given free product. Three things have to be true before any of them is published:
  1. **No VERIFIED badge unless there is a real order behind it.** Fixed in code 28 Jul: `lib/reviews-store.ts` now sets `verified` from whether the row carries an `order_number`, instead of hard-coding `true` on everything published. A tester with no order publishes without the badge, which is what keeps the badge worth anything.
  2. **Incentivised reviews must say so.** Under CMA guidance a review given in exchange for free product is incentivised, and the disclosure has to sit with the review, not in a policy page. There is no field for that yet: `public.reviews` needs an `incentivised boolean`, the review form needs to ask, and the review card needs a third badge alongside VERIFIED and HELDI KITCHEN. Roughly a half-day including the migration, which has to be pasted into the Supabase SQL editor by hand because HeldiPM owns the migration history. **(code)**
     - **Agreed badge wording: `AUNTIES & UNCLES · SENT FREE`.** The first half is established brand vocabulary (the live ticker already runs "AUNTIES & UNCLES PAY LESS") and frames the panel warmly; the second half is the part that does the legal work and must never be dropped or softened, because a consumer has to understand the reviewer did not pay. "Sent free" is plainer than "gifted" and reads the same to everyone.
     - Prefer avoiding this badge entirely by running the tester round as a **paid** round: see the item below.
  3. **Preferred route: make the tester round a real paid round.** Sell to friends, family and testers at a discount through Shopify rather than giving pouches away. They place genuine orders, so every review is legitimately VERIFIED, no disclosure badge is needed, and there is no schema change to make. The only condition is that the discount must not be **conditional** on leaving a review; a launch or family price with no strings attached is just a discount. This is the cheapest way to reach launch with real verified reviews. **(Mihir)**
     - Note the two labels are independent. "Verified" answers *did they buy it*; "incentivised" answers *did we give them something for the review*. A review can be both, which is exactly what Amazon Vine is. Publish the lukewarm ones too, since showing only the flattering ones can itself mislead.
  3. **The /review page currently promises something that would become untrue.** It says "We match every review to a real order before it goes up" and "We never pay for praise" (`components/review-form.tsx`). Free product to a tester is not payment, but it is not a matched order either. Reword before publishing tester reviews. **(code)**
- [ ] **The VERIFIED badge is currently earned by any non-empty string, so decide how an order is actually proved.** Audited 4 Aug 2026. Review-request emails are meant to link to `/review?stars=N&order=XXXX`, and `components/review-form.tsx` does prefill the order field from that parameter, but the field is also visible and freely editable, and nothing anywhere checks the value against Shopify. Since `lib/reviews-store.ts` now derives `verified` from that field, anyone who types anything into it, or who visits `/review?order=1042` directly, earns the badge. Hiding the field does not fix this and makes it worse: it removes the customer's ability to correct a wrong number while making an unverified claim look official. Two real options:
  1. **Moderator check (free, works today).** The badge means "Mihir opened Shopify and confirmed this order exists". HeldiPM's `/reviews` screen already shows the order number next to each submission for exactly this. Honest, but manual, and it is only as good as the discipline.
  2. **Sign the link (the proper fix, about half a day).** The review-request email carries an HMAC of the order number alongside it, `/review?order=1042&t=...`, and `/api/reviews` refuses to store an order number whose token does not verify. The badge then cannot be forged, and the field can safely become read-only. Worth doing when the Klaviyo review-request flow is built, since that email does not exist yet and the link format can be designed once rather than migrated later. **(Mihir decides, then code)**
- [ ] **Shorten the storefront's signed media URLs, and understand what they mean for erasure.** `lib/reviews-store.ts` mints signed URLs with a **one year** TTL and embeds them in a statically rendered page. The bucket is correctly private, so the signature is the only thing standing between a stranger and a customer's photo, and that signature stays valid for a year no matter what happens afterwards. Practical consequence: unpublishing a review, or honouring a UK GDPR erasure request, does **not** revoke a URL already served. Anyone who copied it keeps access for up to twelve months. Shorten the TTL (an hour is plenty given the page revalidates hourly) and note that genuine erasure means deleting the storage object, not just the row. HeldiPM's moderation screen already uses one hour for the same reason. **(code)**
- [ ] **Still required before launch: replace or delete, do not just leave switched off.** Quarantine stops the legal exposure; it does not decide what `/shop` and the homepage show on launch day. Either real moderated reviews are behind these sections, or the sections come out. **(Mihir decides, code executes)**
- [ ] Decide what the reviews band shows with zero reviews. Cleanest option that keeps the design: keep the two Heldi kitchen stock clips, which are honestly labelled "HELDI KITCHEN" and carry no star rating or badge (`pdp-review-teasers.tsx:110-112`), and drop the six invented people. **(Mihir decides, code executes)**
- [x] Flavours row fixed 28 Jul 2026: now "Warm spices you already cook with", deliberately non-specific while the formulation moves. Name real spices again only once the final spec is signed off.
- [x] "Every Heldi order ships with a refillable jar" fixed to "Every pouch order" 28 Jul 2026, so the £5 Sample no longer implies a free jar.
- [x] Jar colour resolved 28 Jul 2026: **gold only**. Copy rewritten, and the image alt text no longer describes a silver jar. Original note:  The homepage invites a silver-or-gold choice; checkout never asks and `docs/free-gift-cart-plan.md:348-350` puts jar colour explicitly out of scope. Either add the option or rewrite so the colour is a surprise. Note only the gold jar has a shipped asset. **(Mihir decides, code executes)**

### Fix before launch

- [ ] Replace the three garbled pack renders. `khana-1.webp` prints "VECITARAN" and cuts off mid-word; `khana-bundle-3.webp` prints "VECITAKAN", "AND MAAKY MORE HOME-COOKED FAVOURITES", and a protein roundel containing a word banned site-wide by `BRAND.md` §5; `khana-bundle-2.webp` prints "HOHE-COOIKED" and "hcalthy". All three are on the PDP gallery, the tier cards, the cart thumbnail and the `/shop` Product JSON-LD image array. File-for-file replacement plus a `?v=` bump, no component changes. Also note the spilled powder in `sample.webp` is turmeric-yellow while the real blend (94.15% whey isolate) is off-white. **(Mihir, real world, then the `add-asset` skill)**
- [x] Phantom products removed from both live blog posts, 28 Jul 2026. It was two files, not one: `why-the-dad-bod-is-a-different-problem-for-desi-men.html` and `what-desi-women-arent-told-about-strength-and-ageing.html`, both in the sitemap and `/feed.xml`. Both now reference only Heldi Khana, and the protein arithmetic still checks out against `PROTEIN_GRAMS_PER_TBSP` (10.4g).
- [x] "90% whey protein isolate" corrected to 94% in both places, 28 Jul 2026, with a comment at each site pointing at `FORMULA` and BRAND.md §11.1. Note both numbers move if the formulation changes; §11.1 already greps for "94".
- [ ] Replace "protein boost" (`components/shop/product-accordions.tsx:37`, `components/home-faqs.ts:40`). The permitted nutrition claims are "source of protein" and "high in protein". **(code)**
- [x] "MOST POPULAR" changed to "BEST VALUE" 28 Jul 2026. One is a price fact anyone can check; the other was a consumer-behaviour claim with zero orders behind it.
- [~] Hard-coded prose leaks that break `BRAND.md` §11. **Half done 3 Sep 2026:** the pouch-life FAQ now reads `${SERVINGS_PER_POUCH}` instead of a literal "25 meals", so the number can never drift from the constant again. **Still open:** "over £40 ship free, £3.55" at `components/site-faqs.ts:178` should come from `SHIPPING`. **(code)**
- [ ] Make the PDP teaser strip able to show real reviews. `components/shop/pdp-review-teasers.tsx:121` reads `PLACEHOLDER_REVIEWS` directly and takes no props, so even after moderation the strip keeps showing invented people while the band below updates. **(code)**
- [ ] **The homepage loses its closing CTA at launch.** `components/heldi-homepage.tsx:1382` wraps the whole final band in `mode !== "live"`, so in live mode the homepage ends with the jar preview and the footer, with no "Shop now". Every other page keeps its CTA via `<WaitlistOrShopCta>`. The `#join` anchor disappears with it, so any older email pointing at `heldi.co.uk/#join` becomes a dead link. **(code)**
- [ ] Add the banned vocabulary word to `scripts/brand-lint.sh` rule 2 alongside "scoop", then fix the two live instances: `content/heldi-living/high-protein-tadka-dal.html:54` and the stale `.ways-steps-card__dose` label documented at `docs/brand/specimen.html:741`. Two-line tooling change. **(code)**
- [x] **Product name locked: "Khana", confirmed 28 Jul 2026.** It names the meals, which is the point. No longer a placeholder; `NEXT_STEPS.md` "Placeholders to revisit" can drop it. Original note kept for the record: locking it mattered before the pouch film was printed, not before the site launched. The renders do not print the name, and `/shop` does not contain it in the URL, so the site cost is bounded: 12 visible strings, 15 in the blog, about 25 internal identifiers, 3 SKUs, the Shopify handle and one Klaviyo template. What is expensive is printed film, shipped SKUs, indexed Recipe schema, and a split PostHog funnel (`components/shop/buy-box.tsx:61`, `:121` send `product: "khana"` with no build error when it changes). **(Mihir)**

### Already done, do not re-ask

- [x] All six `/ways-to-use` comic strips ship, tracked, inside budget. `NEXT_STEPS.md:90` is stale.
- [x] The waitlist to live copy switch is complete and automatic across every surface in `BRAND.md` §11.5. Every CTA, ticker, nav pill, price, FAQ entry, gifting band and schema block is mode-gated. Both `NEXT_PUBLIC_COMMERCE_MODE` and `NEXT_PUBLIC_COMMERCE_PROVIDER` must flip together.
- [x] The review capture flow is compliant by design: `/review` is noindex, it collects an order number for matching, submissions are `pending` by default and only published rows reach the site (`lib/reviews-store.ts:54-90`).
- [x] Nine blog posts published, all heroes resolve and are inside budget, all nine in the feed and the sitemap, all carrying numbered references and correct claim wording.
- [x] All pricing flows from `lib/pricing.ts` in integer pence.

---

## 8. Operations, monitoring and security

### Already done, do not re-ask

- [x] Every route under `app/api/` calls the guard before parsing a body or touching a service, verified line by line across all 12 routes. All six `RATE_RULES` keys are used, no route invents a number inline. `cart/get` correctly uses `checkRate()` alone.
- [x] Webhook HMAC is correct and timing-safe: raw body verified before `JSON.parse`, length pre-check so `timingSafeEqual` cannot throw, `runtime = "nodejs"` pinned (`app/api/webhooks/shopify-orders/route.ts:28-39`, `:122-137`).
- [x] Supabase migrations 0001, 0002 and 0003 applied (PostgREST probe, 28 July). RLS enabled on all three tables, no policies, so `service_role` is the only path in. Closes `NEXT_STEPS.md:65`.
- [x] Secrets hygiene clean. `.gitignore:12-13` covers `.env*`, the only env file ever committed is `.env.example`, and a grep of every tracked file for token, key and JWT shapes returns nothing.
- [x] Security response headers live in production: CSP, HSTS, nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy.
- [x] `PREVIEW_PASSWORD` is set on Vercel, closing `NEXT_STEPS.md:35`.

### Before launch

- [ ] **Set `SHOPIFY_WEBHOOK_SECRET` on Vercel, redeploy, then register the webhook.** In that order. It is absent from all three Vercel environments and `POST https://heldi.co.uk/api/webhooks/shopify-orders` returns 503. Registering first means Shopify retries for 48 hours, then **removes the subscription**. Register at Settings → Notifications → Webhooks, `orders/create`, JSON, `https://heldi.co.uk/api/webhooks/shopify-orders`, API version 2026-01 to match `lib/commerce/shopify/client.ts:18`. Runbook Phase 6.5. **(Mihir, dashboard)**
- [ ] **Set Vercel WAF rules** per `docs/security.md:141-155`. Two documented traps: the blanket rule's exclusion operator must be **does not contain** `/api/webhooks`, and `/api/reviews/upload-url` needs its own rule because rule 1 does not cover it. Understand what the code-level limits actually are: counters live in a per-instance `Map` (`lib/rate-limit.ts:54`), so the effective cap is instances multiplied by the table value, every cold start resets them, and a blocked request **still costs an invocation**. Only the WAF denies at the edge. **(Mihir, dashboard)**
- [x] **`supabase/migrations/0004_review_media_limits.sql` is applied.** Done 4 Aug 2026 via `supabase db query --linked -f supabase/migrations/0004_review_media_limits.sql`, which goes through the Management API and is **not** the banned `db push`; HeldiPM owns the migration history in this shared project and it was left untouched. The bucket now reports `file_size_limit: 52428800` (50MB, matching `REVIEW_LIMITS.mediaMaxBytes`) and the seven mime types in `REVIEW_MEDIA_TYPES`, confirmed independently through both the CLI and the Storage REST API. Enforcement was then tested rather than assumed, against real signed upload URLs: HTML declared as `text/html` was rejected `415 invalid_mime_type`, a 51MB file declared `video/mp4` was rejected `413 Payload too large`, and a small legitimate JPEG was accepted. The test object was deleted and the bucket is empty. Keep the two values in step with `lib/review-submissions.ts` if either changes.
- [ ] Add 0004 to the file table at `supabase/migrations/README.md:42-46`, which is how it got missed. **(code)**
- [ ] Set up an external uptime monitor alerting to Mihir's phone: `https://heldi.co.uk/` and `https://heldi.co.uk/api/cart/get?cartId=x` (expect 400, which proves the function layer is alive and not just the CDN). Today there is no error monitoring, no uptime check and no alerting of any kind: the site could 500 at 2am and nobody would know, because Vercel emails on failed builds and not on runtime 5xx. **(Mihir, dashboard)**
- [ ] Confirm the **value** of `NEXT_PUBLIC_COMMERCE_PROVIDER` on Vercel Production. The CLI shows names only, and the site's mock-cart notice hangs off this variable rather than the mode flag. **(Mihir, dashboard)**
- [ ] Confirm the Supabase project's plan and whether daily backups or PITR are included. Free projects have neither and **pause after inactivity**, which would 500 the waitlist form. **(Mihir, dashboard)**
- [ ] Export the `waitlist` table once before launch. It holds `source`, `consent_copy` and `marketing_opted_in_at`, which exist **only** in Supabase and are the GDPR and PECR consent evidence. Klaviyo does not carry them. Two rows today, so this is the cheapest this will ever be. **(Mihir, dashboard)**

### Code fixes worth doing

- [ ] Fix `sweep()` in `lib/rate-limit.ts:63-68, 100-103`. It evicts long-window counters using whichever window the incoming request carries, so cart traffic (60s) wipes review-upload counters (1h). An attacker can mint 3 upload URLs, fire cart requests to trigger a sweep, and repeat. It matters mostly because 0004 is missing behind it. **(code)**
- [ ] Add a WAF rule for `/ingest` and add it to the `docs/security.md` table. `next.config.ts:119-130` rewrites it to PostHog, rewrites are not route handlers so `guard()` never runs, and every documented WAF rule keys on `/api`. Anyone can pump unlimited events through Heldi's domain on Heldi's invocations. Keep the limit generous, replay uploads are chatty. **(code + Mihir, dashboard)**
- [ ] Pass `timestamp: new Date(order.created_at)` to `client.capture()` at `app/api/webhooks/shopify-orders/route.ts:87`. The deterministic uuid alone does not guarantee dedupe on a delayed Shopify retry, so revenue can double-count. **(code)**
- [ ] Add the five missing variables to `.env.example`: `KLAVIYO_PRIVATE_API_KEY`, `KLAVIYO_WAITLIST_LIST_ID`, `KLAVIYO_NEWSLETTER_LIST_ID`, `KLAVIYO_BASE_CAMPAIGN_ID`, `GSC_PROPERTY`. Anyone setting up from the example file today gets a site whose waitlist silently stops reaching Klaviyo. Note also that `SUPABASE_URL` must exist at **build** time. **(code)**

### Post-launch

- [ ] PostHog alert on `purchase` count = 0 for 24 hours, which catches a dead webhook before Shopify gives up on it. **(Mihir, dashboard)**
- [ ] Review moderation interface. Approving a review today means hand-editing a Supabase row plus a second trip to Storage for a signed URL. Painful after about 20 reviews. **(code)**
- [ ] Abandoned-upload sweeper for `review-media/uploads/*` with no matching `reviews.media_path`. Zero orphans today. **(code)**
- [ ] Turnstile on the waitlist and review forms. The honeypot is visible in page source and stops naive bots only. **(code + Mihir)**
- [ ] Chargeback process: decide where the tracking number, delivery confirmation, order confirmation and accepted policy text live so evidence can be assembled in ten minutes. Confirm Shopify's fraud analysis is on. **(Mihir)**
- [ ] Keep a refund float in the bank account. Shopify Payments takes refunds from the available balance and debits the bank account if it is empty, which it will be on day two. **(Mihir)**
- [ ] Write down the monthly running cost once: Shopify plan, transaction fees, Vercel, Klaviyo, Google Workspace, domain, Supabase. Roughly £60 to £80 a month before a single order. **(Mihir)**

---

## 9. Launch day, in order

Do not reorder these. Each step depends on the one above it.

- [ ] **1.** `PEHLEAAP` created in Shopify with the exact expiry the launch email states, restricted to the three pouch variants, one use per customer, plus a total usage cap. **(Mihir, dashboard)**
- [ ] **2.** Shipping rates live, tax verified at £0.00 on a test checkout, Shopify Payments out of test mode, policies pasted, product images uploaded. **(Mihir, dashboard)**
- [ ] **3.** Online Store password removed, and the Shopify theme kept out of the index (see §6). **(Mihir, dashboard)**
- [ ] **4.** Vercel: set `NEXT_PUBLIC_COMMERCE_MODE=live` and confirm `NEXT_PUBLIC_COMMERCE_PROVIDER=shopify`, then trigger a **fresh build**. **Untick "use existing build cache"**, or push a commit. `lib/commerce/config.ts:5-9` reads a `NEXT_PUBLIC_` variable, which Next.js **inlines at build time**, so a cached redeploy leaves the old `waitlist` value baked into the client bundle and the site does not change. This is the single most likely way launch day appears to fail for no reason. Runbook Phase 7. **(Mihir, dashboard)**
- [ ] **5.** `/shop` is ISR at 1 hour, so allow for that or force a revalidation before judging the result. **(Mihir)**
- [ ] **6.** Verify the live site yourself, end to end, with a real card: add to basket, gifts attach at the right counts, discount applies, shipping matches, checkout completes, confirmation email arrives, `purchase` lands in PostHog. **(Mihir)**
- [ ] **7.** Confirm `https://heldi.co.uk/legal/shipping` returns 200. It is deliberately 404 today and self-heals at launch via `lib/legal.ts:29`. Ten-second curl. **(Mihir)**
- [ ] **8.** **Only now** send the Klaviyo launch campaign. Sending it at step 1 by mistake lands the whole list on a waitlist site holding a code that does not exist. **(Mihir, dashboard)**
- [ ] **9.** Submit the sitemap in Search Console and request indexing on `/` and `/shop`. **(Mihir, dashboard)**

### Rollback

Flipping the mode back reverts the site and nothing else. A real rollback is four actions, and the runbook's single line at `docs/launch-runbook.md:328-330` is not enough.

- [ ] **Trigger agreed in advance.** Pull the launch if: checkout fails, any order charges the wrong total, any order charges tax, or the gift lines do not attach. **(Mihir)**
- [ ] **a.** Re-enable the Shopify Online Store password, or deactivate the product. Otherwise anyone holding a `checkoutUrl` can still complete an order and `shop.heldi.co.uk` stays public. **(Mihir, dashboard)**
- [ ] **b.** Disable `PEHLEAAP`. **(Mihir, dashboard)**
- [ ] **c.** Flip `NEXT_PUBLIC_COMMERCE_MODE` back to `waitlist` and rebuild without the cache. **(Mihir, dashboard)**
- [ ] **d.** Decide what happens to orders already taken, and who emails those customers. **(Mihir)**

---

## 10. Week one after launch

### Check the first real order against this list, before packing it

- [ ] The free jar and dabba lines are present, at the right counts for the tier ordered. **(Mihir)**
- [ ] The tax line reads £0.00. **(Mihir)**
- [ ] Exactly one discount applied, and it is the one the customer expected. **(Mihir)**
- [ ] The shipping charge matches what the cart drawer displayed. **(Mihir)**
- [ ] The delivery address is complete and postable. **(Mihir)**
- [ ] The order confirmation email actually rendered and sent, with images. **(Mihir)**
- [ ] A `purchase` event landed in PostHog with the right value. **(Mihir)**

### Stop conditions, decided now rather than in the moment

- [ ] Pause selling if: two orders show the wrong total, any order charges tax, any order's gifts fail to attach, or stock hits zero. **(Mihir)**

### The rest of week one

- [ ] Watch the PostHog dashboard daily for `purchase` events. A dead webhook looks exactly like a quiet week. **(Mihir)**
- [~] Answer the inbox. **Decided 28 Jul 2026: Mihir watches it, published response time is 2 working days.** Still to do: put that promise somewhere a customer sees it, since there is no `/contact` route and no stated time anywhere today, while returns, faults, non-delivery, halal questions, international requests and review matching all route to info@heldi.co.uk. Cheapest version is an FAQ line plus the footer; a `/contact` page is the fuller version. **(code)**
- [ ] Real reviews start arriving. Publish them (Supabase `status='published'`) and confirm the PDP teaser strip picks them up (blocked until the §7 fix lands). **(Mihir)**
- [ ] Start the Trustpilot profile. It is the honest route to a real aggregate rating later. **(Mihir, dashboard)**
- [ ] Connect Klaviyo's Shopify integration now the store is live, so the catalog populates and back-in-stock and browse-abandon become possible. **(Mihir, dashboard)**
- [ ] **End of the launch period:** set each tier's `launchPence` equal to its `rrpPence` in `lib/pricing.ts`, mirror it in Shopify **the same day**, and retire the launch copy at the same time: "LAUNCH PRICES ON NOW" in `TICKER_COPY_LIVE` (`components/heldi-homepage.tsx:140`) and the block at `components/shop/buy-box.tsx:215-220`. Runbook Phase 8. **(code + Mihir, dashboard)**
- [ ] Have an answer ready for the first bad outcome: a negative review, a "this tastes like protein powder in my dal", or an allergic reaction report. The last of those is an adverse-event record you may need to produce, so decide now where it gets written down. **(Mihir)**

---

## Open questions for Mihir

Nobody can answer these from the repo. Each one blocks or reshapes something above.

1. ~~Do physical pouches exist?~~ **Answered 28 Jul:** blending run not booked, hoped within two weeks. Still needed: date, quantity, co-packer. How many, where, and when was or is the blending run? Everything else is downstream of this.
2. ~~Do the jars and dabbas exist?~~ **Answered 28 Jul:** jars yes, **dabbas no and may change**. Decide whether the dabba stays in the offer at all. Supplier, quantity, lead time. They are contractually promised on the PDP.
3. ~~Registered as a food business?~~ **Answered 28 Jul:** not yet, will register once production is confirmed. Note the 28-day clock runs from registration, so filing early costs nothing and protects the launch date. If not, the 28-day clock has not started.
4. ~~Royal Mail business account?~~ **Answered 28 Jul:** will be set up. Without it the £3.55 Tracked 48 rate and the tracking number the returns policy depends on do not exist.
5. **Who applies the lot code and the best-before date, and in what format?** And is 18 months substantiated?
6. **Where is stock stored, and who dispatches?** This decides the establishment address on the registration form and whether "we pack every order ourselves" is true.
7. **Is the Sample format ready?** If not, decide now not to sell it on day one.
8. ~~VAT decision?~~ **Answered 28 Jul:** not registered, staying that way for now. Revisit at the £90k threshold. Not registered and stay that way, or register voluntarily to reclaim input VAT on packaging, ingredients, manufacturing and ads? If prices already assume VAT will arrive, say so, because at £30 a pouch the threshold is roughly 3,000 pouches and re-pricing after a launch cohort has anchored is the hard conversation.
9. **What is the COGS, and does the worst-case discount stack still work?** Full table at £64 after 20%, minus free shipping on a probably oversized parcel, minus three pieces of steel, minus fees.
10. ~~Vercel on a paid plan?~~ **Answered 28 Jul:** yes, paid. Spend cap still worth setting. Hobby forbids commercial use and cannot set a spend cap. The plan could not be read from the CLI.
11. ~~Is the product name final?~~ **Answered 28 Jul:** yes, "Khana". The deadline is the pouch print order, not the site launch.
12. ~~Launch to a list of two?~~ **Answered 28 Jul:** building the waitlist before launch. So the Klaviyo work in §4 is worth doing now, not later. This is a date decision, not a task.
13. ~~Product liability insurance?~~ **Answered 28 Jul:** will be set up. Must be in force before the first parcel ships.
14. **Is there a business bank account in the name Heldi LTD** for Shopify Payments payout?
15. **What is being launched *with*?** `docs/seo-plan.md:313-330` proposes trade press with a lead time measured in weeks, and `:377-380` budgets ad spend. None of it has been started. Either book the runway now or say out loud that launch day is quiet, so nobody is disappointed by a real result.