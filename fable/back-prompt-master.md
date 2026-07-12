# Back-of-pouch prompt master — Heldi PM

> **Website / Claude Design:** For homepage work, read **`compliance-requirements.md`** instead. That file lists only what the site must include (nutrition, ingredients, statutory text, how-to substance). This document is for **back-of-pack image generation** — its layout order and marketing copy are **not** website requirements.

**Purpose:** Single source of truth for assembling back-of-pack image-generation prompts. Works with **any front pouch design** attached as a reference image. Intended for:

1. **Agents / Design Lab** — paste-ready Higgsfield prompts
2. **Future website builder** — structured copy blocks → prompt assembly

**Pair with:** `docs/image-generation-defaults.md` (model, resolution, reference upload) · `docs/pack-front-prompt-brief.md` (front exploration)

**Default model:** `gpt_image_2` · **Resolution:** `2k` · **Aspect ratio:** `2:3` (portrait stand-up pouch) · **Count:** `1` per design

---

## Core principle: inherit the front, don't clone it

The attached front image (**Image 1**) is the **style DNA** for the back. The prompt must instruct the model to:

| Inherit from Image 1 | Do on the back |
|----------------------|----------------|
| Background colour / material finish | Same mustard, cream, split-panel, etc. |
| Text colour and typography family | Same header vs body relationship |
| Illustration craft register | Same line weight, dot-work, palette accents |
| Decorative motifs (animals, florals, geometry) | Reuse **in the same style** — may appear as accents, dividers, corners, icon frames |
| Pouch physicality | Same stand-up pouch, studio lighting, camera angle |

| Never copy from front to back |
|-------------------------------|
| HELDI wordmark, SKU name (KHANA / DAHI), front hero line |
| Front layout architecture (the back has its own information hierarchy) |
| Front-only claims or badges unless explicitly re-used as a style reference |

**Prompt phrase (always include):**

```
Photorealistic product photography of the exact same physical stand-up pouch from Image 1,
showing the BACK panel only. Same pouch dimensions, material, studio lighting, and camera
angle — as if the pouch were simply turned around. Refer to Image 1 for background colour,
text colour, typography, and illustration style. All decorative elements on the back must
use the identical visual language as Image 1 (same line weight, colour accents, craft register).
```

---

## Physical constraint: zipper safe zone

Stand-up pouches have a resealable zipper at the top. **All printed content must sit below the zipper track.**

**Prompt phrase (always include):**

```
CRITICAL LAYOUT: Resealable zipper at the top of the panel. ALL text, icons, and
illustrations must be positioned BELOW the zipper line with a clear visible margin.
Nothing may overlap the zipper area. The zipper zone stays blank.
```

---

## Content block schema

Blocks are **ordered**. The model must render every enabled block, top to bottom. For website use, each block is a toggle + editable fields.

### Block definitions

