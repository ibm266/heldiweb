# Heldi handover: what everything is, and what is current

**Written 3 September 2026.** Read this first if you are picking Heldi up on a new
machine, in a new session, or with a different model. It is the map. It does not
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

---

## 2. Two repositories, and what each one owns

| | `~/Projects/heldiweb` | `~/Projects/HeldiPM` |
|---|---|---|
| What it is | The public Next.js storefront | Internal product-management app plus all pack and print design |
| Owns | Every product fact, all site copy, pricing, the nutrition calculator | Pouch artwork, print files, COGS, design testing, review packs |
| Source of truth for facts | **Yes.** Everything downstream reads from here | No. It consumes heldiweb's figures |
| Git | Everything tracked | **`design/` is gitignored.** See section 4 |

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
| Prices, shipping, discounts (integer pence) | `lib/pricing.ts` |
| Servings per pouch and per sample | `lib/commerce/catalog.ts` |
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

## 4. The backup problem, and it is the reason this file exists

**`design/` is gitignored in HeldiPM** (`.gitignore` line 72). It holds hundreds of
megabytes of PSD, TIFF and PNG, which is a sensible thing to keep out of git, but the
consequence is severe:

> **A fresh clone of HeldiPM contains no pouch artwork at all.** Not the compliance
> typesetter, not the compose scripts, not the prompts, not the print PDFs. All of it
> exists only on the disk of whatever machine it was made on.

Everything in the table below is **disk-only** and unversioned:

| File | Last changed |
|---|---|
| `design/pouch-v2/typeset_compliance.py` | 3 Sep 13:39 |
| `design/pouch-v2/compose_back_v8.py` | 3 Sep 13:40 |
| `design/pouch-v2/compose_front_v8.py` | 3 Sep 13:46 |
| `design/pouch-v2/edit_upper_copy.py` | 3 Sep 13:46 |
| `design/pouch-v2/prompts/` (17 files) | 3 Sep |
| `design/testing_day.py` | 3 Sep 17:37 |
| `design/build_review_pack.py` | 3 Sep 17:41 |
| The four print PDFs | 3 Sep 18:00 |

**Before switching machines, copy `~/Projects/HeldiPM/design/` across by hand**, or
put it somewhere backed up. Cloning the repo is not enough. This is the single
biggest risk in the whole setup and nothing in either repo currently guards against
it.

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

## 7. Current state, 3 September 2026

**heldiweb**, branch `chai-product-page`, three commits today:

- `e9fe313` read the whey certificate properly and solved the serving for ten grams
- `dfba38c` fixed the checklist items the formulation change left stale
- `da49d69` gave Chai its own section on Inside the pouch, and explained lecithin

Uncommitted: `docs/brand/guidelines-print.html` and `docs/two-product-cart-plan.md`,
both untracked and pre-existing.

**HeldiPM**, branch `pouch-round15-new-formulation`, one commit today:

- `53cda9e` put the settled recipe and declaration into the pack copy sources

Uncommitted and **needing your review before committing**: `docs/back-prompt-master.md`
and `lib/design-generation/{compliance.ts,prompt-builder.ts}` received large automated
rewrites whose figures are right but whose surrounding editorialising is contested.
`context/insert-card-copy.md` and `context/insert-card-front-prompt.md` are your own
earlier work, untouched.

**The print files were regenerated on 3 Sep at 18:00** and carry the settled
declaration. The previous set is archived at
`design/pouch-v2/print/archive/pre-round15-2026-09-03/`.

To rebuild them after changing a source, from `design/pouch-v2/`:

```bash
python3 -c "import sys; sys.path.insert(0,'.'); import compose_back_v8 as cb; cb.compose(stem='print/heldi-khana-5x6-BACK', copy=cb.COPY, sku='khana'); cb.compose(stem='print/heldi-chai-5x6-BACK', copy=cb.COPY_CHAI, sku='chai')"
```

```bash
python3 -c "import sys; sys.path.insert(0,'.'); import compose_front_v8 as cf; cf.compose(stem='print/heldi-khana-5x6-FRONT', sku='khana'); cf.compose(stem='print/heldi-chai-5x6-FRONT', sku='chai')"
```

Each writes an sRGB PNG, a CMYK TIFF and a DeviceCMYK PDF at 5.125 x 6.250 inches.
Watch the printed `comp_xh_mm`: it must stay at or above 1.0, which is the legibility
floor. The typesetter raises rather than clipping, so a genuine overflow fails loudly.

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

**Decided, so do not reopen:** no finished-product lab analysis for the first run.
The calculation is the declaration, which FIC Art 31(4)(b) permits in its own right.
What protects it is the tolerance: for protein above 40 g/100g the band is plus or
minus 8g, so a declared 84.1 survives an analysed result from about 76 to 92. The
certificate must live in the product technical file as the evidence behind it.

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
