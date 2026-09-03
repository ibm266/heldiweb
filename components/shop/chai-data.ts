import type { NutritionProduct } from "./nutrition-data";

// Heldi Chai product facts. The single source of truth for the /shop/chai
// page, in the same role components/shop/nutrition-data.ts plays for Khana.
//
// WHERE THE FIGURES COME FROM
//
// The recipe is the one on the bench and in HeldiPM's COGS model
// (`chai-current`: 250 g pouch, no salt, 85:15 whey to plain micellar
// casein, black pepper in), confirmed by Mihir on 3 Sep 2026. Every figure
// below is CALCULATED from that recipe by scripts/nutrition-calc.mjs: the
// whey at the Arla certificate's 87.3% protein as-is, the casein at 85%, the
// spices and coconut sugar at USDA typical values, energy from the FIC
// conversion factors. FIC Regulation 1169/2011 Art 31(4) allows a
// declaration to be an average value calculated from the known values of the
// ingredients, which is the same basis Khana's table has always used. It is
// still provisional: the go-live checklist sends the finished blend for
// analysis, and the analysed figures replace these in this one file. Rerun
// the script, paste the rows, bump nothing else.
//
// What that settles, and what it does not:
//  - 8 g level tablespoon: Mihir weighed a level tablespoon at 7 to 8 g and a
//    heaped one at 12 to 14 g, so Chai's 8 g is a LEVEL spoon where Khana's
//    12.5 g is a heaped one. Copy must never call Chai's spoon heaped.
//  - "5g per mug" holds: 5.1 g per 8 g serving.
//  - "High in protein" holds with room to spare: protein is 71% of energy
//    against the 20% the claim needs.
//  - Lactose is calculated, not tested (about 1.4 g per 100 g, 0.1 g a mug),
//    so it is stated as a figure and never as a "lactose-free" badge.
//  - Gluten and shelf life are tests, not calculations, and stay unpublished.

/** One serving in grams. The recommended daily portion the statutory
 *  statements have to declare. Chai's spoonful is smaller than Khana's 12g
 *  because it goes into a mug, not a pot. */
export const CHAI_SERVING_GRAMS = 8;

/** How the serving is spooned. A LEVEL tablespoon: Chai's 8 g is a level
 *  spoon where Khana's 12.5 g is heaped. Every surface that names the spoon
 *  reads it from here. */
export const CHAI_SERVING_SPOON = "level tablespoon";

export const CHAI_SERVING_LABEL = `Per ${CHAI_SERVING_GRAMS}g serving (level tbsp)`;

/** Protein per serving and per 100 g, from the calculation above. The
 *  marketing figure is the pack's roundel: "5g per mug". */
export const CHAI_PROTEIN_PER_SERVING_GRAMS = 5.1;
export const CHAI_PROTEIN_PER_100G = 64;
export const CHAI_PROTEIN_MARKETING_GRAMS = 5;

/** Lactose, calculated from the whey certificate (2.28%) and the casein
 *  spec (about 1%). A figure, not a claim: "lactose-free" is a tested
 *  term and this has not been tested. */
export const CHAI_LACTOSE_PER_100G = 1.4;

/** Net weight of the pouch, and the mugs it makes at one level tablespoon
 *  each (250 / 8, rounded down). The 250 g pouch is the COGS decision; the
 *  round-13 print files still say 100 g and need re-emitting. Change these
 *  two together, they are the only place either number is written. */
export const CHAI_POUCH_GRAMS = 250;
export const CHAI_MUGS_PER_POUCH = 31;

/** FIC Reg 1169/2011 requires the allergen before a distance-selling
 *  purchase, not only on the pack. Chai carries casein as well as whey, so
 *  this is not Khana's sentence. */
export const CHAI_ALLERGENS = "Contains milk (whey and casein).";

/** The descriptive legal name FIC Reg 1169/2011 requires next to the brand
 *  name, worded so it holds true under either candidate formulation. */
export const CHAI_LEGAL_NAME =
  "Whey protein and casein blend with chai spices and coconut sugar. Food supplement.";

/** The ingredients, largest first, as a plain-English list. Same order as
 *  the declaration in CHAI_FORMULA below. The round-13 pack artwork still
 *  carries the earlier recipe (no pepper, coconut sugar ahead of the casein)
 *  and needs re-emitting to match. */
