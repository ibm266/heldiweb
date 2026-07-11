# Handoff: Heldi "Stir it into everything" Gallery Section

## Overview
A mobile-first interactive website section for the Heldi homepage (single-SKU protein powder for Indian home cooking). It presents a horizontally swipeable gallery of five home-cooked dishes. Each dish shows its protein content; tapping "Stir in a spoonful" adds Heldi to that dish — a particle burst animates powder falling into the bowl, the per-dish gram counter increments, a playful caption cycles, and a running "TOTAL PROTEIN ON THE TABLE" band at the bottom of the section ticks up. Users can keep stirring indefinitely.

Message being sold: the dish never changes — only the protein number does. "Same recipes. Same taste. More protein."

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to copy directly. Recreate this design in your target codebase's existing environment (React, Next.js — the live Heldi site is Next.js) using its established patterns. The prototype file `Stir Gallery v2.dc.html` contains all markup (inline-styled) and a logic class with the complete interaction model; treat it as the source of truth for values and behavior.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows and copy are final and match the live Heldi design tokens (`app/globals.css`). Recreate pixel-perfectly. The only placeholders are the five dish photos (circular image slots) — replace with real photography: warm-graded, top-down bowls, real UK Desi home-kitchen styling. Do NOT use illustrations/cartoons for food.

## Screens / Views

### Stir Gallery section (one view, mobile 390px design width)
Container: cream `#f8f0de` section. (The prototype wraps it in a 390px rounded panel with a 3px ink border + `8px 8px 0` shadow for presentation; in production this is a full-width homepage section on cream — drop the outer panel chrome.)

Top-to-bottom structure:

1. **Header** (centered, padding 30px 24px 0)
   - Eyebrow: `PUT IT ON THE TABLE` — Gelasio 600, 12px, letter-spacing 0.22em, terracotta `#a8432b`, uppercase.
   - H2: `Stir it into everything.` — Rozha One 400, 30px (scale up with `clamp(2rem, 4.5vw, 3rem)` on larger viewports), line-height 1.12, ink `#011246`.
   - Body: `Every dish on tonight's table takes a spoonful. Keep stirring. Nothing changes but the number.` — Gelasio 400, 14px, line-height 1.55, brown `#4a4238`.

2. **Swipe hint row** (padding 14px 24px 6px, right-aligned)
   - `swipe the table →` — Gelasio 600 italic, 12px, terracotta `#a8432b`. No arrow buttons — navigation is swipe + dots only.

