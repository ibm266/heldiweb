# Heldi handover: what everything is, and what is current

**Written 3 September 2026. Substantially updated 4 September.** Read this first if
you are picking Heldi up on a new machine, in a new session, or with a different
model. Section 7 is what changed on the 4th and is where to start. It is the map. It does not
repeat what the other documents already say; it tells you which document to open
and which file owns which fact.

Update the dated sections when the state moves. If this file and a source file
disagree, **the source file wins** and this one is stale: fix it.

---

## 1. The thirty-second version

Heldi is a UK food supplement brand selling whey protein blends that stir into
Indian home cooking. Pre-launch, waitlist mode, mock cart, no order has ever been
taken. Two SKUs: **Khana** (savoury, 300g, for the pot) and **Chai** (250g, for the
mug). A third name, **Dahi**, appears in older files: it never launched and is not a
SKU. If a document tells you the launch pair is Khana and Dahi, that document is out
of date.

The recipe and the nutrition declaration were **settled on 3 September 2026** against
a real certificate of analysis. Before that date almost every figure in both repos
was wrong in the same specific way. Section 5 explains how, and it is the single most
useful thing in this file.

**Chai is in run 1**, decided 4 September. That closed the top gate in NEXT_STEPS §1b
and contradicts two HeldiPM records that still park it: `context/product-gates.md:17`
("Chai spices not ordered this run") and `data/project-status.json`, which still names
a two-SKU Khana and Dahi launch. The spices have to be ordered, and both records need
correcting.

**The commercial model was settled and largely built on 4 September.** Prices,
discounts, presents, the sample range, four Shopify products and a working two-product
basket. Section 7 has the detail; section 7b has the six things that still need a
human.

---

## 2. Two repositories, and what each one owns

| | `~/Projects/heldiweb` | `~/Projects/HeldiPM` |
|---|---|---|
| What it is | The public Next.js storefront | Internal product-management app plus all pack and print design |
| Owns | Every product fact, all site copy, pricing, the nutrition calculator | Pouch artwork, print files, COGS, design testing, review packs |
| Source of truth for facts | **Yes.** Everything downstream reads from here | No. It consumes heldiweb's figures |
| Git | Everything tracked | Most of `design/` is ignored, but the **pouch build sources are tracked** since 3 Sep. See section 4 |

There are two smaller repos: `~/Projects/heldi-shopify-mcp` (a self-owned Shopify
Admin MCP server) and `~/Projects/heldi-video`.

**The rule between them:** heldiweb wins on any product fact. HeldiPM has no local
copy of the nutrition source of truth and depends on a sibling heldiweb checkout
being present and current. Nothing enforces that mechanically, so check it by hand.

---

## 3. Where each fact lives (open these, not this file)

Facts, in heldiweb:

| Fact | File |
|---|---|
| Khana formulation, nutrition, amino acids | `components/shop/nutrition-data.ts` |
| Chai formulation, nutrition, amino acids | `components/shop/chai-data.ts` |
| The calculator that generates both tables | `scripts/nutrition-calc.mjs` |
| Prices, shipping, discounts, presents (integer pence) | `lib/pricing.ts` |
| The rate card, asserted | `npm run pricing-check` (`scripts/pricing-check.mjs`) |
| Shopify variant GIDs, and the admin jobs still outstanding | `docs/two-product-cart-plan.md` Phase 1 |
| Servings per pouch and per sachet, and the mix SKU model | `lib/commerce/catalog.ts` |
| Whether Chai can be added to a basket | `CHAI_SELLABLE` in `lib/commerce/config.ts` |
| Protein per tablespoon for review maths | `PROTEIN_GRAMS_PER_TBSP` in `lib/reviews.ts` |

Rules and process, in heldiweb:

| Job | File |
|---|---|
| Brand identity, voices, humour, visual tokens, **and §11, the change-impact map** | `BRAND.md` |
| Responsive contract, code conventions, blessed components, recipes | `PLAYBOOK.md` |
| What agents must know before touching anything | `CLAUDE.md` (mirrored to `AGENTS.md`) |
| **Status:** what is done, what is next | `NEXT_STEPS.md` |
| **Mechanics:** exact Shopify clicks and API steps | `docs/launch-runbook.md` |
| **The gate:** read top to bottom before going live | `docs/go-live-checklist.md` |

Those last three are deliberately three documents with three jobs; `NEXT_STEPS.md`
explains the split at its top. **§11 of BRAND.md is the one to read before changing
any product fact**, because most facts are repeated in prose across many surfaces
and editing the source file alone does about a third of the job.

Pack and print, in HeldiPM:

