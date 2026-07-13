# Heldi homepage — current copy v1

Snapshot of all live marketing copy and how it is presented on the homepage as of July 2026.

**Source:** `components/heldi-homepage.tsx`, `components/stir-gallery.tsx`, `components/menu-gallery.tsx`, `components/audience-gallery.tsx`, `app/layout.tsx`

**Live layout:** `heroLayout="reveal"` · `grams={10}` · `ticker` enabled

---

## Meta

| Field | Copy |
|-------|------|
| **Title** | Heldi, desi protein for Indian food |
| **Description** | Protein made to disappear into dal, curry, raita and the home-cooked food you already love. |

**Presentation:** Standard `<title>` and meta description. No on-page animation.

---

## Navigation

| Element | Copy |
|---------|------|
| Logo alt | Heldi |
| Links | Tonight's table · How it works · FAQ |
| CTA | Join waitlist |

**Presentation:**
- Sticky ink-blue bar with gold text and 3px gold bottom border
- Desktop: horizontal links + pill CTA
- Mobile: elephant badge replaces wordmark; burger opens dropdown; floating "Join waitlist" pill appears bottom-right when hero/footer CTAs are off-screen
- Nav hidden behind hero intro curtain until elephant animation completes (`nav--intro`)

---

## Hero (reveal layout — live default)

### Intro sequence (~4s, first visit)

**Aria-label (curtain):** Decorated ink-blue elephants and comic dust cloud sweep across the screen

**Presentation:**
- Full-width marigold curtain covers hero on load
- Elephant run video plays on canvas with chroma-keyed gold background removed (ink elephants + dust cloud remain)
- Curtain fades; white sticker showcase card and actions animate in
- Skipped entirely when `prefers-reduced-motion: reduce`

### Revealed hero copy

**Headline (H1):**
> Protein Powder for  
> [INDIAN FOOD · DAL · CURRY · RAITA · DAHI · CHAAT] *(rotating dissolve words)*

**Pronunciation:**
> /hel-dee/ *adj.* how my nani says "healthy."

**CTAs:** Join waitlist · How it works

**Pouch alt text:** Heldi pouch, same recipes, same taste, more protein

**Product attribute pills (below pronunciation rule):**
- High protein
- All natural
- 99% lactose-free
- No added sugar
- Gluten free
- Vegetarian

**Waitlist success:** You're on the list. One email the day we launch.

**Form placeholder:** you@example.com

**Presentation:**
- White sticker card: 3px ink border, 20px radius, hard offset shadow (`8px 8px 0 #011246`)
- Headline prefix in Rozha One (ink); rotating words in terracotta via **dissolve animation** (blur + translateY, staggered per letter)
- Pouch product photo in right column of showcase card
- Pronunciation in Gelasio italic, centred below interior rule
- Attribute pills: icon + label chips in showcase footer
- Waitlist: pill button expands to email input + submit on click
- "How it works" = outline pill linking to `#how`
- On mobile, CTAs duplicate below showcase card

---

## Ticker (marquee)

> MADE IN THE UK  •  FOR INDIAN KITCHENS  •  NO SHAKER, NO BLENDER  •  100% VEGETARIAN  •  FREE JAR WITH YOUR FIRST ORDER  •  SAME RECIPES, SAME TASTE  •  LAUNCHING AUTUMN 2026  •

**Presentation:**
- Ink background band inside hero section, below showcase
- Gold uppercase text in infinite horizontal scroll (duplicated track for seamless loop)
- Followed by double rule (two 3px ink lines)

---

## The Pouch (`#pouch`)

**Headline:** Food you love. Nutrients you need.

**Body:**
> One blend that **vanishes** into any gravy, dal or yoghurt base. **Dissolves clean**. No chalk, no aftertaste.

**Stats:**
| Card | Value | Label |
|------|-------|-------|
| Gold | 10g | protein per bowl |
| White | All natural | ingredients |

**Badges:**
- 99% lactose-free
- No added sugar
- Gluten free
- Vegetarian