```typescript
/** Back-of-pack content configuration — future website / API shape */
type BackPackPromptConfig = {
  /** UUID or path to uploaded front pouch reference */
  referenceImageId: string;

  /** Generation settings */
  generation: {
    model: "gpt_image_2";
    resolution: "2k" | "4k";
    aspectRatio: "2:3";
    count: 1;
  };

  /** Layout variant key — see Layout variants below */
  layoutVariant: string;

  /** Ordered content blocks — only enabled blocks appear in prompt */
  blocks: BackPackBlock[];
};

type BackPackBlock =
  | KickerBlock
  | ExplainerBlock
  | ClaimIconsBlock
  | ComplianceRowBlock
  | ServingCalloutBlock
  | HowToGetHeldiBlock
  | StatutoryFooterBlock
  | CustomTextBlock;

type KickerBlock = {
  type: "kicker";
  enabled: true;
  text: string;
  typography: "bold-sans"; // matches front HELDI-style headers
};

type ExplainerBlock = {
  type: "explainer";
  enabled: true;
  text: string;
  /** Phrases within text to render in bold for scanability */
  boldPhrases: string[];
  typography: "serif-body"; // matches front KHANA / body style
};

type ClaimIconsBlock = {
  type: "claim_icons";
  enabled: boolean;
  icons: ClaimIcon[];
};

type ClaimIcon = {
  id: "high_protein" | "lactose_free" | "vegetarian" | string;
  label: string;
  /** Semantic description — model adapts visual to front style */
  iconSemantic: string;
};

type ComplianceRowBlock = {
  type: "compliance_row";
  enabled: true;
  /** Nutrition always left, ingredients always right */
  nutrition: NutritionBlock;
  ingredients: IngredientsBlock;
};

type NutritionBlock = {
  header?: string; // default: "NUTRITION INFORMATION"
  per100g: string;
  perServing: string;
  servingLabel: string; // e.g. "Per 12g serving (1 heaped tablespoon)"
};

type IngredientsBlock = {
  header?: string; // default: "INGREDIENTS"
  list: string;
  allergen: string; // e.g. "Contains: Milk."
};

type ServingCalloutBlock = {
  type: "serving_callout";
  enabled: true;
  /** Benefit-led line — dose warning lives in statutory footer only */
  text: string;
  typography: "bold";
};

type HowToGetHeldiBlock = {
  type: "how_to_get_heldi";
  enabled: true;
  sectionHeader: "HOW TO GET HELDI"; // always this exact heading
  icons: [HowToIcon, HowToIcon];
};

type HowToIcon = {
  id: "in_the_pot" | "on_the_table";
  label: string; // "IN THE POT" | "ON THE TABLE"
  caption: string;
  iconSemantic: string;
};

type StatutoryFooterBlock = {
  type: "statutory_footer";
  enabled: true;
  lines: string[];
  typography: "plain-smallest"; // unstyled, locked to bottom
};

type CustomTextBlock = {
  type: "custom";
  enabled: boolean;
  text: string;
  position: "after_explainer" | "after_claims" | "before_footer";
  typography?: "bold-sans" | "serif-body";
};
```

---

## Default copy — Khana (launch SKU)

Use as defaults. Website / agent may override any field.

### 1. Kicker

```
Healthy, but the way my nani says it.
```

### 2. Explainer

**Full text:**

```
Never drink another protein shake again. Heldi is the first protein supplement made to dissolve straight into your dal or curry, so you can enjoy the everyday food you love with the nutrients you need. No shaking, no blending. Just stir it in.
```

**Suggested bold phrases** (pick 2–3 per generation):

- `Never drink another protein shake again.`
- `dissolve straight into your dal or curry`
- `everyday food you love`
- `No shaking, no blending.`
- `Just stir it in.`

### 3. Claim icons

Three icons in a horizontal row. Use **recognisable traditional semantics**, but the **visual style must match Image 1** (same folk-art line work, palette, dot patterns — not generic clip-art).

| ID | Label | Icon semantic (for prompt) |
|----|-------|----------------------------|
| `high_protein` | High in protein | Traditional strength / protein symbol — e.g. flexing arm, wheat-and-dumbbell folk motif, or protein molecule rendered in the front's craft style. **Not** gym-bro aesthetic. |
| `lactose_free` | Lactose free | Traditional "no milk" symbol — milk churn or glass with a cross / strike-through, drawn in the same folk-art style as Image 1. |
| `vegetarian` | Vegetarian | Stylised green plant or leafy sprig — coriander, curry leaf, or small herb motif drawn in the front's folk-art illustration style and palette. **Not** the standard Indian vegetarian mark (green dot in square). |

**Prompt phrase (vegetarian — always include):**

```
"Vegetarian" — stylised green plant with leaves and sprigs ONLY, drawn in folk-art line
style matching Image 1. Absolutely NO green dot in square. NO standard vegetarian
certification mark.
```

**Prompt phrase:**

