# Waitlist offer: one promise, one wording, every surface

**Status: APPLIED IN THE REPO on 17 September 2026, on branch
`offer/waitlist-free-sample` (wording approved by Mihir the same day). NOT yet live:
the cut-over in section 7 has not happened, so production still shows the old offer
and Klaviyo still sends the 5 Sep welcome email.** Written after a four-way inventory
of the site, the cart mechanics, the docs and emails, and everything outside this
repo (HeldiPM, building-heldi, the Heldi skills, Shopify, memory).

Done: sections 3, 4A, 4B, 4C, 4D items 1, 2 and 4 (masters only), 4F, 4G (HeldiPM
wording, both skills revised and this Mac's copies updated, memory) and section 5.
Still open, all needing Mihir: everything in section 8 except item 1.

**Three places where the build deliberately differs from the plan below:**

1. *The early joiners' link is the bare `?claim=pair`, not `&code=WELCOME`* (4D item
   4). `WELCOME` is one use per customer, and a checkout holding only the free pair
   would spend it before the pouch order it was promised on. Their email names
   `WELCOME` for them to type on their first pouch order instead, and
   `npm run pricing-check` asserts the link stays bare.
2. *The claim link's `WELCOME` rider is switched, not removed* (5.2). It stays on
   while `CLAIM_RIDES_WITH_WELCOME` in `components/cart/cart-context.tsx` is `true`,
   because until the samples sit on a £0 Shopify shipping profile it is the only
   thing keeping postage off a free pair. `npm run storefront-check` fails as soon as
   the profile exists and the flag is still `true`, and the other way round.
3. *brand-lint's new rule is check 8, not 9* (3.4), and the form's small print reads
   "Privacy policy and offer terms" so the two links wrap cleanly on a phone.

If this file and a source file disagree, the source file wins. `BRAND.md` §11.9 owns
the offer from here on; this file is the record of how it got there.

---

## 1. The offer, as settled by Mihir on 17 September 2026

| Who | What they get | Small print |
|---|---|---|
| Everyone on the list | First to know: one email, the day we launch | The waitlist consent covers exactly this one email |
| The first 100 on the list, in join order | A free sample pair: one 30g Khana sachet, one 30g Chai sachet. We pay the postage | Claimed from the link in the launch email. One per household |
| Everyone on the list | 15% off their first order | The public family rate (`GIFTING.percent`). Pouches only, never samples |

**No longer part of the waitlist offer:**

- The 25% founders code. It is for close friends only now (`SHUKRIYA-` codes).
- "Postage on us" on the first pouch order. Dropped on 17 Sep. `WELCOME` stays for
  three groups only: close friends (it rides with every founders code), the
  after-launch email sign-up, and the early joiners below.
- 20% off and `PEHLEAAP`. Dead since 2 Sep, still alive in five documents.

**Early joiners.** Nine people were on the list on 17 Sep. Five of them received the
5 Sep welcome email, which promised "two sachets, posted free" and "15% off, postage
on us". Decision: honour the email. They get the pair (they are inside the first 100
anyway), 15% off, and free postage on their first order. The 25% the website showed
them is not honoured. Anyone who joins before the welcome email is corrected in
Klaviyo joins this group, so that push comes first (section 7).

**Why we pay the postage.** The first idea was "free sample, you pay postage and
packaging". UK rules only allow the word "free" when the customer pays nothing beyond
the true cost of delivery: the CAP Code says packing, packaging, handling and admin
charges may not be passed on, and the same practice is number 23 on the DMCC Act 2024
banned list (Schedule 20). Mihir chose to pay the postage, so "free" is safe on every
surface and there is nothing to disclose.

---

## 2. What is wrong today

Four different promises are in circulation, and no document owns the offer.

| Where | What it promises today |
|---|---|
| The website, 8 surfaces, on production and on this branch | 25% off for the first 100 on the list |
| The Klaviyo welcome email, which is LIVE and fires on every signup | First look; first hundred get two sachets posted free; first order 15% off, postage on us |
| `BRAND.md` §7, §11.3, §11.5, `NEXT_STEPS.md`, `docs/go-live-checklist.md`, `docs/brand/specimen.html` | 20% off, code `PEHLEAAP` |
| The `heldi-email-writer` skill | Launch prices (£30 not £35) and a free jar |
| The `heldi-content-creator` skill | "First 100 customers get 25% off, link in bio." |
| `NEXT_STEPS.md` lines 205 to 212 | A taster for the first 50 before launch, and another capped at 200 |