export const CHAI_INGREDIENT_NAMES = [
  "whey protein isolate",
  "micellar casein",
  "coconut sugar",
  "ginger",
  "cardamom",
  "Ceylon cinnamon",
  "black pepper",
  "clove",
  "sunflower lecithin"
] as const;

// MILK is capitalised inside the list on purpose: FIC Reg 1169/2011 Art 21(1)
// requires the allergen emphasised within the ingredients list itself. The
// two milk proteins carry their percentages (QUID) because the name and the
// front of pack lead with them.
export const CHAI_FORMULA =
  "Whey protein isolate (MILK) 53.7% · micellar casein (MILK) 18.2% · coconut sugar 10% · ginger 6.8% · cardamom 5% · Ceylon cinnamon 2% · black pepper 2% · clove 1.6% · sunflower lecithin 0.8%";

export type ChaiNutritionRow = {
  label: string;
  per100g: string;
  perServing: string;
  riPerServing: string;
  indent?: boolean;
};

/** Output of `node scripts/nutrition-calc.mjs chai`, 3 Sep 2026. */
export const CHAI_NUTRITION_ROWS: ChaiNutritionRow[] = [
  { label: "Energy", per100g: "1521 kJ / 359 kcal", perServing: "122 kJ / 29 kcal", riPerServing: "1.4%" },
  { label: "Fat", per100g: "2.2 g", perServing: "0.2 g", riPerServing: "0.3%" },
  { label: "of which saturates", per100g: "0.8 g", perServing: "0.1 g", riPerServing: "0.3%", indent: true },
  { label: "Carbohydrate", per100g: "18.5 g", perServing: "1.5 g", riPerServing: "0.6%" },
  { label: "of which sugars", per100g: "10.7 g", perServing: "0.9 g", riPerServing: "1.0%", indent: true },
  { label: "Fibre", per100g: "4.6 g", perServing: "0.4 g", riPerServing: "—" },
  { label: "Protein", per100g: "64.0 g", perServing: "5.1 g", riPerServing: "10.2%" },
  { label: "Salt", per100g: "0.32 g", perServing: "0.03 g", riPerServing: "0.4%" }
];

export const CHAI_RI_FOOTNOTE =
  "*RI = adult Reference Intake (8400 kJ / 2000 kcal, 70g fat, 20g saturates, 260g carbohydrate, 90g sugars, 50g protein, 6g salt). No RI is set for fibre.";

export type ChaiAminoRow = {
  name: string;
  per100g: string;
  perServing: string;
  essential?: boolean;
};

/** Whey from the supplier profile, casein from the published typical
 *  composition of bovine casein, each scaled by its share of the protein.
 *  Same script, same date. */
export const CHAI_AMINO_ROWS: ChaiAminoRow[] = [
  { name: "Alanine", per100g: "2.84 g", perServing: "0.23 g" },
  { name: "Arginine", per100g: "1.33 g", perServing: "0.11 g" },
  { name: "Aspartic acid", per100g: "6.40 g", perServing: "0.51 g" },
  { name: "Cystine", per100g: "1.16 g", perServing: "0.09 g" },
  { name: "Glutamic acid", per100g: "11.55 g", perServing: "0.92 g" },
  { name: "Glycine", per100g: "1.11 g", perServing: "0.09 g" },
  { name: "Histidine", per100g: "1.16 g", perServing: "0.09 g", essential: true },
  { name: "Isoleucine", per100g: "3.57 g", perServing: "0.29 g", essential: true },
  { name: "Leucine", per100g: "5.86 g", perServing: "0.47 g", essential: true },
  { name: "Lysine", per100g: "5.76 g", perServing: "0.46 g", essential: true },
  { name: "Methionine", per100g: "1.43 g", perServing: "0.11 g", essential: true },
  { name: "Phenylalanine", per100g: "2.04 g", perServing: "0.16 g", essential: true },
  { name: "Proline", per100g: "4.55 g", perServing: "0.36 g" },
  { name: "Serine", per100g: "3.39 g", perServing: "0.27 g" },
  { name: "Threonine", per100g: "4.16 g", perServing: "0.33 g", essential: true },
  { name: "Tryptophan", per100g: "1.00 g", perServing: "0.08 g", essential: true },
  { name: "Tyrosine", per100g: "2.04 g", perServing: "0.16 g" },
  { name: "Valine", per100g: "3.51 g", perServing: "0.28 g", essential: true }
];

