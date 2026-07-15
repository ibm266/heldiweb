# Heldi website

Next.js storefront for Heldi, a UK food supplement brand (whey protein blends that
stir into Indian home cooking). Pre-launch: waitlist mode, mock cart.

(AGENTS.md is the cross-tool mirror of this file for Cursor/Codex/etc., and
`.cursor/rules/` mirrors the project skills. If you change the rules here, update
those mirrors in the same commit.)

**Before writing copy, styling anything, or changing product facts, read
[BRAND.md](BRAND.md).** It holds the brand identity, the two voices, the humour
rules, the visual token system, and (most importantly) §11, the change-impact map
listing every surface that repeats each product fact.

**Before building or restructuring anything, read [PLAYBOOK.md](PLAYBOOK.md).**
It holds the responsive contract, code conventions, the blessed-components table,
step-by-step recipes (add a section, add a page, add a FAQ, add a blog post, change
nav), and the accessibility bar. Project skills `add-section` and `new-post` load
the right recipe automatically for those jobs.

Hard rules that are cheap to break by accident:

- **Every surface ships two deliberate layouts: mobile (≤899px) and wide (≥900px).**
  Size with fluid clamp(); change structure only at that one breakpoint; verify at
  375 and 1280 minimum before calling anything done. "Same but narrower" is not a
  mobile design. PLAYBOOK.md §1 is the contract.

- No em dashes in copy; restructure the sentence. Grep your diff for `—` before
  finishing. (Only exception: the attribution dash in the founder signature.)
- All prices/shipping/discounts come from `lib/pricing.ts` (integer pence); the
  formulation and nutrition figures from `components/shop/nutrition-data.ts`.
- The only permitted health claim, verbatim: "Protein contributes to the maintenance
  of muscle mass."
- One pop-culture easter egg per surface, allusion not quotation.
- Visuals: ink `#011246` borders, hard offset shadows (no blur), Rozha One / Gelasio
  only, colours from the CSS variables in `app/globals.css`.
- Renaming a FAQ question in `home-faqs.ts`/`truth-faqs.ts` breaks the /faq build
  unless `site-faqs.ts` `pick()` calls are updated too.

Tooling and structure:

- `npm run brand-lint` checks the greppable brand rules (em dashes, banned words,
  literal black, raw `<img>`, hard-coded prices, asset budgets). Run it before
  finishing any copy/asset change; errors must be fixed, warnings reviewed.
- `docs/brand/specimen.html` is the visual brand board. It links the production
  `app/globals.css`, so components render exactly as shipped. Open it (any static
  server at the repo root, or file://) instead of guessing at styles.
- Images and video have hard budgets and encoding recipes: BRAND.md §15. Raw `<img>`
  is banned (use `next/image` + `sizes`); videos mount on demand with `preload="none"`
  and a poster, except the hero curtain.
- File placement rules and the repo map: BRAND.md §16. The large root directories
  (`fable/`, `hero-video/`, `stir-gallery-video/`, `design_handoff_*`, `fable_copy/`)
  are gitignored production workspaces: never import from them, never put deployable
  assets in them.

Operational state and launch to-dos live in [NEXT_STEPS.md](NEXT_STEPS.md).
`fable/` design docs are partially stale; BRAND.md §13 says where.
