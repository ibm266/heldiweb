# Heldi homepage layout

**Purpose:** Give Claude Design / Fable a structural map of the live homepage so generated graphics fit the real page rhythm, section order, and component shapes.

**Live URL (dev):** `http://localhost:3000`  
**Source:** `components/heldi-homepage.tsx` · `app/page.tsx` · `app/globals.css`

**Screenshots:** See `screenshots/` — full-page and per-section captures at 1440×900 (desktop) and 390×844 (mobile).

---

## Page architecture (top → bottom)

```
┌─────────────────────────────────────────────────────────┐
│  NAV (sticky) — ink bg, gold text, 3px gold bottom    │
├─────────────────────────────────────────────────────────┤
│  HERO — marigold bg (#eda31d)                           │
│  ├─ Reveal intro (elephant video curtain → content)     │
│  ├─ White sticker card: lede + pouch + pronunciation   │
│  ├─ Waitlist form + "How it works" outline pill         │
│  ├─ TICKER band — ink bg, gold uppercase marquee        │
│  └─ DOUBLE RULE — two 3px ink lines                     │
├─────────────────────────────────────────────────────────┤
│  THE POUCH — cream bg (#f8f0de)                         │
│  ├─ H2 + body copy (centred, max 640px)                 │
│  ├─ 2×2 stat grid (gold + white sticker cards)          │
│  └─ 2×2 badge pills (lactose, sugar, gluten, veg)       │
├─────────────────────────────────────────────────────────┤
│  STIR GALLERY — ink bg (#011246), 3px top border        │
│  └─ Horizontal scroll of interactive dish cards         │
├─────────────────────────────────────────────────────────┤
│  HOW IT WORKS — cream bg                                │
│  └─ Centred 3-step vertical timeline with icons         │
├─────────────────────────────────────────────────────────┤
│  MENU GALLERY ("Tonight's table") — ink bg              │
│  └─ Horizontal scroll of 5 menu cards                   │
├─────────────────────────────────────────────────────────┤
│  AUDIENCE — marigold bg, 3px ink top border             │
│  └─ 3 sticker cards (FOR YOU / FAMILY / PARENTS)        │
├─────────────────────────────────────────────────────────┤
│  FAQ — cream bg, 3px ink top border                     │
│  └─ Accordion list, max-width 860px                     │
├─────────────────────────────────────────────────────────┤
│  FREE JAR — ink bg                                      │
│  ├─ Copy block (gold eyebrow)                           │
│  ├─ Dashed gold frame → white jar preview card          │
│  └─ Second copy block                                   │
├─────────────────────────────────────────────────────────┤
│  FINAL CTA — marigold bg, min-height ~410px             │
│  ├─ Small elephants (desktop only, bottom corners)      │
│  └─ Centred H2 + waitlist form                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER — ink bg, wordmark + copyright                  │
└─────────────────────────────────────────────────────────┘

Fixed overlay (mobile): floating "Join waitlist" pill, bottom-right
```

---

## Section reference

| # | ID | Background | Key component | Screenshot |
|---|-----|------------|---------------|------------|
| — | — | ink | `.nav` sticky header | (in hero shot) |
| 1 | `#top` | marigold | `.hero--reveal` | `screenshots/01-hero-desktop.png` |
| 2 | — | ink | `.ticker` marquee | `screenshots/02-ticker-desktop.png` |
| 3 | `#pouch` | cream | `.pouch-section` | `screenshots/03-pouch-desktop.png` |
| 4 | `#stir` | ink | `.stir-gallery` | `screenshots/04-stir-gallery-desktop.png` |
| 5 | `#how` | cream | `.how-it-works` | `screenshots/05-how-it-works-desktop.png` |
| 6 | `#thali` | ink | `.menu-gallery` | `screenshots/06-menu-gallery-desktop.png` |
| 7 | — | marigold | `.audience-gallery` | `screenshots/07-audience-desktop.png` |
| 8 | `#faq` | cream | `.faq` | `screenshots/08-faq-desktop.png` |
| 9 | `#jar` | ink | `.jar-layout` | `screenshots/09-jar-desktop.png` |
| 10 | `#join` | marigold | `.final-cta` | `screenshots/10-final-cta-desktop.png` |
| 11 | — | ink | `footer` | `screenshots/11-footer-desktop.png` |

Full page: `screenshots/00-full-page-desktop.png` · `screenshots/00-full-page-mobile.png`

---

## Navigation

**Desktop (≥900px):** Horizontal links + pill CTA on the right.