Shopify cannot honour any version of it yet: the only discount that exists is
`WELCOME` (and it is "£4.99 off", not free shipping), the three family codes do not
exist at all, and the free pair has no stock set.

---

## 3. The wording system

### 3.1 One owner

| Layer | Owner | Rule |
|---|---|---|
| The facts (100, 15%) | `WAITLIST_OFFER` in `lib/pricing.ts`, new. The percent is read from `GIFTING.percent`, never typed | `npm run pricing-check` asserts both |
| The words on the site | `lib/waitlist-offer.ts`, new. Exports the lines in 3.3 | No component types its own offer sentence. It imports one |
| The rule book | `BRAND.md` §11.9, new: the table in section 1, the lines in 3.3, the glossary in 3.2 and the touch list in section 4 | Every other document links to §11.9 instead of restating the offer |
| Everything off the site (Klaviyo, Shopify, skills, captions, HeldiPM) | Copies the lines from §11.9 word for word | The email master's header comment and the skills point at §11.9 |

### 3.2 Glossary: one name for each thing

| Thing | Always | Never |
|---|---|---|
| The list | "the waitlist" on first mention and on buttons ("Join waitlist"), then "the list" | wait list, waiting list, mailing list |
| Who gets the pair | "the first 100 on the list" | first hundred, first 100 customers, first 100 people to join, founding 100 |
| The sample | "a free sample pair", explained as "one Khana sachet for the pot, one Chai sachet for the mug" | trial pair, taster pack, Sample Duo, Sample Trio, two sachets to try |
| Its postage | "we pay the postage" | posted free, free shipping, free delivery, postage on us, P&P, postage and packaging |
| The 15% | "15% off your first order" | launch sale, launch price, 25%, 20%, founders, any code string while the site is in waitlist mode |
| The email | "one email, the day we launch" | updates, newsletter (that is Heldi Living), we'll keep you posted |
| Hearing first | "first to know" | first look, early access (neither is promised) |

"Sale" is out for a reason: a sale claims a price that will end. The 15% is the
standing family rate, so calling it a sale would be the kind of false time limit the
DMCC list also bans. "15% off your first order" is true as it stands.

Waitlist mode still shows no £ figure and no code string anywhere. The percent and
the words "free sample pair" are the only offer language allowed before launch
(this replaces the old 20% exception in `BRAND.md` §11.5).

### 3.3 The canonical lines

Numbers are interpolated from `WAITLIST_OFFER` and `GIFTING`, never typed. These need
Mihir's sign-off before any file is touched.

| ID | Used for | The line |
|---|---|---|
| W1 | Popup title, final CTA heading | Be first to stir it in. (unchanged) |
| W2 | Waitlist ticker, two items | FIRST 100 ON THE LIST GET A FREE SAMPLE PAIR  •  15% OFF YOUR FIRST ORDER |
| W3 | Hero line under the Join button, both PDP notes, subpage CTA perk line, `llms.txt`, captions | The first 100 on the list get a free sample pair, and we pay the postage. Everyone on the list gets 15% off their first order. |
| W4 | Popup lede and final CTA paragraph (identical in both) | One email, the day we launch. The first 100 on the list get a free sample pair, one for the pot and one for the mug, and we pay the postage. Everyone on the list gets 15% off their first order. |
| W5 | Form success state | You're on the list. One email, the day we launch, with 15% off your first order inside. If you're one of the first 100, your free sample pair is in there too. Tell your mum we said hi. |
| W6 | The three-row block: welcome email, launch email, terms summary | Everyone on the list: First to know, the day we launch. The first 100: A free sample pair, and we pay the postage. Your first order: 15% off. |
| W7 | Pair explainer: emails, product description | The pair is one Khana sachet for the pot and one Chai sachet for the mug, so you can try both before you commit to a pouch. |
| W8 | The launch FAQ answer (Voice A). The question text is a build key and does not change | Heldi launches in autumn 2026. The shop is available to browse now, and checkout switches on at launch. We send one email on the day the shop opens, so the waitlist is first to know. The first 100 people on the list get a free sample pair, one Khana sachet and one Chai sachet, and we pay the postage. Everyone on the list gets 15% off their first order. |
| W9 | Free pair product copy, in `catalog.ts` and in Shopify | Title: Heldi sample pair, on us (unchanged). Short: A free sample pair for the first 100 on the list. Long: Two 30g sachets, one Khana for the pot and one Chai for the mug. Free for the first 100 on the list, and we pay the postage. |
| W10 | New "Waitlist offer" section in the terms | See 4C |
| W11 | The early joiners' launch email only | Your first order: 15% off, postage on us. (kept word for word, because it is what they were told) |
| W12 | Cart message if the pairs run out | The free sample pairs have all been claimed. Your 15% still works on a pouch. |
| W13 | Every line above once the list passes 100 (see 5.5) | W2: 15% OFF YOUR FIRST ORDER. W3: The free sample pairs have all gone to the first 100. Everyone on the list still gets 15% off their first order. |