```
THREE CLAIM ICONS in a horizontal row. Use traditional recognisable icon semantics
(high protein, lactose free, vegetarian) but draw every icon in the exact illustration
style of Image 1 — same line weight, dot-work, teal/navy/red/green/yellow accents.
Labels beneath each icon. Not generic clip-art.
```

### 4. Compliance row (nutrition left · ingredients right)

**Layout rule (always enforce):**

```
ONE HORIZONTAL ROW — nutrition table on the LEFT column, ingredients + allergen on the
RIGHT column, side by side at the same height. Do not stack them vertically.
```

**Nutrition — Per 100g:**

```
Energy 1571 kJ / 376 kcal. Fat 3.2 g, of which saturates 0.7 g. Carbohydrate 3.6 g,
of which sugars 2.2 g. Fibre 0.8 g. Protein 82.6 g. Salt 0.74 g.
```

**Nutrition — Per 12g serving (1 heaped tablespoon):**

```
Energy 189 kJ / 45 kcal. Fat 0.4 g, of which saturates 0.1 g. Carbohydrate 0.4 g,
of which sugars 0.3 g. Fibre 0.1 g. Protein 9.9 g. Salt 0.09 g.
```

**Ingredients:**

```
Whey Protein Isolate (MILK), Sunflower Lecithin (E322), Coriander Powder, Cumin Powder,
Salt, Kashmiri Chilli Powder, Turmeric Powder.
```

**Allergen:**

```
Contains: Milk.
```

### 5. Protein serving callout

Benefit-led serving line. **Do not** repeat the daily-dose warning here — that appears in the statutory footer only (block 7).

```
one heaped tablespoon stirred into your cooking adds 10 g of protein to your dish.
```

**Prompt phrase (always include):**

```
PROTEIN SERVING CALLOUT (bold) — render EXACTLY the serving_callout text. Do NOT
repeat "do not exceed the recommended daily dose" here — that warning appears in the
statutory footer only.
```

### 6. How to get Heldi (two icons)

Section heading is always **"HOW TO GET HELDI"** — not "How to use".

Drawn in **the same folk-art style as Image 1** (matching the pot/bowl icons from prior successful generations).

| Label | Icon semantic | Caption |
|-------|---------------|---------|
| `IN THE POT` | Traditional Indian cooking pot (handi) with spoon stirring — dish off the heat, cooling (gentle wispy steam, not actively boiling) | `Add a spoonful while the dish is cooling. No taste, no texture, no fuss.` |
| `ON THE TABLE` | Bowl of dal/curry on a dining table with spoon — ready for self-serve at the table | `Or leave it out. Everyone adds their own, as much as they like.` |

**Prompt phrase (section header — always include):**

```
Section heading: "HOW TO GET HELDI" — not "How to use".
```

**Prompt phrase (IN THE POT — always include):**

```
"IN THE POT" — handi pot with spoon stirring in cooling dal/curry. Dish is OFF the heat
and cooling — not boiling or actively cooking. Caption: "Add a spoonful while the dish is
cooling. No taste, no texture, no fuss." Do NOT say "while it cooks" or "while cooking."
```

**Prompt phrase (ON THE TABLE — always include):**

```
"ON THE TABLE" — bowl of dal/curry on a dining table with spoon, ready for self-serve.
Do NOT illustrate a miniature Heldi pouch or any product pack in this icon. Caption:
"Or leave it out. Everyone adds their own, as much as they like."
```

### 7. Statutory footer (smallest plain text, locked to bottom)

```
Do not exceed the recommended daily dose. Keep out of reach of children. Food supplements
should not be used as a substitute for a varied and balanced diet. Food supplement.
Net weight: 300g e. Store in a cool, dry place, away from direct sunlight. Reseal after
opening. Best before: [DATE] Batch: [CODE] Heldi Ltd, 71-75 Shelton Street, Covent Garden,
London, WC2H 9JQ heldi.co.uk
```

