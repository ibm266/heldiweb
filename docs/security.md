# Security and abuse notes

What protects the public routes, what it does not cover, and the two things
that have to be done in the Vercel dashboard rather than in this repo.

## The shape of the problem

Everything under `app/api/` is a door anyone on the internet can knock on.
None of these routes has a login, because none of them needs one: they are
called by our own pages. The risk is not somebody breaking in, it is somebody
repeating a legitimate request until it costs us money:

- `/api/reviews` writes an uploaded file into the Supabase `review-media`
  bucket. Repetition fills the storage quota and parks unreviewed files there.
- `/api/waitlist` writes a row and creates a Klaviyo profile. Klaviyo bills per
  profile, so repetition is both list pollution and a bill.
- `/api/cart/*` proxies to the Shopify Storefront API with our token.
  Repetition burns the shop's API allowance, and then real customers see
  checkout errors.
- `/api/cart/discount-codes` is a guess at a real discount code every time. A
  working guess (the waitlist 20%, a gifting code) is revenue lost once shared.

## What the code does

`lib/rate-limit.ts` holds the caps and two gates, applied by every route:

| Route | Cap per address | Origin checked |
| --- | --- | --- |
| `/api/waitlist` | 5 / minute | yes |
| `/api/reviews` | 3 / hour | yes |
| `/api/reviews/upload-url` | 3 / hour | yes |
| `/api/preview-unlock` (POST) | 5 / 15 minutes | yes |
| `/api/preview-unlock` (DELETE) | none | yes |
| `/api/cart/discount-codes` | 10 / minute | yes |
| `/api/cart/*` (others) | 60 / minute | yes, except `get` |
| `/api/webhooks/shopify-orders` | none, by design | no |

## Review media uploads go straight to Supabase

The photo or video does **not** pass through a Vercel function. The browser
asks `/api/reviews/upload-url` for a signed URL, PUTs the file directly to the
private `review-media` bucket, then submits the form carrying only the object
path. Vercel rejects request bodies over 4.5MB, which is smaller than most
phone videos, so routing the file through our own server capped the feature at
4MB and failed with an opaque 413 above it.

What holds this together:

1. **The server chooses the path, never the client.** `uploads/<uuid>/media.<ext>`.
   The bucket is private with no policies, so the only way an object can exist
   in it is a signed URL minted by that route.
2. **`/api/reviews` verifies rather than trusts.** It checks the path against
   `REVIEW_MEDIA_PATH_PATTERN`, confirms the object exists, and reads the real
   size and content type from storage with `.info()`. A crafted submission
   cannot record a 2KB file as a 40MB video or claim an image type for
   something else, and cannot attach another submission's media without
   guessing a uuid v4.
3. **The bucket enforces its own limits** (migration `0004`): `file_size_limit`
   and `allowed_mime_types`. This is the only check in the upload path that
   cannot be bypassed, because it is the only one on Supabase's side.

Two consequences worth keeping in mind:

- **The mint route's rate limit is the load-bearing cap on storage abuse.**
  Neither this code nor the Vercel WAF ever sees the upload, so 3 mints per
  hour per address is the whole ceiling: at 50MB each that is 150MB/hour from
  one address against a 1GB bucket. Do not loosen `reviewUploadUrl` without
  lowering `mediaMaxBytes` to match.
- **`SUPABASE_URL` must be set at build time,** not just runtime. `next.config.ts`
  derives the `connect-src` CSP entry from it; without that entry the browser
  blocks the upload with nothing but "Failed to fetch" in the console. Verified
  25 Jul 2026: removing it does break uploads, so this is a real dependency and
  not a theoretical one.

## Two deliberate exceptions

- **`/api/cart/get` has no origin check.** Browsers do not send an `Origin`
  header on a same-origin GET, so requiring one would block our own cart
  reads. It is still rate limited. Cross-origin reads are not a leak: without
  CORS headers the browser withholds the response, and a cart id is not secret.
- **The Shopify webhook has neither.** It verifies an HMAC signature before
  doing any work, Shopify sends from many addresses, and dropping a genuine
  order burst would lose revenue data.

