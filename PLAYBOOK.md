# Heldi build playbook

BRAND.md says what Heldi is and what the rules are. This file says **how to build
here without breaking anything**: the responsive contract, the code conventions, the
blessed components, step-by-step recipes for the common jobs, and the accessibility
bar. It is written for any model or person new to the repo. When this file and the
code disagree, the code wins; fix this file in the same change.

**The finishing gate for every change** (memorise this, it closes every recipe):

```
npm run brand-lint && npm run typecheck && npm run build
```

then view the change in the browser **at a phone width AND a wide width** (see §1.6),
run the BRAND.md §14 checklist, and, if you touched a product fact, the §11 impact map.

---

## §1 Both screens, always (the priority)

Heldi is built mobile-and-desktop **together, as two deliberate designs sharing one
DOM**. Mobile is not the desktop squeezed; desktop is not the phone stretched. Most
review traffic for a desi food brand is phones (WhatsApp, Instagram), while the
founder demos on a laptop, so neither width is "the real one". Any new section that
looks considered at only one width is not done.

### 1.1 The sizing model

1. **Fluid first.** Type, padding and gaps scale with `clamp()` between widths
   (`h2: clamp(2rem, 4.5vw, 3rem)`, section padding `clamp(3.5rem, 8vw, 6rem)`).
   Fluid sizing carries a section across most widths with zero media queries.
2. **One structural breakpoint.** Layout changes shape at **`max-width: 899px` /
   `min-width: 900px`** and only there. Do not invent new structural breakpoints.
3. **Fine-tune queries are local.** A component may fine-tune at other widths
   (560, 600, 420 exist) or at short heights, but only to polish its own interior,
   never to restructure the page.
4. **Wide screens vary in height too.** The hero tightens under
   `(min-width: 900px) and (max-height: 900px)` and `(max-height: 820px)` so short
   laptop windows still show the fold. If your section is above the fold, check a
   1280×700 window as well as a tall one.
5. **Caps keep wide screens composed.** Content max-widths do the desktop design:
   1152px (standard), 920px (hero columns), 860px (FAQ), 640px (story prose),
   36rem (how-it-works). Never let running text pass ~65 characters a line.
6. **Text that must fit a box uses container queries**, not viewport units: the
   hero lede sets `container-type: inline-size` on its column and sizes with `cqw`
   (`clamp(0.72rem, 9.5cqw, 3.9rem)`). Copy that pattern for any headline that
   lives inside a card.

### 1.2 What actually changes at 900px (learn from the live swaps)

| Surface | ≤899px | ≥900px |
|---|---|---|
| Nav | burger button + slide-down sheet (`.nav-links--mobile`), cart pinned right | floating white card with inline links (`.nav-links--desktop`) |
| Homepage CTA | floating pill bottom-right, suppressed while a CTA section is on screen (IntersectionObserver) | none; inline CTAs suffice |
| Menu / audience galleries | horizontal **snap rail**: `overflow-x: auto` + `scroll-snap-type: x mandatory`, edge-bleed negative margins, dots underneath | centred grid, dots hidden |
| Hero showcase | compact two-column card (copy beside pouch), attribute pills hidden, pronunciation moves into the card foot, actions become a grid below | wide card: copy + pouch columns, pills row, actions inline |
| Heldi vs shaker | scorecard (ticks) + stacked detail cards, a different information design | single comparison table |
| How it works | its own H2 ("No shaking. No blending. More protein.") | a different H2 and lede |

The lesson in that last row: at phone width you may change **the copy itself**, not
just the boxes. Decide per section what the phone reader needs first.

### 1.3 Hard rules for anything new

1. **Write the two-line spec before coding.** "Mobile: X. Desktop: Y." If X is
   "same but narrower", challenge it: stack, rail, shorten, or drop elements
   deliberately. Put the spec in the PR/commit description.
2. Structure with flex/grid and `gap`; size with `clamp()`, `%`, `fr`, and
   max-widths; reach for `@media` only when the structure itself must change.
3. Mirror the breakpoint in JS exactly as the nav does when behaviour must switch:
   `window.matchMedia("(max-width: 899px)")` with a change listener. CSS and JS
   must never disagree about where mobile ends.
4. **Four or more cards means a snap rail on mobile** (recipe in §1.5) and a grid
   on desktop. One to three cards may simply wrap and centre.
5. **Touch targets**: interactive chips and buttons keep a box of at least 36px
   (`min-width`/`min-height`, as `.menu-card__variant-chip` does); text inputs go
   full-width on mobile. Hover-only affordances (tooltips, reveals) must be gated
   behind `@media (hover: hover) and (pointer: fine)` and need a tap alternative.
