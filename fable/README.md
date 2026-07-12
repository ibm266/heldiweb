# Heldi design context for Claude Design (Fable)

This folder is the **single source of context** for generating graphics, illustrations, and marketing visuals that match the live Heldi homepage (Next.js site in this repo).

**Attach this entire folder** when prompting Claude Design / Fable so outputs stay on-brand.

## Quick start

1. **Compliance only:** `compliance-requirements.md` — nutrition, ingredients, statutory text, how-to-use (substance only)
2. **Layout & styling:** `homepage-layout.md` + `homepage-styling.md` + `design-tokens.json` — how the live page looks today (all flexible)
3. **Visual anchors:** `screenshots/` + `references/` — live captures and brand/product images
4. **Tone:** `brand-voice.md` + `visual-style.md`
5. **Marketing copy:** `homepage-copy.md` — current homepage text (**optional — can delete or rewrite**)
6. **Pack design reference:** `back-prompt-master.md` — back-of-pouch prompt spec; **not a website layout or copy constraint**

## What Heldi is

Heldi is a **single-SKU protein powder** made for home-cooked Indian food — dal, curry, raita, dahi, chaat, not shakes. It dissolves into gravies and yoghurt bases. One pouch for the whole table. Launching autumn 2026, made in the UK.

**Brand promise:** Same recipes. Same taste. More protein.

---

## What is fixed vs free

| Fixed (compliance) | Free (everything else) |
|--------------------|------------------------|
| Nutrition figures (100g + serving) | Hero copy, headlines, lede |
| Ingredients list + `Contains: Milk.` | Section order and layout |
| Statutory footer text | Kicker, explainer, claim icons |
| A how-to-use section (substance only) | Menu gallery, audience cards, FAQ prose |
| | All marketing copy in `homepage-copy.md` |

**Rule:** Read `compliance-requirements.md` for the four must-haves. Use `homepage-layout.md` and `screenshots/` for visual direction. **Do not** treat `back-prompt-master.md` as a website blueprint — it is pack-design source data. Marketing text can be cut, rewritten, or replaced entirely.

### The four must-haves

1. **Nutrition information** — exact figures from `compliance-requirements.md`
2. **Ingredients + allergen** — exact list from `compliance-requirements.md`
3. **Compliance footer** — statutory warnings, net weight, storage, company address
4. **How to use** — any section that explains stirring in (pot while cooling + optional at-table); copy and design fully flexible

---

## Live homepage (July 2026)

| Area | Current live site |
|------|-------------------|
| Hero layout | **Reveal** — elephant intro curtain → white sticker card with lede + pouch |
| Primary dark colour | Ink blue `#011246` |
| Stir gallery | Interactive dish cards with stir-in videos (`#stir`) |
| How to use | `#how` — example implementation, not required format |
| Compliance data | Not yet on homepage — see `compliance-requirements.md` |

Visual authority: **this folder + live CSS** (`app/globals.css`).

---

## File index

| File | Purpose |
|------|---------|
| **`compliance-requirements.md`** | **Minimum legal/product facts — nutrition, ingredients, statutory text, how-to substance** |
| `back-prompt-master.md` | Pack back-of-pouch prompt master (source for compliance figures; ignore layout/marketing blocks for web) |
| `homepage-layout.md` | Current section map, wireframes, screenshots (**flexible**) |
| `homepage-styling.md` | CSS class → visual property reference |
| `homepage-copy.md` | Current marketing copy (**optional**) |
| `screenshots/` | Live homepage screenshots |
| `references/` | Brand and product image assets |
| `design-tokens.json` / `design-tokens.md` | Colours, fonts, shadows |
| `brand-voice.md` / `visual-style.md` | Tone and illustration direction |
| `generation-prompts.md` | Prompt templates for Claude Design |

---

## Reference assets (`references/`)

See `references/README.md` for the full list. Key files:

| File | Use when generating… |
|------|------------------------|
| `pouch.png` | Product shots, packaging colour truth |
| `heldi-wordmark.png` | Logo placement |
| `elephant-*.png` | Decorative elephant motifs |
| `jars-both.png`, `jar-gold.png`, `jar-silver.png` | Jar offer |
| `how-it-works/*.png` | Step icons |
| `pouch-badges/*.png` | Product attribute badges |
| `stir-gallery/*.webp` | Dish photos |

Regenerate screenshots: `node scripts/capture-fable-screenshots.mjs`

---

## Typography (Google Fonts)

- **Display:** Rozha One Regular (400)
- **Body:** Gelasio (400/500/600, italic)
- **No sans-serif**

## Core palette

- **Marigold** `#eda31d`
- **Ink** `#011246`
- **Cream** `#f8f0de`
- **Terracotta** `#a8432b`

## Do not

- Change nutrition figures or ingredients list without updating `compliance-requirements.md`
- Paraphrase statutory footer, ingredients, or allergen line
- Use black `#000` — always Heldi ink `#011246`
- Show protein shakes, blenders, or gym imagery
- Say "scoop" — use **spoon**, **spoonful**, **stir**, **tablespoon**
- Treat `back-prompt-master.md` block order or marketing copy as required on the website

## Source code pointers

- Homepage: `components/heldi-homepage.tsx`
- Styles: `app/globals.css`
- Screenshot script: `scripts/capture-fable-screenshots.mjs`