| Element | Style |
|---------|-------|
| Bar | `background: #011246`, `color: #eda31d`, `border-bottom: 3px solid #eda31d` |
| Logo | Ink-blue HELDI wordmark PNG, height 1.75rem |
| Links | Gelasio 0.9375rem, hover → cream |
| CTA | Gold pill button, ink text; hover → cream bg |

**Mobile (<900px):** Elephant badge replaces wordmark; burger opens full-width dropdown.

Nav links: `#pouch` · `#thali` · `#how` · `#faq` · `#join` (Join waitlist)

---

## Hero (live layout: `heroLayout="reveal"`)

The default homepage uses the **reveal hero**, not the video or classic split-flap layouts.

### Intro sequence (~4s first visit)

1. Full-width **marigold curtain** covers hero
2. Elephant run video plays on canvas (ink elephants + dust cloud, chroma-keyed gold bg)
3. Curtain fades; content animates in (showcase card → actions)

### Revealed hero structure

```
┌──────────────────────────────────────────────────────┐
│  ┌─ hero-reveal-showcase (white sticker card) ─────┐ │
│  │  "Protein Powder for"  │  [pouch image]          │ │
│  │  [DISSOLVE WORDS]      │                         │ │
│  │  /hel-dee/ adj. how my nani says "healthy."     │ │
│  └──────────────────────────────────────────────────┘ │
│  [ email input          ] [ Join waitlist ] [ How it works ] │
└──────────────────────────────────────────────────────┘
```

| Part | Font | Colour | Notes |
|------|------|--------|-------|
| "Protein Powder for" | Rozha One | ink | Fluid size via container query |
| Rotating words (DAL, CURRY…) | Rozha One | terracotta | Dissolve animation (blur + translateY) |
| Pouch | — | product photo | Right column of showcase card |
| Pronunciation | Gelasio italic | ink | Centred below card interior |
| Waitlist input | Gelasio | ink on cream | 2px ink border, 8px radius |
| Join waitlist | Gelasio 600 | gold on ink | Pill button |
| How it works | Gelasio 600 | ink | Outline pill |

**Showcase card CSS:** white bg · 3px ink border · 20px radius · `box-shadow: 8px 8px 0 #011246`

### Alternate hero layouts (not live by default)

| Layout | Prop | Description |
|--------|------|-------------|
| Video | `heroLayout="video"` | Wordmark + 16:9 hero film + lede below |
| Classic | `heroLayout="classic"` | Flanking elephants + split-flap or dissolve board |

---

## The Pouch section

Centred column, max-width 640px.

```
        H2: "Food you love. Nutrients you need."
        Body paragraph (brown, 1.125rem)

   ┌─────────────┐  ┌─────────────┐
   │  10g        │  │  90%+       │
   │  protein    │  │  whey       │
   │  per bowl   │  │  isolate    │
   │  (gold card)│  │  (white)    │
   └─────────────┘  └─────────────┘

   [ 99% lactose-free ] [ No added sugar ]
   [ Gluten free      ] [ Vegetarian     ]
```

Stat cards alternate gold (ink shadow) and white (gold shadow). Badge pills: white bg, 2px ink border, 4px offset shadow.

---

## Stir gallery (`#stir`)

Interactive horizontal rail on **ink background**. Each card:

```
┌─────────────────────────┐
│ Dal tadka      THE MAIN │  ← Rozha One name + pill tag
│      ╭───────╮          │
│      │ photo │ +10g     │  ← circular photo frame, gram counter
│      ╰───────╯          │
│        [ Stir it in ]   │  ← ink pill button
│   "Still tastes exactly │  ← italic caption
│    the same."           │
└─────────────────────────┘
```

- Cards alternate cream / marigold with matching offset shadows (same as menu cards)
- Card width: 280px fixed; rail scrolls horizontally on mobile
- Tap "Stir it in" → plays stir video in circle, counter increments, terracotta pop
- Max 2 tbsp per dish

Dishes: Dal tadka · Chana masala · Cucumber raita · Kadhi · Bowl of dahi

---

## How it works (`#how`)

Centred, max-width 36rem. Vertical timeline:

```
    (1)─── Cook like always
     │     Your dal, curry or raita, same as ever.
     │
    (2)─── Stir in a spoonful
     │     Stir straight into the pot, or at the table.
     │
    (3)─── Eat what you love
          The meal you grew up with, +10g protein.
```

- Gold circle icons (64px inner) with 2px ink vertical connector line
- Step titles: Gelasio 1.375rem; body: brown 1.0625rem
- Copy highlights (`.copy-emphasis`): ink on cream sections

---

## Menu gallery (`#thali`)

Five menu cards in horizontal scroller (desktop: wrapped grid at 900px+).

**Card anatomy (292–300px wide):**

