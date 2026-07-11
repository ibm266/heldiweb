# Reference assets

Brand files copied from the live site (`public/images/variants/ink-blue/`) for attaching to Claude Design / Fable sessions.

| File | Description |
|------|-------------|
| `pouch.png` | Single-SKU product pouch, marigold with ink elephant; packaging copy is colour/type truth |
| `heldi-wordmark.png` | HELDI logo, ink blue |
| `elephant-large-transparent.png` | Large decorated elephant (hero scale), transparent bg |
| `elephant-small.png` | Small elephant (CTA/footer scale) |
| `jars-both.png` | Gold and silver table jars with pouch |
| `hero-video-poster.png` | Hero film still, dining table scene before/after pouch reveal |

## Full library

Additional assets not copied here (use paths when needed):

```
public/images/variants/ink-blue/     ← live ink-blue set
public/images/originals/             ← pre-recolour backups
public/videos/heldi-hero-v3.mp4      ← hero film
hero-video/v2/stills/                ← keyframe stills from video production
```

## Recolour spec

When generating new assets that include dark fills:

- Black → `#011246` (ink blue)
- Keep `#eda31d`, `#f8f0de`, metallics, white unchanged

See `../design-tokens.json` → `imagery.recolorRule`.