Testing these with curl needs an Origin header, since curl sends none:

```bash
curl -i -X POST http://localhost:3000/api/waitlist -H "Origin: http://localhost:3000" -H "Content-Type: application/json" -d '{"email":"a@b.com"}'
```

## The honest limitation

The counters live in the memory of a single serverless instance. Vercel runs
several and recycles them, so:

- a flood spread across many instances gets more through than the table says;
- a cold start forgets every counter;
- the function still runs, so it still costs an invocation.

This is a speed bump that makes casual abuse boring at zero cost and zero
dependencies. It is not a wall. The two items below are the wall, and both are
dashboard work.

## Dashboard work, not repo work

### 1. Move off the Hobby plan before launch

Vercel's fair use guidelines restrict Hobby to non-commercial personal use. A
storefront collecting a waitlist and preparing to sell is commercial, so Pro
($20/month) is required, not optional. Hobby also cannot set a spending limit:
when a limit is hit it disables the feature for 30 days, which for a shop is
worse than a bill.

After upgrading, enable **Spend Management** with a hard cap (e.g. £50) set to
pause projects. That single setting makes a runaway bill structurally
impossible regardless of any bug or attack.

### 2. Add WAF rate-limit rules

Vercel's firewall rules block at the edge, **before a function is invoked**,
so unlike the code above they stop the billing as well as the abuse. Pro allows
40 custom rules. Mirror the table above, slightly looser so the code caps stay
the tighter of the two:

| Path | Rule |
**Hard platform limits to design around** (checked July 2026):

- Counting window: **minimum 10s, maximum 600s (10 minutes)** on Hobby and Pro.
  Only Enterprise reaches 1 hour. So a "per hour" rule cannot be expressed here
  at all, which is why the long windows stay in `lib/rate-limit.ts`.
- **Hobby allows exactly one rate-limit rule** (out of 3 custom rules total).
  Pro allows 40.
- Counting keys: IP or JA4 digest only (Pro and below).
- Counters are tracked **per region**, so traffic arriving in several regions
  can exceed the configured limit in total.

**On Hobby, spend the single rule on the blanket net,** not a specific route:
`/api`, window `60`, limit `60`, keyed on IP. The per-route tightness already
lives in the code; the firewall's job here is protecting the bill.

**On Pro,** all keyed on IP, Fixed Window, **in this precedence order**:

| # | Path condition | Window (s) | Limit | Action |
| --- | --- | --- | --- | --- |
| 1 | equals `/api/reviews` | 600 | 5 | Deny for 30 min |
| 2 | equals `/api/reviews/upload-url` | 600 | 5 | Deny for 30 min |
| 3 | equals `/api/preview-unlock` | 600 | 10 | Deny for 30 min |
| 4 | equals `/api/cart/discount-codes` | 60 | 20 | Deny for 15 min |
| 5 | equals `/api/waitlist` | 60 | 10 | Default (429) |
| 6 | starts with `/api` AND does not contain `/api/webhooks` | 60 | 120 | Default (429) |

Rule 2 is not covered by rule 1: **"equals `/api/reviews`" does not match
`/api/reviews/upload-url`.** Without its own rule the mint route falls through
to the blanket's 120/minute, which is far too loose for the one endpoint that
gates storage writes.

Things that are easy to get wrong here, all verified against the live site on
25 Jul 2026:

- **The blanket rule must exclude `/api/webhooks`.** Otherwise it throttles
  Shopify's `orders/create` deliveries, and since Shopify retries for 48h and
  can burst during a launch spike, that means silently losing revenue data. The
  webhook is already gated by its HMAC check and needs no cap. Same reasoning
  exempts it in `lib/rate-limit.ts`.
- **Watch the exclusion's operator.** It must be **does not contain**. Set to
  **contains**, the two AND-ed conditions match only the webhook, so the rule
  inverts: it caps the one thing that must not be capped and leaves every other
  route unprotected. This shipped that way briefly and the only symptom was
  silence.
