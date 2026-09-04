import type { NutritionProduct } from "./nutrition-data";

// Heldi Chai product facts. The single source of truth for the /shop/chai
// page, in the same role components/shop/nutrition-data.ts plays for Khana.
//
// WHERE THE FIGURES COME FROM
//
// The recipe is the one on the bench and in HeldiPM's COGS model
// (`chai-current`: 250 g pouch, no salt, black pepper in), confirmed by Mihir
// on 3 Sep 2026, with MPC85 as the second milk protein. Every figure below is
// CALCULATED from that recipe by scripts/nutrition-calc.mjs, and FIC
// Regulation 1169/2011 Art 31(4)(b) allows exactly that: an average value
// calculated from the known values of the ingredients. Mihir has decided
// against finished-product analysis for the first run, so this calculation is
// the declaration rather than a placeholder for one. Rerun the script, paste
// the rows, bump nothing else.
//
// TWO CORRECTIONS LANDED 3 Sep 2026, BOTH THE SAME MISTAKE.
//
//  - THE WHEY. Arla certificate 0000672935 reports "Protein in DM (Nx6.38)",
//    which is DRY MATTER. Batch FF25466001 is 92.66% in DM at 4.13% moisture,
//    so the whey is 88.83% protein AS-IS, not the 87.3% this table was first
//    calculated on. Bacarel's 1 kg retail bag quotes 92 g/100g, which looks
//    like the dry-matter figure again: never calculate from the bag.
//  - THE MILK PROTEIN. MPC grades are quoted on dry basis too, so an "85" MPC
//    is about 80.75% protein as-is, not 85%. Read literally as 85% the mug
//    goes to 5.18 g and the blend to 64.8 g/100g, so the declaration barely
//    moves and "5g per mug" survives either way.
//
// The two corrections pull in opposite directions and very nearly cancel:
// protein stayed at 64.0 g/100g and 5.1 g a mug. Energy, fat, saturates,
// carbohydrate, sugars and lactose all moved, so never assume a whey change
// leaves this table alone. Replace the MPC figures with Bacarel's own spec
// when it arrives; it is on the go-live checklist.
//
// What that settles, and what it does not:
//  - 8 g level tablespoon: Mihir weighed a level tablespoon at 7 to 8 g and a
//    heaped one at 12 to 14 g, so Chai's 8 g is a LEVEL spoon where Khana's
//    12 g is a heaped one. Copy must never call Chai's spoon heaped.
//  - "5g per mug" holds: 5.1 g per 8 g serving. Exactly 5.0 g would want a
//    7.81 g spoon, so rounding the serving up to 8 is the safe direction.
//  - "High in protein" holds with room to spare: protein is 71% of energy
//    against the 20% the claim needs.
//  - Lactose is calculated, not tested, and MPC85 carries more of it than
//    micellar casein does: about 2.2 g per 100 g, 0.18 g a mug, up from 1.4.
//    Stated as a figure, never as a "lactose-free" badge.
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

/** Lactose, calculated from the whey certificate (2.28%) and MPC85's typical
 *  5.5%. A figure, not a claim: "lactose-free" is a tested term and this has
 *  not been tested. It rose from 1.4 when the second milk protein moved from
 *  micellar casein to MPC85, the one row that change really moves. */
export const CHAI_LACTOSE_PER_100G = 2.2;

/** Net weight of the pouch, and the mugs it makes at one level tablespoon
 *  each (250 / 8, rounded down). The 250 g pouch is the COGS decision; the
 *  round-13 print files still say 100 g and need re-emitting. Change these
 *  two together, they are the only place either number is written. */
export const CHAI_POUCH_GRAMS = 250;
export const CHAI_MUGS_PER_POUCH = 31;

/** FIC Reg 1169/2011 requires the allergen before a distance-selling
 *  purchase, not only on the pack. Chai carries casein as well as whey, so
 *  this is not Khana's sentence. */
export const CHAI_ALLERGENS = "Contains milk (whey and milk protein concentrate).";

/** The descriptive legal name FIC Reg 1169/2011 requires next to the brand
 *  name, worded so it holds true under either candidate formulation. */
export const CHAI_LEGAL_NAME =
  "Whey protein and milk protein concentrate blend with chai spices and coconut sugar. Food supplement.";

/** The ingredients, largest first, as a plain-English list. Same order as
 *  the declaration in CHAI_FORMULA below. The round-13 pack artwork still
 *  carries the earlier recipe (no pepper, coconut sugar ahead of the casein)
 *  and needs re-emitting to match. */
