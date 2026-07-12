# Heldi homepage styling reference

Complete CSS class → visual property map from `app/globals.css`. Use with `design-tokens.json` for machine-readable values.

---

## CSS custom properties (`:root`)

```css
--gold: #eda31d;           /* Marigold — primary brand warmth */
--ink: #011246;            /* Ink blue — text, dark sections, borders */
--ink-rgb: 1 18 70;        /* For rgba() shadows on ink */
--cream: #f8f0de;          /* Light section/card backgrounds */
--terracotta: #a8432b;     /* Accents, eyebrows, numerals, hover */
--brown: #4a4238;          /* Body copy on light backgrounds */
--muted: #8a8378;          /* Footer secondary text */
--dark-muted: #b5ad9f;     /* Body copy on ink sections */
```

Fonts via Next.js Google Fonts in `app/layout.tsx`:
- `--font-display` → Rozha One 400
- `--font-body` → Gelasio 400/500/600 (+ italic)

---

## Base typography

| Selector | Font | Size | Colour | Line-height |
|----------|------|------|--------|-------------|
| `body` | Gelasio | 1rem | ink | — |
| `h1, h2` | Rozha One 400 | — | inherit | — |
| `h2` | Rozha One | `clamp(2rem, 4.5vw, 3rem)` | inherit | 1.1 |
| `a:hover` | — | — | terracotta | — |
| `.eyebrow` | Gelasio 600 | 0.875rem | terracotta | — |
| `.eyebrow--gold` | — | — | gold | — |
| `.eyebrow` spacing | — | `letter-spacing: 0.22em` | uppercase | — |

---

## Navigation (`.nav`)

```css
background: var(--ink);
color: var(--gold);
border-bottom: 3px solid var(--gold);
padding: 0.75rem clamp(1.25rem, 4vw, 4rem);
position: sticky; top: 0; z-index: 50;
```

| Class | Purpose |
|-------|---------|
| `.nav--intro` | Hidden during hero reveal (opacity 0, translateY -8px) |
| `.nav-links` | Desktop: flex row; mobile: fixed dropdown |
| `.nav-burger` | 2.5rem square, 2px gold border, 8px radius |
| `.nav-elephant-badge` | Mobile logo: gold bg, 2px ink border, 12px radius, 3px shadow |
| `.nav .button` | Gold bg, ink text → hover cream |

---

## Buttons (`.button`)

| Variant | Background | Text | Border | Radius | Hover |
|---------|------------|------|--------|--------|-------|
| default | ink | gold | none | — | terracotta bg, cream text, -2px Y |
| `--pill` | — | — | — | 999px | — |
| `--square` | — | — | — | 8px | — |
| `--outline` | transparent | ink | 2px ink | — | ink fill, gold text |
| `--ghost` | transparent | ink | underline 2px | — | terracotta, -2px Y |

Pill padding: `0.75rem 1.625rem`. Font-weight 600.

---

## Hero reveal (`.hero--reveal`)

| Class | Key styles |
|-------|------------|
| `.hero-reveal` | max-width 1280px; min-height clamp(420px, 58vh, 580px) |
| `.hero-reveal-showcase` | white bg; 3px ink border; 20px radius; `8px 8px 0 ink`; grid 2-col |
| `.hero-reveal-lede` | Rozha One; fluid via `container-type: inline-size`; `clamp(0.72rem, 9.5cqw, 3.9rem)` |
| `.dissolve-board` | terracotta; Rozha One; dissolve blur animation |
| `.hero-reveal-pouch__image` | width 100%; object-fit contain |
| `.pronunciation--showcase` | Gelasio italic; centred; ink |
| `.hero-reveal-actions` | flex wrap; waitlist + outline pill |
| `.hero-reveal-curtain` | absolute overlay; gold bg; z-index 2 |
| `.double-rule` | 7px height; 3px top + 3px bottom ink borders |

Mobile (≤899px): showcase becomes 2-col grid (lede left, pouch right); actions become 2-col grid.

---

## Ticker (`.ticker`)

```css
background: var(--ink);
padding: 0.9375rem 0;
overflow: hidden;
```