/** The drawing that sits with each step: the line drawing printed on the back
 *  of the pouch, cut out as two inks (cream and gold, the site's own tokens)
 *  on a transparent ground, so the tile colour comes from CSS. Each one is
 *  centred on its own square canvas, scaled to fill it, so the tile only has
 *  to centre the image and every drawing sits in the middle of its box.
 *  Rebuild with `node scripts/chai-method-art.mjs` (sources in HeldiPM, print
 *  round 13). */
export type ChaiMethodArt = { src: string; width: number; height: number };

export type ChaiMethodStep = { title: string; body: string; art: ChaiMethodArt };

const METHOD_ART_SIZE = { width: 400, height: 400 };

/** The three steps printed on the back of the pouch, reworded for the site.
 *  The pack says "dose" in its statutory footer; the site never does. */
export const CHAI_METHOD: ChaiMethodStep[] = [
  {
    title: "BREW",
    body: "Make your chai the way you always make it.",
    art: { src: "/images/shop/chai-method/brew.webp", ...METHOD_ART_SIZE }
  },
  {
    title: "COOL",
    body: "Let it come off the boil, then add your milk.",
    art: { src: "/images/shop/chai-method/cool.webp", ...METHOD_ART_SIZE }
  },
  {
    title: "STIR",
    body: "Stir in a level tablespoon just before you drink.",
    art: { src: "/images/shop/chai-method/stir.webp", ...METHOD_ART_SIZE }
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

// Khana's six badges are not reusable here and the difference matters. Every
// one dropped is dropped because Chai cannot stand it up:
//  - "No added sugar" is simply false: Chai is 10 to 15% coconut sugar.
//  - "98% lactose-free" is substantiated against Khana's whey certificate at
//    a 12g spoonful and says nothing about a blend carrying micellar casein.
//  - "All natural" already draws ASA scrutiny on the pack.
//  - "Gluten free" is a legally defined claim (under 20mg/kg, Reg 828/2014).
//    Chai's spices come from a different supplier to Khana's and no gluten
//    result exists for this blend, so the badge waits for the test.
//  - The pack's "ORGANIC SPICES" strip is worse than any of them: organic is
//    a certified term, Heldi holds no certification, and no organic ground
//    clove exists to buy, so it must not appear on the site at all.
// "High in protein" is the one nutrition claim that holds under every
// candidate blend (see the header note), and vegetarian is a fact about the
// rennet, not a test result.
export const CHAI_PILLS: ChaiPill[] = [
  { icon: "/images/pouch-badges/high-protein.png", label: "High protein", width: 256, height: 256 },
  { icon: "/images/pouch-badges/vegetarian.png", label: "Vegetarian", width: 286, height: 367 }
];

export type ChaiImage = { url: string; altText: string };

/** Gallery, hero first. Product photography, not the flat pack artwork.
 *  Regenerate with a ?v= bump so the image optimizer drops the old one. */
export const CHAI_IMAGES: ChaiImage[] = [
  {
    url: "/images/shop/chai-1.webp?v=3",
    altText: "The terracotta Heldi Chai pouch on a linen table with a refillable brass jar"
  },
  {
    url: "/images/shop/chai-pouch-solo.webp?v=3",
    altText: "The Heldi Chai pouch on its own, front facing"
  },
  {
    url: "/images/shop/chai-bundle-2.webp?v=3",
    altText: "Two Heldi Chai pouches with brass and steel refillable jars"
  },
  {
    url: "/images/shop/chai-bundle-3.webp?v=3",
    altText: "Three Heldi Chai pouches with refillable jars and an open masala dabba"
  }
];

/** The bundle the shared nutrition modal renders for Chai. Same shape as
 *  KHANA_NUTRITION in nutrition-data.ts. */
export const CHAI_NUTRITION: NutritionProduct = {
  productName: "Heldi Chai",
  formula: CHAI_FORMULA,
  servingLabel: CHAI_SERVING_LABEL,
  aminoServingLabel: `Per ${CHAI_SERVING_GRAMS}g serving`,
  rows: CHAI_NUTRITION_ROWS,
  aminoRows: CHAI_AMINO_ROWS,
  riFootnote: CHAI_RI_FOOTNOTE,
  basisNote:
    "Calculated from the recipe and each ingredient's own analysis (scripts/nutrition-calc.mjs); the figures from analysis of the finished blend replace these before Chai is sold."
};
