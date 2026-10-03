import { dailyIntake, type NutritionRow } from "./nutrition-data";

// The statements UK law requires next to a food supplement offered for sale.
//
// These are not brand copy and must not be reworded for tone. Under the Food
// Supplements (England) Regulations 2003 reg 6 a supplement must carry the
// "food supplement" designation, the portion recommended for daily
// consumption, a warning not to exceed it, a statement that it does not
// replace a varied diet, and a keep-out-of-reach-of-children line. Under FIC
// Regulation 1169/2011 Art 14 the allergen has to be available to a
// distance-selling customer *before* they buy, not only on the pack that
// arrives afterwards.
//
// Before this component existed the block lived inline on /faq only, which is
// not a commercial surface: someone could reach /shop, choose a tier and buy
// without ever seeing it. Render <StatutoryStatements /> on every surface that
// offers the product for sale. BRAND.md §12 carries the same rule.
//
// THE RECOMMENDED DAILY INTAKE IS A RANGE, 1 to 4 servings (settled 1 Oct
// 2026, printed on the round-16 pouches). It used to declare one serving as
// the daily portion, which capped people at one spoon while the pack allowed
// four. The sentence matches the pack's word for word: "Recommended daily
// intake: 12g to 48g (1 to 4 servings), providing 10.1g to 40.4g of
// protein." Three rules hold it in place:
//  - It stays a range, never "1 recommended, 4 maximum". The warning not to
//    exceed bites at the stated figure, so stating 1 would forbid the second
//    spoon.
//  - It sits directly before "Do not exceed the recommended daily intake.",
//    so the warning plainly refers to it.
//  - The protein at the top is calculated from the per-100g row, the way the
//    per-serving column is (dailyIntake in nutrition-data.ts), which is why
//    Chai's reads 20.5g and not 4 x 5.1.
//
// `servingGrams`, `maxServings`, `declaration` and `allergens` are required
// props, deliberately. They are per-product mandatory particulars: Khana is a
// 12g spoonful of whey, Chai is an 8g spoonful of whey and milk protein
// concentrate. A default here would silently declare the wrong intake on a
// second SKU, which is a false mandatory particular rather than a copy slip.
//
// THE GRAM LEADS AND THE SPOON FOLLOWS AS AN APPROXIMATION. It used to read
// "one heaped tablespoon (12g)", which makes the spoon the declared portion
// and the gram a gloss on it. A heaped tablespoon of this powder measures
// roughly 10 to 14 g depending on whose spoon and how full the pouch is, so
// declaring the spoon declares a quantity we cannot hold. The gram is what
// the nutrition table is calculated on and what FIC Reg 1169/2011 Art 33
// requires quantified, so it goes first; "about" marks the spoon as the
// estimate it is. Do not flip these back for tone. Marketing prose elsewhere
// is still free to say "one spoonful", because it declares nothing.
//
// The house word is "recommended daily intake", never "dose" (BRAND.md).
// The three permitted protein claims (BRAND.md §5) are used verbatim elsewhere
// and are deliberately not repeated here; this block is the mandatory text.
export function StatutoryStatements({
  servingGrams,
  maxServings,
  declaration,
  allergens,
  spoon = "heaped tablespoon",
  className = ""
}: {
  /** One serving in grams, the bottom of the daily range, from the product's
   *  own data (SERVING_GRAMS, CHAI_SERVING_GRAMS). */
  servingGrams: number;
  /** Servings a day at the top of the range (MAX_DAILY_SERVINGS,
   *  CHAI_MAX_DAILY_SERVINGS). */
  maxServings: number;
  /** The product's nutrition declaration rows. Its Protein row supplies the
   *  protein at each end of the range. */
  declaration: readonly Pick<NutritionRow, "label" | "per100g" | "perServing">[];
  /** The allergen sentence, e.g. "Contains milk (whey)." Product-specific. */
  allergens: string;
  /** How the serving is spooned: Khana's is a heaped tablespoon, Chai's a
   *  level one (CHAI_SERVING_SPOON). Part of the mandatory particular, so it
   *  is passed rather than assumed. */
  spoon?: string;
  /** Extra class for spacing at the call site; the type styling is shared. */
  className?: string;
}) {
  const intake = dailyIntake(servingGrams, maxServings, declaration);
  return (
    <p className={`heldi-disclaimer${className ? ` ${className}` : ""}`}>
      Heldi is a food supplement. One serving is {intake.servingGrams}g, about
      one {spoon}. Recommended daily intake: {intake.minGrams}g to{" "}
      {intake.maxGrams}g (1 to {intake.maxServings} servings), providing{" "}
      {intake.minProtein}g to {intake.maxProtein}g of protein. Do not exceed
      the recommended daily intake. Food supplements are not a substitute for
      a varied and balanced diet and a healthy lifestyle. Keep out of reach of
      children. {allergens}
    </p>
  );
}
