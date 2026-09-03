#!/usr/bin/env node
// Nutrition declaration and amino acid profile, calculated from a blend and
// its ingredients. FIC Regulation 1169/2011 Art 31(4) allows a declaration to
// be an average value calculated from the known average values of the
// ingredients (b) or from generally established and accepted data (c). This
// script is that calculation, kept in the repo so the tables in
// components/shop/nutrition-data.ts and components/shop/chai-data.ts can be
// regenerated the moment a recipe or a supplier spec moves.
//
//   node scripts/nutrition-calc.mjs            # prints both blends
//   node scripts/nutrition-calc.mjs chai       # one blend
//
// Sources, per 100 g as-is:
//  - Whey protein isolate: Arla Lacprodan Ultrawhey 90 Instant, certificate
//    0000672935 (batch FF25466001, produced 15.11.2025, shipped to Bacarel).
//    READ THE CERTIFICATE CAREFULLY: it reports "Protein in DM (Nx6.38)",
//    which is DRY MATTER, not as-is. Batch FF25466001 is 92.66% protein in DM
//    at 4.13% moisture, so as-is protein is 92.66 x (100 - 4.13)/100 = 88.83%.
//    That is the figure below. The two numbers this file used to carry were
//    both wrong readings of the same document: 87.3% assumed the spec's
//    worst-case 5.8% moisture rather than the batch's actual 4.13%, and the
//    site's old 86.9 g/100g blend figure implied whey at 92.06% as-is, which
//    is the DM number used as though it were as-is. The other three batches
//    on the certificate are 88.92% (FF25465001) and 89.60% (FF25467001), a
//    three-batch mean of 89.12%; the worst batch Arla's spec permits (90% DM
//    at 6% moisture) would be 84.60%, comfortably inside the +/-8 g protein
//    tolerance around a declared 84. Fat, ash and lactose are as-is on the
//    certificate; sodium from the Arla typical spec.
//  - MPC85 (milk protein concentrate): the Chai milk protein. MPC grades are
//    quoted on DRY BASIS, the same convention that caught the whey above, so
//    an "85" MPC is about 80.75% protein as-is at a typical 5% moisture, not
//    85%. That is the figure used here, and it is the conservative reading.
//    Read as a literal 85% as-is instead, the mug goes from 5.12 to 5.18 g and
//    the blend from 64.0 to 64.8 g/100g, so the declaration barely moves and
//    the 5 g roundel survives either way. Lactose is the row that actually
//    cares: MPC carries about 5.5% against micellar casein's 1%. Replace both
//    with the supplier's own spec when Bacarel sends it.
//  - Coconut sugar, spices, salt: USDA FoodData Central SR Legacy typical
//    values (cardamom 02006, ginger 02021, cinnamon 02010, cloves 02011,
//    pepper 02030, cumin 02014, coriander seed 02013, turmeric 02043,
//    paprika 02028 standing in for Kashmiri chilli, coconut sugar via the
//    USDA branded average). Carbohydrate is available carbohydrate (fibre
//    excluded), per FIC.
//  - Sunflower lecithin powder: Special Ingredients typical spec.
//  - Amino acids: the whey profile is the supplier's, taken from the Khana
//    table already on the site and expressed per 100 g protein; the casein
//    profile is the published typical composition of bovine casein. Both are
//    stated per 100 g of protein and scaled by each blend's protein.
//
// Every figure here is provisional until the finished blend is analysed
// (Eurofins, the go-live checklist); the calculation is the legal basis in
// the meantime, the same basis Khana's table has always used.

const RI = { kcal: 2000, fat: 70, sat: 20, carb: 260, sugar: 90, protein: 50, salt: 6 };

