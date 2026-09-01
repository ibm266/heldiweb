// Heldi Chai product facts. The single source of truth for the /shop/chai
// page, in the same role components/shop/nutrition-data.ts plays for Khana.
//
// WHY THERE IS NO NUTRITION TABLE OR PROTEIN FIGURE HERE
//
// Khana's figures are provisional but uncontradicted, so the site publishes
// them behind a warning. Chai's are neither settled nor consistent, and
// publishing them would state a product fact we already have reason to doubt:
//
//  1. Two live formulations disagree. The pack artwork (HeldiPM
//     design/pouch-v2/CHAI-NUTRITION.md, 18 Aug 2026) is 53.9% whey isolate /
//     13.5% micellar casein / 15% coconut sugar with a cardamom-led spice
//     block. The COGS model (HeldiPM lib/cogs/constants.ts, `chai-current`,
//     25 Aug 2026) is 53.7% / 18.2% / 10% with a ginger-led block and 2%
//     black pepper, which appears on no label anywhere.
//  2. The whey purity behind every protein number is a three-way split.
//     The pack table assumes 93.5% because that is what Khana's table
//     implies; the Arla certificate of analysis in the COGS library says
//     87.3% as-is. At 87.3% an 8g spoonful of the pack formulation gives
//     about 4.7g of protein, so the "5g per mug" roundel printed on the
//     pouch would not stand up.
//  3. Net weight is unresolved: the print files say 100g and "around 12
//     servings", the COGS model says a 250g pouch, and HeldiPM's own
//     pouch-v2 README calls 100g "a placeholder for the sample".
//
// So the page states what is true under every candidate blend (it is a whey
// and casein blend with real chai spices and coconut sugar, it contains milk,
// it is high in protein) and says plainly that the declaration publishes once
// the finished blend has been analysed. The figures must come from analysis
// of the finished blend, not calculated from ingredient inputs: getting them
// wrong on pack is a false declaration under FIC Regulation 1169/2011.
// Publishing them is a hard gate in NEXT_STEPS.md §1b.
//
// What IS safe below, and why:
//  - 8g heaped tablespoon: the same serving in both formulations and on the
//    print files. Still to be confirmed by weighing a spoonful of the real
//    blend, but nothing contradicts it.
//  - "High in protein": needs 20% of energy from protein. Every candidate
//    blend lands between 58 and 63g protein per 100g at about 378 kcal, so
//    protein carries 62 to 67% of the energy. Safe under all of them.

/** One serving in grams. The recommended daily portion the statutory
 *  statements have to declare. Chai's spoonful is smaller than Khana's 12g
 *  because it goes into a mug, not a pot. */
export const CHAI_SERVING_GRAMS = 8;

/** Net weight of the pouch, and the mugs it makes at one spoonful each.
 *  Taken from the round-13 print files, which is the pack in the product
 *  photography on this page. Provisional: see note 3 above. Change these two
 *  together, they are the only place either number is written. */
export const CHAI_POUCH_GRAMS = 100;
export const CHAI_MUGS_PER_POUCH = 12;

/** FIC Reg 1169/2011 requires the allergen before a distance-selling
 *  purchase, not only on the pack. Chai carries casein as well as whey, so
 *  this is not Khana's sentence. */
export const CHAI_ALLERGENS = "Contains milk (whey and casein).";

/** The descriptive legal name FIC Reg 1169/2011 requires next to the brand
 *  name, worded so it holds true under either candidate formulation. */
export const CHAI_LEGAL_NAME =
  "Whey protein and casein blend with chai spices and coconut sugar. Food supplement.";

/** Ingredient names in the order the label prints them, with no percentages.
 *  The percentages and the final order are what the two formulations
 *  disagree about; the ingredients themselves are common to both apart from
 *  black pepper, which no label carries. */
export const CHAI_INGREDIENT_NAMES = [
  "whey protein isolate",
  "micellar casein",
  "coconut sugar",
  "cardamom",
  "ginger",
  "cinnamon",
  "clove",
  "sunflower lecithin"
] as const;

export type ChaiMethodStep = { title: string; body: string };

/** The three steps printed on the back of the pouch, reworded for the site.
 *  The pack says "dose" in its statutory footer; the site never does. */
export const CHAI_METHOD: ChaiMethodStep[] = [
  { title: "BREW", body: "Make your chai the way you always make it." },
  { title: "COOL", body: "Let it come off the boil, then add your milk." },
  {
    title: "STIR",
    body: "Stir in a heaped tablespoon just before you drink."
  }
];

/** The drinks strip from the back of the pouch. */
export const CHAI_DRINKS = [
  "Chai",
  "Tea",
  "Coffee",
  "Hot chocolate",
  "Warm milk"
];

export type ChaiPill = {
  icon: string;
  label: string;
  width: number;
  height: number;
};

// Khana's six badges are not reusable here and the difference matters.
// "No added sugar" is false: Chai is 10 to 15% coconut sugar. "98%
// lactose-free" is substantiated against Khana's whey certificate at a 12g
// spoonful and says nothing about a blend carrying micellar casein. "All
// natural" already draws ASA scrutiny on the pack. The pack's "ORGANIC
// SPICES" strip is worse: organic is a certified term, Heldi holds no
// certification, and no organic ground clove exists to buy, so it must not
// appear on the site at all.
export const CHAI_PILLS: ChaiPill[] = [
  { icon: "/images/pouch-badges/high-protein.png", label: "High protein", width: 256, height: 256 },
  { icon: "/images/pouch-badges/gluten-free.png", label: "Gluten free", width: 328, height: 225 },
  { icon: "/images/pouch-badges/vegetarian.png", label: "Vegetarian", width: 286, height: 367 }
];

export type ChaiImage = { url: string; altText: string };

/** Gallery, hero first. Product photography, not the flat pack artwork.
 *  Regenerate with a ?v= bump so the image optimizer drops the old one. */
export const CHAI_IMAGES: ChaiImage[] = [
  {
    url: "/images/shop/chai-1.webp",
    altText: "The terracotta Heldi Chai pouch on a linen table with a refillable brass jar"
  },
  {
    url: "/images/shop/chai-pouch-solo.webp",
    altText: "The Heldi Chai pouch on its own, front facing"
  },
  {
    url: "/images/shop/chai-bundle-2.webp",
    altText: "Two Heldi Chai pouches with brass and steel refillable jars"
  },
  {
    url: "/images/shop/chai-bundle-3.webp",
    altText: "Three Heldi Chai pouches with refillable jars and an open masala dabba"
  }
];