PDP notes keep their own first sentence and then use W3:

- Khana: "We will put the prices here when the shop opens. Join the waitlist to hear first." then W3.
- Chai: "We are finishing Chai before we sell it. Join the waitlist to hear when it is ready." then W3.

### 3.4 Guardrails, so it cannot drift again

1. **`scripts/brand-lint.sh`, new rule 9, "Stale waitlist offer wording".** Error on
   `PEHLEAAP`, `WAITLIST_OFFER.code`, `(20|25)% off`, `first hundred`, `posted free`,
   `postage on us`, `trial pair`, `wait list`, `waiting list`, `launch sale`. Scope is
   the usual copy dirs plus `public/llms.txt` and `docs/email/`. One named exception:
   the early joiners' email file, which must keep "postage on us".
2. **`scripts/pricing-check.mjs`.** Replace the `FOUNDERS.firstJoiners` assert with
   `WAITLIST_OFFER.freePairFirstJoiners === 100`. Add the asserts that do not exist
   today: the free pair is £0, its compare-at equals `samplePairPence()`, and its SKU
   has a variant id.
3. **One hard rule in `CLAUDE.md`, mirrored to `AGENTS.md` and
   `.cursor/rules/heldi-system.mdc` in the same commit:** "The waitlist offer has one
   owner: BRAND.md §11.9 and `lib/waitlist-offer.ts`. Never type it into a component,
   an email or a doc."

---

## 4. Every surface, and what happens to it

### 4A. The website in waitlist mode

All eight read `FOUNDERS.percent` and `FOUNDERS.firstJoiners` today.

| File and line | Now | Becomes |
|---|---|---|
| `components/heldi-homepage.tsx:141` ticker | FIRST 100 ON THE LIST GET 25% OFF | W2 |
| `components/heldi-homepage.tsx:269-277` `HeroIncentive` | 25% off at launch, for the first 100 on the list. | W3. It currently renders nowhere: the shipped hero is the "reveal" layout, whose `HeroRevealActions` (`:213-231`) never calls it. Wire it in, so the homepage hero finally says why to join |
| `components/heldi-homepage.tsx:1389-1394` final CTA | One email the day we launch, with 25% off inside it... | W4 |
| `components/waitlist-popup.tsx:148-152` lede | ...The first 100 people to join get 25% off at launch. | W4 |
| `components/waitlist-form.tsx:83-87` success | ...you'll find 25% off in your launch email... | W5 |
| `components/waitlist-form.tsx:139-142` small print | Unsubscribe anytime. Privacy policy | Add "Offer terms", linking to the new terms section |
| `components/site-faqs.ts:214-218` launch FAQ | ...we hold 25% off your first order... | W8. Feeds the /faq JSON-LD automatically |
| `components/shop/buy-box.tsx:154-155` | ...the first 100 people on it get 25% off. | Khana note, then W3 |
| `components/shop/chai-buy-box.tsx:199-200` | ...the first 100 people on the list get 25% off. | Chai note, then W3 |
| `components/waitlist-or-shop-cta.tsx` | Button only, on six pages | Recommended: one perk line (W3) under the button in waitlist mode. One change covers our-story, inside-the-pouch, ways-to-use, shop, truth and every blog post |
| `public/llms.txt:5` and `:39` | Says sign-ups are open, never says what a joiner gets | Add W3, so AI answers can quote the offer |
| Chai "hears first" lines: `components/home-faqs.ts:45`, `components/range-section.tsx:69`, `components/shop/pouch-picker.tsx:82` | Three wordings of the same idea | Low priority: settle on "The waitlist hears first." |

