# Handoff: Heldi Homepage Redesign

## Overview
New marketing homepage for Heldi — a protein powder that dissolves into home-cooked Indian food (dal, curry, raita, dahi, chaat) instead of being drunk as a shake. This is a rebrand: the product line has been consolidated from three SKUs (Chai / Khana / Dahi) down to **one SKU**, and the homepage should focus entirely on that single pouch and its use across any gravy/dal/yoghurt-based dish. Tone is warm, playful, culturally specific (Desi household references — "nani", masala dabba, thali) and interaction-forward — this should feel like a fun, living page, not a static brochure.

## About the Design Files
The file in `design-reference/Heldi Home v2.dc.html` is a **design reference built in HTML** (a Design Component format specific to the design tool used to create it — it streams/renders via a small custom runtime, `x-dc`/`sc-for`/`sc-if` tags and a `DCLogic` class). **It is not production code and should not be copied as-is.** Treat it as a fully-specified prototype of layout, copy, color, type, and interaction — and reimplement it using the target codebase's existing frontend stack and component patterns (React, Vue, etc.), or the best-fit framework if the project is greenfield. The custom tags map cleanly to ordinary concepts: `sc-for` = a list `.map()`, `sc-if` = a conditional render, the `DCLogic` class's `state`/`renderVals()` = ordinary component state + derived render props.

You can open the `.dc.html` file directly in a browser to see it render (it self-bootstraps its own runtime), or read the README below, which documents everything needed to rebuild it independently.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and interaction behavior below are final-intent, not placeholder. Rebuild pixel-close using the codebase's existing design system for base primitives (buttons, inputs) but match the specific values called out here (this brand does not yet have an established system to defer to).

## Design Tokens

**Colors**
- Marigold (primary background / brand): `#eda31d`
- Ink (primary text / dark sections / borders): `#1a171b`
- Cream (card/section background): `#f8f0de`
- Terracotta (accent — numerals, links, small labels): `#a8432b`
- Muted brown (body copy on dark): `#b5ad9f`
- Muted grey-brown (secondary text): `#4a4238`, `#8a8378`
- Link default: `#1a171b`; link hover: `#a8432b`

**Typography**
- Display/headings: `'Rozha One', serif` (Google Font) — weight 400 only, used for all H1/H2, numerals, wordmark, split-flap letters
- Body/UI: `Gelasio, Georgia, serif` (Google Font, weights 400/500/600, has italic) — used for paragraphs, nav, buttons, labels
- No sans-serif anywhere; the whole page is serif, which is a deliberate brand choice
- Fluid type via `clamp()` throughout — e.g. hero H1 `clamp(38px,6vw,60px)`, section H2s `clamp(30px,4.5vw,44px)`

**Spacing / shape**
- Section padding: `clamp(56px,8vw,96px) clamp(20px,5vw,64px)` (roughly — varies slightly per section, see below)
- Content max-width: `1152px` for text sections, `1280px` for hero, `860px` for FAQ
- Border radius: `8px` (inputs/buttons), `18–24px` (cards), `999px` (pills/badges — fully rounded)
- Signature "sticker" shadow on cards: `box-shadow: 6px 6px 0 #1a171b` or `8px 8px 0 #1a171b` (hard offset shadow, no blur — not a soft drop shadow)
- Borders are thick and deliberate: `2px` or `3px solid #1a171b`, used as dividers and card outlines
- The wordmark ("HELDI") is always shown with a slight `skewX(-6deg)` italic-like lean, echoing the pouch logo treatment, often bracketed top/bottom by thick horizontal rules

