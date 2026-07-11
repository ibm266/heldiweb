# Heldi design context for Claude Design (Fable)

This folder is the **single source of context** for generating graphics, illustrations, and marketing visuals that match the live Heldi homepage at [heldiweb](https://github.com/) (Next.js site in this repo).

Attach this folder (or individual files) when prompting Claude Design / Fable so outputs stay on-brand.

## Quick start

1. **Read first:** `brand-voice.md` + `visual-style.md`, tone and look.
2. **Match exactly:** `design-tokens.json`, colors, type, spacing (live CSS values).
3. **Copy from:** `homepage-copy.md`, approved headlines and body text.
4. **Attach references:** files in `references/`, pouch, wordmark, elephants, hero poster.
5. **Use templates:** `generation-prompts.md`, starter prompts for common asset types.

## What Heldi is

Heldi is a **single-SKU protein powder** made for home-cooked Indian food, dal, curry, raita, dahi, chaat, not shakes. It dissolves into gravies and yoghurt bases. One pouch for the whole table. Launching autumn 2026, made in the UK.

**Brand promise:** Same recipes. Same taste. More protein.

**Tagline (hero film):** "Bringing something new to the table"

**Pronunciation line:** `/hel-dee/, adj. how my nani says "healthy."`

## Live site vs. original handoff

The homepage was built from `design_handoff_heldi_homepage/` but has evolved:

| Area | Current live site |
|------|-------------------|
| Primary dark color | Ink blue `#011246` (was black `#1a171b` in handoff) |
| Nav | Ink background, marigold text (inverted from early mock) |
| Hero | Video hero (`heroLayout="video"`) with wordmark + lede, not split-flap board |
| Product stats | 10g protein per bowl (placeholder, confirm before launch) |
| Imagery | Ink-blue recoloured assets in `public/images/variants/ink-blue/` |

Always treat **this folder + live CSS** as authoritative for new graphics, not the older handoff alone.

## File index

| File | Purpose |
|------|---------|
| `design-tokens.json` | Machine-readable colors, fonts, radii, shadows |
| `design-tokens.md` | Human-readable design system notes |
| `brand-voice.md` | Tone, vocabulary, do/don't |
| `visual-style.md` | Illustration, photography, layout, UI patterns |
| `homepage-copy.md` | All live homepage copy by section |
| `generation-prompts.md` | Reusable prompt templates for Claude Design |
| `references/` | Brand assets to attach as visual anchors |

## Reference assets

| File | Use when generating… |
|------|------------------------|
| `references/pouch.png` | Product shots, packaging colour truth, elephant motif |
| `references/heldi-wordmark.png` | Logo placement, ink-blue wordmark colour |
| `references/elephant-large-transparent.png` | Decorative Indian elephant (hero scale) |
| `references/elephant-small.png` | Footer/CTA elephant scale |
| `references/jars-both.png` | Free jar offer, gold/silver lid chips |
| `references/hero-video-poster.png` | Hero film look: dining table, family meal, pouch reveal |

Full asset library: `public/images/variants/ink-blue/` (live) and `public/images/originals/` (pre-recolour backups).

## Typography (Google Fonts)

- **Display:** Rozha One Regular (400), headings, wordmark, numerals, menu dish names
- **Body:** Gelasio (400/500/600, italic), paragraphs, nav, buttons, labels
- **No sans-serif**, entire brand is serif-forward; this is intentional

## Core palette (memorise these)

- **Marigold** `#eda31d`, primary brand warmth, backgrounds, accents on dark
- **Ink** `#011246`, text, dark sections, borders, elephant/wordmark fill
- **Cream** `#f8f0de`, card and section backgrounds
- **Terracotta** `#a8432b`, accent numerals, eyebrows, links on hover

## Do not

- Use black `#000` or generic navy, always Heldi ink `#011246`
- Show protein shakes, blenders, or gym imagery
- Say "scoop", use **spoon**, **spoonful**, **stir**
- Reference retired three-SKU line (Chai / Khana / Dahi), one pouch only
- Use soft drop shadows, use **hard offset sticker shadows** (`6px 6px 0` or `8px 8px 0`)
- Use sans-serif type in marketing graphics

## Source code pointers

- Homepage component: `components/heldi-homepage.tsx`
- Styles: `app/globals.css`
- Fonts: `app/layout.tsx`
- Menu cards: `components/menu-gallery.tsx`
- Audience cards: `components/audience-gallery.tsx`