Nav pills, the floating button and every other button stay "Join waitlist". That is
the CTA canon and it is already uniform.

The hero line and the CTA perk line are new elements, so they go through PLAYBOOK §1:
two layouts, checked at 375 and 1280.

### 4B. Live mode and the catalog

| File and line | Now | Becomes |
|---|---|---|
| `lib/commerce/catalog.ts:866-868` | "Two sachets, free for the first hundred." and "...free for the first 100. Postage is on us too." | W9 |
| `components/cart/cart-drawer.tsx:454-458`, `:287`; `lib/commerce/shopify/cart-policy.ts:101-106` | Comments say "first hundred", and one says the variant is untracked | Reword to the glossary and fix the stale tracking note |
| `components/heldi-homepage.tsx:143` live ticker | LAUNCH PRICES ON NOW | Delete the item. There have been no launch prices since 4 Sep, and "AUNTIES & UNCLES PAY LESS" already carries the 15% |
| `components/site-faqs.ts:182`, `components/shop/product-accordions.tsx:143`, `docs/legal/shipping-policy.md:17` | Samples on their own ship free | No change. Still true |

### 4C. Legal

Add a "Waitlist offer" section to `docs/legal/terms-and-conditions.md` (W10), in
Voice A. There is no promotion terms text anywhere today. Draft:

> **Waitlist offer.** If you join the waitlist before we launch, we email you once,
> on launch day. The first 100 people to join, in the order they joined, can claim
> one free sample pair (one 30g Heldi Khana sachet and one 30g Heldi Chai sachet)
> using the link in that email. We pay the postage. UK addresses only, one pair per
> household, claimed with the email address you joined with, within 30 days of the
> launch email. Everyone on the waitlist can also take 15% off their first order of
> pouches with the code in the launch email. The 15% applies to pouches, not to
> samples or included items, and cannot be combined with another product discount.
> There is no cash alternative. If we cannot send the pair at launch because one of
> the blends is not yet ready to ship, we send it as soon as both are.

The 30 days and "one per household" are proposals for Mihir to confirm. The last
sentence exists because the pair holds a Chai sachet and Chai's gates are still open.

`docs/legal/privacy-policy.md` does not change: joining still buys one launch email.

### 4D. Emails

1. **Merge `waitlist-welcome-email` into the working branch.** One commit, merges
   clean, brings `docs/email/waitlist-welcome.html` and its `BRAND.md` §16 row. Today
   the only master copy of the live email is stranded on that branch.
2. **Edit the welcome master.** The three rows become W6 (label "The first 100",
   value "A free sample pair, and we pay the postage", first order "15% off"), the
   explainer becomes W7, and the header comment swaps its 5 Sep provenance note for a
   pointer to `BRAND.md` §11.9. Subject, preheader, sign-off and P.S. stay.
3. **Push it to Klaviyo.** Update library template `TvLgd3`, re-point flow `T6BYu5`
   so it re-clones, read the new clone back and diff it against the master. **Blocked
   today:** the Klaviyo connection failed to authorise in this session.
4. **The launch emails.** Klaviyo holds two drafts, `XGbTBU` (first hundred) and
   `YqrsCh` (the rest), which nobody has been able to read today. Rewrite both from
   W6 and W7 and track their masters in `docs/email/`:
   - `launch-first-100.html`: W6, W7, claim link `heldi.co.uk/?claim=pair`
   - `launch-everyone-else.html`: rows one and three only, link to the shop
   - `launch-early-joiners.html`: the first-100 version with W11, claim link
     `heldi.co.uk/?claim=pair&code=WELCOME`