6. **The page never scrolls sideways.** Anything wider than the viewport gets its
   own `overflow-x: auto` container (rails, tables).
7. Every `next/image` gets a `sizes` attribute that mirrors the real layout at both
   widths, e.g. the hero pouch: `(max-width: 899px) 52vw, (max-width: 1280px) 320px, 420px`.
8. Order flips (image left on desktop, above on mobile) are done with grid/flex
   placement in CSS, never by duplicating DOM. Duplicated DOM variants (the
   comparison section, nav link lists) are the exception, cost double maintenance,
   and need a comment saying both copies must change together.

### 1.4 Fine print that makes mobile feel native here

- Edge-bleed rails: the scroller cancels the section padding with negative margins
  (`margin: 0 calc(-1 * clamp(1.25rem, 5vw, 4rem))`) so cards run to the screen
  edge, then restores breathing room with its own padding.
- Scrollbars on rails are hidden (`scrollbar-width: none` + `::-webkit-scrollbar`),
  dots + swipe hint (`swipe the table →`, `aria-hidden`) carry the affordance.
- `-webkit-tap-highlight-color: transparent` is global; feedback comes from the
  component's own active state, not the grey flash.
- `@supports not (scroll-snap-type: x mandatory)` falls back to wrapping cards.

### 1.5 The snap-rail recipe (copy-paste)

JSX shape (see `components/audience-gallery.tsx` for the full version with
reduced-motion handling):

```tsx
<div className="thing-gallery__scroller" ref={scrollerRef} onScroll={handleScroll}>
  {ITEMS.map((item) => (
    <article className="thing-card" key={item.id}>…</article>
  ))}
</div>
<div className="thing-gallery__dots" role="tablist" aria-label="Things">
  {ITEMS.map((item, i) => (
    <button key={item.id} type="button" role="tab" aria-selected={i === active}
      aria-label={`Card ${i + 1} of ${ITEMS.length}`} onClick={() => scrollToCard(i)} />
  ))}
</div>
```

CSS shape:

```css
.thing-gallery__scroller {
  display: flex;
  gap: 12px;
  margin: 0 calc(-1 * clamp(1.25rem, 5vw, 4rem));
  padding: 0.25rem clamp(1.25rem, 5vw, 4rem) 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.thing-gallery__scroller::-webkit-scrollbar { display: none; }
.thing-card { flex: none; width: 292px; scroll-snap-align: center; }

@media (min-width: 900px) {
  .thing-gallery__scroller {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0; padding: 0; overflow: visible; scroll-snap-type: none;
  }
  .thing-gallery__dots { display: none; }
}
```

### 1.6 How to verify both widths

With the in-app browser: `resize_window` presets **mobile (375×812)** and
**desktop (1280×800)**, plus a wide pass at 1600 and a short pass at 1280×700 for
above-the-fold work. In devtools: the same four. Check at each width: nothing
clipped, no sideways page scroll, tap targets comfortable, headline lines break
where intended, images sharp (right `sizes`). Screenshot both for the summary.

---

## §2 Code conventions

- **All CSS lives in `app/globals.css`.** No Tailwind, no CSS modules, no
  styled-components, no `<style jsx>`. Append new blocks next to related ones and
  head them with a `/* ---------- Section name ---------- */` comment like the file
  already does. Inline `style={}` only for values genuinely computed at runtime
  (animation delays, progress widths).
- **Naming is BEM-ish**: `.block__element--modifier` (`.menu-card__dish--heldi`).
  One block prefix per component; never style bare tags inside components.
- **Colours only via the tokens** (`var(--gold)` etc., BRAND.md §8.1). Alphas via
  `rgb(var(--ink-rgb) / 32%)`. The lint hard-fails literal `#000`.
- **Pages are server components**: `app/<route>/page.tsx` holds metadata (title
  `"Page · Heldi"`, description in voice, `alternates: { canonical }`), JSON-LD
  where relevant, and composition. Anything with state/effects is a `"use client"`
  component under `components/`.
- **Copy is data.** Repeated or listy copy lives in typed const arrays either at
  the top of the component or in a sibling `*.ts` file (`home-faqs.ts`,
  `MENUS`, `AUDIENCES`). Strings a lesser model must find later should not be
  buried mid-JSX.
- TypeScript is `strict`; use named exports; type props inline.
- Images: `next/image` with `sizes` always; `priority` only for true LCP (BRAND.md
  §15.4); brand assets via the ink-blue variant helper (`imageSrc()` pattern) and a
  `?v=` bump on regeneration; raw `<img>` is banned (lint warns).
