# Heldi website: agent instructions

Cross-tool mirror of CLAUDE.md for Cursor, Codex, and any other coding agent.
If you change this file, change CLAUDE.md to match (and vice versa); both are
thin pointers, the actual rules live in BRAND.md and PLAYBOOK.md.

Next.js storefront for Heldi, a UK food supplement brand (whey protein blends that
stir into Indian home cooking). Pre-launch: waitlist mode, mock cart.

**New session, new machine, or new model? Start with docs/handover.md.**
It is the map: which repo owns what, which file owns which fact, the settled product
figures, what is currently open, and the one thing that will bite you (HeldiPM's
`design/` is gitignored, so a fresh clone contains none of the pouch artwork or
print files).

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
- Adding or regenerating any image, video, or animation: follow
  `.claude/skills/add-asset/SKILL.md` (budgets, compression commands, wiring
  rules). Nothing lands in `public/` uncompressed.

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
  Those are Khana's. Heldi Chai has its own facts in
  `components/shop/chai-data.ts`, including a nutrition table since 3 Sep; BRAND.md §11.7 says what Chai must not repeat from Khana, and
  NEXT_STEPS.md §1b holds the open decisions.
- The only permitted health claims are protein's three register entries, used verbatim:
  "Protein contributes to a growth in muscle mass." / "...to the maintenance of muscle
  mass." / "...to the maintenance of normal bones." (BRAND.md §5 has the exact wording
  and why paraphrasing one is a breach.)
- One pop-culture easter egg per surface, allusion not quotation.
- Visuals: ink `#011246` borders, hard offset shadows (no blur), Rozha One / Gelasio
  only, colours from the CSS variables in `app/globals.css`.
- Analytics: components only ever call `track()` from `lib/analytics.ts`, never
  posthog directly. Event names, the checkout button's handler, the consent
  storage key, and the `/ingest` plumbing in `next.config.ts` are load-bearing;
  PLAYBOOK.md §7 lists what to preserve whenever you touch a tracked surface.
- Renaming a FAQ question in `home-faqs.ts`/`truth-faqs.ts` breaks the /faq build
  unless `site-faqs.ts` `pick()` calls are updated too.
- Raw `<img>` is banned (use `next/image` with `sizes`); media budgets and encoding
  recipes are BRAND.md §15.
- **Every new route under `app/api/` calls `guard()` from `lib/rate-limit.ts`
  first**, before it parses a body or touches Supabase, Klaviyo or Shopify.
  These routes have no login, so a cap plus a same-origin check is the only
  thing standing between a loop and our storage quota, Klaviyo bill or Shopify
  API allowance. Add the route's cap to `RATE_RULES` rather than inventing a
  number inline. GET routes use `checkRate()` alone (browsers send no `Origin`
  on a same-origin GET). See [docs/security.md](docs/security.md).

The finishing gate for every change:

```
npm run pricing-check && npm run brand-lint && npm run typecheck && npm run build
```

then view the change at a phone width AND a wide width, and run the BRAND.md §14
checklist. Visual reference: `docs/brand/specimen.html`. Repo map and file
placement: BRAND.md §16. Launch to-dos: NEXT_STEPS.md.
