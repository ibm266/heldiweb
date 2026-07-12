# Reference assets

Image files copied from the live site for attaching to Claude Design / Fable sessions.

## Brand

| File | Description |
|------|-------------|
| `pouch.png` | Single-SKU product pouch, marigold with ink elephant |
| `heldi-wordmark.png` | HELDI logo, ink blue |
| `elephant-large-transparent.png` | Large decorated elephant (hero scale), transparent bg |
| `elephant-small.png` | Small elephant (CTA/footer scale) |
| `jars-both.png` | Gold and silver table jars with pouch |
| `jar-gold.png` | Gold-lid table jar |
| `jar-silver.png` | Silver-lid table jar |
| `hero-video-poster.png` | Hero film still — dining table scene |

## How it works icons (`how-it-works/`)

| File | Step |
|------|------|
| `step-1-cook.png` | Cook like always |
| `step-2-stir.png` | Stir in a spoonful |
| `step-3-eat.png` | Eat what you love |

## Pouch badges (`pouch-badges/`)

| File | Label |
|------|-------|
| `lactose-free.png` | 99% lactose-free |
| `no-sugar.png` | No added sugar |
| `gluten-free.png` | Gluten free |
| `vegetarian.png` | Vegetarian |

## Stir gallery dishes (`stir-gallery/`)

| File | Dish |
|------|------|
| `dal-tadka.webp` | Dal tadka |
| `chana-masala.webp` | Chana masala |
| `cucumber-raita.webp` | Cucumber raita |
| `kadhi.webp` | Kadhi |
| `bowl-of-dahi-clean.webp` | Bowl of dahi |

## Full library (not copied here)

```
public/images/variants/ink-blue/     ← live ink-blue set
public/images/originals/             ← pre-recolour backups
public/videos/stir-gallery/        ← stir-in loop videos
public/videos/heldi-hero-v3.mp4      ← hero film
```

## Recolour spec

When generating new assets that include dark fills:

- Black → `#011246` (ink blue)
- Keep `#eda31d`, `#f8f0de`, metallics, white unchanged

See `../design-tokens.json` → `imagery.recolorRule`.