- Interactivity follows the house patterns: `matchMedia` mirrors, focus traps,
  Escape-to-close, `prefers-reduced-motion` checks (§5).
- New npm dependencies need a written case (BRAND.md §15.4). The client currently
  ships React + Next and nothing else; keep it that way.

## §3 Blessed components: use these, do not reinvent

| Job | Reach for | Lives in |
|---|---|---|
| Inline emphasis in copy | `<CopyHighlight>` | `components/copy-highlight.tsx` |
| Primary CTA that must respect waitlist vs live | `<WaitlistOrShopCta />` (subpages) / `WaitlistForm` (homepage) | `components/waitlist-or-shop-cta.tsx` |
| Subpage chrome | `<SubpageNav />` + `<SubpageFooter />`, first section gets `data-nav-hero` | `components/subpage-nav.tsx` |
| Section label | `.eyebrow` (`--gold` variant on ink) | globals.css |
| Feature/benefit card | `.sticker-card` | globals.css |
| Stat pair | `.pouch-stat--gold` / `--white` | globals.css |
| Menu with dishes + grams | `.menu-card` anatomy (tag, title, rule, courses, leaders, gram pills, heldi band, table total) | `components/menu-gallery.tsx` + globals |
| Receipt-style list with a punchline row | `.story-menu-card` (+ `__gap` band) | globals.css |
| Tappable filter/reveal chips | `.truth-chip` (+ `--dark`), radio semantics | `components/truth-page.tsx` |
| Purchase options | `.option-card` with real `<input type="radio">` | `components/shop/buy-box.tsx` |
| Accordion | the `faq-list` / `pdp-accordion` button pattern (§5) | homepage / `product-accordions.tsx` |
| Social proof | `<ReviewsSection tone=… heading=…>` | `components/reviews/reviews-section.tsx` |
| Gifting/discount anything | `GiftingBand`, `GiftingPopup`, `GiftingCodePicker` | `components/shop/` |
| Section sign-off / seam | `.double-rule`, `.section--bordered` | globals.css |
| Text link with momentum | `.pill-link` (+ `--dark` on ink) | globals.css |
| Marquee | `.ticker` + `.ticker-track` | globals.css |

Render reference for all of these: `docs/brand/specimen.html`. Recipes for the
shapes: BRAND.md §8.4. If the content job genuinely matches none of them, §R6.

## §4 Recipes

Every recipe ends with the finishing gate from the top of this file.

### R1 · Add a homepage section

1. Define the job and voice (BRAND.md §3, §4), then the two-line responsive spec
   (§1.3.1).
2. Pick the ground colour by continuing the alternation. Current order on `/`:
   gold hero + ink ticker → cream pouch → ink stir → cream how → ink gifting →
   gold truth → ink thali → gold audience → ink vs-shaker → cream reviews →
   gold founder → cream faq → ink jar → gold final CTA → ink footer. Slot in
   without creating two same-ground neighbours; copy the seam treatment
   (`.section--bordered` or nothing) from the nearest identical transition.
3. Scaffold inside the `return` of `components/heldi-homepage.tsx`:

```tsx
<section className="section section--ink my-thing" id="my-thing">
  <div className="content">
    <p className="eyebrow eyebrow--gold">MY EYEBROW</p>
    <h2>Two beats. Then the point.</h2>
    <p className="my-thing__lede">
      One short lede with a single <CopyHighlight>emphasis</CopyHighlight>.
    </p>
    {/* cards / interactive content */}
    <a className="pill-link pill-link--dark" href="/somewhere">
      Read more &#8594;
    </a>
  </div>
</section>
```

4. Append a commented CSS block to `app/globals.css` using your block prefix, with
   the mobile structure in the same block (see §1.5 shapes).
5. Images through `next/image` + `sizes`; icons/illustrations in ink only.
6. If the section should be reachable from the nav, that is a separate decision:
   R5.

### R2 · Add a subpage

1. Create `app/<route>/page.tsx`:

```tsx
import type { Metadata } from "next";
import { CopyHighlight } from "@/components/copy-highlight";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { WaitlistOrShopCta } from "@/components/waitlist-or-shop-cta";

export const metadata: Metadata = {
  title: "My page · Heldi",
  description: "One sentence in voice, not keyword salad.",
  alternates: { canonical: "/my-page" }
};

export default function MyPage() {
  return (
    <main>
      <SubpageNav tone="cream" />
      <section className="section section--cream story-hero" data-nav-hero>
        <div className="story-hero__inner">
          <p className="eyebrow">MY PAGE</p>
          <h1 className="story-hero__title">The claim, stated plainly.</h1>
          <p className="story-hero__lede">Lede with one <CopyHighlight>emphasis</CopyHighlight>.</p>
        </div>
      </section>
      <div className="double-rule" aria-hidden="true" />
      {/* alternating sections; reuse story-copy / story-pull / story-menu-card */}
      <section className="final-cta section--bordered story-final">
        <div className="final-cta-copy">
          <h2>Closing line.</h2>
          <WaitlistOrShopCta />
        </div>
      </section>
      <SubpageFooter />
    </main>
  );
}
```

