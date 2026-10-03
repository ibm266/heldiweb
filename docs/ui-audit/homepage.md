# The homepage: what repeats, and how to get it to about nine screens

A follow-up to item 6 in [README.md](README.md). This is a proposal only;
nothing here is built yet.

**How the numbers were measured.** Production build, waitlist mode, after the
item 1, 2, 5 and 9 fixes (the bigger type in item 9 added about 40px). Each cut
was made in a live browser by removing or restyling that section in the page,
and the page height read back at 375×812 and 1280×800. "Screens" is page height
divided by the viewport height (812 on a phone, 800 on a laptop).

## The short answer

| | Phone (375) | Laptop (1280) |
|---|---|---|
| Today | 11,740px · **14.5 screens** | 11,303px · **14.1 screens** |
| Step 1: cut the repeats | 8,869px · 10.9 screens | 8,579px · 10.7 screens |
| Step 2: trim inside what stays | 7,955px · **9.8 screens** | 7,803px · **9.8 screens** |
| Step 3 (optional): fold the jar into "Two pouches" | about 7,200px · 8.9 screens | about 7,400px · 9.3 screens |

Step 1 is almost all deletion of content that already lives somewhere else.
Step 2 keeps every section that survives step 1 but shortens it. Step 3 is the
one content decision that is genuinely yours.

## Section by section

Heights are phone / laptop. "Elsewhere" means the same content already exists
on another page, or earlier on the homepage.

| # | Section | Height | What it says | Elsewhere | Verdict |
|---|---|---|---|---|---|
| 1 | Hero and ticker | 1,058 / 745 | The product, 10g in food and 5g in drinks, three pills, the offer | | **Keep as is** (you like it) |
| 2 | "Food you love. Nutrients you need." (phones only) | 623 / none | "10g protein per bowl", "All natural", four badges | The hero says 10g; `/shop/khana` has all six badges and the "What's inside" accordion. The laptop page already lives without this section | **Cut** |
| 3 | "Stir it into everything." | 778 / 1,257 | Six dishes; tap to stir in a spoonful and watch the grams rise | The menus (row 7) make the same point a second time | **Keep**: it is the one interactive proof |
| 4 | "One for the pot. One for the mug." | 764 / 1,074 | The two pouches, named, with links | `/shop` uses the same eyebrow and the same lede word for word | **Keep**: the homepage needs to introduce the range |
| 5 | "It's as easy as 1, 2, 3." | 842 / 1,435 | Four three-step strips: pot, bowl, table, mug | The same four strips are on `/ways-to-use`, whose hero repeats this heading and lede word for word | **Keep, trim**: pot and mug only on laptops (one per pouch) |
| 6 | "That 18g figure? It's for dry dal." | 926 / 493 | The 18g myth, then 6g + 10g = 16g | `/truth` | **Keep, trim**: the sum on one row on phones |
| 7 | "Lunch and dinner menus." | 988 / 1,533 | Five menus for two, 90 to 120g on the table | Same idea as row 3 at meal size; homepage only | **Move** to `/ways-to-use` |
| 8 | "Built for you. Made for the whole family." | 636 / 567 | Three cards: you, the family, parents and grandparents | The shaker joke is row 9; "the whole family" is the founder band; kids and parents are FAQs; "20-30g in one meal" is row 3's maths | **Cut**, and give its best line to the founder band |
| 9 | "Reasons to stop shaking and start stirring" | 1,280 / 1,026 | Four ticks, then seven Heldi-vs-shake rows | The rows repeat row 5 (how you take it), row 4 (hot drinks), row 6 (94% whey isolate) and row 8 (who it feeds) | **Keep, trim**: the four ticks plus the two funniest rows, Flavours ("Birthday Cake Blast™") and Washing up |
| 10 | Founder band | 642 / 671 | Nani's photo and the name story | `/our-story` opens with the same photo and nearly the same words | **Keep**: it is the homepage's trust moment |
| 11 | "The questions we hear most." | 1,360 / 1,334 | Thirteen questions | All thirteen are on `/faq`; five are already answered by sections above | **Keep five** |
| 12 | "A jar for the table. On us." | 857 / 439 | A free brass jar with every pouch order | `/shop/khana` lists it under "Includes"; `/ways-to-use` has "On the table" | **Keep, trim** (smaller photo on phones), or **step 3** |
| 13 | "Be first to stir it in." | 379 / 374 | The waitlist ask | | **Keep** |
| 14 | Statutory wording | 296 / 213 | The required supplement text | Also on `/faq` and both shop pages | **Keep, tighten** the empty space above it |