**Presentation:**
- Cream background, centred column (max ~640px)
- Body copy in brown Gelasio; emphasis via `.copy-emphasis` (ink, weight 600)
- 2×2 stat grid: alternating gold/white sticker cards with hard offset shadows
- Badge pills: white bg, 2px ink border, icon + label, 4px offset shadow

---

## Stir gallery (`#stir`)

**Eyebrow:** SEE IT IN ACTION

**Headline:** Stir it into everything.

**Lede:**
> Every dish on tonight's table takes a spoonful. Keep stirring. Nothing changes but **the protein**.

**Hint:** swipe the table →

### Dishes

| Dish | Tag | Base protein |
|------|-----|--------------|
| Dal tadka | THE MAIN | 9g |
| Chana masala | THE MAIN | 8g |
| Cucumber raita | ON THE SIDE | 3g |
| Kadhi | THE MAIN | 7g |
| Bowl of dahi | ON THE SIDE | 5g |

**Counter label:** protein in this bowl

**Button states:**
| State | Copy |
|-------|------|
| Initial | Stir in a spoonful |
| After 1 spoon | Stir in another |
| Animating | Adding Heldi… |
| Maxed (2 tbsp) | This dish is Heldi. |

**Spoonful badge (when boosted):** 1 spoonful · 2 spoonfuls

**Captions (random on each stir, italic):**
- Still tastes exactly the same.
- The same food, just a little heldier.
- Nani is impressed.
- Save some for the raita.
- A very strong bowl indeed.
- Even mama approves of this one.
- The dal did not even notice.
- At this point, keep the jar on the table.

**Max caption:** That's 2 tbsp, the most we recommend stirring into one dish.

**Presentation:**
- Ink background, gold eyebrow
- Horizontal scroll rail of dish cards (cream/marigold alternating sticker cards)
- Circular photo frame per dish; tap button → stir-in video plays in circle (or particle burst fallback)
- Gram counter increments (+10g per spoonful); terracotta **pop animation** on boost
- Random witty caption appears below button (`aria-live="polite"`)
- Dot navigation below rail (mobile); "swipe the table →" hint
- Max 2 spoonfuls per dish

---

## How it works (`#how`)

**Eyebrow:** HOW IT WORKS

### Mobile headline
> No shaking.  
> No blending.  
> More protein.

### Laptop headline + body (≥900px)
**Headline:** Food you love. Nutrients you need.

**Body:**
> One blend that **vanishes** into any gravy, dal or yoghurt base. **Dissolves clean**. No chalk, no aftertaste.

### Steps

1. **Cook like always.**  
   Your dal, curry or raita, **same as ever**.

2. **Stir in a spoonful.**  
   Stir straight into the pot, or **at the table**.

3. **Eat what you love.**  
   The meal you grew up with, +10g **protein**.

**Presentation:**
- Cream background, centred vertical timeline
- Gold circle step icons (cook / stir / eat illustrations) connected by 2px ink vertical line
- Responsive header: short punchy headline on mobile; pouch copy reused on laptop
- Copy highlights shift to ink on cream sections

---

## Tonight's table — menu gallery (`#thali`)

**Eyebrow:** PUT IT ON THE TABLE

**Headline:** Lunch and dinner menus.

**Lede:**
> **Five ways to lay the table. Swipe through.** Dishes in gold are **boosted with Heldi**, **counted for one person's plate.**

### Menu: The Weeknight Dinner (DINNER)
- TO START: Papad & chutney · 2g
- THE MAIN: Dal tadka · 19g *(9g + Heldi)*
- ON THE SIDE: Jeera rice · 4g · Cucumber raita · 13g *(3g + Heldi)*
- From the food **18g**
- Boosted with Heldi · 2 tbsp **+20g**
- ON THE TABLE **38g**

### Menu: The Saturday Lunch (LUNCH)
- TO START: Aloo chaat · 14g *(4g + Heldi)*
- THE MAIN: Chana masala · 18g *(8g + Heldi)*
- ON THE SIDE: Steamed rice · 3g · Bowl of dahi · 15g *(5g + Heldi)*
- From the food **20g** · Boosted **+30g** (3 tbsp) · ON THE TABLE **50g**