// per 100 g: energy in kcal, fat, saturates, carbohydrate (available), sugars,
// fibre, protein, salt. Energy is recomputed from the macros (FIC conversion
// factors) so it is consistent with the rows, not copied from the source.
const INGREDIENTS = {
  wpi:        { name: "Whey protein isolate (MILK)", fat: 0.3,  sat: 0.18, carb: 2.28, sugar: 2.28, fibre: 0,    protein: 88.83, salt: 0.45 },
  mpc85:      { name: "Milk protein concentrate (MILK)", fat: 1.6, sat: 1.0, carb: 5.5, sugar: 5.5, fibre: 0,    protein: 80.75, salt: 0.25 },
  coconut:    { name: "Coconut sugar",                fat: 0.4,  sat: 0.3,  carb: 93.0, sugar: 90.0, fibre: 1.0,  protein: 1.1,  salt: 0.11 },
  cardamom:   { name: "Cardamom",                     fat: 6.7,  sat: 0.7,  carb: 40.5, sugar: 0.0,  fibre: 28.0, protein: 10.8, salt: 0.05 },
  ginger:     { name: "Ginger",                       fat: 4.2,  sat: 2.6,  carb: 57.5, sugar: 3.4,  fibre: 14.1, protein: 9.0,  salt: 0.07 },
  cinnamon:   { name: "Cinnamon",                     fat: 1.2,  sat: 0.3,  carb: 27.5, sugar: 2.2,  fibre: 53.1, protein: 4.0,  salt: 0.03 },
  clove:      { name: "Clove",                        fat: 13.0, sat: 4.0,  carb: 31.6, sugar: 2.4,  fibre: 33.9, protein: 6.0,  salt: 0.69 },
  pepper:     { name: "Black pepper",                 fat: 3.3,  sat: 1.4,  carb: 38.7, sugar: 0.6,  fibre: 25.3, protein: 10.4, salt: 0.05 },
  cumin:      { name: "Cumin",                        fat: 22.3, sat: 1.5,  carb: 33.7, sugar: 2.3,  fibre: 10.5, protein: 17.8, salt: 0.42 },
  coriander:  { name: "Coriander seed",               fat: 17.8, sat: 1.0,  carb: 13.1, sugar: 0.0,  fibre: 41.9, protein: 12.4, salt: 0.09 },
  garam:      { name: "Garam masala",                 fat: 12.0, sat: 2.0,  carb: 30.0, sugar: 3.0,  fibre: 25.0, protein: 12.0, salt: 0.15 },
  chilli:     { name: "Kashmiri chilli",              fat: 12.9, sat: 2.1,  carb: 19.1, sugar: 10.3, fibre: 34.9, protein: 14.1, salt: 0.17 },
  turmeric:   { name: "Turmeric",                     fat: 3.3,  sat: 1.8,  carb: 44.4, sugar: 3.2,  fibre: 22.7, protein: 9.7,  salt: 0.07 },
  salt:       { name: "Fine sea salt",                fat: 0,    sat: 0,    carb: 0,    sugar: 0,    fibre: 0,    protein: 0,    salt: 99.0 },
  lecithin:   { name: "Sunflower lecithin",           fat: 93.0, sat: 10.0, carb: 4.0,  sugar: 0.5,  fibre: 0,    protein: 0,    salt: 0.02 }
};