---

## Strict content order

The prompt must list blocks in this order. Do not reorder.

```
1. Kicker
2. Explainer (with bold phrases marked)
3. Claim icons row (if enabled)
4. Compliance row — nutrition LEFT, ingredients RIGHT
5. Protein serving callout
6. How to get Heldi — heading "HOW TO GET HELDI" · IN THE POT | ON THE TABLE
7. Statutory footer
```

Optional `custom` blocks insert at their configured position without breaking the compliance/footer sequence.

---

## Layout variants

Pass one variant per generation. Variants change composition only — not content.

| Key | Description |
|-----|-------------|
| `editorial` | Centred kicker, full-width explainer, claim icons row, split compliance row, protein serving callout, how-to-get-Heldi icons, footer. Minimal floral dividers. |
| `type_led` | Oversized bold kicker. Claim icons in dashed-circle badges (style of front protein badge if present). Bordered compliance columns with floral vine divider. |
| `band` | Kicker + explainer in top third. Compliance row inside a horizontal band with folk-art floral borders. Claim icons above band. Decorative motif (elephant/floral) flanking band if present on front. |
| `asymmetric` | Left-aligned kicker. Claim icons top-right. Full-width compliance row with dotted vertical rule. Corner accent matching front hero motif. |
| `heritage` | Centred kicker. Explainer as pull-quote. Claim icons in horizontal garland. Compliance row framed by small corner motifs in front style. How-to-get-Heldi icons in medallions. |

**Prompt suffix example:**

```
Layout: editorial — centred kicker below zipper, explainer, claim icons row,
nutrition-left/ingredients-right split, protein serving callout, how-to-get-Heldi icons, footer.
Small floral divider accents only.
```

---

## Curved / diagonal colour split (when present on front)

When Image 1 has a **curved or diagonal two-tone background** (e.g. cream upper panel sweeping into maroon lower), the back must consciously handle this — do not default to a flat single-colour back.

Choose **one** approach per generation and state it explicitly in the prompt:

| Key | Description |
|-----|-------------|
| `mirror_curve` | Mirror the front's curved colour boundary so the back feels like the other side of the same pouch — same two colours, curve reflected/reversed for symmetry when turned around. |
| `dual_tone_layout` | Use both front colours across the back without copying the exact front curve — e.g. cream top + maroon bottom with a back-appropriate divider (straight band, gentle wave, or floral border). |

**Prompt phrase (always include when front has curved split):**

```
BACKGROUND GEOMETRY: Image 1 has a curved diagonal colour split ({{colour_a}} / {{colour_b}}).
{{mirror_curve OR dual_tone_layout}}. Both panel colours MUST appear on the back panel.
Match the material finish and ink colours from Image 1 on each zone.
```

**Agent rule:** Read Image 1 first. If a curved split is visible, fill `colour_a` / `colour_b` from the front and pick `mirror_curve` unless the user specifies otherwise.

---

## Style extraction checklist (from any front reference)

When a new front design is attached, the prompt-assembler (human, agent, or website) should read Image 1 and fill this checklist into the prompt prose:

| Attribute | What to extract | Example prompt fragment |
|-----------|-----------------|-------------------------|
| Background | Dominant panel colour / texture | `warm mustard/saffron yellow matte` |
| Curved split | Diagonal/curved two-tone boundary (if present) | `curved cream-to-maroon diagonal — mirror curve on back for symmetry` |
| Text colour | Ink / contrast colour | `dark charcoal` |
| Header font | Relationship to HELDI wordmark | `bold slanted sans-serif` |
| Body font | Relationship to KHANA / descriptor | `classic slab-serif` |
| Illustration craft | Folk tradition, line style | `Mughal/Madhubani folk-art, teal/navy line work` |
| Accent palette | Colours beyond background + ink | `red, forest green, marigold, white dot-work` |
| Hero motif | Animal, floral, geometric | `ornate elephant with decorative blanket` or `lotus florals` |
| Badge style | If front has circular/dashed badges | `dashed-circle badges like front protein callout` |
| Decorative density | Minimal vs ornate | `delicate floral sprigs as accents only` |