| Thing | File |
|---|---|
| **The printed compliance panel for both SKUs** | `design/pouch-v2/typeset_compliance.py` |
| Back panel narrative, claims strip, round history | `design/pouch-v2/compose_back_v8.py` |
| Front panel | `design/pouch-v2/compose_front_v8.py` |
| Fit, ink normalisation, CMYK, PDF writing | `design/pouch-v2/pipeline.py` |
| Artwork regeneration prompts | `design/pouch-v2/prompts/*.txt` |
| Master back-panel prompt | `docs/back-prompt-master.md` |
| Front brief | `docs/pack-front-prompt-brief.md` |
| Printer-facing spec | `design/pouch-v2/print/PRINT-SPEC.txt` |

**Do not trust `heldi-status.html` in HeldiPM.** As of this writing it still says the
launch is Khana and Dahi with Chai deferred. It is a stale snapshot, not a status
board.

---

## 4. The backup situation

**Fixed on 3 September: the pouch build sources are now in git.** They were not,
and that was the largest risk in the whole setup. `HeldiPM/design/` is 1.2 GB, of
which 1.1 GB is 276 intermediate PNGs, so the whole tree had been ignored. The
consequence was that a clone of HeldiPM contained no pouch design at all: not the
compliance typesetter, not the compose scripts, not the seventeen prompts, not the
print PDFs.

The default is still "ignore everything under `design/`". Negated back in is the
set needed to rebuild from a fresh clone and nothing else: **56 files, 25 MB.**

| Tracked | Not tracked |
|---|---|
| The Python (17 files) | Mockups and source imagery |
| Artwork prompts and briefs (19 txt, 9 md) | CMYK TIFFs and sRGB previews |
| The three fonts | Archived print rounds |
| The 4 generated PNGs the compose scripts read | The other 272 PNGs |
| The 4 print-ready PDFs | |

Two dependencies live outside HeldiPM and were found by walking every file path
the compose chain reads: heldiweb's `public/images/elephant-large-transparent.png`
and `public/images/heldi-wordmark.png`, read by absolute path and gitignored there
too. Both are now tracked in heldiweb. **The absolute path means heldiweb must be
checked out at `~/Projects/heldiweb` for the pouch front to build.**

Reproducible from a clone means the **live** path, `compose_back_v8.py` and
`compose_front_v8.py`. The superseded `compose_back.py`, `compose_front.py` and
`patch_label.py` are kept as history but their v4/v5 input art is not tracked, so
they will not run from a clean checkout.

**Adding a new artwork input?** It must be negated in `.gitignore` explicitly or a
clone cannot rebuild. Check with `git check-ignore -v <path>`.

### What is still only on this machine

**Nothing is pushed.** As of writing, `heldiweb` is ahead of `origin` on branch
`chai-product-page` and the `HeldiPM` branch `pouch-round15-new-formulation` has no
upstream at all. The work is now *committable* and *clonable*, but it is not yet
*off this Mac*. Push both branches, or the git work above buys you nothing against
losing the machine.

---

## 5. The dry-matter trap, and why every old figure was wrong

Arla's certificate of analysis for the whey (certificate 0000672935, batch
FF25466001, the one in hand) reports its first row as:

> **Protein in DM (N x 6.38): 92.66%**, moisture 4.13%

**DM is dry matter.** The protein actually in the powder is
`92.66 x (100 - 4.13) / 100` = **88.83% as-is**. Read the 92.66 straight off the page
as though it were as-is, and everything downstream inherits about three grams per
hundred that is not in the pouch.

Both repos had made that mistake, in different directions:

| Reading | Value | Verdict |
|---|---|---|
| Batch FF25466001 as-is | **88.83%** | Correct, use this |
| What `nutrition-calc.mjs` assumed | 87.30% | Conservative but defensible (spec-max moisture) |
| What the site's table implied | 92.06% | Wrong, the DM number wearing an as-is label |
| **What Bacarel's 1kg retail bag prints** | **92 g/100g** | Wrong, same slip. **Never calculate from the bag** |

Two more traps in the same family:

- **94% is the whey's inclusion rate in the Khana blend, not its purity.** Different
  number, different meaning. Do not conflate them.
- **MPC grades are quoted on dry basis too.** An "85%" milk protein concentrate is
  about 80.75% protein as-is. Chai's table is calculated on that reading, and the
  supplier's own spec is still outstanding.

---

## 6. The settled facts, as of 3 September 2026

Do not re-derive these. If you need to change them, edit the recipe in
`scripts/nutrition-calc.mjs`, run it, and paste the printed rows.

**Heldi Khana.** 300g pouch, 25 servings, **12g serving, about one heaped tablespoon.**