// Amino acids, g per 100 g of protein.
// Whey: the supplier profile behind Khana's table (86.9 g protein per 100 g
// of that blend), normalised to protein. Casein: published typical bovine
// casein composition (Swaisgood 2003 / USDA), rounded to one decimal.
const AMINO = {
  whey: {
    "Alanine": 5.10, "Arginine": 1.62, "Aspartic acid": 11.38, "Cystine": 2.38, "Glutamic acid": 17.55,
    "Glycine": 1.74, "Histidine": 1.52, "Isoleucine": 5.96, "Leucine": 9.54, "Lysine": 9.75,
    "Methionine": 2.16, "Phenylalanine": 2.70, "Proline": 6.18, "Serine": 5.42, "Threonine": 7.48,
    "Tryptophan": 1.74, "Tyrosine": 2.50, "Valine": 5.42
  },
  casein: {
    "Alanine": 2.9, "Arginine": 3.7, "Aspartic acid": 6.9, "Cystine": 0.3, "Glutamic acid": 21.5,
    "Glycine": 1.9, "Histidine": 2.9, "Isoleucine": 5.0, "Leucine": 9.0, "Lysine": 7.7,
    "Methionine": 2.7, "Phenylalanine": 5.0, "Proline": 10.7, "Serine": 5.5, "Threonine": 4.2,
    "Tryptophan": 1.2, "Tyrosine": 5.6, "Valine": 6.3
  }
};
// MPC is whole milk protein, so its amino profile is the milk ratio: roughly
// four parts casein to one part whey. Derived rather than typed out, so it
// cannot drift from the two profiles above.
AMINO.mpc85 = Object.fromEntries(
  Object.keys(AMINO.whey).map((k) => [k, AMINO.casein[k] * 0.8 + AMINO.whey[k] * 0.2])
);
const ESSENTIAL = new Set(["Histidine", "Isoleucine", "Leucine", "Lysine", "Methionine", "Phenylalanine", "Threonine", "Tryptophan", "Valine"]);

// The blends. Percentages by weight; serving in grams.
const BLENDS = {
  khana: {
    name: "Heldi Khana",
    // 12 g, solved for 10 g of protein rather than picked for a round spoon.
    // At 88.83% whey the blend is 84.06 g protein per 100 g, so 10.0 g needs
    // 11.90 g and 12 g delivers 10.09 g. It survives the open formulation
    // question: the site's 4-ingredient FORMULA needs 11.93 g for the same
    // 10 g. 12 g also divides the 300 g pouch into exactly 25 servings.
    serving: 12,
    pouch: 300,
    lines: [
      ["wpi", 94.0], ["cumin", 1.7], ["lecithin", 1.5], ["coriander", 1.25], ["salt", 0.75],
      ["garam", 0.5], ["chilli", 0.2], ["turmeric", 0.1]
    ],
    proteinSources: { whey: 94.0 * 0.8883 }
  },
  chai: {
    name: "Heldi Chai",
    serving: 8,
    pouch: 250,
    lines: [
      ["wpi", 53.69], ["mpc85", 18.18], ["coconut", 10], ["ginger", 6.77], ["cardamom", 5],
      ["cinnamon", 2], ["pepper", 2], ["clove", 1.56], ["lecithin", 0.8]
    ],
    proteinSources: { whey: 53.69 * 0.8883, mpc85: 18.18 * 0.8075 }
  }
};

function calc(blend) {
  const total = blend.lines.reduce((s, [, p]) => s + p, 0);
  if (Math.abs(total - 100) > 0.05) throw new Error(`${blend.name} sums to ${total}`);
  const acc = { fat: 0, sat: 0, carb: 0, sugar: 0, fibre: 0, protein: 0, salt: 0 };
  for (const [id, pct] of blend.lines) {
    const ing = INGREDIENTS[id];
    for (const k of Object.keys(acc)) acc[k] += (ing[k] * pct) / 100;
  }
  // FIC Annex XIV conversion factors: carbohydrate 4, protein 4, fat 9, fibre 2 kcal/g.
  const kcal = acc.carb * 4 + acc.protein * 4 + acc.fat * 9 + acc.fibre * 2;
  const kJ = acc.carb * 17 + acc.protein * 17 + acc.fat * 37 + acc.fibre * 8;
  return { ...acc, kcal, kJ };
}

// FIC rounding guidance (EU Commission guidance on tolerances, Dec 2012):
// energy to the nearest 1 kJ/kcal; fat, carbs, sugars, fibre, protein: <10 g
// to 0.1 g, >=10 g to 1 g; salt <1 g to 0.01 g, >=1 g to 0.1 g. The site's
// tables have always shown one decimal on the macros for readability; both
// are printed so the choice is deliberate.
const r = (v, d) => v.toFixed(d);
const ficMacro = (v) => (v >= 10 ? r(v, 0) : r(v, 1));
const ficSalt = (v) => (v >= 1 ? r(v, 1) : r(v, 2));