`.ticker-track span`: gold · 0.875rem · weight 600 · letter-spacing 0.24em · 30s linear infinite scroll

---

## Sections (`.section`)

```css
padding: clamp(3.5rem, 8vw, 6rem) clamp(1.25rem, 5vw, 4rem);
```

| Modifier | Background | Text |
|----------|------------|------|
| `--cream` | `#f8f0de` | ink |
| `--gold` | `#eda31d` | ink |
| `--ink` | `#011246` | cream |
| `--bordered` | — | `border-top: 3px solid ink` |

Content containers: `.content`, `.split-layout` → max-width 1152px, centred.

---

## Pouch section

| Class | Styles |
|-------|--------|
| `.pouch-section` | flex column; centred; max-width 640px; gap clamp(1.75rem, 4vw, 2.5rem) |
| `.pouch-section__copy p` | brown; 1.125rem; line-height 1.65; max-width 34rem |
| `.pouch-stat` | 3px ink border; 20px radius; min-height 8.5rem; centred |
| `.pouch-stat--gold` | gold bg; `8px 8px 0 ink` |
| `.pouch-stat--white` | white bg; `8px 8px 0 gold`; strong → terracotta |
| `.pouch-stat strong` | Rozha One; clamp(2.25rem, 6vw, 3rem) |
| `.pouch-badge` | white; 2px ink border; 999px radius; `4px 4px 0 ink`; min-height 3rem |

---

## Stir gallery

| Class | Styles |
|-------|--------|
| `.stir-gallery__header h2` | cream on ink section |
| `.stir-gallery__lede` | dark-muted; 0.875rem |
| `.stir-gallery__hint` | gold; 0.75rem italic; right-aligned |
| `.stir-card` | 280px fixed; 3px ink border; 18px radius; padding 18px |
| `.stir-card--cream` | cream bg; `6px 6px 0 rgba(237,163,29,0.9)` |
| `.stir-card--marigold` | gold bg; `6px 6px 0 rgba(248,240,222,0.85)` |
| `.stir-card__name` | Rozha One 19px |
| `.stir-card__tag` | 10px; 2px ink border; pill |
| `.stir-card__photo-circle` | 190×190px; 3px ink border; 50% radius; gold bg |
| `.stir-card__counter` | Rozha One 52px; → terracotta when boosted |
| `.stir-card__button` | ink fill; gold text; 3px border; 999px; `4px 4px 0 ink/25%` |
| `.stir-card__caption` | 13px italic 600; min-height 36px |

---

## How it works

| Class | Styles |
|-------|--------|
| `.how-it-works` | max-width 36rem; centred |
| `.how-it-works__steps::before` | 2px ink vertical line at 2.625rem |
| `.how-it-works__step` | grid: 5.25rem icon + 1fr copy |
| `.how-it-works__icon` | 5.25rem circle; gold bg; centred icon 3.375rem |
| `.how-it-works__copy h3` | 1.375rem Gelasio |
| `.how-it-works__copy p` | brown; 1.0625rem; line-height 1.55 |

---

## Menu gallery

| Class | Styles |
|-------|--------|
| `.menu-gallery__header h2` | cream; clamp(1.75rem, 4.5vw, 2.75rem) |
| `.menu-gallery__lede` | dark-muted; strong → cream |
| `.menu-card` | 292px (300px desktop); 3px ink border; 18px radius |
| `.menu-card--cream` | cream; gold shadow |
| `.menu-card--marigold` | gold; cream shadow |
| `.menu-card__tag` | 0.625rem; 2px ink border; pill; letter-spacing 0.16em |
| `.menu-card__title` | Rozha One 1.375rem |
| `.menu-card__rule` | double rule 7px |
| `.menu-card__dish-grams` | Rozha One 0.9375rem; pill; Heldi → filled bg |
| `.menu-card__heldi-band` | 9px 12px padding; 10px radius; gold or ink bg |
| `.menu-card__table-total strong` | Rozha One clamp(1.75rem, 6vw, 2.25rem) |

---

## Audience / sticker cards