3. **Card rail** — horizontal scroll, `display:flex; gap:16px; overflow-x:auto; scroll-snap-type:x mandatory; padding:4px 24px 20px;` scrollbars hidden (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`). Rail must be `position:relative` if you use offsetLeft math (see Interactions).

4. **Dish cards** (5 of them, `flex:0 0 280px; scroll-snap-align:center`)
   - Border 3px solid ink, radius 18px, padding 18px 18px 16px, column flex centered.
   - Alternating schemes (per brand menu-card pattern):
     - Even cards (1st, 3rd, 5th): cream bg `#f8f0de`, gold shadow `6px 6px 0 rgba(237,163,29,0.9)`.
     - Odd cards (2nd, 4th): marigold bg `#eda31d`, cream shadow `6px 6px 0 rgba(248,240,222,0.85)`.
   - **Card header row** (space-between): dish name — Rozha One 19px ink; tag pill (`THE MAIN` / `ON THE SIDE`) — 2px ink border, radius 999px, padding 2px 9px, Gelasio 600 10px ink.
   - **Dish photo**: 190×190px circle, 3px ink border, overflow hidden, marigold fallback bg. Real photo, object-fit cover.
   - **Spoonful badge** (when spoonfuls > 0): absolutely positioned top-right of the circle (-6px, -6px), ink bg, gold text `#eda31d`, radius 999px, padding 4px 11px, Gelasio 600 12px. Text: `1 spoonful` / `N spoonfuls`.
   - **Gram counter**: Rozha One 52px, line-height 1, margin-top 14px. Ink `#011246` at base; terracotta `#a8432b` once boosted. Label below: `protein in this bowl` — Gelasio 12px brown.
   - **Stir button**: ink bg, gold text, 3px ink border, radius 999px, padding 10px 22px, Gelasio 600 14px, shadow `4px 4px 0 rgba(1,18,70,0.25)`. Label: `Stir in a spoonful` → `Stir in another` after first tap.
   - **Caption line**: min-height 36px (reserve space), margin-top 10px, Gelasio 600 italic 13px ink, centered, line-height 1.35.

5. **Pagination dots** (centered row, gap 7px, padding-bottom 16px)
   - 10px circles, 2px ink border; active dot filled ink, inactive transparent. Each dot is a button that scrolls its card to center.

6. **Totals band** (full-width, ink `#011246` bg, padding 14px 22px, flex space-between)
   - Label: `TOTAL PROTEIN ON THE TABLE` — Gelasio 600, 11px, letter-spacing 0.16em, gold `#eda31d`, `white-space:nowrap`.
   - Value: one single number — Rozha One 36px, cream `#f8f0de`, `white-space:nowrap`. It must never wrap or stack; it updates in place.

### Dish data
| Dish | Tag | Base protein |
|------|-----|--------------|
| Dal tadka | THE MAIN | 9g |
| Chana masala | THE MAIN | 8g |
| Cucumber raita | ON THE SIDE | 3g |
| Kadhi | THE MAIN | 7g |
| Bowl of dahi | ON THE SIDE | 5g |

Base table total: 32g. Each spoonful adds **10g** (make this a config constant; product team may confirm final grams before launch).

### Caption lines (cycle in order per dish, index = (spoonfuls − 1) mod length)
1. One spoonful in. Nothing changes but the number.
2. Still tastes exactly the same.
3. Going back for more? Good.
4. Okay beta, that's plenty.
5. Nani is impressed.
6. Save some for the raita.
7. A very strong bowl indeed.
8. Even mama approves of this one.
9. The dal did not even notice.
10. At this point, keep the jar on the table.

Copy rules: no em dashes anywhere; never say "scoop" (always spoon/spoonful/stir); warm nani/beta/mama voice is intentional.

## Interactions & Behavior

- **Stir tap**: increments that dish's spoonful count (unbounded — users can keep stirring).
  - Gram counter updates: `base + spoonfuls × 10`.
  - Counter color flips ink → terracotta once boosted.
  - **Pop feedback**: counter and grand total scale to 1.15/1.12 then back, `transform 0.25s ease` transition (not a keyframe re-mount — re-mounting keyed nodes caused duplicate stacked numbers in earlier prototypes; update the number in place).
  - **Particle burst**: 12 small dots (7px, cream fill, 1px ink border) fall from the top of the photo circle, `translateY(-8px → 110px)` with scale 1→0.4 and fade, 1.2s ease-in, staggered delays 0–0.7s, spread across the circle width. Burst container renders for 1.3s after each tap, then unmounts (retap resets the timer).
  - Caption cycles to the next line each tap.
  - Totals band value = 32 + (total spoonfuls across all dishes × 10), ticks up in place with the pop scale.
- **Gallery navigation**: native swipe with mandatory center snap; dots are clickable.
  - Programmatic scroll must center the actual card: `target = card.offsetLeft − (rail.clientWidth − card.offsetWidth) / 2` with `rail.scrollTo({left, behavior:'smooth'})`. **Do not hardcode a stride** and do not use `scrollIntoView`. The rail needs `position:relative` for offsetLeft to be rail-relative.
  - Active dot: on scroll, pick the card whose center is nearest the rail's viewport center. Suppress this handler during programmatic scrolls (flag + ~900ms timeout) so smooth scrolling isn't interrupted.
- **Reduced motion**: `prefers-reduced-motion: reduce` → effectively disable particle/pop animations.

## State Management
- `spoons: number[5]` — spoonfuls per dish (source of truth for all derived numbers).
- `active: number` — current gallery index (dots).
- `burstAt: number` — dish index currently showing a particle burst (−1 none); cleared by 1300ms timeout.
- `popping: boolean` — drives the 250ms scale pop on counters.
- No data fetching. All values derived: per-dish grams, badge text, caption, total.

## Design Tokens
- Marigold `#eda31d` · Ink `#011246` · Cream `#f8f0de` · Terracotta `#a8432b` · Brown `#4a4238`
- Never use black `#000`; never soft Gaussian shadows — hard offset shadows only (`4px 4px 0`, `6px 6px 0`, `8px 8px 0`).
- Fonts (Google Fonts): Rozha One 400 (display/numerals), Gelasio 400/500/600 + italic (everything else). No sans-serif.
- Radii: cards 18px, pills/buttons 999px, section panel 24px.
- Borders: 3px ink (cards, photo circle, buttons), 2px ink (pills, dots).

## Assets
- Dish photos: not included — supply 5 real photos (top-down bowls, warm grade, UK Desi home kitchen). Circular crop, 190×190 display size (serve 2x).
- No logos/icons required in this section. Fonts from Google Fonts.

## Files
- `Stir Gallery v2.dc.html` — the interactive prototype (markup with inline styles + logic class at the bottom of the file). Open in a browser to test behavior.
- `image-slot.js` — prototype-only helper for the photo placeholders; not needed in production.
- `generation-prompts.md` — ready-to-use prompts for the five hyper-realistic dish photos and the full animation spec (timings, easings, keyframes).
