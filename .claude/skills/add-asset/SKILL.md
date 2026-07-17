---
name: add-asset
description: Add, replace, or regenerate any image, video, or animation on the Heldi website so it ships inside the BRAND.md §15 performance budgets. Use whenever the user asks to add or swap a photo, product shot, illustration, icon, blog hero, poster, video clip, or animated flourish, or when wiring a new <Image> or <video> element into a component, even if they never mention performance or file size. Do not use for pure copy edits or for building whole sections (use add-section).
---

# Add an asset to the Heldi site

Every asset ships to phones on Instagram's in-app browser over cellular. The
site earned its load times (homepage ~1.4MB, /shop ~0.4MB first load, July
2026); one careless 2MB PNG or preloaded video undoes it. This skill is the
order of operations. `npm run brand-lint` enforces the greppable parts and
must pass before you finish.

## Step 0: Load the budgets (BRAND.md §15, read it, numbers are there)

The ceilings, restated:

- **Image**: ≤ 400KB in `public/images`, and no more than 2× its largest
  rendered CSS width. WebP for photos (q80); near-lossless WebP for alpha
  line art; PNG only if it measurably beats WebP (rare, test both).
- **Video**: ≤ 1MB per second actually played, ≤ 8MB per file, resolution no
  more than 2× the rendered size, **no audio stream** on muted/autoplay files,
  `+faststart`.
- **First-load transfer**: `/` ≤ 4MB, `/shop` ≤ 3MB. If your asset is eager
  (above the fold, `priority`, or `preload="auto"`), re-measure the page.

## Step 1: Compress BEFORE the file touches `public/`

This machine has no ffmpeg, no cwebp, no Homebrew. Use what is here:

**Images** (sharp is in `node_modules`):

```bash
node -e "
const sharp = require('./node_modules/sharp');
sharp('SOURCE.png')
  .resize({ width: TWICE_RENDERED_CSS_WIDTH })   // omit if already sized
  .webp({ quality: 80 })                          // photos
  // .webp({ nearLossless: true, quality: 60 })   // alpha line art instead
  .toFile('public/images/<dest>.webp').then(i => console.log(i.size/1024|0, 'KB'));
"
```

**Videos** (install `ffmpeg-static` in a scratch dir, never in the repo):

```bash
npm install --prefix /tmp/ff ffmpeg-static
FFMPEG=$(node -e "console.log(require('/tmp/ff/node_modules/ffmpeg-static'))")
"$FFMPEG" -i SOURCE.mp4 -t <seconds-that-play> -vf scale=<2x-rendered>:-2 \
  -an -c:v libx264 -crf 26 -preset slow -movflags +faststart public/videos/<dest>.mp4
```

Poster frames: `"$FFMPEG" -i clip.mp4 -frames:v 1 poster.png` then run the
sharp WebP conversion on it.

**Masters**: the uncompressed source never lands in `public/` tracked paths.
Put it in the gitignored `public/images/originals/` (images) or the
`hero-video/` / `stir-gallery-video/` workspace dirs (video sources).

## Step 2: Wire it in, the blessed way

**Images:**

- Always `next/image`, never raw `<img>` (brand-lint errors on it; the only
  exception is Satori og-card JSX under `components/og/`).
- Always an accurate `sizes` attribute, including on small fixed icons: a
  missing `sizes` makes 2x phones fetch transforms at double the `width` prop
  (brand-lint flags any `<Image>` with `fill` or `width` ≥ 200 and no `sizes`).
  Write the rendered CSS width, e.g. `sizes="32px"` or
  `sizes="(max-width: 899px) 52vw, 420px"`.
- `priority` only for true LCP candidates (hero pouch, nav wordmark); the
  two nav elephants are already the ceiling.
- Regenerating a file in place? Bump its `?v=` (imageSrc IMAGE_VERSION or the
  literal query string), or the optimizer serves the stale version for a month.

**Videos:**

- Default posture: mount on demand, `preload="none"`, always a `poster`,
  pause or skip under `prefers-reduced-motion`. Copy the stir gallery
  (`components/stir-gallery.tsx`), it is the reference implementation.
- `preload="auto"` is reserved for the hero curtain alone; brand-lint warns
  on any new one. Never mount a list of eager videos.
- Muted autoplay files carry no audio stream (strip with `-an`).

**Animations:**

- CSS or canvas only, on demand, no new dependency (no lottie, no framer,
  no carousel libs; §15.4). Animate `transform`/`opacity`, not layout.
- Every flourish needs the `prefers-reduced-motion` fallback (§8.6): skip,
  pause, or settle to the end state.

## Step 3: The finishing gate

1. `npm run brand-lint` passes with no new warnings.
2. Verify at 375px and 1280px on the real page (`heldi-prod` launch config).
3. If the asset loads eagerly, re-measure first-load transfer for that page
   and check it against the §15.1 target.
4. Grep your diff for `—` (no em dashes in any copy you touched).
