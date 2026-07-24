# Heldi brand guide

The single reference for anyone (human or model) writing copy, designing surfaces, or
changing code on heldi.co.uk. It was distilled from the live site in July 2026 and it
**wins over every other brand doc in this repo**. The files under `fable/` predate the
current formulation and product line-up; where they disagree with this file or with the
live code, this file and the code are right (see §13 for the known stale spots).

How to use it: read §1 to §7 before writing any copy, §8 before styling anything,
§15 before adding or touching any image or video, §16 before creating files, and
**always** check §11 before a change that touches product facts (formulation, protein
numbers, prices, names). §14 is the pre-flight checklist; run it before you finish.
`npm run brand-lint` mechanically checks the greppable rules. A visual specimen of
the whole system lives at `docs/brand/specimen.html` (it uses the production
`app/globals.css`, so it cannot drift). This file is the **what and why**; the
step-by-step **how** (responsive contract, code conventions, build recipes) is
PLAYBOOK.md, and building anything starts there.

---

## §1 The brand in one breath

**Heldi is desi protein for Indian food**: a whey protein isolate blend that disappears
into dal, curry, sabzi and raita so the meals a UK desi family already cooks quietly
carry more protein. No shaker, no new habits, no separate "healthy" cooking.

- **Name**: /hel-dee/, *adj.* how my nani says "healthy." The founder's nani's
  pronunciation, adopted as the brand. This line appears verbatim on the hero and pack.
- **Slogan**: **They shake, we stir.** (A Bond allusion. It is in the ticker, the footer,
  the meta description, and the Organization schema. Treat it as locked.)
- **Tagline family**: "The same food, just a little Heldier." · "Bringing something new
  to the table." · "Same recipes. Same taste. More protein." (pack front)
- **Founder story, one line**: "My nani never said healthy. She said heldi. Warm food,
  made with care, made for you. That is where the name comes from." (founder band,
  homepage; photo of Mihir with nani; signed "— Mihir, founder")
- **Product today**: one product, **Heldi Khana** (savoury blend, 300g pouch, 25
  servings), sold as three bundle tiers plus a £5 Sample (3 servings). Chai is
  publicly teased as "in development" on /our-story. There are no flavour SKUs.
- **Stage**: pre-launch waitlist ("Launching autumn 2026" in the ticker), full storefront
  UI built behind a mock cart. CTAs switch on `COMMERCE_MODE` ("waitlist" | "live").

## §2 Who we are talking to

- **Primary**: UK-based desi households, roughly 20 to 60, cooking Indian food at home.
  Second-generation buyers sorting out their parents, and the parents, aunties and
  uncles themselves.
- **Secondary**: anyone who wants protein without changing what they eat, including
  non-vegetarians (the truth page addresses them directly) and people on GLP-1
  medicines (a whole FAQ group).
- The reader is intelligent and sceptical of supplements. In many desi homes powders
  carry a gym-boy stigma; Heldi positions itself as the opposite: food-first,
  family-table, "the part of milk that has always been there."
- Always **British English** (whilst, flavour, colour, litre) and UK reference points
  (Royal Mail, NHS guidance, Leicester/Wembley/Harrow in review placeholders).

## §3 The five pillars

Every section of the site leans on at least one of these. New surfaces should too.

1. **Radical honesty about food numbers.** The flagship move: "That 18g figure? It's
   for dry dal." The truth page corrects internet protein myths against the bowl you
   actually eat, cites NHS, the British Nutrition Foundation and McCance & Widdowson,
   and lists the honest fixes **with Heldi last** (dahi first, paneer second, Heldi
   third). Honesty is credibility; never reorder the fixes to put Heldi first.
2. **The food never changes.** Disappearing is the product's whole job: "if Mama could
   taste the difference, it failed." Copy celebrates the unchanged recipe, never a
   "new improved" dish. Words: disappear, vanish clean, blend clean, no chalk, no
   aftertaste.
3. **The whole table, not the individual.** Heldi feeds families, not macros. The free
   jar lives on the dinner table ("Not the cupboard"), the leaderboard counts spoonfuls
   into shared pots, bundles are "The pair" and "The full table." Fitness-lifestyle
   framing (gains, shredding, physique) is banned.
4. **Desi pride without caricature.** Nani, mama, papa, aunties and uncles, the masala
   dabba, the thali: affectionate and specific, never stereotyped or exoticised. The
   decorated ink elephant is brand jewellery, not a mascot with a personality.
5. **Show your working.** Provenance and paperwork as brand content: named suppliers
   (Arla, Spice Entice, Special Ingredients), a real batch report on the page, "Blended
   in England. Packed in England.", full nutrition and amino tables one click away.
   "Desi households check marks. So do we."

## §4 The two voices

Heldi speaks in two registers. Never blend them inside one section.

