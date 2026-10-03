# UI audit, 3 October 2026

A design review of the live waitlist-mode site at phone and desktop widths, with
a ranked list of changes. **Nothing in this folder changes the site.** It is a
proposal: each item says what I saw, why it matters, the fix, and which files it
touches, so any item can be picked up as its own small PR.

Mockups of the proposals (before and after, both widths) are on a Claude Design
canvas: <https://claude.ai/artifact/MNFEWk6yjQV8LZm7yVmohk>. It is private to
the owner until shared from its Share menu.

## How this was checked

- Production build (`npm run build && npm start`) of `main` at `6356f09`,
  waitlist mode, no preview unlock. The dev server was avoided because the
  dev-only mode toggle and the Next badge change the nav's width.
- Playwright Chromium at **375×812** and **1280×800** for every route, plus the
  hero at 360, 414, 768, 899, 900, 1024, 1280×700, 1440 and 1600×900.
- DOM probes on every page for sideways scroll, tap targets under 36px, text
  under 13px, heading outline, and WCAG contrast of every text node against its
  real background.
- Live mode (prices, basket, gifting) was **not** audited: it is not what
  visitors see today.

## The top ten

| # | Change | Where | Size |
|---|---|---|---|
| 1 | Stop the desktop nav wrapping between 900 and 1135px | Desktop | Small, **bug** |
| 2 | Remove the gold band under every footer on phones | Mobile | Small, **bug** |
| 3 | Re-compose the desktop hero so the buttons sit with the headline | Desktop | Medium |
| 4 | Stop the floating "Join waitlist" pill covering body copy | Mobile | Small |
| 5 | Fix two colour pairs that fail contrast | Both | Small |
| 6 | Shorten the homepage from 14 phone screens to about 9 | Both | Bigger |
| 7 | Show the email field in the closing CTA | Both | Small |
| 8 | Give blog posts a proper reading width | Both | Small |
| 9 | Lift the floor on tiny type and small tap targets | Mobile | Small |
| 10 | Give the waitlist-mode shop page one clear ask | Both | Medium |

Items 1, 2, 5 and 9 are mechanical and could ship together in one afternoon.
Items 3, 6 and 10 change what people see and want a decision first.

---

### 1. The desktop nav wraps between 900 and 1135px (bug)

![Nav at 1024px on the homepage](nav-1024-home.webp)
![Nav at 1024px on the Khana page](nav-1024-khana.webp)

**What I saw.** Measured every 20px from 900 to 1300: the nav card is 54px tall
from 1140px up, and 93 to 99px tall at every width from 900 to 1120, because the
seven links and the join pill drop to a second row. The taller card then sits on
top of the page: it overlaps the hero card by 4 to 9px on the homepage, and on
`/shop/khana` it hides the "THE HELDI POUCH" eyebrow and the top of the product
photo. A 1024px iPad in landscape and most small laptops land in this band.
PLAYBOOK R5 already names 900 to 1100px as the tight spot.

**Why.** `.nav-links` has `flex-wrap: wrap` (`app/globals.css:218`) and the card
is capped at `calc(100vw - 5.5rem)` (`app/globals.css:129`), so when the links
do not fit they wrap silently instead of failing visibly.

**Fix.** Keep the one structural breakpoint at 900. Inside the nav only, below
1140px, fold the three lowest-traffic links (Inside the pouch, Ways to use, FAQ)
into a "More" disclosure button, and set `flex-wrap: nowrap` on the desktop list
so a future link can never push the card onto two rows again. That is the
"fine-tune inside a component" case PLAYBOOK §1.1.3 allows. Remember R5: the
link lists live in four places (`heldi-homepage.tsx` and `subpage-nav.tsx`,
desktop and mobile).

- Mobile: unchanged (burger sheet).
- Desktop 900 to 1139px: five links, More, Join waitlist, one row.
- Desktop 1140px up: unchanged.

### 2. A gold band under every footer on phones (bug)

![Bottom of the 404 page at 375px](footer-band-375.webp)