export const CHAI_INGREDIENT_NAMES = [
  "whey protein isolate",
  "milk protein concentrate",
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
// front of pack lead with them, and the coconut sugar carries one because
// CHAI_LEGAL_NAME names it, which is the Art 22(1)(a) trigger.
//
// THE SPICES ARE UNQUANTIFIED HERE, but Chai's case is weaker than Khana's and
// a labelling consultant should rule on it before print. On Khana the spices
// are plainly "used in small quantities for the purposes of flavouring", the
// Annex VIII Part A(4) exemption. On Chai they arguably characterise the
// product: it is a masala chai, the legal name says "chai spices", and ginger
// at 6.77% is not a small quantity by anyone's reading. If the ruling goes the
// other way the fix is either a percentage on the spice total or a legal name
// that stops naming them. Note also that Annex VII Part B's "mixed spices"
// shorthand is unavailable to both blends: it needs the spices to total 2% or
// less, and Chai's are over 19%, Khana's 3.75%.
export const CHAI_FORMULA =
  "Whey protein isolate (MILK) 53.7% · milk protein concentrate (MILK) 18.2% · coconut sugar 10% · ginger · cardamom · Ceylon cinnamon · black pepper · clove · sunflower lecithin";

export type ChaiNutritionRow = {
  label: string;
  per100g: string;
  perServing: string;
  riPerServing: string;
  indent?: boolean;
};

/** Output of `node scripts/nutrition-calc.mjs chai`, 3 Sep 2026. */
export const CHAI_NUTRITION_ROWS: ChaiNutritionRow[] = [
  { label: "Energy", per100g: "1532 kJ / 362 kcal", perServing: "123 kJ / 29 kcal", riPerServing: "1.4%" },
  { label: "Fat", per100g: "2.1 g", perServing: "0.2 g", riPerServing: "0.2%" },
  { label: "of which saturates", per100g: "0.7 g", perServing: "0.1 g", riPerServing: "0.3%", indent: true },
  { label: "Carbohydrate", per100g: "19.3 g", perServing: "1.5 g", riPerServing: "0.6%" },
  { label: "of which sugars", per100g: "11.6 g", perServing: "0.9 g", riPerServing: "1.0%", indent: true },
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

/** Whey from the supplier profile; MPC85 as whole milk protein, which is
 *  roughly four parts casein to one part whey, so the script derives its
 *  profile from the other two rather than hard-coding a third. Each is scaled
 *  by its share of the protein. Same script, same date. */
export const CHAI_AMINO_ROWS: ChaiAminoRow[] = [
  { name: "Alanine", per100g: "2.92 g", perServing: "0.23 g" },
  { name: "Arginine", per100g: "1.25 g", perServing: "0.10 g" },
  { name: "Aspartic acid", per100g: "6.57 g", perServing: "0.53 g" },
  { name: "Cystine", per100g: "1.24 g", perServing: "0.10 g" },
  { name: "Glutamic acid", per100g: "11.41 g", perServing: "0.91 g" },
  { name: "Glycine", per100g: "1.10 g", perServing: "0.09 g" },
  { name: "Histidine", per100g: "1.11 g", perServing: "0.09 g", essential: true },
  { name: "Isoleucine", per100g: "3.60 g", perServing: "0.29 g", essential: true },
  { name: "Leucine", per100g: "5.89 g", perServing: "0.47 g", essential: true },
  { name: "Lysine", per100g: "5.84 g", perServing: "0.47 g", essential: true },
  { name: "Methionine", per100g: "1.41 g", perServing: "0.11 g", essential: true },
  { name: "Phenylalanine", per100g: "1.95 g", perServing: "0.16 g", essential: true },
  { name: "Proline", per100g: "4.39 g", perServing: "0.35 g" },
  { name: "Serine", per100g: "3.39 g", perServing: "0.27 g" },
  { name: "Threonine", per100g: "4.28 g", perServing: "0.34 g", essential: true },
  { name: "Tryptophan", per100g: "1.02 g", perServing: "0.08 g", essential: true },
  { name: "Tyrosine", per100g: "1.92 g", perServing: "0.15 g" },
  { name: "Valine", per100g: "3.48 g", perServing: "0.28 g", essential: true }
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
//    a 12 g spoonful and says nothing about a blend carrying MPC85, which is
//    lactose-richer per gram and sits in a blend with a third less protein.
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
    url: "/images/shop/chai-1.webp?v=4",
    altText: "The terracotta Heldi Chai pouch beside the engraved brass table jar and its gold spoon"
  },
  {
    url: "/images/shop/chai-pouch-solo.webp?v=3",
    altText: "The Heldi Chai pouch on its own, front facing"
  },
  {
    url: "/images/shop/chai-bundle-2.webp?v=4",
    altText: "Two Heldi Chai pouches with the engraved brass jar, its gold spoon and the cotton tote bag"
  },
  {
    url: "/images/shop/khana-chai-pair.webp?v=1",
    altText: "One Heldi Chai pouch and one Heldi Khana pouch with the engraved brass jar, its gold spoon and the cotton tote bag"
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
    "Average values calculated from the whey certificate of analysis and published values for the milk protein and each spice, as FIC Regulation 1169/2011 Article 31(4) allows."
};
