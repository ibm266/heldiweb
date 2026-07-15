---
name: new-post
description: Publish a Heldi Living blog post on the Heldi website end to end, the HTML body file, the posts.json metadata entry, the hero image, tags, and the automatic FAQ/Recipe schema. Use this whenever the user asks to add, publish, or wire up a blog post, article, recipe, or "Heldi Living piece" on the site, including "add the ghee post to the site", "publish this recipe", or when they paste finished copy and say put it on the blog. For writing the words themselves it defers to the heldi-blog-writer skill; this skill owns everything mechanical around the words.
---

# Publish a Heldi Living post

Two halves: the words (owned by the **heldi-blog-writer** skill) and the wiring
(owned by this one). Never freestyle the words; never hand-write schema.

## Step 1: The words

If finished copy was not supplied, invoke `heldi-blog-writer` to produce the
piece (it owns structure, voice, and SEO shape for Heldi posts). If copy was
supplied, still sanity-check it against BRAND.md §4 to §6: right voice, no em
dashes, British English, the only health claim is the verbatim §5 one.

## Step 2: The wiring (PLAYBOOK.md R4 is the recipe)

1. **Body file**: `content/heldi-living/<slug>.html` containing an `<article>`
   body. An optional `<div class="heldi-faq">` of `h3` + `p` pairs is
   auto-extracted into FAQPage JSON-LD by `lib/heldi-living.ts`, so put the
   post's FAQ there rather than inventing markup.
2. **Metadata**: add an entry to `content/heldi-living/posts.json` matching
   `HeldiLivingPostMeta` (`lib/heldi-living.ts`): `slug`, `title`, `tags`
   (reuse existing tags from other entries where they fit; new tags create new
   filter chips), `summary` (2 to 3 evidence-dense bullets), `description`
   (one sentence, in voice, no em dash), `image`, `publishedAt` (ISO date or
   null for unpublished), `htmlFile`, `order`. Recipe posts also fill the
   `recipe` block, which drives Recipe JSON-LD (times, yield, ingredients,
   instructions, protein content).
3. **Hero image**: `public/images/heldi-living/<slug>.webp` within the BRAND.md
   §15 budget (≤400KB, no more than 2× rendered size). Warm grade, home-kitchen
   framing (BRAND.md §8.8), never gym or shaker imagery.
4. The sitemap picks the post up automatically; do not edit `app/sitemap.ts`.

## Step 3: Prove it

```
npm run brand-lint && npm run typecheck && npm run build
```

The build renders every post statically, so a malformed posts.json entry fails
here. Then view `/heldi-living` (card appears, tag filters work) and the post
page via the `heldi-dev` launch config at mobile (375) and desktop (1280)
widths. Check the hero image is sharp, the summary bullets read well on the
card, and nothing scrolls sideways. If the post states protein numbers or
formulation facts, they must match BRAND.md §10 sources and the §11 impact map.