```
┌──────────────────────────┐
│ LUNCH                    │  ← pill tag
│ The Weeknight Dinner     │  ← Rozha One 1.375rem
│ ═══════════════════════  │  ← double rule (7px)
│ TO START                 │
│ Papad & chutney ··· 2g   │  ← dotted leader + gram pill
│ THE MAIN                 │
│ Dal tadka ··· [9g gold]  │  ← Heldi-boosted = filled pill
│ ...                      │
│ FROM THE FOOD      18g   │
│ ┌ HELDI ADDED ──── 20g ┐ │  ← contrasting band
│ ON THE TABLE TONIGHT 38g │
└──────────────────────────┘
```

Schemes alternate:
- **Cream card:** cream bg, gold shadow `6px 6px 0 rgba(237,163,29,0.9)`
- **Marigold card:** gold bg, cream shadow `6px 6px 0 rgba(248,240,222,0.85)`

---

## Audience section

Marigold background, 3px ink top border. Three `.sticker-card` columns:

| Card | Eyebrow | Title |
|------|---------|-------|
| 1 | FOR YOU | Hit your protein target without another shake. |
| 2 | FOR THE FAMILY | One pouch, the whole table. |
| 3 | FOR PARENTS & GRANDPARENTS | Built for the way they already cook. |

Sticker card: cream bg · 3px ink border · 18px radius · `6px 6px 0 ink` · terracotta `+` bullets

---

## FAQ (`#faq`)

Max-width 860px, centred. Accordion with 2px ink horizontal rules.

- Question: Gelasio 600, clamp 1.0625–1.25rem
- Toggle glyph: Rozha One terracotta `+` / `–` at 1.75rem
- Answer: brown body, max-width 720px

---

## Free jar (`#jar`)

Ink section, centred column max 720px.

```
  WITH YOUR FIRST ORDER          ← gold eyebrow
  A jar for the table. On us.    ← cream H2

  ┌ - - - - - - - - - - - - - ┐  ← 2px dashed gold, 24px radius
  │ ┌─────────────────────┐   │
  │ │  jars + pouch photo │   │  ← white sticker card, 8px shadow
  │ └─────────────────────┘   │
  └ - - - - - - - - - - - - - ┘

  Silver or gold? That is a choice...   ← dark-muted body
```

---

## Final CTA (`#join`)

Marigold band, min-height 410px (desktop). Small ink elephants anchored bottom-left/right (hidden on mobile).

Centred:
- H2: "Be first to stir it in." — clamp 2.125–3.25rem
- Italic subline in warm dark `#2c2418`
- Waitlist form

---

## Footer

Ink bar, flex space-between. Gold-tinted wordmark (CSS filter) + muted copyright `#8a8378`.

---

## Responsive breakpoints

| Breakpoint | Behaviour |
|------------|-----------|
| ≥900px | Nav links inline; menu/audience cards wrap to grid; elephants visible; carousel dots hidden |
| ≤899px | Burger nav; hero showcase stacks lede/pouch side-by-side in card; floating CTA; elephants hidden |
| ≤560px | Full-width buttons; tighter hero padding |

---

## Global UI patterns

| Pattern | Where used |
|---------|------------|
| **Sticker card** | Hero showcase, stats, menu cards, stir cards, audience cards, jar preview |
| **Hard offset shadow** | All cards — never soft/blurred shadows |
| **Double rule** | Hero bottom, inside menu cards |
| **Eyebrow** | Section labels — uppercase, 0.22em tracking, terracotta or gold |
| **Copy highlight** | `<strong class="copy-emphasis">` — weight 600, colour shifts per section bg |
| **Pill button** | CTAs, tags, gram counts, badges |
| **Horizontal scroller** | Stir gallery, menu gallery, audience gallery (mobile) |

---

## Colour rhythm (section alternation)

```
marigold → ink (ticker) → cream → ink → cream → ink → marigold → cream → ink → marigold → ink
  hero     (in hero)    pouch   stir   how    thali  audience   faq    jar    join   footer
```

When generating section-specific graphics, match the section's background colour exactly — see `design-tokens.md`.

---

## Source file map

| UI area | Component | Styles |
|---------|-----------|--------|
| Page shell | `components/heldi-homepage.tsx` | `app/globals.css` |
| Stir gallery | `components/stir-gallery.tsx` | `.stir-gallery*` in globals.css |
| Menu cards | `components/menu-gallery.tsx` | `.menu-gallery*`, `.menu-card*` |
| Audience cards | `components/audience-gallery.tsx` | `.sticker-card`, `.audience-gallery*` |
| Copy emphasis | `components/copy-highlight.tsx` | `.copy-emphasis` |
| Fonts | `app/layout.tsx` | `--font-display`, `--font-body` |