**What I saw.** Every page on a phone ends navy footer, then a 72px strip of
gold. It is most obvious on short pages like the 404, where the floating pill
also sits on the footer's address line.

**Why.** At 899px and below `main { padding-bottom: 4.5rem }`
(`app/globals.css:3338`) reserves room for the floating pill. The footer is
inside `main` and the `body` background is gold, so the reserve shows as a gold
band. It is also applied where the pill never appears: live mode, `/legal`,
`/review` and `/preview` (`HIDDEN_PREFIXES` in
`components/floating-waitlist-cta.tsx`).

**Fix.** Move the reserve into the footer's own bottom padding so it is navy,
and only add it when the pill is active (for example a `data-floating-cta`
attribute on `<body>` set by `FloatingWaitlistCta`). Add the footer to the
pill's `[data-floating-cta-suppress]` targets so it never sits on the address.

### 3. Re-compose the desktop hero

![Hero at 1280×700](hero-1280x700.webp)

**What I saw.** At 1280 the reading order is: headline (centre), pouches
(centre), then the eye has to jump to the far right for the two buttons and the
offer, and to the far left for the story copy, which is 15.4px in a 298px
column. The primary button is the third thing you find. "More from the food you
love." is styled like a second headline and competes with the H1. The same
three-column split carries down to 900px, where the left column gets very
narrow.

**Fix.** Same white card, sticker, word badge and pills, two columns:

- Left: "Protein powder for" plus the word badge, left-aligned; one support
  paragraph at about 18px that opens with "More from the food you love." in
  bold; the two buttons side by side; the offer ticket under them.
- Right: the pouch pair with the three pills and the "Developed by Indian home
  cooks for Indian families" line beneath.

Mobile is unchanged; the phone hero already reads top to bottom. The mock is
board 3 on the Design canvas. While in there, `text-wrap: pretty` on
`.hero-card__support` (`app/globals.css:776`) would stop "adding" being
orphaned before the nowrap grams span, which happens at 1280 and 1600 today.

### 4. The floating pill covers body copy on phones

![The pill over a paragraph on /truth at 375px](floating-pill-375.webp)

**What I saw.** The pill is suppressed near in-place CTAs, which is good, but
through the middle of every long page it sits on top of a paragraph's last
words. On the truth page, the blog and inside-the-pouch it covers text in most
scroll positions.

**Fix, pick one.**

- Cheapest: hide it while scrolling down and show it on the way up, reusing
  the logic in `components/use-nav-scroll-hide.ts`, so it behaves like the nav.
- Better for conversion: a slim full-width bar fixed to the bottom with a short
  offer line ("The first 100 get a free sample pair.") and the gold pill, with
  `env(safe-area-inset-bottom)` padding, hidden on scroll down. The short line
  would need adding to `lib/waitlist-offer.ts`, since no surface may type the
  offer itself.

Either way, item 2's fix gives it a navy place to land at the end of the page.

### 5. Two colour pairs fail contrast

| Pair | Ratio | Where it shows up |
|---|---|---|
| `--muted` #8a8378 on cream | 3.31:1 | Statutory wording on home, Khana, Chai and FAQ (`.heldi-disclaimer`), truth sources, story notes, ways notes, the "Have a look at the Chai pouch" link |
| `--muted` on white | 3.75:1 | Range card notes, Chai "in the pouch" note, review form legal line |
| `--muted` on gold | 1.76:1 | The `.story-note` on `/shop` |
| `--terracotta` on gold | 2.81:1 | Eyebrows on gold (home "TWO POUCHES", `/shop`, `/ways-to-use`, `/review`) and the founder signature |

The statutory wording is the one that matters most: it is the legally required
supplement text and should be comfortably readable.

**Fix.** Darken `--muted` (`app/globals.css:8`) to **#736b60**: 4.63:1 on
cream and 5.25:1 on white, and still visibly quieter than `--brown`. Never put
muted on gold; use `--brown` (4.63:1) or the warm dark #2c2418 (7.18:1). For
eyebrows and the signature on gold, use `--brown`, or a deep terracotta
#6e2a1a (4.91:1) if the red cast matters. Then add a line to BRAND.md §8.1 and
the specimen.

