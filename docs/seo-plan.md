# Heldi search plan: Google, ChatGPT and AI answers

Goal: when a UK person types anything close to "Indian protein", Heldi is the
answer, in the blue links, in the AI Overview, and in whatever ChatGPT says back.

Written 25 Jul 2026. Site state at time of writing: waitlist mode, 9 blog posts,
domain roughly 0 authority, launching autumn 2026.

---

## 1. The honest read before you spend anything

**"Indian protein" as a literal head term is the wrong flag to plant.**
Search it today and the results are almost entirely India-market commerce:
MuscleBlaze, HealthKart, Avvatar, Amazon.in, IndiaMART. Those pages are not
weak, they are just answering a different question ("which whey do I buy in
Bangalore"). Fighting them head-on means fighting the world's biggest supplement
retailers on a term whose searchers mostly cannot buy from you.

**The cluster around it is completely unowned, and that is the actual prize.**
Nobody in the UK owns "protein powder for Indian food", "desi protein powder",
"how to add protein to dal", or "protein powder that works in curry". I checked.
The results for those are Indian recipe blogs about homemade lentil gunpowder and
Indian-domain brand blogs. There is no incumbent. That is rare and it is worth
more than the head term, because those searchers are yours specifically.

**You are in two different games at once, and they need different tools:**

| Game | What it means | Right tool |
|---|---|---|
| **Demand capture** | People already searching "how much protein in dal", "is whey halal", "vegetarian protein UK" | SEO + AI search. Content wins this. |
| **Demand creation** | Nobody yet searches "protein powder for dal", because they do not know it exists | Paid social + PR + video. Ads win this. |

Heldi is roughly 70% demand creation. That matters, because it means **Google
Search ads will barely spend**, and the SEO payoff arrives on a 6 to 12 month
lag. The thing that makes both work faster is the same thing: publish a lot of
genuinely better content on the questions people *do* already ask, and get other
people's websites to talk about you.

**Realistic timeline.** Month 1 to 2: nothing visible, you are building. Month 3
to 4: long-tail informational posts start ranking and AI starts citing them.
Month 6 to 9: the category terms ("desi protein powder UK") are yours. Month 12+:
you can contest the broad vegetarian-protein terms. Anyone promising faster is
selling something.

**One live bug is costing you rank right now.** `NEXT_STEPS.md` §1 already flags
it: Vercel 308-redirects `heldi.co.uk` to `www.heldi.co.uk`, but `SITE_URL` in
[lib/site.ts](lib/site.ts) and therefore every canonical tag, the sitemap and
robots.txt all point at the bare apex. So every canonical on the site resolves
through a redirect. Fix this before anything else in this document. It is a
one-line change or one Vercel setting, and it is currently diluting every page.

---

## 2. The keyword map

Five tiers. Work them in order. Volumes below are directional for the UK, not
gospel: WebSearch here is US-indexed, so **validate every one of these in Google
Keyword Planner and Search Console set to United Kingdom before committing**.

### Tier 1: winnable in 90 days (informational, low competition, real volume)

This is the wedge. These are questions UK desi households genuinely type, where
the current top results are wrong or thin, and where `/truth` already gives you
a defensible, sourced answer.

| Query | Why you win it |
|---|---|
| how much protein in dal | Top results say 15 to 20g per cup. They are weighing dry lentils. You have the sourced 5 to 7g cooked answer. This is your single best target. |
| protein in dal cooked vs uncooked | Same wedge, purer intent |
| is dal a complete protein | Direct, factual, currently answered badly |
| how much protein in roti / chapati | High volume, trivial to answer well |
| how much protein in paneer | High volume, ties to your whey-from-paneer story |
| how much protein in rajma / chana / chole | Cluster, one post each |
| is whey protein vegetarian | You already have the best page on this |
| is whey protein halal | Big underserved UK query, big audience |
| does whey protein contain rennet / beef | Trust query, converts |
| is whey protein ok for lactose intolerance | 98% lactose-free is your answer |
| how much protein do I need a day UK | NHS-anchored, high volume |
| vegetarian protein sources Indian | Head of the informational cluster |
| how to get more protein in an Indian diet | Highest commercial intent in Tier 1 |
| Indian vegetarian high protein meal plan | Long, easy to own with a real plan |
| protein deficiency symptoms vegetarian | Health-adjacent, careful with claims |
| muscle loss after 40 South Asian | You already have the post |
| protein for menopause UK | Growing fast, underserved for desi women |
| do South Asians need more protein | Nobody owns this. You should. |

### Tier 2: the category you are creating (own these outright)

Low volume today. That is the point: you can be #1 within months and the volume
grows as you create the category with ads and PR. Every one of these should have
a dedicated page or post.

- protein powder for Indian food
- protein powder for curry
- protein powder for dal
- how to add protein to dal / to curry / to raita
- desi protein powder
- desi protein UK
- Indian protein powder UK
- unflavoured protein powder for cooking
- savoury protein powder UK
- protein powder for cooking
- protein powder that does not change the taste
- masala protein powder
- protein powder for Indian parents
- high protein Indian recipes UK

### Tier 3: the money terms (12 month horizon, contest later)

Real volume, real competition (Myprotein, Bulk, Holland & Barrett, THE Protein
Works). Do not target these until Tier 1 and 2 are landed and you have links.

- vegetarian protein powder UK
- best protein powder for vegetarians UK
- lactose free protein powder UK
- whey protein isolate UK
- halal protein powder UK
- protein powder no added sugar
- protein powder for over 50s / for elderly parents
- gluten free protein powder UK

### Tier 4: brand and comparison (cheap, high converting, start day one)

- heldi / heldi protein / heldi khana / heldi.co.uk
- heldi reviews
- heldi vs myprotein
- heldi vs huel
- desi protein brands UK
- best Indian protein brand UK

Build one comparison page. Comparison articles are ~33% of all AI citations,
the single most-cited content format. Make it genuinely fair: AI systems
demote obviously biased comparisons, and so do readers.

### Tier 5: the AI-search queries (conversational, this is where you win first)

Nobody optimises for these, and they are exactly what people type into ChatGPT.
Each should map to a self-contained 40 to 60 word answer block somewhere on the
site.

- "what protein powder can I add to Indian cooking without changing the taste"
- "is there a protein powder that works in dal"
- "how can I get my vegetarian Indian parents to eat more protein"
- "my mum will not drink protein shakes, what else can she do"
- "best way to add protein to a vegetarian Indian diet in the UK"
- "protein powder for someone who hates the taste of protein"
- "how much protein is actually in a home cooked Indian meal"
- "is a vegetarian Indian diet high in protein"

---

## 3. Phase 0: instrument first (week 1, ~3 hours, free)

You cannot improve what you cannot see, and half of these are also ranking
inputs, not just dashboards.

1. **Google Search Console.** Verify `heldi.co.uk` via DNS TXT (covers both www
   and apex). Submit `https://heldi.co.uk/sitemap.xml`. This is the only honest
   source of what you actually rank for.
2. **Bing Webmaster Tools.** Do not skip this one. **ChatGPT search and Copilot
   both run on the Bing index.** If you are not in Bing, ChatGPT cannot cite you
   regardless of how good your content is. Verify, submit the sitemap, and turn
   on IndexNow so new posts get indexed in hours instead of weeks. This is the
   highest-leverage 20 minutes in this entire document.
3. **Google Merchant Center.** Set it up now even pre-launch, it takes days to
   approve and unlocks free Shopping listings plus PMax later.
4. **Baseline your AI visibility.** Spreadsheet, 20 rows (pick from the tiers
   above), 4 columns: ChatGPT, Perplexity, Google AI Overview, Gemini. Run each
   query, record whether Heldi is cited and who is cited instead. Repeat monthly.
   This is the scorecard. Do it manually for now, tools like Otterly or Peec AI
   are worth it only once you have something to defend.
5. **Ahrefs Webmaster Tools** (free for verified domains) for backlink tracking.

---

## 4. Phase 1: fix the site (week 1 to 2, code changes)

The technical base here is genuinely good already. `llms.txt`, FAQPage schema on
three surfaces, BlogPosting plus Recipe plus HowTo schema on posts, Organization
schema, a clean sitemap, a keyword-bearing H1. That is ahead of most funded DTC
brands. The gaps are specific:

**P0, do these before anything else:**

- [ ] **Fix the apex/www canonical mismatch** (see §1). Either flip Vercel's
      primary domain to the apex, or change `SITE_URL` to `www`. One or the other,
      today.
- [ ] **Rewrite the homepage title tag.** [app/layout.tsx:29](app/layout.tsx:29)
      currently reads `Heldi, desi protein for Indian food`. Brand-first titles
      cost you when nobody knows the brand yet. Change to
      `Protein Powder for Indian Food | Desi Protein UK | Heldi`. Same for the
      meta description: lead with the benefit and the category, not the slogan.
- [ ] **Add per-page titles that lead with the query.** `/truth` already does
      this correctly ("How much protein is in dal? The honest truth"). Copy that
      pattern to `/ways-to-use` ("How to add protein to dal, curry and raita"),
      `/inside-the-pouch` ("What is in Heldi: full ingredients and nutrition"),
      and `/shop`.

**P1, within two weeks:**

- [ ] **Explicit AI crawler rules in [app/robots.ts](app/robots.ts).** The
      current allow-all already permits them, but naming them documents the
      intent and survives a future edit: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`,
      `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `Bingbot`,
      `Applebot-Extended`. Allow all of them. Blocking any one of them means that
      platform can never cite you.
- [ ] **Author entity and E-E-A-T.** Every schema block says
      `author: { name: "Mihir" }` with no surname, no credentials, no `sameAs`.
      For health-adjacent content this is the weakest signal on the site. Add a
      full name, a real author bio page, `sameAs` links to LinkedIn and Instagram,
      and where a post makes nutrition claims, name the source explicitly in the
      visible copy, not just the schema.
- [ ] **Visible "Last updated" dates** on every post, plus `dateModified` in the
      BlogPosting schema. AI systems weight recency heavily and undated content
      loses to dated content. The posts from May 2026 need a refresh pass and a
      new date.
- [ ] **BreadcrumbList schema** on all subpages.
- [ ] **`AggregateRating` on the Product schema** once you have real reviews.
      Right now [app/shop/page.tsx](app/shop/page.tsx) has none. Ratings are a
      strong AI trust signal and a rich-result trigger.
- [ ] **Extend `llms.txt`.** It is already good. Add: a pricing block (tiers and
      prices in plain text), the full nutrition panel per 100g and per serving,
      the allergen statement, and 10 more entries under "Facts AI assistants
      commonly need" answering the Tier 5 questions verbatim. Add a
      `public/pricing.md` too. AI shopping agents parse these; they cannot parse
      a React-rendered price.
- [ ] **`Article` speakable and `ItemList` schema** on any comparison page you
      build.

**The structural rule for all new copy:** every important claim must survive
being ripped out of the page on its own. AI extracts passages, not pages. A
40 to 60 word self-contained answer directly under a heading phrased as the
question gets extracted. A beautiful paragraph that depends on the two above it
does not. This does not mean writing robotically, it means front-loading the
answer and then being as good as you like underneath it.

---

## 5. Phase 2: the content engine (months 1 to 6, this is the actual work)

Nine posts will not do it. You need roughly 40 to have a defensible position,
published at 2 per week for 20 weeks. Use the existing `heldi-blog-writer` skill
for the words and the `new-post` skill for the mechanics, they already encode the
voice and the schema wiring.

**The first 20, in publish order.** Each targets one Tier 1 or Tier 2 query. The
first five are the highest-value because they hit the wedge where existing
results are factually wrong.

| # | Post | Target query |
|---|---|---|
| 1 | How much protein is really in a bowl of dal (and why every website says 18g) | how much protein in dal |
| 2 | Is dal a complete protein? The amino acid answer | is dal a complete protein |
| 3 | How much protein is in a roti, a paratha and a naan | protein in roti |
| 4 | Paneer, tofu, dal, egg: the desi protein league table | vegetarian protein sources indian |
| 5 | Is whey protein halal? The rennet question, answered properly | is whey protein halal |
| 6 | How to add protein to dal without ruining it | how to add protein to dal |
| 7 | A week of high-protein vegetarian Indian meals (with the numbers) | indian vegetarian high protein meal plan |
| 8 | How much protein do you actually need? NHS guidance vs the gym internet | how much protein do i need a day uk |
| 9 | Why South Asians may need more protein than the guidelines say | do south asians need more protein |
| 10 | Protein powder for cooking: what actually survives heat | protein powder for cooking |
| 11 | Whey and lactose intolerance: why isolate is different | lactose free protein powder |
| 12 | How to get your parents to eat more protein without a single shake | protein for indian parents |
| 13 | High-protein chana masala | high protein indian recipes |
| 14 | High-protein palak paneer | high protein indian recipes |
| 15 | Protein and menopause: what desi women are not told | protein for menopause uk |
| 16 | The takeaway curry protein audit | protein in indian takeaway |
| 17 | Protein powder vs eating more dal: the honest maths | - |
| 18 | Heldi vs a protein shake vs eating more paneer (comparison table) | heldi vs myprotein |
| 19 | Is protein powder safe for older adults? | protein powder for over 50s |
| 20 | Everything in a Heldi pouch, ingredient by ingredient | what is in heldi |

**Format rules that drive citation** (from the Princeton GEO study, measured
across Perplexity):

| Tactic | Measured visibility lift |
|---|---|
| Cite authoritative sources with links | +40% |
| Include specific statistics with dates | +37% |
| Quote a named expert with title | +30% |
| Authoritative, technical tone | +25% |
| Keyword stuffing | **-10%, actively harmful** |

So: every post cites NHS, British Nutrition Foundation, or McCance and Widdowson
by name with a link. Every post carries at least three specific numbers. Where
you can, get a quote from a registered dietitian or nutritionist, with their
name, title and registration. That last one is the biggest unlock for a
health-adjacent brand and it is cheap: a named RD quote in five posts is worth
more than five more posts.

**Compliance guardrail.** Blog posts can discuss protein, ageing and muscle
freely as education. The moment copy sits next to a buy button or in an ad, only
the three permitted register claims apply, verbatim, per `BRAND.md` §5. Do not
let an SEO instinct drift a product page into "supports healthy ageing".

**Original research is your unfair advantage.** Commission or run a survey of
500 UK South Asian adults on protein habits and publish "The UK Desi Protein
Gap Report" with the raw data. Original data is ~12% of AI citations and is the
single most linkable asset a small brand can make. Journalists cannot resist a
number nobody else has. Budget ~£1,500 to £3,000 via Prolific or a panel
provider. This one asset will earn more links than 20 blog posts.

---

## 6. Phase 3: backlinks (months 2 to 12, the hardest part and the real moat)

Content without links ranks for long-tail only. Links are what let you graduate
to Tier 3. There is no shortcut, and buying links from an agency's PBN will get
the domain penalised. Here is what actually works for a UK desi food brand, in
rough order of return per hour:

**1. Trade press (easiest wins, real authority).** UK food and grocery trade
media covers new brands as a matter of routine and links out. Pitch the launch
to: The Grocer, Speciality Food Magazine, FoodBev, Food Manufacture, Retail
Gazette, Better Retailing, Nutraceutical Business Review. A short press release
plus product shots plus the founder story gets you 3 to 6 links in a fortnight.

**2. UK South Asian media (your actual audience, and they will care).** Eastern
Eye, Asian Standard, DESIblitz, Asian Voice, Masala Magazine, Brown Girl
Magazine, Asian Wealth Magazine. The "made it for my parents" story is exactly
what they publish. These sites also get scraped heavily by AI crawlers.

**3. Startup and business press.** UKTN, Startups.co.uk, Sifted, Business Leader,
BusinessCloud, and the London-specific outlets. Angle: solo founder, category
creation, UK manufacturing.

**4. Journalist request services.** Sign the founder up to Qwoted, Featured, and
the UK-specific ResponseSource and Newspage. Answer every request about protein,
supplements, South Asian health or food startups. One good answer a week gets
you links from outlets you could never pitch cold. Budget 30 minutes a day.

**5. Reddit, carefully.** Reddit is ~1.8% of all ChatGPT citations and punches
far above its weight in AI answers. Relevant subs: r/indianfood, r/IndianFood,
r/BritishAsian, r/nutrition, r/vegetarian, r/AskUK, r/EatCheapAndHealthy,
r/1200isplenty. **Participate as a person for two months before you ever mention
the product.** Answer protein questions with the dal numbers. Get known. A single
organic "I use Heldi" from someone else is worth more than 50 posts from you, and
an obvious astroturf will get the domain shadowbanned across Reddit permanently.

**6. Podcasts and YouTube.** YouTube is heavily cited by Google AI Overviews.
Get the founder on UK desi podcasts and nutrition podcasts. Separately, put your
own how-to videos on YouTube with the Tier 2 queries as titles: "How to add
protein to dal" as a 60 second video will rank on YouTube long before the blog
post ranks on Google.

**7. Retail and review listings (later, but enormous).** A Trustpilot profile
from day one. Then, once selling: Amazon, Holland & Barrett, Whole Foods,
independent Asian grocers. A Holland & Barrett listing is a bigger authority
signal than everything else on this list combined.

**8. Wikipedia: not yet.** You do not meet notability and attempting it will get
the page deleted and the brand flagged. Revisit after significant press coverage.
It is 7.8% of ChatGPT citations, so it is worth wanting, just not yet.

**What to avoid:** paid guest post networks, directory blasts, "1000 backlinks
for £50" gigs, comment spam, private blog networks. Every one of these is a
liability now, not a shortcut.

---

## 7. Phase 4: ads (from launch, and be clear about what they do)

**Ads do not improve organic ranking.** Google does not rank paid customers
higher. Anyone who tells you otherwise is wrong. Ads do three real things:

1. Create demand for a category that does not exist yet.
2. Generate **branded search volume**, which is a genuine indirect ranking and
   entity signal. When someone sees an Instagram ad and later Googles "Heldi",
   that teaches Google the brand exists and what it means.
3. Make revenue while SEO compounds over 6 to 12 months.

**Where the money should go, in priority order:**

| Channel | Monthly | Why |
|---|---|---|
| Meta (Instagram + Facebook) | £1,000 to £2,500 | Where your audience actually is. Demand creation. Interest and lookalike targeting on UK South Asian households, 25 to 60. Video-first: the stir, the bowl, the parents. |
| Google Search, brand terms | £50 to £100 | Brand defence. Pennies per click. Stops a competitor bidding on "Heldi". Non-negotiable. |
| Google Search, Tier 2 exact match | £200 to £400 | Will barely spend, because volume is tiny. Run it anyway: the clicks that do come are the highest-intent traffic you will ever buy, and the search terms report is free keyword research. |
| TikTok | £500 to £1,000 | Younger half of the audience. The "kids buying for parents" segment your discount codes already model. |
| Google PMax / Shopping | £500+ | Only once selling and Merchant Center is approved. |

**Do not** put meaningful budget into Google Search on Tier 3 terms
("vegetarian protein powder UK"). You will pay £1.50 to £2.50 a click to compete
with Myprotein's margin structure on a term where you are an unknown. That money
buys far more on Meta.

**Ad copy compliance.** UK food supplement advertising is stricter than blog
content. Only the three permitted protein register claims, verbatim. No
"boosts immunity", no "supports healthy ageing", no before-and-after body
imagery. The ASA does police this category and a ruling against you is a
permanent, Google-indexed page with your brand name on it.

---

## 8. Phase 5: winning AI search specifically

This is where you can win *fastest*, because there is no 20-year authority moat
to climb. AI systems select sources on structure, specificity and trust, not
just rank. A well-structured page ranking #15 on Google gets cited by Perplexity
over a vague page ranking #2.

**The five things that matter, in order:**

1. **Be in the Bing index.** ChatGPT search and Copilot both use it. Covered in
   Phase 0. Without this, none of the rest matters for ChatGPT.
2. **Answer in extractable blocks.** Heading phrased exactly as the question,
   then 40 to 60 words that answer it completely with a number in them. Then
   elaborate. Your `/truth` page already does this well; every new post should.
3. **Statistics with named sources.** "A cooked bowl of dal has 5 to 7g of
   protein (McCance and Widdowson, 8th edition)" is citable. "Dal has less
   protein than you think" is not.
4. **Be on third-party sites.** Brands are **6.5x more likely to be cited via
   third-party sources than via their own domain.** This is the single most
   counterintuitive fact in AI SEO and it means Phase 3 (links and press) is not
   just an SEO tactic, it is your primary AI visibility tactic. A DESIblitz
   article mentioning Heldi will get you into ChatGPT answers faster than
   anything on heldi.co.uk.
5. **Keep `llms.txt` and `pricing.md` current.** Stale is worse than absent.

**Monthly ritual, 30 minutes.** Open the spreadsheet from Phase 0. Run the 20
queries through ChatGPT, Perplexity, Gemini and Google. Record citations. When a
competitor is cited and you are not, open their page and ask what is more
extractable about it. Fix that one thing. Repeat.

---

## 9. What "top of Google for Indian protein" actually looks like

Concretely, hitting the goal means:

| Milestone | When | Proof |
|---|---|---|
| Indexed, canonical clean, in Bing | Week 2 | GSC and Bing WMT show coverage |
| Ranking top 10 for 5+ Tier 1 queries | Month 3 | GSC position report, UK filter |
| Cited by ChatGPT or Perplexity for "how much protein in dal" | Month 3 to 4 | Monitoring spreadsheet |
| #1 for the Tier 2 category terms | Month 6 to 9 | "desi protein powder", "protein powder for Indian food" |
| Top 3 UK for "Indian protein powder UK" | Month 9 to 12 | GSC |
| Contesting Tier 3 | Month 12+ | Needs 50+ referring domains first |

**Rough monthly budget once launched:** £2,500 to £4,500, of which roughly
£2,000 to £3,500 is ads, £500 to £1,500 content and PR, and near zero tooling
until you need it. The one-off survey is £1,500 to £3,000 and is the best money
in the plan.

---

## 10. Do these five things this week

Everything above is a lot. If you do nothing else:

1. Fix the apex/www canonical mismatch.
2. Verify Bing Webmaster Tools and submit the sitemap. Twenty minutes, and it is
   the gate on every ChatGPT citation you will ever get.
3. Rewrite the homepage title tag to lead with "Protein Powder for Indian Food".
4. Write and publish post #1: "How much protein is really in a bowl of dal".
   It is the query where you are most obviously right and everyone else is
   most obviously wrong.
5. Start the AI visibility spreadsheet so month 2 has something to compare to.