**Rule:** Name what you see on the front. Do not invent a style that contradicts Image 1.

---

## Assembled prompt template

Copy, fill `{{placeholders}}`, attach front as Image 1.

```
Photorealistic product photography of the exact same physical stand-up pouch from Image 1,
showing the BACK panel only. Same pouch dimensions, material, studio lighting, and camera
angle. 2:3 portrait. Sharp print detail, no watermark.

CRITICAL LAYOUT: Resealable zipper at top. ALL printed content BELOW the zipper with clear
margin. Nothing overlaps the zipper zone.

STYLE (from Image 1): {{style_extraction_summary}}

TYPOGRAPHY: {{header_font}} for kicker and section headers. {{body_font}} for body copy.
{{text_colour}} on {{background_colour}}.

ILLUSTRATIONS: All icons and decorative elements in the exact visual language of Image 1 —
{{craft_register}}, {{accent_palette}}. Motifs from front ({{hero_motif}}) may appear as
accents, dividers, or corner details. Do not reproduce the front layout or HELDI wordmark.

STRICT CONTENT ORDER (verbatim text, do not paraphrase):

1. KICKER (bold): "{{kicker}}"

2. EXPLAINER — BOLD these phrases: {{bold_phrases_quoted}}. Full text: "{{explainer}}"

3. CLAIM ICONS (horizontal row, folk-art style matching Image 1):
   "{{claim_1_label}}" — {{claim_1_semantic}}
   "{{claim_2_label}}" — {{claim_2_semantic}}
   "{{claim_3_label}}" — {{claim_3_semantic}}

4. HORIZONTAL ROW — LEFT: nutrition table. RIGHT: ingredients + allergen.
   Nutrition Per 100g: {{nutrition_100g}}
   {{serving_label}}: {{nutrition_serving}}
   Ingredients: {{ingredients}}
   Allergen: {{allergen}}

5. PROTEIN SERVING CALLOUT (bold): "{{serving_callout}}"

6. HOW TO GET HELDI (section heading, bold) — two icons side by side in matching folk-art style:
   "{{pot_label}}" ({{pot_semantic}}) — "{{pot_caption}}"
   "{{table_label}}" ({{table_semantic}}) — "{{table_caption}}"
   ON THE TABLE icon: bowl on table only — NO miniature pouch illustration.

7. FOOTER (smallest plain text, bottom edge): {{statutory_footer}}

Layout: {{layout_variant_description}}

One pouch. One image.
```

---

## Higgsfield invocation

See `docs/image-generation-defaults.md` for upload flow.

```json
{
  "model": "gpt_image_2",
  "resolution": "2k",
  "aspect_ratio": "2:3",
  "count": 1,
  "medias": [{ "value": "<media_id>", "role": "image" }],
  "prompt": "<assembled prompt>"
}
```

| Request type | Jobs | Credits (approx.) |
|--------------|------|-------------------|
| 1 back design | 1 | ~1 |
| 5 layout variants | 5 parallel jobs | ~5 |
| 2×3 concept grid | 1 contact sheet | ~1 |

**Do not** use 4K unless explicitly requested. Default to `2k`.

---

## Website builder notes (future)

### UI flow

1. User selects / uploads a **front design** (reference image).
2. User toggles and edits **content blocks** (schema above).
3. User picks a **layout variant** (or "generate 5 variants").
4. Backend runs `extractStyleHints(referenceImage)` — optional vision step to pre-fill style checklist.
5. Backend calls `assembleBackPrompt(config)` → Higgsfield prompt string.
6. Generation returns back-of-pouch mockup; user may iterate on copy without changing front.