### Which five FAQs to keep

These are the objections a desi family raises before trying it:

1. Will my food taste different?
2. Is whey protein vegetarian?
3. Is Heldi halal?
4. I am lactose intolerant. Can I have Heldi?
5. Is it safe for parents and grandparents?

The other eight stay on `/faq`. "How do I use it?" is row 5. "Why not just drink
a protein shake?" is row 9. "Is there a Heldi for chai?" is row 4. "Why do I need
more protein?" is row 6. "Can I use it in dishes not on the pouch?", "Can I put
Khana in my chai?", "Is it safe for kids?" and "I have diabetes" are narrower
questions people will look for on the FAQ page.

**How to build it safely.** Do not delete questions from
`components/home-faqs.ts`: `site-faqs.ts` pulls them into `/faq` by exact
question text, and the build breaks if one disappears (CLAUDE.md). Mark five as
featured and have the homepage render only those. The homepage FAQPage JSON-LD
in `app/page.tsx` should then list the same five, because FAQ markup is meant to
match what the page shows.

## What each step saves, measured

| Change | Phone | Laptop |
|---|---|---|
| Cut "Food you love. Nutrients you need." | −623 | 0 (already hidden) |
| Move the menus to Ways to use | −988 | −1,533 |
| Cut "Built for you" | −636 | −567 |
| FAQs from 13 to 5 | −624 | −624 |
| **Step 1 total** | **−2,871** | **−2,724** |
| Vs the shaker: four ticks and two rows | −493 | −242 |
| How it works: pot and mug only | 0 (it is a swipe rail; the rail is one card tall) | −534 |
| The 6g + 10g = 16g sum on one row | −250 | 0 (already one row) |
| Smaller jar photo on phones | −115 | |
| Tighter statutory block | −56 | |
| **Step 2 total** | **−914** | **−776** |
| Step 3: fold the jar into "Two pouches" as one line and a small photo | about −750 | about −400 |

One thing the numbers show: on a phone, removing cards from a swipe rail saves
nothing, because a rail is one card tall however many cards it holds. Phone
savings come from removing whole sections or making cards shorter.

## The order after steps 1 and 2

Hero → Two pouches → Stir it into everything → How it works → The honest truth
→ Heldi vs the shaker → Founder band → Five FAQs → Jar → Be first to stir it in →
Statutory → Footer.

Removing rows 2, 7 and 8 keeps the gold, ink and cream grounds alternating with
no two neighbours the same, so no section needs recolouring. Swapping "Two
pouches" above the stir gallery is optional. It would put the products
straight after the hero, but it needs one ground swapped to keep the
alternation.

## Two things the deep dive turned up

- **Dal is 9g in one place and 6g in two others.** The stir gallery starts dal
  tadka at 9g (`components/stir-gallery.tsx:25`), while the truth teaser
  directly below says a bowl of dal "lands closer to 6g", and `/our-story`'s
  menu card says 6g. For a brand whose first pillar is honest numbers, a visitor
  who reads both will notice. Worth one decision and one edit, whatever happens
  to the layout.
- **The phone-only stats section puts Khana's badges under Chai's name.** Its lede
  says "Chai does the same in the mug", but the badges beneath it (98%
  lactose-free, no added sugar, gluten free) are Khana-only claims. The hero
  code deliberately keeps Khana-only claims off the pair. Cutting the section
  (step 1) fixes this too. Its "All natural" stat is also the claim
  `docs/go-live-checklist.md` calls the weakest on the site.