2. Register the route in `app/sitemap.ts` with a priority matching its peers.
   Add an `opengraph-image.tsx` beside `page.tsx` (copy any existing one; it is
   ~12 lines over `components/og/card.tsx`) so shared links render branded.
3. Add the nav link in **four places** (desktop + mobile lists in both
   `components/heldi-homepage.tsx` and `components/subpage-nav.tsx`), or decide
   explicitly that it is footer-only (`FooterLegal`).
4. Consider JSON-LD (FAQPage if it hosts FAQs, Article for editorial).
5. Educational pages want question-shaped H2s (BRAND.md §5) for AI citability.

### R3 · Add or edit a FAQ

1. Choose the file: homepage surface → `components/home-faqs.ts`; truth page →
   `components/truth-faqs.ts`; FAQ page only → the right group in
   `components/site-faqs.ts`.
2. `site-faqs.ts` imports shared questions **by exact question string** via
   `pick()`. Renaming a question in home/truth files without updating the `pick()`
   call breaks the build (that is the safety net, not a bug).
3. Answer style: first sentence answers the question; 2 to 5 sentences; medical
   topics hand off to a GP/dietitian; optional `more` link. Voice A.
4. Schema updates itself (the FAQPage JSON-LD maps over these files). Never
   hand-write FAQ schema.

### R4 · Add a Heldi Living post

1. Write the piece with the **heldi-blog-writer** skill (it owns structure and
   voice for posts).
2. Mechanics: add `content/heldi-living/<slug>.html` (an `<article>` body; an
   optional `<div class="heldi-faq">` block of h3+p pairs is auto-extracted into
   FAQ schema) and an entry in `content/heldi-living/posts.json` matching
   `HeldiLivingPostMeta` in `lib/heldi-living.ts`: `slug`, `title`, `tags`,
   `summary` (2 to 3 bullets), `description`, `image`, `publishedAt`
   (ISO or null), `htmlFile`, `order`, plus `recipe` metadata for recipe posts
   (drives Recipe JSON-LD).
3. Hero image to BRAND.md §15 budget (WebP, ≤400KB) in
   `public/images/heldi-living/`.
4. Sitemap picks the post up automatically via `lib/heldi-living.ts`. No em
   dashes in the HTML; the lint scans `content/`.

### R5 · Add a nav destination

Update all four link lists (two in `heldi-homepage.tsx`, two in
`subpage-nav.tsx`), keep order identical, add to `app/sitemap.ts`, and check the
nav still fits at 900 to 1100px wide (the card wraps badly when links overflow;
that width band is the tight spot). Anchors (`/#how`) work from subpages only with
the leading slash.

### R6 · New component style

Only after §3 has no match. Pick a block name, append a commented block to
`app/globals.css` near its relatives, build both widths (§1), use tokens and the
shape language (BRAND.md §8.4: 3px ink borders, hard offset shadows, 999px pills,
16 to 20px card radii). Then **add a demo of it to `docs/brand/specimen.html`**
with a class-name caption, so the board stays the complete inventory. Run the
lint; run both-width checks.

## §5 Accessibility house rules (the bar the codebase already sets)

- **Real elements**: `<button>` for actions, `<a>` for navigation, real
  `<input type="radio">` inside selectable cards (`.option-card` pattern), labels
  attached (visible or `.sr-only`).
- **Accordions**: `h3 > button` with `aria-expanded` + `aria-controls`, content
  hidden via the `hidden` attribute, +/– glyph `aria-hidden`.
- **Chip groups**: selection = `role="radiogroup"` / `role="radio"` +
  `aria-checked` (truth chips); toggles = `aria-pressed` (gifting picker).
- **Live updates**: `aria-live="polite"` on counters/meters/captions;
  `role="status"` on success messages; `role="alert"` on rejections.
- **Overlays** (drawer, popups): `role="dialog"` + `aria-modal`, focus moved in on
  open, Tab trapped inside, Escape closes, body scroll locked, backdrop click
  closes (see `cart-drawer.tsx`, the reference implementation).
- **Decorative media**: empty `alt` + `aria-hidden` (elephants, icons, leader
  dots). Meaningful images describe dish + Heldi context. Icon-only buttons get
  `aria-label` ("One pouch fewer").