## Assets
- `design-reference/assets/pouch.png` — product pouch photo/render (the new single-SKU packaging, marigund pouch with black elephant illustration and "Same Recipes / Same Taste / More Protein" copy). Source of truth for brand colors and the elephant motif.
- `design-reference/assets/elephant-large.png` — decorative Indian elephant line illustration (large, used flanking the hero, one instance mirrored via `transform:scaleX(-1)`)
- `design-reference/assets/elephant-small.png` — same illustration, smaller, used flanking the final CTA section
- These are final creative assets — bring them into the target codebase's asset pipeline as-is (don't regenerate).
- Client will supply additional final imagery (e.g. lifestyle/dish photography) as it becomes available. Current sections needing no imagery today (how-it-works, who-it's-for, FAQ) are copy-only by design, but keep them structured so a photo can be dropped in later without a layout rework.

## Screens / Sections
This is a single scrolling homepage. In order, top to bottom:

### 1. Nav (sticky)
- `position: sticky; top: 0`, marigold background, `3px solid #1a171b` bottom border, `z-index: 50`
- Left: "HELDI" wordmark, Rozha One 26px, skewed -6deg, bordered top/bottom with 3px black rules
- Right: nav links (The pouch, Tonight's table, How it works, FAQ) — 16px Gelasio, no underline — plus a solid pill CTA button "Join waitlist" (`#1a171b` bg, `#eda31d` text, `12px 26px` padding, fully rounded)
- Wraps to multiple lines on narrow viewports (`flex-wrap: wrap`)

### 2. Hero
- Marigold background. Layout: elephant illustration (left) — center content column (max 720px) — elephant illustration (right, mirrored on the left one only). **Elephants hide below ~900px viewport width** (see Responsive Behavior).
- Center column, all centered text:
  1. Large "HELDI" wordmark lockup (Rozha One, `clamp(58px,9vw,96px)`, skewed -6deg, thick 5px top/bottom rules) — **this is new**, added per user request to reinforce brand at the very top
  2. Pronunciation line in italic Gelasio: `/hel-dee/ — adj. how my nani says "healthy."` (pulled directly from the pouch packaging)
  3. H1: "Desi protein for" (Rozha One, `clamp(38px,6vw,60px)`)
  4. **Animated word board** (see Interactions & Behavior below) cycling through: INDIAN FOOD, DAL, CURRY, RAITA, DAHI, CHAAT
  5. Italic subline: "Never drink another protein shake again."
  6. Body paragraph (max-width 620px): explains the product — dissolves into dal/curry/raita/etc., same recipes/taste, more protein
  7. Email capture row: email input (cream bg, 2px black border, 8px radius) + solid "Join waitlist" button, max width 520px, wraps on narrow screens
  8. On submit, replaces with confirmation copy: "You're on the list — one email the day we launch."
- Bottom of hero: two horizontal rules (3px then 2px, small gap) as a graphic sign-off before the next section

### 3. Ticker (marquee)
- Full-width `#1a171b` band, single line, continuously scrolling left (see Interactions)
- Content (bullet-separated, uppercase, letter-spacing 0.24em, marigold text): MADE IN THE UK • FOR INDIAN KITCHENS • NO SHAKER, NO BLENDER • 100% VEGETARIAN • FREE JAR WITH YOUR FIRST ORDER • SAME RECIPES, SAME TASTE • LAUNCHING AUTUMN 2026
- Can be toggled off entirely (see Tweak/props below)

### 4. The Pouch (`#pouch`)
- Cream background. Two-column layout: product photo card (left, max 440px) — copy + stat grid (right)
- Photo card: white background, 3px black border, 20px radius, hard sticker shadow, contains `pouch.png`; the image gently bobs (see Interactions)
- Right column: eyebrow label "THE POUCH" (terracotta, uppercase, letter-spacing 0.22em) → H2 "Same recipes. Same taste. More protein." → body paragraph about the whey isolate blend → a responsive stat grid (auto-fit, min 150px columns) of 6 facts, each with a `2px solid` top rule as separator:
  - **10g** protein per bowl (this number is a live prop — see Tweaks)
  - **90%+** whey protein isolate
  - **99%** lactose-free
  - No added sugar
  - Gluten free
  - 100% vegetarian

### 5. Tonight's Table / Thali Builder (`#thali`, interactive centerpiece)
- Ink (`#1a171b`) background. Two-column: dish list (left) + sticky running-total card (right, max 360px)
- Left: eyebrow "PUT IT ON TONIGHT'S TABLE" → H2 "One pouch. Every dish with a gravy, a dal or a dahi." → supporting line → a list of 5 dishes, each row: dish name (Rozha One) + "Xg protein on its own" subcopy + a live gram count + a toggle pill ("+ Stir in Heldi" / "Heldi in · +10g")
  - Base dishes and their own-protein values: Dal tadka (9g), Chana masala (8g), Cucumber raita (3g), Bowl of dahi (5g), Aloo chaat (4g)
- Right: sticky card with dashed marigold border, 24px radius — shows a large animated running total in grams ("ON THE TABLE TONIGHT" / big number / "OF PROTEIN"), plus a small line showing how much of that came from Heldi
- **This is the single most interactive section of the page — see Interactions & Behavior.**

### 6. How it works (`#how`)
- Cream background. Centered H2: "No shaking. No blending. Ten seconds a bowl."
- 3-column grid (auto-fit, min 240px), each column: large terracotta numeral (1/2/3, Rozha One 34px) + bold subhead + short body copy, separated by a 2px top rule
  1. **Cook like always** — make your dal/curry/raita as usual
  2. **Stir in a spoonful** — "A spoonful, a splash of water, a quick stir into the bowl — or let everyone add their own at the table." (language deliberately says spoonful/stir, never "scoop")
  3. **Eat what you love** — same meal, now with {grams}g more protein per bowl

### 7. Who it's for
- Marigold background, top border 3px black. Centered H2: "Built for you. Made for the whole family."
- 3-column card grid (auto-fit, min 270px), each card: cream bg, 3px black border, 18px radius, sticker shadow. Eyebrow label, Rozha One subhead, and a bullet list (terracotta "+" markers):
  1. **FOR YOU** — "Hit your protein target without another shake." (20–30g across a meal, absorbs fast, zero change to food)
  2. **FOR THE FAMILY** — "One pouch, the whole table." (disappears into shared dishes, works for fussy eaters, no separate "healthy" cooking)
  3. **FOR PARENTS & GRANDPARENTS** — "Built for the way they already cook." (protein maintains muscle mass, 99% lactose-free, no recipe changes)

### 8. FAQ (`#faq`)
- Cream background, top border. Centered H2: "The questions we hear most."
- Accordion list, one open at a time, `+`/`–` glyph toggle (Rozha One, terracotta):
  1. Is whey protein vegetarian? → explains whey is the liquid from paneer-making, filtered/dried
  2. Will my food taste different? → blend uses spices already in the dish, no chalky film/aftertaste
  3. Do I cook with it or add it after? → add after cooking, spoonful + splash of water into a paste, or let people add their own
  4. Can I use it in dishes that are not on the pouch? → yes, anything gravy/dal/yoghurt-based (sambar, kadhi, korma, bhindi, chaat with dahi)
  5. Is it safe for parents and grandparents? → muscle-mass maintenance claim, 99% lactose-free, vegetarian, no added sugar/preservatives/gluten

### 9. Free Jar (`#jar`) — **new section**
- Ink background. Two-column: copy (left) + interactive lid-picker card (right, max 380px)
- Left: eyebrow "WITH YOUR FIRST ORDER" → H2 "A jar for the masala dabba. On us." → body: every first order ships with a refillable jar for the spice shelf, pick your lid at checkout
- Right: dashed marigold border card, "PICK YOUR LID" label, two selectable chips — **Gold** (gradient swatch `#f6d47c → #c98f1b`) and **Silver** (gradient swatch `#f4f4f4 → #9aa0a6`) — selecting one fills the chip solid marigold and shows a confirmation line ("Gold it is." / "Silver it is.")

### 10. Final CTA (`#join`)
- Marigold background, top border, `position: relative; overflow: hidden`
- Small elephant illustrations bottom-left and bottom-right (mirrored), hidden below ~900px
- Centered: H2 "Be first to stir it in." → italic line "One email the day we launch — and a free jar with your first order." → same email capture pattern as hero → same confirmation-on-submit state

### 11. Footer
- Ink background. Left: small skewed "HELDI" wordmark (marigold). Right: "© 2026 Heldi · Made in the UK · Desi protein for Indian food"
- Wraps on narrow screens

## Interactions & Behavior

**1. Hero animated word board (the centerpiece animation)** — two interchangeable modes, currently set to **split-flap** (a departure-board flip effect):
- Renders as a row of individual tiles (one per character), each tile a black rounded rect containing a marigold Rozha One character
- Cycles through the word list `INDIAN FOOD → DAL → CURRY → RAITA → DAHI → CHAAT → (loop)`
- To transition between words, every character position independently increments through the alphabet (` ABCDEFGHIJKLMNOPQRSTUVWXYZ`, wrapping) at a fixed tick rate (~75ms per step) until it lands on the target letter — so tiles land on their final letter at different times, like a real split-flap sign settling
- Each individual letter change plays a brief flip-in keyframe animation (a quick rotateX from -85deg to 0, ~90ms) so each tick visibly "flaps"
- Column count is fixed (11); the widest word (INDIAN FOOD) sets the max width, shorter words collapse trailing tile width/opacity/margin to 0 with a ~320ms transition, so the board visibly widens/narrows per word
- Dwell time on the first word (INDIAN FOOD) is longer (3200ms) than subsequent words (default 1700ms, tunable) before cycling to the next
- Tile size is responsive: smaller tile width/height/font below ~720px viewport width
- **Alternate mode ("dissolve")**: same word list, but instead of flipping letters, each new word's letters fade/blur in individually with a staggered delay (~55ms per letter) using an opacity+blur+translateY keyframe — evokes powder dissolving into liquid rather than a train-station board. Both modes exist behind a toggle; split-flap is currently selected but the client was unsure and asked to keep both available — confirm with the client which one ships, or expose it as a real user-facing option if desired.

**2. Scrolling ticker marquee** — a duplicated content block, animated via CSS `transform: translateX(-50%)` linearly over 30s, looped infinitely, creating a seamless continuous scroll (the classic marquee-via-doubled-content technique — the container has `overflow:hidden`, the inner flex row is exactly double-width, and translating by -50% loops seamlessly). Can be toggled on/off as a flag.

**3. Pouch photo bob** — subtle continuous idle animation: alternates `translateY(0) rotate(-1deg)` ↔ `translateY(-10px) rotate(1deg)` over 4.5s ease-in-out, infinite alternate — makes the product photo feel alive without being distracting.

**4. Thali builder (tap-to-add protein counter)** — the interactive core of the page:
- Each dish row has a toggle pill. Tapping it flips that dish's "Heldi added" boolean state
- The displayed per-row gram count updates immediately (base grams, or base + product grams-per-bowl when toggled on) and its color shifts from cream to marigold when active
- The big total counter (right-hand sticky card) animates from its old value to the new total using a manual requestAnimationFrame loop with cubic ease-out over ~550ms — not a CSS transition, because the number itself is being tweened digit-by-digit
- A caption below the total ("Tap a dish to stir Heldi in" / "+Ng from Heldi") reflects how much of the total is attributable to Heldi specifically
- The right-hand total card is `position: sticky` so it stays in view while scrolling the dish list

**5. FAQ accordion** — single-open accordion (opening one closes any other), `+` becomes `–` when expanded, answer fades in via normal DOM insertion (no special animation needed, but the codebase could add a max-height/opacity transition on open).

**6. Free jar lid picker** — two selectable chips, exactly one active at a time (radio-button behavior), active chip fills solid marigold with a border-color match, inactive chips show an outline-only marigold treatment. Selecting updates a small confirmation caption.

**7. Waitlist email capture (appears twice — hero and final CTA)** — clicking "Join waitlist" (no real validation/submission wired up in the prototype — this needs real form handling/API integration) flips local state to show a confirmation line beneath the input row: "You're on the list — one email the day we launch." Each instance (hero vs. final CTA) tracks the same shared "joined" state in the prototype; decide in implementation whether these should be a single shared success state or independent per-instance.

## State Management
Reimplement as ordinary component state (React `useState`/reducer or equivalent):
- `dishOn: boolean[5]` — which thali dishes have Heldi toggled on
- `displayTotal: number` — the currently-animated (tweened) total, driven by requestAnimationFrame from `dishOn`
- `faqOpen: number` — index of the currently expanded FAQ item, `-1` for none
- `joined: boolean` — whether the waitlist form has been submitted
- `jar: 'gold' | 'silver'` — selected free-jar lid color
- Split-flap board: `chars: string[11]` (current letter per tile, mid-transition), a `target` word being typed toward, and a tick interval driving per-character advancement — or, more simply in a real app, use a small reusable "SplitFlapText" component/library and pass it the current target word each cycle
- Viewport width tracked via a resize listener, to decide: hero elephants visible (≥900px) and split-flap tile size (narrow <720px) — in a real codebase, prefer CSS media queries/container queries over JS width tracking where possible

## Responsive Behavior
- Built mobile-first with `clamp()` for all major type sizes and section padding — no fixed breakpoint jumps for most text
- Nav wraps to a second line on narrow widths
- Hero: side elephant illustrations are **hidden below ~900px** viewport width (JS-driven `wideHero` flag in the prototype; implement as a CSS breakpoint, e.g. `display: none` under a `900px` media query, or `@container`)
- Hero/CTA email capture rows: `flex-wrap: wrap`, input `flex: 1 1 220px`, so button drops below input on narrow screens
- Split-flap tiles shrink (48px→30px wide, 68px→46px tall, 38px→24px font) below ~720px width
- Two-column sections (pouch, thali builder, free jar) use `flex-wrap: wrap` so columns stack on narrow viewports; the sticky total card in the thali builder should probably become non-sticky (or sticky within its own stacked block) on mobile — verify behavior once stacked
- Card grids (`who it's for`, pouch stat grid, how-it-works) use CSS Grid `auto-fit`/`minmax()` so column count reduces naturally rather than via explicit breakpoints

## Tunable Parameters (exposed as props/tweaks in the prototype)
These were exposed as designer-tunable "props" in the design tool — carry them forward as config/props/CMS fields as appropriate, not hardcoded values, since the client will likely want to adjust them:
- `grams` (number, default 10) — protein grams per bowl; feeds the pouch stat, the how-it-works step 3 copy, and the thali builder math. **This is currently a placeholder value — confirm the real number with the client before shipping.**
- `heroAnim` (`'split-flap' | 'dissolve'`) — which hero word-cycling animation style to use; client has not yet finalized this choice
- `flapDwellMs` (number, default 1700, client currently testing ~2200) — how long the split-flap board rests on each word before cycling to the next
- `tickerOn` (boolean, default true) — whether the scrolling ticker band renders at all

## Content/Copy Notes
- The gram values on the 5 thali-builder dishes (Dal tadka 9g, Chana masala 8g, Cucumber raita 3g, Bowl of dahi 5g, Aloo chaat 4g) are **illustrative placeholders** — replace with real per-dish protein values before shipping.
- Language deliberately avoids "scoop" — always "spoon"/"spoonful"/"stir" throughout (this was a client-requested correction from an earlier draft).
- Brand line "how my nani says 'healthy'" and "Same Recipes / Same Taste / More Protein" are pulled verbatim from the physical pouch packaging (`assets/pouch.png`) — keep consistent with packaging if it changes.
- Historical note for context only: an earlier version of this product (and an earlier PDF-based homepage draft) had three SKUs — Chai / Khana / Dahi — each with its own protein dose (3g/10g/20g) and its own preparation method. **That three-SKU structure has been fully retired**; this homepage reflects the current single-SKU product and should not reference multiple pouches/blends/flavors.

## Files
- `design-reference/Heldi Home v2.dc.html` — the full design reference (open directly in a browser to view/interact with it)
- `design-reference/assets/pouch.png` — pouch packaging photo (brand source of truth)
- `design-reference/assets/elephant-large.png` — large elephant illustration (hero)
- `design-reference/assets/elephant-small.png` — small elephant illustration (final CTA)