5. **Three segments, mutually exclusive:** early joiners (a static list, frozen at the
   cut-over), the first 100 by join order minus the early joiners, and everyone else.
   Supabase `public.waitlist.joined_at` is the record, so the first-100 line is drawn
   there and pushed to Klaviyo as a list at launch.
6. **Archive the orphan template `VnY8iQ`.** It still says 20% and £30, sends to
   nobody, and four documents point at it as if it were the welcome email.

### 4E. Shopify, by hand in the admin

The MCP server cannot do any of these: it has no shipping, inventory or
free-shipping-discount tools.

| Job | Why the copy depends on it |
|---|---|
| Put both sample products on a £0 "Heldi samples" shipping profile | Makes "we pay the postage" true at checkout. Today a £0 pair is charged £4.99 |
| Free pair: inventory tracking on, 100 units, "continue selling" off | The only thing that caps the giveaway. Today it has no stock set |
| Rebuild ACHABETA, RISHTA, SHABASH at 15%, pouches only, once per customer, combining with shipping discounts | Makes "15% off your first order" true. None of the three exists right now |
| Rebuild `WELCOME` as a free-shipping discount, once per customer | It is "£4.99 off the order" today, which does nothing on a £0 basket |
| Paste W9 into the free pair's description | Same words in the shop as on the site |

### 4F. Docs, rules and mirrors

| File | Change |
|---|---|
| `BRAND.md` | New §11.9 (the owner). §7 CTA canon: replace the 20% lines with W4 and W5. §10: add a waitlist offer row, and fix the stale £40, £3.55 and `MAX_POUCHES` 2 figures while there. §11.3 item 6: replace with a pointer to §11.9. §11.5: replace the 20% exception with the rule in 3.2. §13: log this clean-up |
| `NEXT_STEPS.md` | §0: WELCOME's purpose, segments are three not two, founders codes are close friends only. Delete the dead bullets at `:87`, `:319`, `:322`, `:323`, `:324`. Remove the "first 50" and "cap 200" tasters at `:205-212`. Correct the Klaviyo template ids |
| `docs/go-live-checklist.md` | §4: the flow exists (`T6BYu5`), the template is `TvLgd3`, and the list id typo `U6LSH` should read `U6jLSH`. Remove every "create `PEHLEAAP`" step (`:277-283`, `:461`, `:477`): worked top to bottom today, this checklist tells you to create a code the plan killed. **This file carries Mihir's uncommitted trademark edit at `:152`. Edit around it, never revert it** |
| `docs/launch-runbook.md` | Step 2: WELCOME is for friends, early joiners and post-launch sign-ups, not for every claim. Step 6: founders codes are close friends only, no first-100 generation |
| `docs/two-product-cart-plan.md` | Do not rewrite history. Add a dated "superseded 17 Sep, see BRAND §11.9" note on the waitlist reward row, P3, D3 and D5 |
| `docs/handover.md` | §7a codes paragraph and the free pair paragraph, §8 Klaviyo items |
| `docs/brand/specimen.html:817`, `:848-852` | Hand-kept mirror of the popup. Still says 20%. Becomes W4 and W5 |
| `docs/copy-review.html` | Untracked marking tool from the voice rewrite. Its four waitlist records go stale the moment this lands. Regenerate it afterwards, or mark those four superseded |
| `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/heldi-system.mdc` | The one-owner rule from 3.4, in the same commit |

### 4G. Outside this repo