### Menu: The Friday Feast (DINNER)
**Variant selector:** SELECT YOUR MAIN — ✓ VEG · NON-VEG

**VEG:**
- TO START: Vegetable samosa · 3g
- THE MAIN: Paneer butter masala · 22g *(12g + Heldi)*
- ON THE SIDE: Jeera rice · 4g · Boondi raita · 14g *(4g + Heldi)*
- From the food **23g** · Boosted **+20g** (2 tbsp) · ON THE TABLE **43g**

**NON-VEG:**
- THE MAIN: Butter chicken · 30g *(20g + Heldi)*
- From the food **31g** · ON THE TABLE **51g**

### Menu: The Light Lunch (LUNCH)
- TO START: Dahi puri · 15g *(5g + Heldi)*
- THE MAIN: Kadhi · 17g *(7g + Heldi)*
- ON THE SIDE: Steamed rice · 3g · Roasted papad · 2g
- From the food **17g** · Boosted **+20g** (2 tbsp) · ON THE TABLE **37g**

### Menu: The Sunday Thali (DINNER)
- TO START: Samosa chaat · 15g *(5g + Heldi)*
- THE MAIN: Dal makhani · 21g *(11g + Heldi)*
- ON THE SIDE: Two rotis · 4g · Cucumber raita · 13g *(3g + Heldi)*
- From the food **23g** · Boosted **+30g** (3 tbsp) · ON THE TABLE **53g**

**Presentation:**
- Ink background, gold eyebrow
- Five menu cards in horizontal scroller (grid wrap at ≥900px)
- Cards alternate cream/marigold with hard offset shadows and double rule under title
- Heldi-boosted dishes shown in gold-filled gram pills; dotted leaders between dish name and grams
- Summary band: "Boosted with Heldi · X tbsp" with contrasting heldi value
- Friday Feast has VEG/NON-VEG radio chips that swap main dish and totals
- Dot navigation below scroller

---

## Who it's for — audience (`#audience`)

**Headline:** Built for you. Made for the whole family.

### FOR YOU
**Title:** Hit your protein target without another shake.
- Stir into two or three dishes and add **20-30g** across one meal.
- Whey isolate absorbs fast and **blends clean**.
- Zero change to the food you love.

### FOR THE FAMILY
**Title:** One pouch, the whole table.
- **Disappears into** the dal, the curry, the raita everyone already eats.
- Works for fussy eaters and big appetites alike.
- No separate "healthy" cooking required.

### FOR PARENTS & GRANDPARENTS
**Title:** Built for the way they already cook.
- Protein contributes to the maintenance of muscle mass.
- 99% lactose-free isolate.
- Not a single **recipe changes**.

**Presentation:**
- Marigold background, 3px ink top border
- Three sticker cards in horizontal scroller (grid at ≥900px)
- Terracotta `+` bullets; eyebrow labels in uppercase tracking
- Dot navigation below cards

---

## FAQ (`#faq`)

**Headline:** The questions we hear most.

**Q: Is whey protein vegetarian?**  
> Yes. Whey is the pale liquid left when milk curdles, the same one you see when paneer is made at home. We simply filter it to concentrate the protein and gently dry it into a fine powder. Nothing added, just the part of milk that has always been there.

**Q: Will my food taste different?**  
> No. The spices are designed to disappear into the dish, not sit on top of the flavour. Heldi blends clean into what you already cook. No chalky film, no protein-shake aftertaste.

**Q: How do I use it?**  
> Once the pot is done cooking and has cooled a little, stir the powder straight into the full dal, curry or raita and mix it through. If you are adding to a whole pot, a splash of water can help loosen it. Or leave the jar on the table and let each person add as much as they like to their own bowl.

**Q: Can I use it in dishes that are not on the pouch?**  
> Yes. Anything with a gravy, a dal or a yoghurt base works, sambar, kadhi, korma, bhindi in gravy, even a chaat with dahi on top. If a spoon can stir it, Heldi can disappear into it.