- Recipe: whey protein isolate (MILK) 94%, cumin 1.7%, sunflower lecithin 1.5%,
  coriander 1.25%, fine sea salt 0.75%, garam masala 0.5%, Kashmiri chilli 0.2%,
  turmeric 0.1%
- Printed list quantifies **the whey only**. The spice ratios are the recipe and stay
  unpublished (Annex VIII Part A(4) flavouring exemption)
- Per 100g, then per 12g: energy 1578 kJ / 372 kcal then 189 kJ / 45 kcal; fat 2.4
  then 0.3; saturates 0.4 then 0.0; carbohydrate 3.2 then 0.4; sugars 2.2 then 0.3;
  fibre 0.9 then 0.1; **protein 84.1 then 10.1**; salt 1.2 then 0.14
- Marketing rounds protein **down** to 10g, which is deliberate and always safe

**Heldi Chai.** 250g pouch, 31 mugs, **8g serving, about one LEVEL tablespoon.**

- Recipe: whey protein isolate (MILK) 53.7%, milk protein concentrate (MILK) 18.2%,
  coconut sugar 10%, ginger 6.77%, cardamom 5%, Ceylon cinnamon 2%, black pepper 2%,
  clove 1.56%, sunflower lecithin 0.8%
- Per 100g, then per 8g: energy 1532 kJ / 362 kcal then 123 kJ / 29 kcal; fat 2.1
  then 0.2; saturates 0.7 then 0.1; carbohydrate 19.3 then 1.5; sugars 11.6 then 0.9;
  fibre 4.6 then 0.4; **protein 64.0 then 5.1**; salt 0.32 then 0.03
- Marketing says 5g per mug. Lactose about 2.2 g/100g
- The second milk protein is there **for creaminess in the mug**, not for the protein
  figure

**Three rules that are legal, not stylistic:**

1. The ingredient list must be in **descending order of weight** (FIC Art 18(1)).
2. **Chai's spoon is LEVEL and Khana's is HEAPED.** A level spoon is 7 to 8g and a
   heaped one 12 to 14g, so calling Chai's heaped declares half again the powder its
   table is calculated on.
3. Net quantity is **300g for Khana, 250g for Chai.** They were both 100g on the pack
   until 3 September.

**The gram leads and the spoon follows.** Declarations read "12g, about one heaped
tablespoon", never the other way round, because a heaped tablespoon of this powder
varies from about 10 to 14g between one hand and the next. Marketing prose may still
say "one spoonful", because it declares nothing.

**Never on either pack:** organic, all natural, gluten free. **Never on Chai:** no
added sugar, 98% lactose-free. **Never in Heldi's own copy:** the word "dose"; the
house wording is "recommended daily intake".

---

## 7. What happened on 4 September, and where the build stands

Nineteen commits on `chai-product-page`, **none of them pushed**. The whole day is
still only on this Mac.

### 7a. The commercial model, settled and built

Three numbers in `lib/pricing.ts` now define every pouch price. Change one and the
ladder, both buy boxes, the drawer, the schema and the check script all follow:

```
RRP_PENCE             = 3500   one pouch, Khana or Chai, same price
BUNDLE_DISCOUNT_PENCE =  500   off the second pouch
MAX_POUCHES           =    2   a single or a pair, in any mix
```

One pouch £35, a pair £65 against a £70 RRP. That gives exactly **five** things a
customer can buy (1 Khana, 1 Chai, 2 Khana, 2 Chai, one of each), which is why
Shopify has five pouch variants and not the twenty-seven an earlier plan assumed.

**Samples:** a 30g sachet, £5 in Khana or Chai, £8 for the pair. 30g is 2 Khana meals
at a 12g portion and 3 Chai mugs at 8g, derived and rounded down. That settled a fill
the go-live checklist had been carrying as an open question in three places.

**A free trial pair**, `HELDI-SAMPLE-PAIR-FREE`, £0 with an £8 compare-at, for the
first 100. It is gated by INVENTORY, not by code: that one variant is tracked and
stocked at 100 and closes itself. It is the only variant in the store that should
have tracking on, which is the opposite of every other one.

**Presents:** one set per order. A jar with a single, a jar and a tote with a pair.
Never two jars. The masala dabba is withdrawn.

**Codes:** family ACHABETA / RISHTA / SHABASH at 15% on any quantity; founders at 25%,
one code per person; welcome free postage, the only thing that combines with a product
discount. `PEHLEAAP` and the 20% promise are gone from the codebase entirely.