- **Focus ring**: 3px white (terracotta on inputs), offset 3. Never remove or
  restyle it away; on new dark surfaces confirm the ring is visible.
- **Reduced motion**: every animation, autoplaying video, and smooth scroll checks
  `prefers-reduced-motion` (CSS block and/or the `matchMedia` mirror the galleries
  use). Videos pause; curtains skip; scrolls jump.
- **Tables**: real roles (`role="table"/row/cell"`) with `sr-only` column headers
  when headers are visual (comparison section).

## §6 Where things live

Repo map and placement rules: BRAND.md §16. Facts and their single sources:
BRAND.md §10. What to update when a fact changes: BRAND.md §11. Assets: §15.
Visual reference: `docs/brand/specimen.html` (served by the `repo-static` launch
config, or any static server at the repo root). Dev server: the `heldi-dev`
launch config (`npm run dev`).

## §7 Analytics: keep the journey wired

The site tracks the customer journey with PostHog EU behind `lib/analytics.ts`.
A pinned PostHog dashboard ("Heldi: the customer journey") and the Shopify
checkout stitching depend on exact names in this codebase, so casual edits can
silently blind the analytics. Rules, in order of how likely you are to hit them:

1. **Adding a section or page needs no analytics work.** Pageviews and clicks
   are captured automatically. Only add a `track()` call for a genuinely new
   conversion moment (a new form, a new buy path), named in `snake_case` with
   flat string/number/boolean props.
2. **Never import `posthog-js` in a component.** Components call `track()` from
   `lib/analytics.ts` and nothing else. Consent handling, initialisation and
   the PostHog instance live in that one file.
3. **These event names and props are load-bearing** (the PostHog funnels and
   dashboard reference them exactly): `view_item`, `add_to_cart`,
   `begin_checkout`, `waitlist_signup` (+ `placement`), `tier_selected`
   (+ `tier`), `purchase`, `checkout_started`, `consent_updated`,
   `gifting_discount_applied`, and the `first_touch_*` and `gifting_audience`
   props. Renaming one breaks a dashboard tile with no build error. If a
   rename is truly needed, update the insight in PostHog in the same sitting.
3b. **If you move or rewrite a component that carries a `track()` call**
   (buy-box, cart-drawer, WaitlistForm, gifting components, review form),
   carry the call over unchanged. Grep the old file for `track(` before
   deleting it.
4. **The checkout button in `cart-drawer.tsx` is special.** Its click handler
   fires `begin_checkout` and writes the `_heldi_ph_id` / `_heldi_ph_session`
   / `_heldi_utm` cart attributes that stitch the storefront journey to
   Shopify checkout (via `lib/checkout-handoff.ts`). If you restyle or move
   it, keep the handler, keep `window.location.assign` outside the try, and
   keep the 1200ms timeout race. The Shopify custom pixel and the orders
   webhook (`app/api/webhooks/shopify-orders/`) read those exact attribute
   keys.
5. **Consent gates everything.** The modal (`components/consent-modal.tsx`)
   and the panel on /legal/cookies write `heldi_consent_v1`; `lib/consent.ts`
   is the only reader/writer. Never rename that key (it re-prompts every
   visitor), never track around a refusal, and any future ad pixel must check
   `hasConsent("marketing")` before loading anything.
6. **Never let PostHog load or inject external scripts.**
   `disable_external_dependency_loading: true` in `lib/analytics.ts` is
   load-bearing: script injection lands beside the JSON-LD tags and corrupts
   hydration. The replay recorder stays a lazy import of
   `posthog-js/dist/posthog-recorder` (not `dist/recorder`, which the SDK
   ignores). No `<Script src="...analytics...">` anywhere, ever.
7. **Do not touch the plumbing in `next.config.ts`**: the `/ingest` rewrites,
   `skipTrailingSlashRedirect: true`, and `worker-src 'self' blob:` in the
   CSP all exist for analytics. Removing any of them breaks capture or replay
   in production only, where you will not see it fail.
8. **Env**: `NEXT_PUBLIC_POSTHOG_KEY` missing means analytics silently
   degrades to `window.dataLayer` only (fine in CI). `SHOPIFY_WEBHOOK_SECRET`
   guards the orders webhook. Launch wiring steps: docs/launch-runbook.md
   Phase 6.5.
9. **Verify after touching any of the above**: in dev, every `track()` logs
   `[analytics] <event>` to the console; trigger your surface and watch for
   it. Then confirm a `POST /ingest/e/` request succeeds, and run the §3
   finishing gate as usual.