| Where | Change |
|---|---|
| HeldiPM `lib/run-one/constants.ts:160`, `:165`, `:176-181` | Founders go to close friends only. The claim link no longer applies WELCOME to everyone |
| HeldiPM `lib/run-one/constants.ts:243-250` and `app/run-one/page.tsx:153-155` | The discount mixes still assume orders at list price. Mihir's position is that nearly every order uses the 15%. He sets the new shares |
| HeldiPM `components/run-one/presents-section.tsx:137-163`, `app/run-one/page.tsx:220`, `lib/run-one/engine.ts:476` | Rename "free trial pair" to "free sample pair". The cost model stays as it is: Heldi still pays the postage |
| HeldiPM `components/run-one/sources-section.tsx:54` | Lists the waitlist offer as an open call. Close it and record the decision |
| HeldiPM `lib/cogs/constants.ts:1008-1014`, `components/cogs/landed-tab.tsx:583-586` | The 25% no longer covers "most of the launch cohort" |
| HeldiPM `context/product-gates.md:21` | The "locked" run-1 offer is the July one. Mark it superseded |
| `heldi-email-writer` skill | Rewrite its locked facts to read from this repo, point its offer section at `BRAND.md` §11.9, and redo its welcome and launch guidance around W6 and W7. Almost every figure in it dates from July |
| `heldi-content-creator` skill | `references/captions-and-hashtags.md:128-130`: "First 100 customers get 25% off, link in bio." becomes W3. Also `:61`, `seven-archetypes-deep.md:94-95`, `founder-story.md:84` |
| `heldi-seedance-director` skill | Naming only: "Sample-trio", Dahi |
| **All five skills sync from the claude.ai account**, so a local edit can be overwritten | Prepare the revised files here; Mihir uploads them in claude.ai |
| building-heldi, the announcement reel | No change. Its spoken line, "join the waitlist and you'll be the first to know when we launch", already matches. Add W3 to the written caption. The 15 Sep archive is left alone |
| Instagram bio and link in bio | Not on disk. Mihir pastes: "Join the waitlist. First 100 get a free sample pair." |
| Claude memory | Both pricing memories still hand 25% to the first 100. Correct them when this lands |

---

## 5. Making the words true at checkout

Small code changes. Without them the copy promises things the cart will not do.

1. **`lib/pricing.ts`.** Remove `FOUNDERS.firstJoiners` and rewrite the founders
   comment (close friends only). Add `WAITLIST_OFFER = { freePairFirstJoiners: 100 }`.
   Rewrite the `WELCOME_POSTAGE` comment for its three audiences, and fix the stale
   £3.55 inside it.
2. **`components/cart/cart-context.tsx:420-425`.** The claim link adds `WELCOME` to
   every claimed basket. That now hands free postage on pouches to the whole first
   100, which Mihir dropped. Remove it, **but only after the £0 samples shipping
   profile exists** (4E), or the free pair starts arriving with £4.99 attached. Early
   joiners carry `WELCOME` in their own link instead.
3. **Sold-out handling, `cart-context.tsx:409-437`.** If the pairs run out, the add
   throws before the code is applied, so the customer gets a generic red error and
   loses their code as well. Apply the code independently and show W12.
4. **Chai gate.** `cart-policy.ts:107-112` skips the free pair before the
   `CHAI_SELLABLE` check, so a claim would ship a Chai sachet that is not cleared for
   sale. Make the claim link inert until Chai is cleared.
5. **Keep the promise true as the list fills.** Once 100 people have joined, the site
   must stop offering the pair to new joiners. Nothing counts today: the API returns
   `{ ok: true }` and nothing else. Recommended: a cached server-side count from
   Supabase passed into the homepage as a prop (no new API route, so no new
   rate-limit rule), switching W2 to W5 over to their W13 forms. A nice extra: the
   signup API returns whether this joiner made the first 100, so the success state
   can say so outright.
6. **Who can claim.** The link needs no code and carries no identity, so a forwarded
   link lets strangers drain the 100 before the real first 100 claim. For run 1:
   send the link only to the first-100 segment, put "claimed with the email you
   joined with, one per household" in the terms, and check each free-pair order
   against the first-100 export at packing. Every order is hand-packed, so this is
   proportionate. Per-person signed links are the robust fix if the list grows.
7. **`scripts/storefront-check.mjs:160-170`.** Keep the gate probe, reword its
   messages to the glossary.

---

## 6. How the work is split

One branch, `offer/waitlist-free-sample`, stacked on `copy/family-kitchen-voice`.
Draft PR 4 (the voice rewrite) has already rewritten the same eight sentences, so
branching from `main` would conflict on every one. Merge order: PR 4, then this.

**Production is promising 25% to every new joiner right now.** If PR 4 will sit for
more than a few days, land the eight strings on `main` first as a small fix.

