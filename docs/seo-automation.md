# Automating the search plan

Companion to [seo-plan.md](seo-plan.md). That doc says what to do. This one says
what runs itself, what runs with a 15 minute human gate, and what you must not
automate.

Written 25 Jul 2026.

---

## 1. The honest split

You asked to stop hand-making posts and hand-adding links. Two of those three
things automate well. One does not, and the reason matters.

| Work | Automatable? | Notes |
|---|---|---|
| Schema, sitemap, RSS, canonical tags | **Already done** | Next.js + `lib/heldi-living.ts` handle it. You have never hand-written schema and never should. |
| Search engine pinging on publish | **Fully** | IndexNow. Zero human, forever. |
| Rank and AI-citation monitoring | **Fully** | Scheduled agent writes you a report. |
| Repurposing a post into email, Reel script, captions | **Fully** | Skills already exist for all three. |
| Writing and wiring a blog post | **To a review gate** | Agent does ~90%, you spend 15 minutes approving a PR. |
| Link building and PR outreach | **No.** Do not try | See §7. Automating this is the one thing here that can actively damage the domain. |

**Why the post pipeline keeps a human gate.** Two independent reasons, both real:

1. **Google's scaled content abuse policy** (live since the March 2024 spam
   update) explicitly targets mass-produced content published without human
   review or added value. It is enforced with manual actions. A pipeline that
   commits straight to `main` is the exact pattern it describes.
2. **You sell a food supplement in the UK.** `BRAND.md` §5 permits three protein
   claims, verbatim. `npm run brand-lint` catches em dashes and banned words by
   grep, but it cannot catch an agent writing "supports healthy ageing" or
   inventing a nutrition figure. The ASA does enforce this and a ruling is a
   permanent indexed page with your brand on it.

The gate costs you 15 minutes per post instead of 3 hours. That is the win. A
fully unattended publisher is not a bigger win, it is a liability.

---

## 2. The stack

Almost all of it is free, and most of it is things you already own.

| Layer | Tool | Cost | Status |
|---|---|---|---|
| Writing | `heldi-blog-writer` skill | owned | Already encodes voice, structure, SEO shape |
| Wiring | `new-post` skill | owned | Already does HTML, posts.json, schema, image |
| Orchestration | Claude Code scheduled agents (`/schedule`) | plan | Runs the pipeline on a cron |
| Version control gate | GitHub PRs | free | The human gate. Already have the repo. |
| CI checks | GitHub Actions | free | Runs brand-lint, typecheck, build on every PR |
| Deploy | Vercel | current | Already auto-deploys on merge |
| Indexing | IndexNow + GSC + Bing WMT | free | The missing piece. See §4. |
| Rank data | Search Console API | free | Pulled by the monitoring agent |
| Backlink data | Ahrefs Webmaster Tools | free | Free for domains you verify |
| AI visibility | Scheduled agent, not a SaaS | free | See §5 before paying Otterly £100/mo |
| Email | `scripts/send-weekly-letter.mjs` + Klaviyo | built | Already clones from `/feed.xml` |
| Keyword validation | Google Keyword Planner | free | Needs any active Ads account |

**What you do not need:** Surfer, Jasper, Frase, Clearscope, MarketMuse, Byword,
SEObot, or any "autoblog" product. They are content mills wearing a UI, they
cannot hold the Heldi voice, and they produce exactly the pattern Google
penalises. You already have better tooling in this repo.

---

## 3. The content pipeline

Target: one command's worth of human effort per post, twice a week, forever.

```
docs/seo-queue.json   (the keyword backlog, ordered)
        |
        v
scheduled agent, Tue + Fri 07:00
  1. read the queue, take the next unshipped item
  2. invoke heldi-blog-writer for the words
  3. invoke new-post for the wiring
  4. run: npm run brand-lint && npm run typecheck && npm run build
  5. git checkout -b post/<slug>, commit, gh pr create
  6. mark the queue item "in-review"
        |
        v
YOU: read the PR, 15 minutes
  - facts and figures correct and sourced?
  - health claims limited to the three permitted ones?
  - voice right, no em dashes, British English?
  - merge, or comment and let the agent revise
        |
        v
Vercel deploys -> sitemap, feed.xml, schema all update themselves
        |
        v
post-merge automations fire (§4 and §6)
```

**The queue is the thing you actually maintain.** Seed it once with the 20 posts
from [seo-plan.md](seo-plan.md) §5, each with its target query. After that you
top it up monthly from Search Console's "queries where you rank 5 to 20" report,
which is a list of things you almost rank for and would rank for with a
dedicated post. That refill can itself be a monthly agent that appends to the
queue and opens a PR against it.

**Why PRs rather than direct commits.** The build is the safety net. Every post
renders statically, so a malformed `posts.json` entry fails CI before it can
reach production. That check only helps if there is a gate for it to block.

---

## 4. Indexing automation (build this first, it is the cheapest win)

Right now a new post waits for Google and Bing to notice it. That can be weeks.
Two things fix it permanently.

