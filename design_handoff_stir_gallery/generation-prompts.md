# Generation prompts: dish photos & animation spec

Companion to `README.md`. Use the photo prompts with any high-quality image generator (or as a shot list for a real photographer). The animation spec is the exact motion the prototype implements and the production build should match.

---

## Master photo context block

Paste at the start of every dish-photo prompt:

```
Brand: Heldi — desi protein powder that disappears into home-cooked Indian food. The dish must look completely ordinary and delicious: the whole message is that nothing visibly changes when Heldi is stirred in.

Photography style: hyper-realistic, top-down (90 degrees overhead), single bowl centered, real UK Desi home kitchen — not restaurant plating, not stock "exotic India". Warm colour grade aligned to marigold #eda31d and cream #f8f0de. Natural window light or warm tungsten. Slight steam is welcome. Sharp focus on the food.

Surface: warm wood table or cream cloth. Props minimal: a steel spoon, maybe a second bowl edge or roti at the frame edge.

Never: protein powder visible on/in the food, shaker bottles, blenders, gym context, cold blue grading, visible text or logos baked into the image.

Crop: square 1:1, bowl filling ~80% of frame (it will be displayed in a 190px circle at 2x, so deliver at least 800×800).
```

---

## The five dish prompts

### 1. Dal tadka (THE MAIN)
```
Top-down photo of a bowl of dal tadka: golden-yellow tempered lentils with a visible tadka of cumin seeds, dried red chilli and curry leaves in ghee swirled on top, scattered fresh coriander. Steel or ceramic bowl, home-portion size. Warm, glossy, freshly cooked.
```

### 2. Chana masala (THE MAIN)
```
Top-down photo of a bowl of chana masala: chickpeas in a rich reddish-brown onion-tomato gravy, slivers of ginger and green chilli on top, sprinkle of coriander. Home-cooked texture — slightly rustic, not restaurant-smooth.
```

### 3. Cucumber raita (ON THE SIDE)
```
Top-down photo of a small bowl of cucumber raita: creamy white yoghurt with grated cucumber, a light dusting of roasted cumin powder and a few coriander leaves. Cool, fresh, matte yoghurt texture with gentle swirls.
```

### 4. Kadhi (THE MAIN)
```
Top-down photo of a bowl of kadhi: pale turmeric-yellow yoghurt-gram flour curry with soft pakora dumplings partly submerged, a red-chilli ghee tadka drizzled on top. Gentle steam, homely and comforting.
```

### 5. Bowl of dahi (ON THE SIDE)
```
Top-down photo of a small steel bowl of plain dahi (homemade set yoghurt): thick, just-set surface with a spoon dip taken from one edge. Simple, clean, everyday — the most ordinary bowl on the table.
```

### Consistency note
Generate/shoot all five with the same surface, light direction and grade so the gallery reads as one table. If the generator supports it, state: "part of a five-image series on the same wood table, same warm light from the upper left."

---

## Animation spec (what the section should feel like)

All motion is feedback for one action: **stirring a spoonful in**. Nothing animates idly; the section is calm until tapped. Respect `prefers-reduced-motion: reduce` by disabling the particle burst and pops (numbers still update instantly).

### 1. Powder particle burst (on every stir tap)
- 12 dots, 7px, cream `#f8f0de` fill with 1px ink `#011246` border.
- Spawn just above the top of the dish circle, spread across 10–90% of its width.
- Each falls ~110px while scaling 1 → 0.4 and fading out; duration 1.2s, ease-in (accelerating, like falling powder); staggered delays 0–0.7s.
- Burst lives 1.3s then cleans up; re-tapping restarts the timer. Keyframes:
  `0% { transform: translateY(-8px) scale(1); opacity: 0 } 15% { opacity: 1 } 100% { transform: translateY(110px) scale(0.4); opacity: 0 }`

### 2. Counter pop (per-dish grams + grand total)
- The number updates **in place** (never re-mount the node — earlier builds that re-mounted keyed nodes rendered duplicate stacked numbers).
- Scale 1 → 1.15 (dish) / 1.12 (total) and back, `transform 0.25s ease` transition, triggered on each stir.
- Dish counter colour crossfades ink `#011246` → terracotta `#a8432b` once the dish is boosted.

### 3. Caption swap
- New line appears instantly with the state change; optional 150ms fade-in. Reserve min-height 36px so the card never reflows.

### 4. Gallery motion
- Native horizontal swipe with `scroll-snap-type: x mandatory`, cards snap to center.
- Dot taps scroll smoothly to center the target card (measure the card's real position; no hardcoded stride; never `scrollIntoView`).
- Active dot fills ink with a 150ms background transition.

### 5. Optional launch polish (not in prototype, nice-to-have)
- On first scroll into viewport: cards stagger in with a 250ms fade + 12px rise, 60ms apart, once only.
- Totals band number can roll odometer-style (count up ~400ms) instead of jumping, if cheap in your stack.

### Timing summary
| Element | Duration | Easing |
|---------|----------|--------|
| Particle fall | 1.2s (+0–0.7s stagger) | ease-in |
| Counter pop | 0.25s | ease |
| Caption fade (optional) | 0.15s | ease |
| Dot fill | 0.15s | ease |
| Snap scroll | native smooth | — |

---

## Checklist before accepting a photo

- [ ] Looks like a real home kitchen, not a restaurant or stock shoot
- [ ] Top-down, bowl centered, crops cleanly to a circle
- [ ] Warm grade that sits happily next to marigold #eda31d and cream #f8f0de
- [ ] No powder, packaging, text or logos in the image
- [ ] Matches the other four (same table, same light)