### `assembleBackPrompt` pseudocode

```typescript
function assembleBackPrompt(config: BackPackPromptConfig): string {
  const style = config.styleHints ?? defaultStyleFromReference(config.referenceImageId);
  const enabled = config.blocks.filter((b) => b.enabled);
  // Validate order: kicker → explainer → [claims] → compliance → serving callout → how-to → footer
  return TEMPLATE.fill({
    style_extraction_summary: style.toProse(),
    ...mapBlocksToPlaceholders(enabled),
    layout_variant_description: LAYOUTS[config.layoutVariant],
  });
}
```

### Bold phrase handling

- Store full explainer as one string.
- Store `boldPhrases[]` separately.
- Prompt lists bold phrases explicitly: `BOLD these phrases: "…" and "…"`
- Do not rely on markdown in the image prompt — the model renders visual bold weight.

### Claim icon styling rule (critical)

Always pass **semantic** + **style inheritance** — never ask for "standard protein icon":

```
Traditional [semantic] icon, redrawn in the exact illustration style of Image 1.
```

---

## Quality checklist (before generating)

- [ ] Front reference image uploaded and passed as `medias`
- [ ] Zipper safe-zone rule in prompt
- [ ] Style extraction from Image 1 described in prose
- [ ] All enabled blocks present in strict order
- [ ] Nutrition left / ingredients right enforced
- [ ] Bold phrases listed explicitly
- [ ] Claim icons use semantic + style-match instruction
- [ ] How-to-get-Heldi section heading is "HOW TO GET HELDI"
- [ ] How-to-get-Heldi icons described with folk-art style match
- [ ] IN THE POT caption says cooling, not cooking
- [ ] ON THE TABLE icon has bowl only — no miniature pouch
- [ ] Curved/diagonal front split handled (`mirror_curve` or `dual_tone_layout`) when applicable
- [ ] Statutory footer marked as smallest plain text
- [ ] `2k`, `2:3`, `count: 1`
- [ ] Cost preflighted if batch > 5 credits

---

## Output location

| Type | Path |
|------|------|
| Single back design | `pouch-designs/favourites-variations/{{front-code}}-back-{{variant}}.png` |
| Batch of variants | `GEN-{code}-back-v{N}-{slug}.png` |

---

## Example: minimal assembled prompt (Khana · editorial)

```
Photorealistic product photography of the exact same stand-up pouch from Image 1, back panel
only. Same mustard matte pouch, studio lighting, 2:3 portrait. No watermark.

CRITICAL: All content BELOW resealable zipper. Clear top margin.

Match Image 1: mustard yellow, charcoal text, bold slanted sans-serif headers, slab-serif
body, Mughal folk-art line style with teal/navy/red/green accents and dot-work.

STRICT ORDER:
1. KICKER bold: "Healthy, but the way my nani says it."
2. EXPLAINER — BOLD "Never drink another protein shake again." and "Just stir it in." — [full paragraph]
3. CLAIM ICONS: High in protein | Lactose free | Vegetarian — traditional semantics, Image 1 style
4. LEFT nutrition table | RIGHT ingredients + Contains: Milk — horizontal row
5. PROTEIN SERVING CALLOUT bold: "one heaped tablespoon stirred into your cooking adds 10 g of protein to your dish."
6. HOW TO GET HELDI — IN THE POT + ON THE TABLE icons with captions (no mini pouch on table)
7. Statutory footer smallest plain text

Layout: editorial. One pouch. One image.
```

---

## Agent task (when human points you at this file)

1. Confirm front reference image (path or upload).
2. Read Image 1 → fill style extraction checklist (including curved split if present).
3. Confirm SKU copy overrides (or use Khana defaults).
4. Confirm layout variant(s) and batch size.
5. Assemble prompt(s) from template.
6. Preflight cost → generate via Higgsfield MCP.
7. Save to `pouch-designs/favourites-variations/` with descriptive filename.
