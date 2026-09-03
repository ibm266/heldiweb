// Nutrition declaration and amino acid profile for the Heldi blend.
// Source: supplier analysis of the launch formula. Shared by the nutrition
// modal (full data) and the Nutrition accordion (declaration only).
//
// CONFIRMED 3 Sep 2026. The long-running "formulation is still moving" note
// that sat here is gone: Mihir confirmed the eight-ingredient spiced blend
// (the garam masala one), and every figure below is calculated from it by
// scripts/nutrition-calc.mjs. Two things landed together, so read them as one
// change.
//
// 1. THE WHEY. Arla certificate 0000672935, batch FF25466001, reports
//    "Protein in DM (Nx6.38)" of 92.66% at 4.13% moisture. DM is DRY MATTER,
//    so the protein in the powder is 92.66 x (100 - 4.13)/100 = 88.83% as-is.
//    The table used to imply 92.06%, which is the dry-matter number read as
//    though it were as-is, and it carried about 3 g/100g that was never in
//    the pouch. Bacarel's own 1 kg retail bag quotes 92 g/100g and looks like
//    the same misreading, so do not calculate from the bag: calculate from
//    the certificate.
// 2. THE SERVING. 12 g is solved rather than chosen: at 84.06 g protein per
//    100 g, exactly 10.0 g needs 11.90 g, so 12 g delivers 10.09 g and
//    divides the 300 g pouch into exactly 25 servings.
//
// BASIS. These are average values CALCULATED from the known values of the
// ingredients, which FIC Regulation 1169/2011 Art 31(4)(b) permits as a basis
// in its own right. Mihir has decided against finished-product analysis for
// the first run, so this calculation is the declaration, not a placeholder for
// one. What protects it is the tolerance: for protein above 40 g/100g the GB
// guidance allows +/-8 g, so a declared 84.1 holds anywhere from about 76 to
// 92 on analysis, and even the worst batch Arla's spec permits (90% DM at 6%
// moisture) computes to 80.1. Keep the certificate in the product technical
// file; it is the evidence behind the number.
//
// TO REGENERATE: `node scripts/nutrition-calc.mjs khana` prints these rows.
// Change the recipe there, not here. Full change impact: BRAND.md §11.1.

// MILK is capitalised inside the list on purpose. FIC Reg 1169/2011 Art 21(1)
// requires the allergen to be emphasised within the ingredients list itself;
// a separate "contains milk" line elsewhere does not satisfy it.
//
// ONLY THE WHEY CARRIES A PERCENTAGE, deliberately, so the spice ratios stay
// the recipe's own business. The list itself is mandatory and must stay in
// DESCENDING ORDER OF WEIGHT (Art 18(1)), but a percentage is only required
// where QUID bites (Art 22): an ingredient named in the food's name, or
// emphasised in words or pictures, or essential to characterise it. Annex VIII
// Part A(4) then exempts "ingredients used in small quantities for the
// purposes of flavouring", which is what these spices are at 0.1 to 1.7%. The
// whey keeps its 94% because the site emphasises it on nearly every surface,
// which is exactly the trigger, and because it is the number worth shouting.
// Do not add percentages back to the spices without a reason; do not reorder
// the list to disguise the ratios, because the order is the part that is
// legally fixed.
export const FORMULA =
  "Whey protein isolate (MILK) 94% · cumin · sunflower lecithin · coriander · fine sea salt · garam masala · Kashmiri chilli · turmeric";

/** One serving in grams. The recommended daily portion the statutory
 *  statements have to declare, and the basis of every per-serving figure
 *  below. Kept separate from SERVING_LABEL so callers never parse prose.
 *
 *  12 g, SOLVED for 10 g of protein against the real certificate of analysis
 *  on 3 Sep 2026, not picked for a round spoon. Arla certificate 0000672935
 *  (batch FF25466001) reports 92.66% protein IN DRY MATTER at 4.13% moisture,
 *  so the whey is 88.83% protein as-is; at 94% whey the blend is 84.06 g per
 *  100 g, 10.0 g of protein needs 11.90 g and 12 g delivers 10.09 g. 12 g also
 *  divides the 300 g pouch into exactly 25 servings. It briefly read 12.5 g
 *  earlier the same day, before the certificate was read properly.
 *  THE GRAM IS THE DECLARED PORTION AND THE SPOON IS AN
 *  APPROXIMATION OF IT, not the other way round: a heaped tablespoon of this
 *  powder measures roughly 10 to 14 g between one hand and the next, so every
 *  declaration-adjacent surface leads with 12.5 g and calls the spoon "about".
 *  See statutory-statements.tsx. The weighing record that backs 12.5 g is a
 *  real-world document, not a repo one; docs/go-live-checklist.md tracks it. */