function table(blend) {
  const per100 = calc(blend);
  const s = blend.serving / 100;
  const per = Object.fromEntries(Object.entries(per100).map(([k, v]) => [k, v * s]));
  const ri = (v, key) => `${((v / RI[key]) * 100).toFixed(1)}%`;
  const rows = [
    ["Energy", `${r(per100.kJ, 0)} kJ / ${r(per100.kcal, 0)} kcal`, `${r(per.kJ, 0)} kJ / ${r(per.kcal, 0)} kcal`, ri(per.kcal, "kcal")],
    ["Fat", `${r(per100.fat, 1)} g`, `${r(per.fat, 1)} g`, ri(per.fat, "fat")],
    ["of which saturates", `${r(per100.sat, 1)} g`, `${r(per.sat, 1)} g`, ri(per.sat, "sat")],
    ["Carbohydrate", `${r(per100.carb, 1)} g`, `${r(per.carb, 1)} g`, ri(per.carb, "carb")],
    ["of which sugars", `${r(per100.sugar, 1)} g`, `${r(per.sugar, 1)} g`, ri(per.sugar, "sugar")],
    ["Fibre", `${r(per100.fibre, 1)} g`, `${r(per.fibre, 1)} g`, "—"],
    ["Protein", `${r(per100.protein, 1)} g`, `${r(per.protein, 1)} g`, ri(per.protein, "protein")],
    ["Salt", `${ficSalt(per100.salt)} g`, `${ficSalt(per.salt)} g`, ri(per.salt, "salt")]
  ];
  return { per100, per, rows };
}

function amino(blend) {
  const proteinG = calc(blend).protein;
  const s = blend.serving / 100;
  const names = Object.keys(AMINO.whey);
  return names.map((n) => {
    let g100 = 0;
    for (const [src, proteinPct] of Object.entries(blend.proteinSources)) {
      g100 += (AMINO[src][n] * proteinPct) / 100;
    }
    return { name: n, per100g: g100, perServing: g100 * s, essential: ESSENTIAL.has(n), shareOfProtein: g100 / proteinG };
  });
}

function ingredientsLine(blend) {
  const sorted = [...blend.lines].sort((a, b) => b[1] - a[1]);
  return sorted.map(([id, pct]) => `${INGREDIENTS[id].name} ${pct}%`).join(" · ");
}

const which = process.argv[2];
for (const [id, blend] of Object.entries(BLENDS)) {
  if (which && which !== id) continue;
  const t = table(blend);
  console.log(`\n=== ${blend.name}: ${blend.pouch} g pouch, ${blend.serving} g serving (${Math.floor(blend.pouch / blend.serving)} servings) ===`);
  console.log("Ingredients, descending:", ingredientsLine(blend));
  console.log(`Energy check: ${t.per100.kcal.toFixed(0)} kcal/100 g; protein share of energy ${((t.per100.protein * 4) / t.per100.kcal * 100).toFixed(0)}% (high in protein needs 20%)`);
  console.log(`Protein per serving: ${t.per.protein.toFixed(2)} g  | per 100 g ${t.per100.protein.toFixed(2)} g`);
  console.log("\n| | Per 100 g | Per serving | %RI |");
  for (const row of t.rows) console.log(`| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |`);
  console.log("\nAmino acids (g per 100 g / per serving):");
  for (const a of amino(blend)) console.log(`  ${a.name.padEnd(14)} ${a.per100g.toFixed(2).padStart(6)}   ${a.perServing.toFixed(2).padStart(5)}${a.essential ? "  *" : ""}`);
  console.log("\nAs TS rows:");
  console.log(JSON.stringify(t.rows.map(([label, per100g, perServing, riPerServing]) => ({ label, per100g, perServing, riPerServing })), null, 0));
  console.log(JSON.stringify(amino(blend).map((a) => ({ name: a.name, per100g: `${a.per100g.toFixed(2)} g`, perServing: `${a.perServing.toFixed(2)} g`, ...(a.essential ? { essential: true } : {}) })), null, 0));
}