```css
.sticker-card {
  padding: 2rem;
  border: 3px solid var(--ink);
  border-radius: 18px;
  background: var(--cream);
  box-shadow: 6px 6px 0 var(--ink);
}
.sticker-card h3 { Rozha One 1.6875rem; }
.sticker-card li::before { content: "+"; color: terracotta; weight 600; }
.sticker-card li { brown; line-height 1.5; }
```

---

## FAQ

| Class | Styles |
|-------|--------|
| `.faq` | max-width 860px |
| `.faq-list` | border-top 2px ink |
| `.faq-list article` | border-bottom 2px ink |
| `.faq-list button` | full width flex; Gelasio 600; clamp 1.0625–1.25rem |
| `.faq-list button b` | Rozha One terracotta 1.75rem (+/–) |
| `.faq-list article > p` | brown; 1.0625rem; max-width 720px |

---

## Jar section

| Class | Styles |
|-------|--------|
| `.jar-layout` | max-width 720px; centred |
| `.jar-card` | 2px dashed gold; 24px radius; centred |
| `.jar-preview-card` | white; 3px ink border; 20px radius; `8px 8px 0 ink` |
| `.section-copy--dark p` | dark-muted |

---

## Final CTA

| Class | Styles |
|-------|--------|
| `.final-cta` | gold bg; min-height 410px; flex; overflow hidden |
| `.final-cta h2` | clamp(2.125rem, 5.5vw, 3.25rem) |
| `.final-cta-copy > p` | `#2c2418`; 1.125rem italic |
| `.cta-elephant` | absolute; bottom 1rem; width 190px; opacity 0.9 |

---

## Footer

```css
footer {
  background: var(--ink);
  color: var(--muted);
  font-size: 0.875rem;
  padding: 1.625rem clamp(1.25rem, 5vw, 4rem);
  flex wrap; space-between;
}
.heldi-logo--on-dark { CSS filter → gold tint }
```

---

## Copy emphasis (`.copy-emphasis`)

Context-dependent colour (font-weight 600):

| Section background | Colour |
|--------------------|--------|
| cream | ink |
| ink | gold |
| gold / final-cta | ink |

---

## Floating CTA (mobile)

```css
.floating-cta {
  position: fixed; right: 1rem; bottom: 1rem; z-index: 60;
  gold bg; 3px ink border; 999px radius;
  box-shadow: 4px 4px 0 ink;
}
```

---

## Waitlist form

```css
.waitlist-form { max-width 480px; flex wrap; gap 0.625rem; }
input { cream bg; 2px ink border; 8px radius; padding 0.75rem 1rem; }
.waitlist-success { italic; 2px ink bottom border; }
```

---

## Focus & accessibility

```css
button:focus-visible, a:focus-visible { outline: 3px solid #fff; offset 3px; }
input:focus-visible { outline-color: terracotta; }
.sr-only { visually hidden utility }
```

`prefers-reduced-motion: reduce` → disables all animations/transitions; hero reveal shows immediately.

---

## Animation keyframes

| Name | Used for |
|------|----------|
| `ticker-move` | Marquee translateX -50% |
| `hero-part-in` | Fade + translateY 14px → 0 |
| `dissolve-in` | Blur 10px + translateY 8px → clear |
| `hero-dish-in` | Rotating hero dish words |
| `stir-fall` | Particle burst on stir button |
| `answer-in` | FAQ answer reveal |
| `floating-cta-in` | Mobile CTA entrance |

---

## Sticker shadow cheat sheet

Use these exact values in generated graphics:

| Context | Shadow |
|---------|--------|
| Standard card on light bg | `6px 6px 0 #011246` |
| Product / stat / jar card | `8px 8px 0 #011246` |
| Cream card on ink bg | `6px 6px 0 rgba(237, 163, 29, 0.9)` |
| Marigold card on ink bg | `6px 6px 0 rgba(248, 240, 222, 0.85)` |
| Badge / small pill | `4px 4px 0 #011246` |
| Nav elephant badge | `3px 3px 0 rgba(1, 18, 70, 0.35)` |

**Never** use `box-shadow` with blur radius — always hard offset, zero blur.
