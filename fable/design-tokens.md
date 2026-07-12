# Heldi design tokens

Values below match the **live homepage** (`app/globals.css`). Use these exactly when generating graphics.

## Colors

| Token | Hex | Role |
|-------|-----|------|
| Marigold (`--gold`) | `#eda31d` | Brand warmth, hero bg, marigold sections, accents on ink |
| Ink (`--ink`) | `#011246` | Text, dark bands, borders, illustrations, wordmark |
| Cream (`--cream`) | `#f8f0de` | Light section and card backgrounds |
| Terracotta (`--terracotta`) | `#a8432b` | Eyebrows, stats, step numbers, interactive accents |
| Brown (`--brown`) | `#4a4238` | Body copy on cream/gold |
| Muted (`--muted`) | `#8a8378` | Footer secondary |
| Dark muted (`--dark-muted`) | `#b5ad9f` | Body on ink sections |
| Warm dark | `#2c2418` | Hero sublines on marigold |

### Section backgrounds (alternating rhythm)

1. **Hero**, marigold (`heroLayout="reveal"` — elephant intro → sticker card)
2. **Ticker**, ink (full-width band inside hero)
3. **The Pouch**, cream
4. **Stir gallery**, ink (top border 3px)
5. **How it works**, cream
6. **Tonight's table / menus**, ink
7. **Who it's for**, marigold (top border 3px ink)
8. **FAQ**, cream (top border)
9. **Free jar**, ink
10. **Final CTA**, marigold
11. **Footer**, ink

## Typography

### Rozha One (display)

- Weight 400 only
- Headlines, menu card titles, stat numerals, FAQ +/- glyphs
- Slightly editorial, Indian-influenced serif display, not Western luxury serif

### Gelasio (body)

- Weights 400, 500, 600; italic available
- All UI, paragraphs, nav links, button labels
- Pronunciation line uses display for `/hel-dee/` and italic Gelasio for `adj. how my nani says "healthy."`

### Type scale (fluid)

- Section H2: `clamp(2rem, 4.5vw, 3rem)`, line-height ~1.1
- Hero lede (video): `clamp(1.375rem, 3.5vw, 2rem)`
- Body: `1rem–1.125rem`, line-height 1.55–1.65
- Eyebrow: `0.875rem`, uppercase, `letter-spacing: 0.22em`, terracotta or gold on dark

## Layout & spacing

- Section padding: `clamp(3.5rem, 8vw, 6rem)` vertical, `clamp(1.25rem, 5vw, 4rem)` horizontal
- Content max-width: 1152px (860px FAQ)
- Card grids: CSS `auto-fit` / `minmax(240px–300px, 1fr)`

## Shape language

### Sticker cards

The signature Heldi look, **not** soft Material shadows:

```css
border: 3px solid #011246;
border-radius: 18px–20px;
box-shadow: 6px 6px 0 #011246; /* or 8px 8px 0 for product card */
background: #f8f0de or #eda31d;
```

### Rules & dividers

- Thick horizontal rules: 2px or 3px solid ink
- "Double rule" sign-off: two stacked 3px ink lines
- Stat and step separators: 2px top border

### Pills & chips

- Fully rounded (`border-radius: 999px`)
- 2px ink border; active state fills ink with cream/gold text

### Dashed frames

- Jar section card: `2px dashed #eda31d`, 24px radius, playful, "pick your lid" energy

## Buttons

| Variant | Default | Hover |
|---------|---------|-------|
| Solid | Ink bg, gold text | Terracotta bg, cream text |
| Pill (hero) | Same | Slight lift `-2px` |
| Outline | Transparent, ink border | Ink fill, gold text |

## Motion (for animated assets)

- **Pouch bob:** gentle `translateY` + slight rotation, 4.5s ease-in-out
- **Ticker:** 30s linear infinite marquee, uppercase gold on ink
- **Hero video:** family dining table → ink elephants cross → smoke clears → pouch + tagline
- **Dissolve text:** opacity + blur + translateY (evokes powder in liquid)

Prefer `prefers-reduced-motion` safe static fallbacks for accessibility.

## Image recolour rule (ink-blue variant)

When creating or editing brand assets:

- Recolour black/near-black → `#011246`
- Preserve marigold `#eda31d`, cream `#f8f0de`, metallics, and white unchanged
- Reference: `public/images/variants/ink-blue/`