### 6. The homepage is too long

| | Blocks (incl. footer) | Height | Screens |
|---|---|---|---|
| Phone, today | 15 | 11,700px | 14.4 |
| 1280, today | 14 | 11,340px | about 14 |
| Phone, proposed | 12 | about 7,500px | about 9 |

Measured section by section at 375px (tallest first): FAQ 1,360, vs-the-shaker
1,280, hero 1,058, menus 962, truth 926, jar 857, how 842, stir 778, range 764,
founder 642, audience 630, pouch stats 623, closing CTA 379, statutory 296,
footer 230.

Several sections say the same thing: the stir gallery and the menus are both
"a dish and its grams"; "How it works" is a four-card preview of `/ways-to-use`;
the pouch stats repeat the hero pills and the shop page; the homepage carries
thirteen FAQs, all of which `/faq` already holds.

**Proposal** (board 6 on the canvas), keeping the ground colours alternating:

1. Hero
2. One for the pot. One for the mug. (moved up: it is the first question a
   visitor has after the hero)
3. Stir it into everything
4. How it works, one card and "See every way to use it"
5. That 18g figure? It's for dry dal.
6. Heldi vs the shaker, scorecard only on phones
7. Founder band, with the three audience lines folded in
8. Five FAQs and "See the full FAQ"
9. A jar for the table
10. Be first to stir it in, with the email field (item 7)
11. Statutory statements
12. Footer

Moved, not deleted: the menus go to `/ways-to-use`; the pouch stats section
goes (its "All natural" stat is also the claim `docs/go-live-checklist.md`
calls the weakest on the site). This one needs a decision from you before
anyone builds it. If you only take one piece, cutting the homepage FAQs from
thirteen to five saves about 700px on a phone on its own.

### 7. Show the email field in the closing CTA

**What I saw.** "Be first to stir it in." ends on one square "Join waitlist"
button that opens the popup. It is the only square primary button on the
public site (everything else is a pill), and it adds a click at the point of
highest intent.

**Fix.** In `components/heldi-homepage.tsx:1545` render
`<WaitlistForm ... id="footer-email" startExpanded buttonStyle="pill" />`.
Desktop: the field and the pill on one row, max 560px, the weekly-letter
checkbox under. Mobile: stacked, full width. The `waitlist_signup` event and
its `placement` stay exactly as they are (PLAYBOOK §7). Board 7 on the canvas.

### 8. Give blog posts a proper reading width

![A post at 375px](post-375.webp)
![The empty heading at the top of one post](post-empty-h1-1280.webp)

**What I saw.** On a phone the article sits in a white card inside the gold
page gutter, so the text column is 293px, about 35 characters a line. On a
1280 laptop it is 726px at 17px, about 86 characters, past the 65 to 75 that
PLAYBOOK §1.1.5 asks for.