export const SERVING_GRAMS = 12;

export const SERVING_LABEL = `Per ${SERVING_GRAMS}g serving (heaped tbsp)`;

export type NutritionRow = {
  label: string;
  per100g: string;
  perServing: string;
  riPerServing: string;
  indent?: boolean;
};

export const NUTRITION_ROWS: NutritionRow[] = [
  { label: "Energy", per100g: "1578 kJ / 372 kcal", perServing: "189 kJ / 45 kcal", riPerServing: "2.2%" },
  { label: "Fat", per100g: "2.4 g", perServing: "0.3 g", riPerServing: "0.4%" },
  { label: "of which saturates", per100g: "0.4 g", perServing: "0.0 g", riPerServing: "0.2%", indent: true },
  { label: "Carbohydrate", per100g: "3.2 g", perServing: "0.4 g", riPerServing: "0.1%" },
  { label: "of which sugars", per100g: "2.2 g", perServing: "0.3 g", riPerServing: "0.3%", indent: true },
  { label: "Fibre", per100g: "0.9 g", perServing: "0.1 g", riPerServing: "—" },
  { label: "Protein", per100g: "84.1 g", perServing: "10.1 g", riPerServing: "20.2%" },
  { label: "Salt", per100g: "1.2 g", perServing: "0.14 g", riPerServing: "2.4%" }
];

export const RI_FOOTNOTE =
  "*RI = adult Reference Intake (8400 kJ / 2000 kcal, 70g fat, 20g saturates, 260g carbohydrate, 90g sugars, 50g protein, 6g salt). No RI is set for fibre.";

export type AminoRow = {
  name: string;
  per100g: string;
  perServing: string;
  essential?: boolean;
};

/** Everything the nutrition modal needs for one product. Khana's bundle is
 *  below; Chai's is CHAI_NUTRITION in chai-data.ts. */
export type NutritionProduct = {
  productName: string;
  formula: string;
  servingLabel: string;
  aminoServingLabel: string;
  rows: NutritionRow[];
  aminoRows: AminoRow[];
  riFootnote: string;
  /** One sentence on where the figures come from, shown under the formula. */
  basisNote: string;
};

export const AMINO_ROWS: AminoRow[] = [
  { name: "Alanine", per100g: "4.26 g", perServing: "0.51 g" },
  { name: "Arginine", per100g: "1.35 g", perServing: "0.16 g" },
  { name: "Aspartic acid", per100g: "9.50 g", perServing: "1.14 g" },
  { name: "Cystine", per100g: "1.99 g", perServing: "0.24 g" },
  { name: "Glutamic acid", per100g: "14.65 g", perServing: "1.76 g" },
  { name: "Glycine", per100g: "1.45 g", perServing: "0.17 g" },
  { name: "Histidine", per100g: "1.27 g", perServing: "0.15 g", essential: true },
  { name: "Isoleucine", per100g: "4.98 g", perServing: "0.60 g", essential: true },
  { name: "Leucine", per100g: "7.97 g", perServing: "0.96 g", essential: true },
  { name: "Lysine", per100g: "8.14 g", perServing: "0.98 g", essential: true },
  { name: "Methionine", per100g: "1.80 g", perServing: "0.22 g", essential: true },
  { name: "Phenylalanine", per100g: "2.25 g", perServing: "0.27 g", essential: true },
  { name: "Proline", per100g: "5.16 g", perServing: "0.62 g" },
  { name: "Serine", per100g: "4.53 g", perServing: "0.54 g" },
  { name: "Threonine", per100g: "6.25 g", perServing: "0.75 g", essential: true },
  { name: "Tryptophan", per100g: "1.45 g", perServing: "0.17 g", essential: true },
  { name: "Tyrosine", per100g: "2.09 g", perServing: "0.25 g" },
  { name: "Valine", per100g: "4.53 g", perServing: "0.54 g", essential: true }
];

export const KHANA_NUTRITION: NutritionProduct = {
  productName: "Heldi Khana",
  formula: FORMULA,
  servingLabel: SERVING_LABEL,
  aminoServingLabel: `Per ${SERVING_GRAMS}g serving`,
  rows: NUTRITION_ROWS,
  aminoRows: AMINO_ROWS,
  riFootnote: RI_FOOTNOTE,
  basisNote:
    "Average values calculated from the whey certificate of analysis and published values for each spice, as FIC Regulation 1169/2011 Article 31(4) allows."
};