**Q: Is it safe for parents and grandparents?**  
> Heldi is designed for the whole table. Protein contributes to the maintenance of muscle mass, and the isolate is 99% lactose-free, 100% vegetarian and free from added sugar, preservatives and gluten.

**Presentation:**
- Cream background, centred accordion (max ~860px)
- 2px ink horizontal rules between items
- Rozha One terracotta `+` / `–` toggle glyph
- One item open at a time; answer in brown body copy

---

## Free jar (`#jar`)

**Eyebrow:** WITH YOUR FIRST ORDER

**Headline:** A jar for the table. On us.

**Body (block 1):**
> Every first order ships with a refillable Heldi jar that sits on the **dinner table**, where it belongs. Not the cupboard. Right there **beside the dal**, where everyone can reach for it.

**Body (block 2):**
> Silver or gold? That is a choice every mama likes to make. Gold when the table is set for guests. Silver for the meal the whole family eats every night. We ship both finishes with your first pouch. You pick the one that stays.

**Jar alt text:** Heldi pouch with silver and gold table jars

**Presentation:**
- Ink background, gold eyebrow, cream H2
- Dashed gold frame (2px, 24px radius) wrapping white sticker preview card
- Product photo: pouch + silver and gold jars
- Copy emphasis highlights in cream on dark

---

## Final CTA (`#join`)

**Headline:** Be first to stir it in.

**Subline:** One email the day we launch, and a **free jar** with your first order.

**Form:** Join waitlist

**Success:** You're on the list. One email the day we launch.

**Presentation:**
- Marigold band, min-height ~410px
- Small ink elephant illustrations anchored bottom-left/right (desktop only, hidden mobile)
- Centred H2 + italic warm-dark subline + waitlist form
- Same expand-to-email interaction as hero

---

## Footer

**Tagline:** © 2026 Heldi · Made in the UK · Desi protein for Indian food

**Presentation:**
- Ink bar, flex space-between
- Gold-tinted wordmark (CSS filter) + muted copyright

---

## Packaging / film copy (referenced on site)

| Context | Copy |
|---------|------|
| Pouch artwork | Same Recipes / Same Taste / More Protein |
| Pronunciation | /hel-dee/, adj. how my nani says "healthy." |
| Hero film tagline (video layout aria) | Bringing something new to the table |

---

## Alternate hero layouts (not live by default)

### Video layout (`heroLayout="video"`)
**Lede:** Desi protein that disappears into dal, curry, raita and other home-cooked favourites.

**Presentation:** Wordmark + looping hero film (elephants cross dinner table) + lede below

### Classic layout (`heroLayout="classic"`)
**H1:** Desi protein for  
**Animated words:** INDIAN FOOD · DAL · CURRY · RAITA · DAHI · CHAAT *(split-flap or dissolve)*  
**Subline:** Never drink another protein shake again.  
**Body:** Heldi is a protein made to disappear straight into your dal, curry, raita and every other home-cooked favourite. **The same food, just a little Heldier.**

**Presentation:** Flanking elephant illustrations; split-flap board cycles charset or dissolve board

---

## Global copy patterns

| Pattern | Role |
|---------|------|
| `.copy-emphasis` / `<CopyHighlight>` | Key phrases set in ink (on cream/gold) or cream (on ink) at weight 600 |
| `.eyebrow` | Uppercase section labels, wide tracking — terracotta on cream, gold on ink |
| Sticker cards | White/cream cards with 3px ink border + hard offset shadow — carries hero, stats, stir, menu, audience, jar |
| Pill buttons | CTAs, tags, gram counts, badges |
| Horizontal scrollers | Stir gallery, menu gallery, audience gallery (with dot nav on mobile) |

## Section colour rhythm (top → bottom)

```
marigold → ink (ticker) → cream → ink → cream → ink → marigold → cream → ink → marigold → ink
  hero     (in hero)    pouch   stir   how    thali  audience   faq    jar    join   footer
```