- **Keep the blanket rule last** as hygiene, though ordering matters less than
  it first appears: a rate-limit rule only blocks once its own limit is
  exceeded, so requests under the blanket's 120 still flow through to the
  tighter rules below it.
- **A persistent "deny for N minutes" action blocks the address site-wide,**
  not just on the path that triggered it. Confirmed by test: tripping the
  discount-code rule returned 403 for the homepage, `/shop`, every API route
  and even the webhook. Worth weighing before adding a timed block to a rule a
  real customer could plausibly trip.

These are looser than the code caps on purpose: our own routes stay the
stricter of the two, so normal use gets our friendly 429 copy and the firewall
only steps in on something that is clearly an attack.

**Where:** project dashboard, **Firewall** in the sidebar, **⋯ > Configure**,
**Add New... > Rule**, then **Rate Limit** as the **Then** action. Rules take
effect only after **Review Changes > Publish**.

Rules can also be described in natural language ("Rate limit /api to 120
requests per minute per IP") and generated, but check the window it produces:
anything over 600s is rejected by the form.

On the reviews and preview-unlock rules, set the action to **Deny** with a "for"
timeframe (a **persistent action**) where the dropdown offers one. That blocks
the address for longer than the 600s counting window can reach, and those
blocked requests are turned away before processing, so they do not count
towards CDN or traffic usage at all.

Follow Vercel's own advice and set a new rule's action to **Log** first, watch
the 10-minute live traffic on the Firewall overview to confirm it is catching
what you expect and not real customers, then switch it to **Deny**. Worth doing
for the broad `/api` rule especially.

Keep **Attack Mode** in mind as a break-glass switch during a live incident.

## Known gaps, deliberately left

- **No bot check on the forms.** The hidden `website` honeypot field catches
  naive spam only; it is visible to anyone who reads the page source.
  Cloudflare Turnstile is free and would close this, but it needs a Cloudflare
  account and a site key/secret pair, so it cannot be added from the repo alone.
- **`script-src` still allows `'unsafe-inline'`** (see `next.config.ts`).
  Tightening it to per-request nonces needs middleware. There is currently no
  path for user content to become executable script: the only
  `dangerouslySetInnerHTML` calls render repo-authored markdown and JSON-LD
  escaped through `lib/json-ld.ts`, and reviews are manually approved before
  display. So this is defence in depth, not an open hole.
- **Abandoned uploads are never cleaned up.** A signed URL is minted, the file
  lands in `uploads/`, and if the customer closes the tab before submitting,
  that object stays there with no row referencing it. The mint rate limit bounds
  how fast this can grow, but it only ever grows. A periodic sweep of
  `uploads/*` objects with no matching `reviews.media_path` (and older than the
  2h signed-URL lifetime) is the fix; there is no script for it yet.
- **No moderation interface.** Approving a review means opening the Supabase
  dashboard, finding the row in `public.reviews`, and changing `status` by hand,
  with a second trip to Storage to view the attached media through a signed URL.
  Workable at zero reviews, painful at launch volume.
- **The PostHog project key is public** (it has to be, it ships in the browser).
  Anyone can post fake events to the project and skew funnels. Inherent to
  client-side analytics.

## What is already right, and should stay that way

Worth stating so nobody "simplifies" it later:

- All three Supabase tables have RLS enabled with **no policies**. The anon key
  can therefore read nothing. The app uses the `service_role` key, server-side
  only, from `lib/supabase/admin.ts`, whose env vars are deliberately not
  `NEXT_PUBLIC_*` so a stray client import yields `null` instead of a leak.
- The `review-media` bucket is private; reads go through signed URLs.
- Reviews land `status: 'pending'` and require manual approval, which is also
  the DMCC Act 2024 requirement, not just a security control.
- The Shopify webhook verifies its HMAC with `timingSafeEqual` and a length
  pre-check **before** parsing the body.
- `lib/json-ld.ts` escapes `<`, `>`, `&` and U+2028/9 so an inline JSON-LD
  block cannot break out of its `<script>` tag.
- Security headers are applied to every route in `next.config.ts`.
