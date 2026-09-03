// Nutrition declaration and amino acid profile for the Heldi blend.
// Source: supplier analysis of the launch formula. Shared by the nutrition
// modal (full data) and the Nutrition accordion (declaration only).
//
// PROVISIONAL, 28 Jul 2026. The formulation is still in development and is
// expected to become a blend of several spices rather than cumin alone, so
// FORMULA and the figures below will change. Accepted risk pre-launch; do not
// spend effort reconciling spice copy across the site against this file yet.
// Confirming the final formulation is a hard gate in
// docs/go-live-checklist.md, and the real deadline is the pouch film print
// order, not launch day: printed packaging carries the ingredients list and
// the nutrition declaration, and getting those wrong is a false declaration
// under FIC Regulation 1169/2011. The final numbers must come from analysis of
// the finished blend, not calculated from ingredient inputs. Full change
// impact: BRAND.md §11.1.

// MILK is capitalised inside the list on purpose. FIC Reg 1169/2011 Art 21(1)
// requires the allergen to be emphasised within the ingredients list itself;
// a separate "contains milk" line elsewhere does not satisfy it.
export const FORMULA =
  "Whey protein isolate (MILK) 94.15% · sunflower lecithin 4% · cumin 1.25% · fine sea salt 0.6%";

/** One serving in grams. The recommended daily portion the statutory
 *  statements have to declare, and the basis of every per-serving figure
 *  below. Kept separate from SERVING_LABEL so callers never parse prose. */
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
  { label: "Energy", per100g: "1613 kJ / 380 kcal", perServing: "194 kJ / 46 kcal", riPerServing: "2.3%" },
  { label: "Fat", per100g: "4.5 g", perServing: "0.5 g", riPerServing: "0.8%" },
  { label: "of which saturates", per100g: "0.6 g", perServing: "0.1 g", riPerServing: "0.4%", indent: true },
  { label: "Carbohydrate", per100g: "2.9 g", perServing: "0.4 g", riPerServing: "—" },
  { label: "of which sugars", per100g: "2.4 g", perServing: "0.3 g", riPerServing: "0.3%", indent: true },
  { label: "Fibre", per100g: "0.1 g", perServing: "~0.0 g", riPerServing: "—" },
  { label: "Protein", per100g: "86.9 g", perServing: "10.4 g", riPerServing: "—" },
  { label: "Salt", per100g: "1.08 g", perServing: "0.13 g", riPerServing: "2.2%" }
];

export const RI_FOOTNOTE =
  "*RI = adult Reference Intake (2000 kcal, 70g fat, 20g saturates, 90g sugars, 6g salt). No official RI for protein or carbohydrate.";

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
  { name: "Alanine", per100g: "4.43 g", perServing: "0.53 g" },
  { name: "Arginine", per100g: "1.41 g", perServing: "0.17 g" },
  { name: "Aspartic acid", per100g: "9.89 g", perServing: "1.19 g" },
  { name: "Cystine", per100g: "2.07 g", perServing: "0.25 g" },
  { name: "Glutamic acid", per100g: "15.25 g", perServing: "1.83 g" },
  { name: "Glycine", per100g: "1.51 g", perServing: "0.18 g" },
  { name: "Histidine", per100g: "1.32 g", perServing: "0.16 g", essential: true },
  { name: "Isoleucine", per100g: "5.18 g", perServing: "0.62 g", essential: true },
  { name: "Leucine", per100g: "8.29 g", perServing: "0.99 g", essential: true },
  { name: "Lysine", per100g: "8.47 g", perServing: "1.02 g", essential: true },
  { name: "Methionine", per100g: "1.88 g", perServing: "0.23 g", essential: true },
  { name: "Phenylalanine", per100g: "2.35 g", perServing: "0.28 g", essential: true },
  { name: "Proline", per100g: "5.37 g", perServing: "0.64 g" },
  { name: "Serine", per100g: "4.71 g", perServing: "0.56 g" },
  { name: "Threonine", per100g: "6.50 g", perServing: "0.78 g", essential: true },
  { name: "Tryptophan", per100g: "1.51 g", perServing: "0.18 g", essential: true },
  { name: "Tyrosine", per100g: "2.17 g", perServing: "0.26 g" },
  { name: "Valine", per100g: "4.71 g", perServing: "0.57 g", essential: true }
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
    "Calculated from the supplier analysis of each ingredient; the figures from analysis of the finished blend replace these before launch."
};