**RRP is shown.** From two pouches up the page strikes the RRP through beside the
price and names the saving. This reverses P2 of the plan, and the reason it is
allowed where the old launch price was not: £35 is a price a single pouch genuinely
sells at, so the comparison is real rather than a reference to a price nobody was
charged. That is the line the DMCC draws.

### 7b. What is built in code

- **Phase 0 done.** The 20% promise is gone from all eight surfaces.
- **Phase 2 done.** The mix model lives at the foot of `lib/commerce/catalog.ts`,
  added BESIDE the old tier model rather than replacing it, so the build stayed green
  throughout. The tier half goes when its last caller does.
- **Phase 3 done and verified working.** A basket holds at most one pouch line whose
  variant encodes both counts (`HELDI-K{khana}C{chai}`). The drawer shows one row per
  product with its own stepper, a group price line, and the presents beneath. The
  server clamp is `lib/commerce/shopify/cart-policy.ts`, wired into all four mutating
  routes and the GET route.
- **The launch email deep link.** `?claim=pair&code=XXX` lands on a basket with the
  free pair in it and the code applied, and strips both params from the URL.
- **Phase 4 partly done.** The Khana buy box offers one or two pouches priced from the
  ladder. The Chai buy box still has no add-to-basket path, because Chai cannot be
  sold yet.
- **Phase 5 not started.** Stock, the orders webhook and `/api/stock`.

### 7c. What is in Shopify

Four products, all **DRAFT**: Heldi pouches (5 variants), Heldi samples (3), Heldi
sample pair on us (1), Heldi tote bag (1). **Every GID is recorded in
`docs/two-product-cart-plan.md` Phase 1 and nowhere else.** Read them from there
rather than re-querying.

Product images are exported and named by SKU in
`public/images/originals/shopify-upload/` (gitignored). The MCP server has no media
tool, so uploading them is a manual job.

### 7d. Photography, reshot

The jar in every shot on the site was a jar Heldi was never going to ship: no
engraving, no spoon. The correct one is HeldiPM `design/merch/12-table-jar-brass.png`.
Everything was reshot on GPT Image 2 against it, plus the new tote. Retired outright:
both three-pouch shots, the dabba thumb, and the old jar thumb.

Two lessons worth keeping. **Hand the model the actual artwork, not a description of
it**: describing the wordmark produced an upright serif every time; uploading
`public/images/heldi-wordmark.png` produced the real italic lockup immediately. And
**read the print front before guessing at pack colour**: Khana is gold on navy, Chai
is CREAM on terracotta, and they are meant to differ. I got that backwards twice.

### 7e. The testing, and what it found

Verified through the real UI on `npm run dev:mock` (live mode, mock provider, port
3001). That is the only way to exercise the cart without a connected store.

Functional testing found two silent money bugs: a family code that never applied to
anything, and two product codes sitting on a cart at once with only one discounting.

An adversarial review of the diff then found eight more, and **none of them were
visible in the mock**, because the mock has no server clamp. Two would have broken the
site: every step down silently emptied the basket, and an over-cap basket threw in a
component mounted in the root layout, taking down every page. A third quoted £30 on
the CTA for a pouch that costs £35, with £35 struck through against it, which is
exactly the fabricated former price the code's own comment says the DMCC forbids.

**The lesson for whoever picks this up: mock-mode green is not proof.** The clamp has
still never run against a real Shopify cart.

---

## 8. Open decisions, all needing a human

Before the pouch film print order, which is the binding deadline and the
irreversible spend:

1. **Mustard in the garam masala.** It comes from Buy Whole Foods Online, not Spice
   Entice. A compound ingredient under 2% need not be broken out, but allergens are
   never exempt. Same question for the Kashmiri chilli if it is a blend.
2. **Bacarel's MPC spec sheet.** Chai is calculated on the industry dry-basis
   convention, not a measured figure for the product being bought.
3. **A labelling consultant on the artwork**, with two specific questions: does Chai's
   spice list need QUID given its legal name says "chai spices", and is the estimated
   sign lawful (it requires the packer to run and record the average quantity system).
4. **The serving weighing record.** Half its evidence exists: 12g was solved against
   the certificate and corroborated by its bulk density of 0.42 g/cm3. The bench
   weighing is the missing half, and it is what a due diligence defence would rest on.
5. **Front panel contradiction.** `docs/pack-front-prompt-brief.md` says "claim-free
   front" and the rendered artwork agrees, but `lib/design-generation/compliance.ts`
   names the same strings `KHANA_FRONT_STRIP` and `CHAI_FRONT_STRIP` and injects them
   into the front prompt. Two surfaces specify opposite artwork.

Not print-blocking but commercially larger:

