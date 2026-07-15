# Heldi website: agent instructions

Cross-tool mirror of CLAUDE.md for Cursor, Codex, and any other coding agent.
If you change this file, change CLAUDE.md to match (and vice versa); both are
thin pointers, the actual rules live in BRAND.md and PLAYBOOK.md.

Next.js storefront for Heldi, a UK food supplement brand (whey protein blends that
stir into Indian home cooking). Pre-launch: waitlist mode, mock cart.

**Before writing copy, styling anything, or changing product facts, read
BRAND.md.** It holds the brand identity, the two voices, the humour rules, the
visual token system, and (most importantly) §11, the change-impact map listing
every surface that repeats each product fact.

**Before building or restructuring anything, read PLAYBOOK.md.** It holds the
responsive contract, code conventions, the blessed-components table, step-by-step
recipes (add a section, add a page, add a FAQ, add a blog post, change nav), and
the accessibility bar.

Task recipes (plain markdown, written for any agent, not only Claude):

- Adding or restructuring a section, band, or page: follow
  `.claude/skills/add-section/SKILL.md`.
- Publishing a Heldi Living blog post: follow `.claude/skills/new-post/SKILL.md`.

Hard rules that are cheap to break by accident:

- **Every surface ships two deliberate layouts: mobile (≤899px) and wide (≥900px).**
  Size with fluid clamp(); change structure only at that one breakpoint; verify at
  375 and 1280 minimum before calling anything done. "Same but narrower" is not a
  mobile design. PLAYBOOK.md §1 is the contract.
- No em dashes in copy; restructure the sentence. Grep your diff for the em dash
  character before finishing. (Only exception: the attribution dash in the founder
  signature.)
- All prices/shipping/discounts come from `lib/pricing.ts` (integer pence); the
  formulation and nutrition figures from `components/shop/nutrition-data.ts`.
- The only permitted health claim, verbatim: "Protein contributes to the maintenance
  of muscle mass."
- One pop-culture easter egg per surface, allusion not quotation.
- Visuals: ink `#011246` borders, hard offset shadows (no blur), Rozha One / Gelasio
  only, colours from the CSS variables in `app/globals.css`.
- Renaming a FAQ question in `home-faqs.ts`/`truth-faqs.ts` breaks the /faq build
  unless `site-faqs.ts` `pick()` calls are updated too.
- Raw `<img>` is banned (use `next/image` with `sizes`); media budgets and encoding
  recipes are BRAND.md §15.

The finishing gate for every change:

```
npm run brand-lint && npm run typecheck && npm run build
```

then view the change at a phone width AND a wide width, and run the BRAND.md §14
checklist. Visual reference: `docs/brand/specimen.html`. Repo map and file
placement: BRAND.md §16. Launch to-dos: NEXT_STEPS.md.
