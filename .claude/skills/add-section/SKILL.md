---
name: add-section
description: Add or restructure a section, band, card row, or whole page on the Heldi website following the house build system (PLAYBOOK.md + BRAND.md). Use this whenever the user asks to add, build, create, redesign, or move any UI surface on the site, a "press section", "testimonials band", "wholesale page", "comparison strip", "put X on the homepage", "new route for Y", even if they do not say "section" or mention the playbook. Also use when adding a brand-new component style. Do not use for blog posts (use new-post) or for pure copy edits inside an existing section.
---

# Add a section or page to the Heldi site

You are building inside a locked design system. The knowledge lives in two files;
this skill is the order of operations. Do not build from memory of other websites.

## Step 0: Load the rules (read, do not skim)

1. `PLAYBOOK.md` §1 (the responsive contract; it is the priority), §2 (code
   conventions), §3 (blessed components), and the recipe that matches:
   - homepage section → R1
   - new page/route → R2
   - nav change → R5
   - genuinely new component style → R6
2. `BRAND.md` §3 to §6 for what the section says and in which voice, §8 for the
   visual system. Open `docs/brand/specimen.html` when unsure what a component
   looks like (serve via the `repo-static` launch config).

## Step 1: Write the spec before any code

Produce and state these five lines first; they prevent the five most common failures:

- **Job**: what this section earns on the page (which BRAND.md §3 pillar it serves).
- **Voice**: A (honest expert) or B (desi underdog); never mixed (BRAND.md §4).
- **Mobile (≤899px)**: the layout in one line. "Same but narrower" is not a spec;
  choose stack, snap-rail, shorten, or drop.
- **Desktop (≥900px)**: the layout in one line, with its max-width cap.
- **Ground**: cream, ink, or gold, continuing the page's alternation (R1 has the
  current homepage order); seam treatment copied from the nearest same transition.

## Step 2: Build

- Compose from the blessed components table (PLAYBOOK.md §3) before inventing
  anything. New CSS goes in `app/globals.css`, BEM-ish block naming, tokens only,
  appended near relatives with a `/* ---------- */` header.
- The structural breakpoint is 899/900 only. Fluid `clamp()` first; media query
  only when structure changes. Four or more cards means the snap-rail recipe
  (PLAYBOOK.md §1.5).
- Every image through `next/image` with a real `sizes` for both widths.
- CTAs must respect waitlist/live mode: `WaitlistOrShopCta` or the mode-aware
  patterns, never a hard-coded "Shop now".
- Accessibility bar is PLAYBOOK.md §5 (real elements, aria patterns, focus ring,
  reduced motion). The codebase sets this bar; match it.
- No em dashes in copy; one pop-culture easter egg maximum per surface, allusion
  not quotation; the only health claim allowed is the verbatim BRAND.md §5 one.

## Step 3: Prove it

Run the finishing gate and show the evidence:

```
npm run brand-lint && npm run typecheck && npm run build
```

Then view via the `heldi-dev` launch config at mobile (375) and desktop (1280),
plus 1600 and a short 1280×700 window if the section is above the fold. Confirm:
no sideways page scroll, tap targets at least 36px, headline breaks intentional.
Screenshot both widths for the summary. If you touched product facts, run the
BRAND.md §11 impact map before finishing.