**IndexNow.** One HTTP POST tells Bing, Yandex, Seznam and Naver that a URL
changed, typically indexed within hours. **Be clear about what this does and does
not cover:** Bing is what matters here because ChatGPT search and Copilot both
run on the Bing index. IndexNow does **not** feed Google. Google has said it is
evaluating the protocol, nothing more. Google gets your posts via the sitemap and
GSC.

Setup, roughly an hour once:

1. Generate a key (any 32 character hex string).
2. Serve it at `https://heldi.co.uk/<key>.txt` containing the key as the only
   content. A file in `public/` does this.
3. Add a GitHub Action on push to `main` that diffs `content/heldi-living/` and
   POSTs any changed URLs to `https://api.indexnow.org/indexnow`.

Then it never needs touching again.

**Google.** Verify in Search Console, submit the sitemap once, done. Do not
bother with the old sitemap ping endpoint, Google retired it in 2023. For a site
this size the sitemap alone is enough once the domain has any crawl history.

---

## 5. Monitoring automation

A weekly scheduled agent, Monday morning, that emails or Slacks you one report:

- **Search Console API**: impressions, clicks and average position for the Tier 1
  and Tier 2 queries, week over week. Flag anything that moved more than 3
  positions. Flag any query where you rank 5 to 20 (those are queue candidates).
- **AI citation check**: run the 20 queries from the plan through whichever AI
  surfaces you can reach programmatically, record whether Heldi is cited and who
  is cited instead. Append to a CSV in the repo so you have a real time series.
- **Backlinks**: new referring domains from Ahrefs Webmaster Tools.
- **Nothing else.** A report you skim in two minutes gets read. A dashboard with
  40 metrics does not.

**On paying for AI visibility tools.** Otterly, Peec AI and ZipTie are £30 to
£150 a month to do roughly what the agent above does. Worth it when you have
share-of-voice to defend across many queries. For 20 queries and a pre-launch
brand, the agent is enough. Revisit in six months.

---

## 6. Repurposing automation (the real leverage)

This is where automation pays best, and it is the part most people skip. One
merged post should fan out into five assets without you writing anything:

| Output | Tool | Trigger |
|---|---|---|
| Weekly letter email | `scripts/send-weekly-letter.mjs` | **Already built.** Clones the Klaviyo base campaign from `/feed.xml`. Just needs scheduling. |
| Reel / TikTok script + shot list | `heldi-content-creator` skill | Post-merge agent |
| 5 hook variants for the Reel | `heldi-hook-master` skill | Post-merge agent |
| Instagram carousel captions | `heldi-content-creator` skill | Post-merge agent |
| YouTube short with the target query as the title | `heldi-seedance-director` skill | Post-merge agent |

That last one matters more than it looks. YouTube is heavily cited by Google AI
Overviews, and "How to add protein to dal" as a 60 second video will rank on
YouTube months before the blog post ranks on Google. Same script, different
surface, near zero extra work.

**Scheduling the weekly letter.** `send-weekly-letter.mjs` is written to be safe
to run daily (it records sends in `public.sent_campaigns` and never doubles up),
so put it on a GitHub Action daily cron and forget it. It needs
`KLAVIYO_BASE_CAMPAIGN_ID`, which does not exist yet, plus the Klaviyo key from
`NEXT_STEPS.md` §2.

---

## 7. What you must not automate

**Link building.** There is no tool that earns real links. What automated
outreach tools actually do is send templated emails at scale, which journalists
and editors filter to spam, and which burns the domain's name with the outlets
you most want. The three tactics that work for you (trade press, UK South Asian
media, journalist request services) all depend on the founder being visibly a
real person with a real story. That is the asset. Automating it destroys it.

Budget 30 minutes a day for Qwoted and ResponseSource responses. That is the
single highest-return unautomatable half hour in the plan.

**Reddit.** Automated or templated posting gets domains shadowbanned across the
entire site, permanently and unappealably. Reddit is ~1.8% of ChatGPT citations
so it is worth real effort, but only as yourself, and only after two months of
answering questions without mentioning the product.

**Publishing without reading.** Covered in §1. The 15 minutes is the point.

**The original research survey.** A human designs the questions or the data is
worthless.

---

## 8. Build order

1. **IndexNow + Bing Webmaster Tools.** Half a day. Unblocks every ChatGPT
   citation you will ever get.
2. **GitHub Actions CI** running `brand-lint`, `typecheck`, `build` on PRs. An
   hour. Makes the gate in step 4 safe.
3. **Schedule `send-weekly-letter.mjs`.** Already written. Needs the Klaviyo key
   and base campaign, then a cron.
4. **`docs/seo-queue.json` + the twice-weekly drafting agent.** The big one.
   Seed it with the 20 posts from the plan.
5. **Weekly monitoring agent.** After the pipeline is running, so it has
   something to measure.
6. **Post-merge repurposing agent.** Last, because it multiplies content and
   there needs to be content first.

Steps 1 to 3 are a day's work and are pure infrastructure. Step 4 is the one
that removes the work you actually want removed.