| Phase | Who | Owns | Gate |
|---|---|---|---|
| 0 | Mihir | Signs off 3.3 and the open points in section 8 | Nothing moves before this |
| 1 | One agent, alone | `lib/pricing.ts`, `lib/waitlist-offer.ts`, `BRAND.md`, `scripts/brand-lint.sh`, `scripts/pricing-check.mjs`, the three rule mirrors | `pricing-check`, `typecheck` |
| 2A | Agent, site | `heldi-homepage.tsx`, `waitlist-form.tsx`, `waitlist-popup.tsx`, `buy-box.tsx`, `chai-buy-box.tsx`, `site-faqs.ts`, `waitlist-or-shop-cta.tsx`, `home-faqs.ts`, `range-section.tsx`, `pouch-picker.tsx`, `public/llms.txt`, `app/globals.css`, `docs/brand/specimen.html` | 375 and 1280 |
| 2B | Agent, cart | `catalog.ts`, `cart-context.tsx`, `cart-drawer.tsx`, `cart-policy.ts`, `mock-provider.ts`, `storefront-check.mjs`, the count helper | `npm run dev:mock` |
| 2C | Agent, legal and email | `docs/legal/terms-and-conditions.md`, `docs/email/*.html` | Master diffs clean against Klaviyo after the push |
| 2D | Agent, docs | `NEXT_STEPS.md`, `docs/go-live-checklist.md`, `docs/launch-runbook.md`, `docs/two-product-cart-plan.md`, `docs/handover.md` | Every offer mention links to §11.9 |
| 2E | Agent, outside | HeldiPM on its own branch, the revised skill files, both memories | HeldiPM typecheck and tests |
| 3 | A fresh agent, adversarial | Greps every banned phrase in 3.2 across all four repos and the skills store. Reads the rendered site in waitlist mode and in `dev:mock` live mode. Checks every line against 3.3 character for character | The four commands: `pricing-check`, `typecheck`, `brand-lint`, `build` |
| 4 | Mihir, with Claude | Section 8 | |

2A to 2E run in parallel because no file appears twice. Nobody stages the untracked
`docs/trademark*` files or `docs/copy-review.html`.

---

## 7. The cut-over

The order matters because the welcome email is live.

1. Wording signed off.
2. Phases 1 to 3 on the branch.
3. **Same day:** the Klaviyo welcome template is pushed and the site is deployed.
   Write the timestamp here: `____`.
4. Freeze the early-joiner list at that timestamp. It is 9 people as of 17 Sep.
5. Before launch: Shopify admin (4E), launch emails and segments (4D), skills,
   HeldiPM, the bio.

---

## 8. What needs Mihir

1. Approve the lines in 3.3. Two to look at hardest: "we pay the postage" as the one
   phrase for it, and "15% off your first order" rather than "launch sale".
2. Confirm the terms: 30 days to claim, one per household, UK only.
3. Hero line and CTA perk line: yes or no. Recommended yes.
4. Reconnect Klaviyo. It failed to authorise in this session (`invalid_target`). Run
   `claude` in a terminal, type `/mcp`, re-authorise Klaviyo.
5. The five Shopify jobs in 4E.
6. Upload the revised skills to claude.ai.
7. Paste the bio line.
8. New discount mix shares for the HeldiPM run-one page.
9. Before any sachet is posted: Chai's gates, the sachet label (30g is declared
   nowhere yet), and the registration and insurance points in the HeldiPM memory on
   home samples. There is no exemption for free samples.
10. Weigh the pair pack against the Large Letter limit. This sets your cost, not the
    copy.

---

## 9. Found in passing, not part of this job

- `components/cart/cart-drawer.tsx:616`, "Add a Sample for free UK shipping.", cannot
  be true at a £50 threshold (£35 plus £5 is £40).
- `docs/legal/shipping-policy.md:16` and `:18` still say £40 and £3.55.
- `.env.example` is missing the four Klaviyo variables and `NEXT_PUBLIC_CHAI_SELLABLE`.
- The flow-owned Klaviyo clone id is recorded nowhere in the repo. It changes on
  every re-point, so the header comment should say "read it from the flow".
- HeldiPM's pricing memory contradicts itself on who gets the 25%.