**Voice A, the honest expert.** Plain, precise, quietly warm. Explains numbers without
condescension, concedes points against itself ("Dal chawal pairs them, which is
genuinely clever, but pairing fixes quality, not quantity"), cites sources, uses the
authorised health claim verbatim. No jokes inside medical, nutrition or compliance
copy. This voice owns: /truth, FAQ answers about health and diet, nutrition accordion,
GLP-1 group, legal, anything a GP might read.

**Voice B, the desi underdog.** Warm, proud, slightly cheeky, family-first. First
person plural, jokes about aunties and shakers, allusions to desi pop culture. This
voice owns: hero, ticker, gifting, cart microcopy, stir gallery captions, founder band,
review placeholders, social-facing copy.

Both voices share the same spine: short declarative sentences, concrete nouns (dal,
kadhi, spoonful, pot), and zero wellness jargon.

| Surface | Voice | Example from the live site |
|---|---|---|
| Hero + ticker | B | "THEY SHAKE, WE STIR • AUNTIES & UNCLES PAY LESS" |
| How it works | A with B warmth | "Cook like always." / "Stir in a spoonful." |
| Truth page prose | A | "Here is a normal day, weighed honestly." |
| Truth page garnish | B (one line only) | "Bade bade bowls mein, chhoti chhoti proteins." |
| Our story | B narrating, A on numbers | "Six powders. One kitchen. A few ruined dinners." |
| Inside the pouch | A | "Short label. Long paper trail." |
| Shop PDP | A structure, B accents | "Launch prices. Not forever prices." |
| Cart + gifting | B | "Copied. Good beta." / "Copied. Rishta sorted." / "Copied. Shabash." |
| FAQ | A (B only in delivery/contact answers) | "replies come with opinions about dal" |
| Legal, nutrition table | A only, no garnish | statutory wording |

## §5 Writing mechanics

- **No em dashes in copy, ever.** Restructure the sentence instead (commas, colons,
  full stops). The single sanctioned dash is the attribution dash before a signature
  ("— Mihir, founder"). Grep any new file for `—` and `&mdash;` before finishing.
- **Full stops as rhythm.** The brand loves short sentences landing hard: "No shaking.
  No blending. More protein." / "Gold when the table is set for guests." Prefer three
  short sentences to one long one in headlines and ledes.
- **The authorised claims, verbatim, and nothing stronger.** Protein has exactly three
  entries on the UK register (retained Regulation 432/2012), and all three are open to
  Heldi because the condition of use is only that the food is at least a *source of
  protein*, which the pouch clears comfortably:
  *"Protein contributes to a growth in muscle mass."*
  *"Protein contributes to the maintenance of muscle mass."*
  *"Protein contributes to the maintenance of normal bones."*
  Use whichever fits the surface, and more than one where it reads naturally ("protein
  contributes to the maintenance of muscle mass and the maintenance of normal bones").
  Where context needs the fuller form, append: "as part of a varied and balanced diet
  and a healthy lifestyle."
  **Verbatim means verbatim**: the register says "a growth in muscle mass", not "the
  growth of muscle mass" or "muscle growth". Paraphrasing an authorised claim is itself
  a breach, so copy the wording rather than retyping it from memory. Never write "builds
  muscle", "prevents muscle loss", "helps you lose weight", or any medical benefit. See §12.
- **Numbers**: grams as figures with no space ("6g", "75g", "10.4g"). Money always in
  pence integers via `lib/pricing.ts`, rendered with `formatPence`/`formatMoney`; never
  type "£30" into copy (one legacy exception lives in `site-faqs.ts`, see §11.3).
- **The 10 vs 10.4 rule**: marketing prose and interactive toys round to **10g** per
  heaped tablespoon ("one spoonful, ten grams"); declaration-adjacent surfaces quote
  **10.4g** exactly (nutrition accordion, "The protein numbers" FAQ, review gram
  maths via `PROTEIN_GRAMS_PER_TBSP`). The bowl equation is 6g dal + 10g Heldi = 16g.
- **Vocabulary, always**: stir, spoon, spoonful, heaped tablespoon, pouch, pot, bowl,
  the table, disappear into, vanish clean, desi, home-cooked, dal, sabzi, raita, dahi,
  kadhi, chaat, nani, mama, aunties and uncles, Heldier.
- **Vocabulary, never**: scoop, shake (as the verb for using Heldi), shaker (except
  when mocking it), blender, gym, gains, macros, superfood, clean eating, guilt-free,
  "healthy alternative" framing that implies the family's food was not good enough.
- **Emoji policy**: none, with one grandfathered exception: the trusting smiley in the
  gifting copy ("We trust you :)"). Do not add emoji anywhere else on the site.
- **Questions as headings**: educational H2s are phrased as real search questions
  ("Is dal a complete protein?", "How much protein is in dal, really?"). This is
  deliberate AI/SEO surface area; keep it.

## §6 The humour playbook

Rules first: **one easter egg per surface, allusion not quotation.** The joke must
still read as plain English to someone who misses the reference. Humour is banned in
nutrition tables, medical answers, allergen and statutory text, and legal pages.
Never joke about a protected characteristic, a health condition, or someone's body.

The six named patterns, with canon examples:

1. **Pop-culture allusion, bent to food.** Desi or British reference reshaped around
   dal, never quoted straight.
   - "They shake, we stir." (Bond)
   - "Bade bade bowls mein, chhoti chhoti proteins." (DDLJ, truth page)
   - "Bends into the dal like Beckham." (stir gallery)
2. **Family-authority comedy.** The real power structure of a desi household is the
   joke; the brand is slightly scared of aunties and that is correct.
   - "We can't charge aunties and uncles full price. We'd never hear the end of it."
   - "We're not brave enough to ask the aunty WhatsApp group."
   - Discount codes ACHABETA ("acha beta", good kid), RISHTA (buying for uncle
     and aunty), and SHABASH ("well done"), confirmed on copy as "Copied. Good
     beta." / "Copied. Rishta sorted." / "Copied. Shabash."
3. **Deadpan understatement.** The product works so well nothing happens.
   - "The dal did not even notice."
   - "Papa had seconds and still has no idea."
   - "Not one comment at the table." (the highest praise a desi cook can get)
4. **The mock-memorial.** Small tragedy, great dignity.
   - "One pot of kadhi gave its life for this. We remember it fondly."
   - "Some of them we would rather forget." (the kitchen trials)
5. **Small-brand honesty.** The operation's size is charming, not apologised for.
   - "Email info@heldi.co.uk and the founder answers. It really is that small an
     operation right now, which is also why replies come with opinions about dal."
   - "We can't check... We trust you :)"
   - "Sent by us, packed with care."
6. **The shaker as pantomime villain.** Punch at the category, never at people who
   use it ("You can, if you like them. Most of our parents don't.").
   - "That shaker. You know the smell."
   - "Fake vanilla until your next chai." / "Birthday Cake Blast™"
   - "Who it feeds: whoever owns the shaker."

## §7 Copy component patterns

- **Section skeleton**: EYEBROW (uppercase, letter-spaced, terracotta or gold) →
  display H2 (often a question or a two-beat declarative) → one short lede →
  interactive or card content → optional pill-link "Read the full X →".
- **Eyebrow canon**: THE HONEST TRUTH, HOW IT WORKS, THE POUCH, WITH EVERY ORDER,
  CLOSE THE GAP, THE GOLD STANDARD, IN THE FAMILY?, LAUNCH PRICES. Keep them short,
  concrete, slightly dramatic.
- **`<CopyHighlight>`** (`components/copy-highlight.tsx`) is the only inline emphasis:
  it renders `strong.copy-emphasis`, weight 600, colour ink on light sections and gold
  on ink sections. Use it for the one phrase per paragraph that carries the point.
  Do not use italics for emphasis (italics mean pronunciation line, captions,
  founder quote, story notes).
- **CTA canon**: primary "Join waitlist" (waitlist mode) or "Shop now" (live), decided
  by `COMMERCE_MODE`, never hard-coded per surface; secondary "How it works" (outline);
  closing "Be first to stir it in." with "One email the day we launch, with 20% off
  your first order inside."; waitlist success: "You're on the list, 20% off saved for
  launch day. Tell your mum we said hi." The 20% is the waitlist launch offer
  (`WAITLIST_OFFER`, §11.3); every surface interpolates the percent, never a hard-coded
  number or the code string.
- **Pill-links** end with a spaced arrow: "Read the full truth →".
- **FAQ style**: question = what a person actually types; answer = 2 to 5 sentences,
  direct first sentence, no marketing pivot until the facts are done, optional
  `more` link. Medical-adjacent answers always hand off to a GP/dietitian and never
  diagnose ("They know your situation; we do not.").
- **Metadata**: page titles follow "Page name · Heldi" (home: "Heldi, desi protein for
  Indian food"). Descriptions are written in voice, not keyword salads.
- **Alt text** describes dish + Heldi context ("Dal tadka with Heldi being stirred
  in"), never "food photo". Decorative elephants get empty alt.

## §8 Visual identity

### 8.1 Palette (CSS custom properties in `app/globals.css`)

| Token | Hex | Use |
|---|---|---|
| `--gold` (marigold) | `#eda31d` | Hero and gold sections, brand chip, accents on ink |
| `--ink` | `#011246` | Text, dark sections, every border and hard shadow, wordmark |
| `--cream` | `#f8f0de` | Light sections, card backgrounds |
| `--terracotta` | `#a8432b` | Eyebrows, stats, active accents, hover states |
| `--brown` | `#4a4238` | Body copy on cream/gold |
| `--muted` | `#8a8378` | Footer secondary, story notes |
| `--dark-muted` | `#b5ad9f` | Body copy on ink sections |
| warm dark | `#2c2418` | Hero sublines on marigold |
| white | `#ffffff` | Nav card, sticker cards, pills |

Jar lids (imagery only): gold gradient `#f6d47c → #c98f1b`, silver `#f4f4f4 → #9aa0a6`.
**Never `#000`**: anything black in an asset gets recoloured to ink (`--ink`); keep
marigold, cream, metallics and white unchanged (pipeline: `public/images/variants/ink-blue/`).

### 8.2 Type

- **Rozha One, weight 400 only** (`--font-display`, next/font in `app/layout.tsx`):
  h1/h2, menu card titles, stat numerals, gram pills, FAQ +/– glyphs, the gifting code
  chip. It is the Indian-inflected editorial serif that makes numbers feel like menus.
- **Gelasio 400/500/600 + italic** (`--font-body`, fallback Georgia): everything else,
  including nav, buttons and UI. Italic is reserved for the pronunciation line,
  captions, the founder quote, story notes and the hero subline.
- **No sans-serif anywhere**, site or marketing assets.
- Scale: H2 `clamp(2rem, 4.5vw, 3rem)` at line-height 1.1; body 1rem to 1.125rem at
  1.55 to 1.65; eyebrow 0.875rem, weight 600, `letter-spacing: 0.22em`; ticker
  0.875rem at `0.24em`.

### 8.3 Section rhythm

Sections alternate cream / ink / gold down every page (`.section--cream/--ink/--gold`),
separated where colours meet by `.section--bordered` (3px ink top border) or the
signature **double rule** (7px tall, `border-block: 3px solid var(--ink)`). Section
padding `clamp(3.5rem, 8vw, 6rem)` vertical. Content max-width 1152px (FAQ 860px,
story prose 640px). The first section under the floating nav carries `data-nav-hero`
for clearance (`--nav-clearance: 4.75rem`).

Every section is designed twice: mobile (≤899px) and wide (≥900px) are separate,
deliberate layouts sharing one DOM, sized fluidly with `clamp()` between them. The
full responsive contract, including the snap-rail recipe and the short-viewport
rules, is PLAYBOOK.md §1; treat it as part of this section.

### 8.4 Shape language (the "bubbles")

The signature is **hard offset shadows, never blur**, on ink-bordered rounded cards.

| Component | Recipe |
|---|---|
| Sticker card (default) | `border: 3px solid ink; border-radius: 18px; background: cream; box-shadow: 6px 6px 0 ink` |
| Hero showcase / product card | white bg, radius 20px, `8px 8px 0 ink` |
| Menu card, cream scheme | cream bg, 3px ink border, 18px, **gold shadow** `6px 6px 0 rgb(237 163 29 / 90%)` |
| Menu card, marigold scheme | gold bg, **cream shadow** `6px 6px 0 rgb(248 240 222 / 85%)` |
| Pills/badges | `border-radius: 999px`, 2px ink border, white bg, optional `4px 4px 0 ink`; active state fills ink with cream/gold text |
| Attribute pill (hero/PDP) | lighter: `1.5px solid rgb(ink / 32%)`, no shadow, icon + label |
| Pill-link | white, 2px ink, 999px, `3px 3px 0 ink`, hover lifts `-2px` and fills gold; dark variant gold-on-ink |
| Truth chip (tap toys) | cream, 2px ink, 999px, `3px 3px 0 ink`; active = ink bg, gold text |
| Amino coin | 54px circle, 3px ink border, white; "gold" state = ink bg, gold text, scale 1.06 |
| Option card (PDP radios) | white, 2px ink, 16px radius; selected = gold bg + `4px 4px 0 ink` |
| Gifting code chip | tear-off ticket: 2px ink border but **left border 3px dotted**, radius `4px 16px 16px 4px`, gold bg, Rozha One, letter-spaced |
| Story menu card | white, 3px ink, 20px, `8px 8px 0 ink`, **2px dashed ink/30% separators**, dotted leader lines, gold "gap" band with `4px 4px 0 ink` |
| Dashed frame (jar card) | `2px dashed var(--gold)`, 24px radius, playful |
| Floating nav | white card, radius 12px, `5px 5px 0 ink`, gold brand chip (8px radius) with mirrored elephants flanking the wordmark |
| Nutrition/legal tables | plain rules, no shadows: compliance surfaces stay sober |

Leader dots (`···`) connect dish names to gram counts on every menu-style card; gram
values sit in Rozha One pills that fill gold (cream card) or ink (marigold card) when
the dish is Heldi-boosted.

### 8.5 Buttons

| Variant | Rest | Hover |
|---|---|---|
| `.button` (solid) | ink bg, gold text, weight 600 | terracotta bg, cream text, lift `-2px` |
| `.button--pill` | radius 999px, `0.75rem 1.625rem` | same |
| `.button--square` | radius 8px | same |
| `.button--outline` | transparent, 2px ink border, ink text | ink fill, gold text |
| `.button--ghost` | underlined text (2px, offset 0.2em) | terracotta |

Focus is `outline: 3px solid #fff; outline-offset: 3px` (terracotta on inputs and
option cards). Keep it: gold/ink sections need the white ring.

### 8.6 Motion

- Easing house style: `cubic-bezier(0.23, 1, 0.32, 1)` (and the .22/.36 sibling),
  340 to 640ms, always translate + fade, no bounces.
- Canon effects: ticker marquee 30s linear infinite; dissolve-in text (opacity + blur +
  translateY, evokes powder in liquid, 55ms per letter stagger); hero elephant run
  (chroma-keyed video curtain, ~3s, replayable via the "Press to call the elephants"
  button); spoonful burst + gram pop in the stir gallery; hover lift `-2px` on
  buttons/pills.
- **Every animation must respect `prefers-reduced-motion`** (the codebase already
  pauses videos, skips the curtain, and disables smooth scroll; match that bar).

### 8.7 The elephant and wordmark

- Decorated Indian elephant line illustration, always ink (`#011246`), always
  ornamental: flanking the hero, bracketing the final CTA, mirrored pair in the nav
  chip. No faces, no speech, no mascot behaviour. One motif, reused.
- HELDI wordmark is a supplied PNG (Rozha One derived, slight forward lean); never
  redraw it. On ink it goes gold via the `.heldi-logo--on-dark` filter.
- Images are served from `/images/variants/ink-blue/` with a `?v=` cache-busting
  version (`IMAGE_VERSION` constants); bump the version when regenerating an asset
  in place.

### 8.8 Photography and illustration

Do: real UK desi home kitchens, shared meals, hands serving, warm colour grade toward
marigold/cream, natural or warm tungsten light, recognisable dishes (dal, kadhi,
raita, chaat). Don't: shaker bottles, gym settings, scoops on grey seamless, cold
blue grading, "exotic India" stock tropes. Illustration (always ink line art) covers
elephants, icons and infographics; photography covers food, pouch and family. Current
product shots are AI-generated placeholders to be replaced with real photography
(tracked in NEXT_STEPS.md).

## §9 Page map and content architecture

| Route | Job | Registered in |
|---|---|---|
| `/` | Convert: hero reveal, pouch stats, stir gallery, how-it-works, gifting, truth teaser, menus, audience, vs-shaker, reviews, founder band, FAQ teaser, jar, waitlist CTA | `components/heldi-homepage.tsx` |
| `/truth` | Educate + rank for protein questions (interactive myth-busting) | `components/truth-page.tsx` |
| `/our-story` | Founder trust: nani, kitchen trials, taste panel, what's next | `app/our-story/page.tsx` |
| `/inside-the-pouch` | Provenance: suppliers, batch report, made in England | `app/inside-the-pouch/page.tsx` |
| `/heldi-living` | Blog: honest-truth educational pieces + recipes | `content/heldi-living/posts.json` + HTML files |
| `/faq` | Everything, grouped; FAQPage schema | `components/site-faqs.ts` |
| `/shop` | PDP: buy box, tiers, nutrition modal, accordions, reviews, gifting | `components/shop/*` |
| `/legal/*` | Statutory pages | `docs/legal/*.md` via `lib/legal.ts` |

Plumbing worth knowing:

- **FAQs live in three files**: `home-faqs.ts`, `truth-faqs.ts`, and `site-faqs.ts`,
  where the /faq page **imports shared questions by exact question string** via
  `pick()`. Renaming a question in home/truth files without updating `site-faqs.ts`
  **throws at build time**. Question text is a key; treat it like one.
- **JSON-LD**: Organization + FAQPage on `/`, FAQPage on `/faq`, Product on `/shop`
  (AggregateOffer only in live mode). New FAQ content should flow into these
  automatically because the schemas map over the same data files; keep it that way.
- Nav links are duplicated four times (desktop + mobile, in both
  `heldi-homepage.tsx` and `subpage-nav.tsx`); `app/sitemap.ts` lists routes again.
- The waitlist form stores nothing yet (top item in NEXT_STEPS.md).

## §10 Single sources of truth

Change these files, and only these files, for their facts:

| Fact | Source of truth | Notes |
|---|---|---|
| All prices, RRP vs launch, tier names/contents | `lib/pricing.ts` | Integer pence. Strikethrough RRP becomes the real price after launch. Mirror changes in Shopify admin once connected |
| Shipping thresholds and rates | `SHIPPING` in `lib/pricing.ts` | £40 free threshold, £3.55 Tracked 48, sample letter absorbed |
| Gifting discount + codes | `GIFTING` in `lib/pricing.ts` | ACHABETA / RISHTA / SHABASH, 10%, single+double tiers only |
| Servings per pouch / sample | `SERVINGS_PER_POUCH`, `SERVINGS_PER_SAMPLE` in `lib/commerce/catalog.ts` | 25 and 3; feeds every per-meal price |
| Formulation, nutrition table, amino profile | `components/shop/nutrition-data.ts` | `FORMULA`: whey isolate 94.15%, sunflower lecithin 4%, cumin 1.25%, sea salt 0.6%. Protein 10.4g per 12g serving |
| Precise protein per tbsp for maths | `PROTEIN_GRAMS_PER_TBSP` in `lib/reviews.ts` (10.4) | Keep in sync with nutrition-data |
| Marketing grams per spoon (10) | `grams={10}` prop in `app/page.tsx` → homepage, stir gallery, menus | The rounded figure, see §5 |
| Product name and SKUs | `lib/commerce/catalog.ts` | "Khana" is a placeholder name (NEXT_STEPS.md) |
| Canonical URL | `lib/site.ts` | https://heldi.co.uk |
| FAQ copy | the three FAQ files (§9) | |
| Blog posts | `content/heldi-living/` | Written to the heldi-blog-writer skill's rules |
| Reviews | `lib/reviews.ts` | ALL placeholder. Legally cannot ship as-is (DMCC Act 2024 bans fake reviews); swap for real submissions before launch |

## §11 Change-impact map: "if you change X, update Y"

The point of this section: most product facts are **repeated in prose** across many
surfaces. A model that edits the source-of-truth file and stops has done a third of
the job. Grep before you declare victory.

### 11.1 Formulation / spices change

The July 2026 reformulation (7-ingredient spiced blend → 4-ingredient cumin blend)
left stale copy behind; do not repeat that. Touch list:

1. `components/shop/nutrition-data.ts`: FORMULA, all NUTRITION_ROWS, AMINO_ROWS.
2. `app/inside-the-pouch/page.tsx`: hero ingredient list, percentages in prose, the
   supplier sections, metadata description, batch report if supplier changes.
3. `components/site-faqs.ts`: "What are the ingredients?", "Where do the ingredients
   come from?", "Is whey protein ultra-processed?" answers.
4. `components/comparison-section.tsx`: the "Flavours" and "On the label" rows.
5. `components/heldi-homepage.tsx`: truth-teaser ingredient line ("90% whey protein
   isolate. The rest, spices you already know.") and the "Will my food taste
   different?" FAQ in `home-faqs.ts` ("The spices are designed to disappear").
6. Blog posts under `content/heldi-living/` that name spices, and `posts.json`.
7. Pack-facing docs: `fable/back-prompt-master.md`, `fable/compliance-requirements.md`.
8. Allergen line stays "Contains: Milk." unless the new formula adds an allergen, in
   which case every disclaimer block changes too (grep "Contains milk").
9. Grep terms: `cumin`, `turmeric`, `garam`, `coriander`, `Kashmiri`, `spices`,
   `94`, `four ingredients`, `Four ingredients`.

### 11.2 Protein-per-serving change (currently 10.4g, marketed as 10g)

1. `nutrition-data.ts` (declaration) and `lib/reviews.ts` `PROTEIN_GRAMS_PER_TBSP`.
2. The rounded marketing figure: `grams={10}` in `app/page.tsx`, the homepage bowl
   equation (6 + 10 = 16 in `PouchEquation`, including its aria-label), menu gallery
   totals (`heldiTotal = heldiTbsp × 10` hand-written per menu in `menu-gallery.tsx`),
   stir gallery `boostGrams`, and the mobile hero facts line in
   `components/heldi-homepage.tsx` ("10g of protein in every spoonful").
3. Prose repetitions: `product-accordions.tsx` ("10.4g" and "16g in the same bowl"),
   `site-faqs.ts` ("How much protein does one spoonful add?", GLP-1 answers "past
   13g", "How do I add more protein…" "10.4g"), `truth-faqs.ts`, `truth-page.tsx`
   FIXES ("+ 2 tbsp Heldi 20g") and the non-veg paragraph ("an extra 10g"),
   `our-story/page.tsx` ("one spoonful, ten grams" and the menu card gap maths),
   `inside-the-pouch/page.tsx` closing ("ten grams of protein a spoonful").
4. Blog posts repeating the 16g bowl maths (`grep -rl "16g" content/`).
5. Grep terms: `10.4`, `10g`, `ten grams`, `16g`, `13g`, `20g` (near "tbsp").

### 11.3 Price / tier / discount change

1. `lib/pricing.ts` only, then mirror in Shopify admin (NEXT_STEPS.md §1).
2. Known hard-coded exception to keep in sync: the delivery FAQ answer in
   `site-faqs.ts` says "over £40 ship free… £3.55", and `docs/legal/shipping-policy.md`
   repeats the rates. Update both or rewrite them to render from `SHIPPING`.
   (Both are live-mode surfaces: the FAQ question and the shipping-policy page
   are hidden while `COMMERCE_MODE` is `waitlist`, see §11.5.)
3. Tier names ("One pouch", "The pair", "The full table") flow from pricing.ts, but
   prose references exist in gifting copy ("single pouches and 2-packs") and
   NEXT_STEPS.md.
4. If the gifting rules change, update `gifting-band.tsx`, `gifting-popup.tsx`,
   the cart checkbox label in `cart-drawer.tsx`, and the ticker line
   "AUNTIES & UNCLES PAY LESS".
5. Free gift items (the table jar and masala dabba) are real £0.00 Shopify
   products the cart adds automatically. Their worth (`EXTRA_VALUE_PENCE`) and
   per-order caps (`GIFT_CAPS`, currently 2 jars + 1 dabba) live in
   `lib/pricing.ts`; the Shopify compare-at prices on `HELDI-JAR` / `HELDI-DABBA`
   mirror the worth, and the pick-pack sheet repeats the caps. Change all three
   together. Grep terms: `jar`, `dabba`, `GIFT_CAPS`, `EXTRA_VALUE_PENCE`.
   A tier is only pouches/RRP/launch price — it carries **no** jars/dabbas field;
   gift counts always come from `giftCountsForPouches`, so the full table ships
   2 jars, not 3. Don't reintroduce per-tier gift fields (they drift).
6. Waitlist launch offer (`WAITLIST_OFFER` in `lib/pricing.ts`: 20% off, code
   `PEHLEAAP`, all pouch tiers, never the Sample, one per order, one use per
   customer, 14-day window). If it changes, the surfaces are: the mock
   eligibility helper (`waitlistEligiblePenceForLines` in `catalog.ts`) and its
   use in `mock-provider.ts`; the waitlist-mode copy that shows the **percentage**
   (ticker `TICKER_COPY_WAITLIST`, hero `.hero-incentive`, final-CTA `<p>` and
   waitlist success in the shared form, popup lede, `buy-box.tsx` waitlist
   shipping note, the launch FAQ in `site-faqs.ts`); the Klaviyo welcome template
   (`VnY8iQ`) and the launch email; and the real Shopify code created at launch.
   The **code string** lives only in `WAITLIST_OFFER`, the launch email and
   Shopify — never on the site. Grep terms: `WAITLIST_OFFER`, `PEHLEAAP`, `% off`.

### 11.4 Product name change ("Khana" is a placeholder)

`lib/commerce/catalog.ts` (title, handle, SKUs, GIDs, image alts and filenames),
`app/shop/page.tsx` metadata, `buy-box.tsx` H1, our-story "What's next" section
("Khana is on the table. Chai is on the stove."), blog posts and `posts.json`,
`cart-drawer`/`cart-context` identifier names (cosmetic), Shopify product. Grep
`Khana|khana`.

### 11.5 Launch date / launch state

- Date lives in the waitlist ticker string in `heldi-homepage.tsx` ("LAUNCHING
  AUTUMN 2026") and in `fable/brand-voice.md`. The ticker is one string per mode:
  `TICKER_COPY_WAITLIST` carries the date and no price lines, `TICKER_COPY_LIVE`
  carries "LAUNCH PRICES ON NOW" / "AUNTIES & UNCLES PAY LESS" and drops the date.
- Waitlist → live is **not** a copy edit: flip `NEXT_PUBLIC_COMMERCE_MODE`. Every CTA,
  the floating mobile CTA, the final-CTA section, PDP button and cart already switch
  on `mode`; never hand-edit a CTA to force it.
- Waitlist mode shows **no prices (£) and no discount code strings anywhere**;
  everything returns on the flip to live. The one deliberate exception is the
  waitlist launch offer, advertised as a **percentage only** ("20% off your first
  order") to give joining a reason — never a £ price, never the `PEHLEAAP` string.
  It rides the ticker, the join forms/popup, the PDP waitlist shipping note and
  the launch FAQ (all §11.3 item 6). Gated on the mode: PDP prices, the launch-price
  block and the shipping note (`buy-box.tsx`), the accordion shipping rates
  (`product-accordions.tsx`), the gifting band/popup/codes, the "How much is
  delivery?" FAQ and the shipping-policy `more` link (`site-faqs.ts`, which also
  swaps the waitlist-only launch question), the shipping-policy page + footer
  link + sitemap entry (`lib/legal.ts`, `subpage-nav.tsx`), the ticker price
  lines, and the /shop AggregateOffer schema. Never hand-delete a price to hide
  it; gate it on `mode` so live restores it. The consultant preview (`/preview`,
  unlocked with `PREVIEW_PASSWORD`) can flip a single browser into selling mode and
  reveal all of these before launch; that is intentional and affects no one else.
- After the launch period ends: set each tier's `launchPence` equal to `rrpPence` in
  pricing.ts (kills the strikethroughs everywhere at once), retire "LAUNCH PRICES ON
  NOW" from `TICKER_COPY_LIVE` and the "Launch prices. Not forever prices." line in
  `buy-box.tsx`.

### 11.6 Other cross-cutting facts

- **Contact email** (info@heldi.co.uk): footer (`subpage-nav.tsx`), FAQ page lede,
  several `site-faqs.ts` answers, all `docs/legal/*`.
- **Company address**: `FooterLegal` and the legal docs.
- **Servings per pouch (25)**: single constant, but "25 meals" phrasing appears via
  the constant only; keep it that way.
- **Health claim wording**: appears verbatim in at least 8 files; if regulation ever
  changes it, `grep -rl "contributes to the maintenance"`.
- **Nav changes**: four link lists (§9) + `app/sitemap.ts`.
- **FAQ question renames**: update `site-faqs.ts` `pick()` calls or the build throws.
- **Regenerated images**: bump the `?v=` versions (`IMAGE_VERSION` in
  `heldi-homepage.tsx` and `subpage-nav.tsx`; per-URL `?v=` in `catalog.ts`).
- **Social share cards**: every route has an `opengraph-image.tsx` rendered from
  `components/og/card.tsx` (fonts and art in `assets/`). Colour-token changes must
  be mirrored there (satori cannot read CSS variables), and new routes get a card
  (PLAYBOOK.md R2). Blog cards pull title/tags from `posts.json` automatically.

### 11.7 Analytics event names and checkout stitching

The PostHog dashboard and the Shopify checkout stitching depend on exact event
names, prop names, and cart-attribute keys in code. Renaming or moving any of
them requires the touch list in PLAYBOOK.md §7 (the analytics rules), and a
matching edit to the saved insights in PostHog. There is no build error when
this breaks; the dashboard just goes quiet.

## §12 Compliance guardrails (UK food supplement)

- Only the three authorised protein claims (§5). No disease prevention, no weight-loss
  promises, no "boosts immunity", no medical advice. FAQ answers about medical
  situations always defer to GP / dietitian / midwife.
- Allergen statement: **Contains milk (whey).** Keep it in the PDP description, the
  ingredients FAQ, the nutrition accordion and the FAQ-page disclaimer block.
- The supplement disclaimer block (do not exceed the recommended daily intake; not a
  substitute for a varied and balanced diet; keep out of reach of children) must stay
  reachable from every commercial surface; today it renders on /faq and the truth
  page sources note, with statutory text specified in `fable/compliance-requirements.md`
  (figures there are stale, wording pattern still applies).
- Nutrition figures come from the supplier analysis in `nutrition-data.ts`; never
  round or "tidy" them in the table itself.
- Reviews: everything in `lib/reviews.ts` is placeholder and must be replaced with
  real, verifiable submissions before launch (CMA / DMCC Act 2024). Do not seed fake
  reviews into any new surface, including screenshots for ads.
- "98% lactose-free", "no added sugar", "gluten free", "vegetarian", "all natural"
  are the approved badge claims; do not invent new badges without substantiation.
  Substantiation: Arla Ultrawhey COA lactose ~2.2 to 2.4% (batch FF25466001
  2.28%); finished pouch slightly lower after blend. Per ~12g spoon ~0.3g
  lactose, well below traditional whey concentrate.
- Do not imply Heldi replaces meals or that anyone *needs* a supplement; the honest
  framing is closing a gap in an otherwise good diet.

## §13 Known drift to fix (as of July 2026)

Live inconsistencies a copy pass should resolve:

1. `comparison-section.tsx` "Flavours" row still says "Cumin, turmeric, garam masala";
   the current formula contains cumin only. Stale from the old blend.
2. Homepage truth teaser says "90% whey protein isolate. The rest, spices you already
   know." The pouch is 94.15% isolate (the *isolate* is ~90% protein: two different
   numbers conflated), and "spices" overstates cumin + salt.
3. `fable/compliance-requirements.md` carries the old 7-ingredient list and 9.9g
   figures; `fable/brand-voice.md` says the Khana/Chai/Dahi line is retired while the
   live site names Khana and teases Chai, and its "10g per bowl (placeholder)" is now
   a confirmed 10.4g. Update or clearly deprecate both files.
4. `home-faqs.ts` "The spices are designed to disappear" reads oddly against a
   one-spice formula; soften to "the blend".

## §14 Pre-flight checklist for any copy or design change

1. Voice: does the surface know whether it is Voice A or B (§4)? No mixing.
2. Grep your diff for `—` and `&mdash;`; restructure any sentence that wanted one.
3. Maximum one easter egg on the surface, allusion not quotation (§6).
4. Numbers: 10g in prose, 10.4g in declarations; money from `pricing.ts` helpers.
5. Health language: one of the three authorised claims verbatim, or nothing (§5, §12).
6. Colours from the tokens, borders in ink, shadows hard-offset with zero blur; no
   `#000`, no sans-serif, no soft Material shadows (§8).
7. New animation honours `prefers-reduced-motion`.
8. Ran the §11 impact map for any fact you touched, including `content/heldi-living/`
   and `docs/legal/`.
9. FAQ edits: `site-faqs.ts` `pick()` still resolves (build proves it).
10. British English throughout; alt text describes the dish, not "image of food".
11. Any new or regenerated asset meets the §15 budgets (format, dimensions, weight)
    and got its `?v=` bump.
12. New files live where §16 says they live; nothing under app/components/lib imports
    from a gitignored workspace directory.
13. `npm run brand-lint` exits clean (warnings reviewed, errors fixed).
14. Layout or component changes verified at both widths, 375 and 1280 minimum
    (1600 and a short 1280×700 window for above-the-fold work): no sideways page
    scroll, tap targets at least 36px, deliberate mobile structure (PLAYBOOK.md §1).

## §15 Assets and performance rules

State of play after the July 2026 optimisation pass: tracked `public/` is ~6MB
(was ~90MB). The intro film is 1.0MB (3s, 1280×720, no audio); product, blog and
variant photos are WebP; `/shop` thumbnails go through `next/image` with accurate
`sizes`; and the dormant "video" hero film plus its poster live behind the
gitignore, so they never deploy. Replaced PNG masters were moved to the gitignored
`public/images/originals/pre-webp/`; pre-compress video masters sit in
`hero-video/archive-pre-compress/` and `stir-gallery-video/archive-pre-compress/`.
First-load transfer measured 17 July 2026 on a production build: `/` ~1.4MB (1.0MB
of that is the intro film), `/shop` ~0.4MB. Galleries stay disciplined (videos
mount on demand with `preload="none"` and posters). Run `npm run brand-lint` for
the live list of over-budget assets.

### 15.1 Budgets (ceilings for anything new or regenerated)

- Photo or illustration source in `public/images`: **≤ 400KB**, and no more than 2×
  its largest rendered CSS size. WebP for photos; PNG only where crisp alpha line
  art genuinely beats WebP alpha (rare; test first).
- Video: **≤ 1MB per second actually played, ≤ 8MB per file**, resolution no more
  than 2× the largest rendered size, no audio stream on muted/autoplay files.
- First-load transfer targets: `/` ≤ 4MB, `/shop` ≤ 3MB (both currently fail; see
  15.2/15.3 for the fixes).
- Fonts: the two families, latin subsets, via next/font only. Adding a weight means
  justifying it here first.

### 15.2 Image rules

- **Always `next/image` with an accurate `sizes` attribute.** Raw `<img>` bypasses
  the optimizer and ships the full source file. The July 2026 pass converted the
  last violations (buy-box thumbnails, option cards, includes rows, cart
  included-items list); a fixed-size icon without `sizes` is just as bad, because
  2x-DPR phones then pull transforms at twice the `width` prop (the nav elephants
  shipped ~2000px wide for a 32px slot until they got `sizes="32px"`).
- Product and lifestyle PNGs convert to WebP around q80 (`cwebp -q 80 in.png -o
  out.webp`, or sharp from `node_modules`); expect roughly 2.4MB → 150KB at
  1200×1200. Done July 2026 for the shop shots, blog heroes and ink-blue variants;
  alpha line art (elephant, wordmark) used near-lossless WebP, which beat PNG by
  ~20x. Any new photo asset starts life as WebP.
- `public/images/hero-video-poster.png` (5.7MB, 2688×1520) is gitignored with its
  film and must become a JPEG/WebP at ≤ 300KB if the video hero layout ever ships.
- Keep source PSD/PNG masters out of `public/` (that is what the gitignored
  `public/images/originals/` and the workspace dirs are for); everything in `public/`
  deploys to the CDN.
- After regenerating any image in place, bump its `?v=` (see §11.6) or it will be
  served stale by the image cache.
- `next.config.ts` uses default formats (WebP) with `minimumCacheTTL` at 31 days;
  the `?v=` discipline is what makes the long TTL safe. Enabling AVIF
  (`images.formats = ["image/avif", "image/webp"]`) is an optional further ~20%
  saving at the cost of slower first-hit transforms; decide once real traffic exists.

### 15.3 Video rules

- Default posture: **mount on demand, `preload="none"`, always a `poster`**, pause
  or skip under `prefers-reduced-motion`. The stir gallery (single reused element,
  mounted only while animating) and the review gallery are the reference
  implementations. Never mount five `<video preload="auto">` in a list.
- The **hero curtain** (`elephant-run-gold.mp4`) is the one sanctioned eager video
  and must earn it. Since July 2026 it is 1.0MB: 3s, 1280×720, H.264 CRF 26,
  `+faststart`, audio stripped. Any regenerated version must match that shape
  (target ≤ 2MB):
  `ffmpeg -i in.mp4 -t 3 -vf scale=1280:-2 -an -c:v libx264 -crf 26 -preset slow -movflags +faststart out.mp4`
- `heldi-hero-v3.mp4` (29.5MB) and its poster belong to the dormant `heroLayout="video"`
  variant and sit behind the experimental-renders gitignore block with v4. If that
  layout ever ships, compress both to budget first.
- Stir-gallery clips are 720×720 (re-encoded July 2026, 0.35 to 0.6MB each) for a
  ~380px circle. Any new clip gets the same treatment before landing in `public/`.
- Poster frames: `ffmpeg -i clip.mp4 -frames:v 1 -q:v 3 poster.jpg` then compress.

### 15.4 Loading discipline

- `priority` only on true LCP candidates (hero pouch shot, nav wordmark). Everything
  below the fold stays lazy (the `next/image` default). Two `priority` elephants in
  the nav is already the ceiling.
- The site ships almost no client JS beyond React/Next and zero third-party scripts.
  Keep it that way: no carousel/animation/analytics library may land without a
  measured case. Analytics, when it comes, is the cookieless kind (NEXT_STEPS §4)
  loaded `afterInteractive` at most.
- `marked` renders legal markdown server-side; that is the pattern for any future
  markdown surface (never ship a markdown parser to the client).
- Interactive flourishes (ticker, dissolve, curtain, stir bursts) are CSS/canvas on
  demand; every new one needs the `prefers-reduced-motion` fallback (§8.6) and no
  new dependency.

## §16 Repo map and file placement

The working tree is deliberately two-layered: a small tracked app plus large
**gitignored production workspaces** that never ship. `git ls-files` weighs ~92MB
(nearly all `public/`); the workspaces add ~600MB locally.

| Path | Tracked | What it is, and the rule |
|---|---|---|
| `app/` | yes | Routes, metadata, JSON-LD. Page shells only; big copy blocks live in components or data files |
| `components/` | yes | UI + the copy data files (`*-faqs.ts`, galleries). New component copy goes next to its component |
| `lib/` | yes | Pure logic and data: pricing, catalog, commerce providers, reviews, analytics. No JSX |
| `content/heldi-living/` | yes | Blog: one HTML body per post + `posts.json` index (slug, title, description, date). New post = both |
| `docs/legal/` | yes | Legal markdown sources, rendered at `/legal/*` via `lib/legal.ts` |
| `docs/brand/` | yes | `specimen.html`, the visual brand board (opens standalone; links the real `app/globals.css`) |
| `scripts/` | partly | `brand-lint.sh` is tracked; the screenshot capture tool is gitignored |
| `.claude/skills/` | yes | Project skills (`add-section`, `new-post`): plain-markdown task recipes usable by any agent |
| `AGENTS.md` + `.cursor/rules/` | yes | Cross-tool mirrors of CLAUDE.md and the skills for Cursor/Codex/etc.; update together with CLAUDE.md |
| `public/` | yes | Ships wholesale to the CDN. Only referenced, budget-compliant assets (§15). `llms.txt` lives here for AI crawlers |
| `public/images/variants/ink-blue/` | yes | The **live** recoloured brand assets (`imageSrc()` helpers point here); root-level copies of the same images are gitignored leftovers |
| `fable/` | no | Design/brand docs for the generation pipeline. Partially stale (§13); superseded by this file |
| `fable_copy/`, `fableplan/` | no | Copywriting drafts and one-off plans. Archives |
| `hero-video/`, `stir-gallery-video/` | no | Video generation workspaces (plans, keyframes, renders). Final cuts get copied into `public/videos/` |
| `design_handoff_*/` | no | Point-in-time design handoff bundles |
| `public/images/originals/` | no | Uncompressed asset masters kept out of the deploy |
| `assets/` | yes | Build-time inputs that never ship raw: og-card fonts (TTF) and scaled art read by `components/og/card.tsx` |

Placement rules:

1. **Never import from a gitignored directory** in `app/`, `components/` or `lib/`;
   Vercel builds from git and the import will fail there.
2. New route: `app/<route>/page.tsx` with metadata + canonical, then §11.6 (nav is
   duplicated four times, sitemap is manual).
3. New asset: compress to §15 budget first, then place under
   `public/images/<surface>/` (or `public/videos/<surface>/`); recolour pipeline
   output goes to `public/images/variants/ink-blue/`.
4. Generation experiments, alternate renders, source masters: workspace dirs, never
   `public/`. If an experiment graduates, copy the final file in and reference it.
5. One-off scripts go in `scripts/` and get tracked only if they enforce or verify
   something ongoing (like brand-lint); pipeline tooling stays ignored.
6. New standing docs (like this one) live at the root or `docs/`, in markdown, and
   get a pointer from CLAUDE.md if models must load them.
