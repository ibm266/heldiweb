import { SERVING_GRAMS } from "./nutrition-data";

// The statements UK law requires next to a food supplement offered for sale.
//
// These are not brand copy and must not be reworded for tone. Under the Food
// Supplements (England) Regulations 2003 reg 7 a supplement must carry the
// "food supplement" designation, the recommended daily portion, a warning not
// to exceed it, a statement that it does not replace a varied diet, and a
// keep-out-of-reach-of-children line. Under FIC Regulation 1169/2011 Art 14
// the allergen has to be available to a distance-selling customer *before*
// they buy, not only on the pack that arrives afterwards.
//
// Before this component existed the block lived inline on /faq only, which is
// not a commercial surface: someone could reach /shop, choose a tier and buy
// without ever seeing it. Render <StatutoryStatements /> on every surface that
// offers the product for sale. BRAND.md §12 carries the same rule.
//
// The three permitted protein claims (BRAND.md §5) are used verbatim elsewhere
// and are deliberately not repeated here; this block is the mandatory text.
export function StatutoryStatements({
  className = ""
}: {
  /** Extra class for spacing at the call site; the type styling is shared. */
  className?: string;
}) {
  return (
    <p className={`heldi-disclaimer${className ? ` ${className}` : ""}`}>
      Heldi is a food supplement. Recommended daily portion: one heaped
      tablespoon ({SERVING_GRAMS}g). Do not exceed the recommended daily
      intake. Food supplements are not a substitute for a varied and balanced
      diet and a healthy lifestyle. Keep out of reach of children. Contains
      milk (whey).
    </p>
  );
}