Separately, `content/heldi-living/will-i-get-bulky-if-i-have-too-much-protein.html`
starts with `<h1><br></h1>`. It renders a blank band at the top of the card and
gives the page a second h1. Its slug also no longer matches its title ("Why
your dal feels filling but you're hungry an hour later").

**Fix.**

- Mobile: drop the card frame for the article body (`.living-post-panel`,
  `app/globals.css:5721`) and run it full width on cream with the standard
  gutter: 335px of text. Keep the gold header with the title.
- Desktop: cap the body at `max-width: 66ch`.
- Delete the empty `<h1>`. Renaming the slug is optional and needs a redirect
  in `next.config.ts` if you do it.

### 9. Lift tiny type and small tap targets

**Type under 12px** on phones: menu card course labels (`.menu-card__course h4`,
10px, twenty of them), `.menu-card__tag` and `.menu-card__grams-note` (10px),
`.stir-card__tag` (10px), `.living-card__tag` (11px), `.hero-card__pill`
(11.5px). The menu cards are where the grams story lives, and on a phone they
are the hardest thing on the site to read.

**Tap targets** below PLAYBOOK §1.3.5's 36px: the stir and ways gallery dots
(10×10, `app/globals.css:3910` and `:9110`), menu and audience dots (30×30),
the call-the-elephants button (30×30), blog card tags (24px tall) and the
`/ways-to-use` jump chips (32px tall).

**Fix.** A 12px floor for uppercase labels and 13px for anything meant to be
read. Give every dot a 36px hit area while keeping the visible dot small
(padding plus `background-clip: content-box`, or a `::before` hit box). Bump
the chips and tags to `min-height: 36px`.

### 10. One clear ask on the waitlist-mode shop page

![Khana buy box at 375px](pdp-buybox-375.webp)

**What I saw.** Before launch the Khana buy box still asks three things: size,
how many, and "Need more than two?" with a stepper that reads 1 next to a
selected "One pouch" card. There are no prices, and every path ends at the same
"Join waitlist" button. It reads as two controls for one number, and as choices
that do nothing.

**Fix.** In waitlist mode only (`components/shop/buy-box.tsx`), replace the
pickers with: what comes in the box (the pouch and the jar, as the "Includes"
card already shows), the offer ticket, and the email field with the pill. Keep
the full picker for live mode untouched. If you would rather keep the picker as
a preview, at least hide the stepper until "Two pouches" is selected. Board 10
on the canvas.

---

## Also worth doing (smaller)

- **Range cards on desktop are very tall.** The 1:1 photos make each card about
  640px tall, so on an 800px laptop "Meet Khana" is below the fold. A 4:3 crop
  at 900px and up (`.range-card__media`, `app/globals.css:9211`) fixes it.
- **The jar section shows the pouch.** "A jar for the table. On us." uses
  `jar-pouch.webp`, where the jar is small beside the pouch
  (`components/heldi-homepage.tsx:1523`). The copy is about the jar; the brass
  jar and spoon shot (`/images/shop/gift-jar-brass-spoon.webp`) would carry it.
- **The public footer links to `/preview`.** That is the internal unlock page
  (`components/subpage-nav.tsx:163`). Reach it by URL only.
- **"Have a look at the Chai pouch" on Our story** is a link styled as a muted
  italic caption (`app/our-story/page.tsx:287`), so it reads as a note, not a
  way forward. Make it a `.pill-link`.
- **The homepage statutory block** has about 90px of empty cream above its rule
  on both widths. Tighten its top padding.
- **First visit stacks two interstitials.** The elephant curtain plays for about
  three seconds, then the consent modal lands centred over the hero, so a new
  visitor sees two full-screen moments before the headline. On phones, a bottom
  sheet for consent, opened after the curtain finishes, keeps the hero visible.
  (Headless Chromium has no H.264, so in testing the curtain showed as plain
  gold; a real browser shows the elephants.)
- **768px tablets get the phone layout stretched.** Pills and pouches look
  small in a very wide card. Capping the hero card around 560px below 900px
  keeps the phone design's proportions without a new breakpoint.

## What is working, keep it

- No page scrolls sideways at 375 or 1280. Every rail and table is contained.
- The shape language is consistent everywhere: ink borders, hard shadows, pill
  buttons, the ticket offer. The site looks like one brand on every route.
- The phone layouts are genuinely different designs, not squeezed desktops:
  the vs-shaker scorecard, the snap rails with dots, the stacked Chai method.
- Real buttons, labels and radio inputs throughout; one h1 per page except the
  blog post in item 8.
- The Khana and Chai gallery stays sticky on desktop while the buy box scrolls.

## Screenshots in this folder

| File | What |
|---|---|
| `nav-1024-home.webp`, `nav-1024-khana.webp` | Item 1 at 1024×768 |
| `footer-band-375.webp` | Item 2, bottom of the 404 page |
| `hero-1280x700.webp` | Item 3 |
| `floating-pill-375.webp` | Item 4, `/truth` |
| `post-375.webp`, `post-empty-h1-1280.webp` | Item 8 |
| `pdp-buybox-375.webp` | Item 10 |
| `first-visit-375.webp` | First visit, consent modal over the hero |