6. **Fake social proof is still on the site.** Three entries on the DMCC Act 2024
   banned-practice list, which the CMA can fine directly. `go-live-checklist.md` line
   32.
7. **Shopify cannot take an order today.** No shipping rates, Payments in test mode,
   no business bank account, policies not pasted in.

### Added 4 September: the admin work that blocks the checkout test

None of these can be done by the MCP server, and every one of them independently
stops a Storefront `cartCreate` from working. Until they are done the server-side
clamp cannot be exercised at all, which is where the review found the subtle bugs.

8. **Untrack inventory on the 8 paid variants.** A tracked-but-unstocked variant is
   silently refused by the Storefront API, so this failure looks like a code bug. It
   is the likeliest reason launch day appears broken.
9. **`HELDI-SAMPLE-PAIR-FREE`: tracking ON, 100 units.** The only variant that should
   have it on, which is easy to get backwards while doing item 8.
10. **Publish all four products to the Headless channel** the Storefront token uses.
    A draft can only be carted on a channel it is published to.
11. **Both sample products onto the Sample shipping profile**, or a £0 pair still
    charges £3.55 postage.
12. **Rebuild the three family codes at 15%**, any quantity, once per customer,
    combining with shipping discounts only. They are still the July 10% on single and
    pair, and `GIFTING.percent` in the repo now says 15. Every surface reading it is
    live-mode gated, so nothing is visibly wrong today, but the two must agree before
    the mode flips.
13. **Product images**, from `public/images/originals/shopify-upload/`, named by SKU.

### Added 4 September: decisions still open

- **The tote's stated worth.** `EXTRA_VALUE_PENCE.tote` is £6, a placeholder. It is a
  stated worth on a free item, so it has to be defensible against a real retail price.
- **Weigh the sample pair pack** against the Royal Mail Large Letter limit. Two
  sachets have never been weighed together, and a parcel rate eats the whole £8.
- **Chai's remaining gates**: printed label, finished-product gluten result, physical
  stock. `CHAI_SELLABLE` stays false until all three land. Note it is inlined at build
  time, so flipping it needs a redeploy with the build cache cleared.
- **Klaviyo template `VnY8iQ`** still promises 20% off and £30 pouches. Both false.
- **The launch email needs the claim link format**: `heldi.co.uk/?claim=pair&code=THEIR-CODE`.

**Decided, so do not reopen:** no finished-product lab analysis for the first run.
The calculation is the declaration, which FIC Art 31(4)(b) permits in its own right.
What protects it is the tolerance: for protein above 40 g/100g the band is plus or
minus 8g, so a declared 84.1 survives an analysed result from about 76 to 92. The
certificate must live in the product technical file as the evidence behind it.

---

## 8b. Where to pick the build up

In order, and the first is not optional:

1. **Do the admin work in section 8, items 8 to 13.** Then run the verification matrix
   in `docs/two-product-cart-plan.md` §8 against the real store. Expect to find bugs
   the mock could not show: the clamp has never run against a real cart.
2. **Finish Phase 4.** The shared buy box, so the Chai page has an add-to-basket path
   behind `CHAI_SELLABLE`, and the "add the other pouch" row.
3. **Phase 5.** The orders webhook writing to Supabase, `/api/stock`, and the pickers
   reading real stock. The migration is pasted by hand in the dashboard: the heldi-dev
   database is shared with another app, so `db push` and `migration repair` are banned.
4. **Phase 6.** Docs, and the mirrors: `CLAUDE.md`, `AGENTS.md`,
   `.cursor/rules/heldi-system.mdc` and `PLAYBOOK.md` all state the finishing gate
   verbatim and none of them mention `npm run pricing-check` yet.

Two things to know before touching the cart:

- **Run `npm run dev:mock`** (live mode, mock provider, port 3001). Waitlist mode
  renders no cart at all, and the normal dev server points at Shopify, where the draft
  products do not resolve.
- **The finishing gate is now four commands**: `npm run pricing-check`,
  `npm run typecheck`, `npm run brand-lint`, `npm run build`.

---

## 9. Machine notes

- No ffmpeg, cwebp or Homebrew. Use the repo's `sharp` for images and a scratchpad
  `ffmpeg-static` for video. The `add-asset` skill carries the exact commands.
- `npm run brand-lint` before finishing any copy or asset change. Errors must be
  fixed, warnings reviewed. Three warnings are currently expected and pre-existing.
- HeldiPM's typecheck reports one pre-existing error in
  `lib/design-testing/scoring.test.ts`, unrelated to any of this.
- The browser pane on heldiweb freezes on screenshots at widths at or above 900px.
  Verify with DOM probes and screenshot at 375 instead.
