import {
  EXTRA_VALUE_PENCE,
  MAX_POUCHES,
  SAMPLE_PRICE_PENCE,
  TIERS,
  TIER_ORDER,
  giftCountsForPouches,
  ladderPence,
  packPouches,
  presentsForPouches,
  samplePairPence,
  type TierId
} from "@/lib/pricing";
import { CHAI_IMAGES, CHAI_SERVING_GRAMS } from "@/components/shop/chai-data";
import { SERVING_GRAMS } from "@/components/shop/nutrition-data";
import { moneyToPence, penceToMoney } from "./money";
import type {
  CartLine,
  CartLineInput,
  IncludedItem,
  Money,
  Product,
  ProductImage,
  ProductVariant
} from "./types";

// Static catalog until the Shopify store exists. At connect time the
// placeholder GIDs get replaced with real Product/ProductVariant ids (or the
// whole file switches to a server-side Storefront API fetch) — callers of
// getProducts/getProduct don't change either way.
//
// Each pricing tier is its own variant (a fixed bundle SKU, as it will be in
// Shopify). The cart UI thinks in pouches and repacks the tier lines to the
// cheapest mix for the running total (see packPouches in lib/pricing.ts), so
// a basket holds at most one line per tier — e.g. 4 pouches is 1 × The full
// table + 1 × One pouch. All prices come from lib/pricing.ts: the variant
// price is the launch price, compareAtPrice is the RRP that gets struck
// through.

// PRICING REWORK DECIDED 2 SEP 2026, NOT YET BUILT — see NEXT_STEPS.md §1c.
// The three tier variants here become ONE Shopify product ("Heldi pouches")
// with 27 fixed-price variants, one per (pouches 1–6, Khana 0–6) combination,
// SKUs like HELDI-K2C1. The cart keeps a pouch count per product and maps
// (khana + chai, khana) to a single variant, the way packPouches maps a count
// to a tier today. Inventory is untracked on those variants and the pouch
// stock is kept by the site via the orders webhook. Every helper below that
// keys off Khana's tier SKUs then reads the counts off the variant's options.

export const KHANA_VARIANT_ID = "gid://shopify/ProductVariant/57986783052159";
export const KHANA_DOUBLE_VARIANT_ID = "gid://shopify/ProductVariant/57986783084927";
export const KHANA_TRIPLE_VARIANT_ID = "gid://shopify/ProductVariant/57986783117695";
export const SAMPLE_VARIANT_ID = "gid://shopify/ProductVariant/57986783150463";

export const TIER_VARIANT_IDS: Record<TierId, string> = {
  single: KHANA_VARIANT_ID,
  double: KHANA_DOUBLE_VARIANT_ID,
  triple: KHANA_TRIPLE_VARIANT_ID
};

const TIER_SKUS: Record<TierId, string> = {
  single: "HELDI-KHANA-300",
  double: "HELDI-KHANA-300-X2",
  triple: "HELDI-KHANA-300-X3"
};

export const SAMPLE_SKU = "HELDI-SAMPLE";

// The free gift items are real Shopify £0.00 products (compare-at = their
// worth), so Shopify checkout shows them as FREE lines with an image. The cart
// adds and removes their lines automatically from the pouch count (see
// giftLinesForPouchCount); a shopper never selects or edits them. GIDs from
// the store, created 19 Jul 2026.
export const JAR_PRODUCT_ID = "gid://shopify/Product/15796489847167";
export const JAR_VARIANT_ID = "gid://shopify/ProductVariant/58012531130751";
export const DABBA_PRODUCT_ID = "gid://shopify/Product/15796489912703";
export const DABBA_VARIANT_ID = "gid://shopify/ProductVariant/58012531196287";

export const GIFT_SKUS = { jar: "HELDI-JAR", dabba: "HELDI-DABBA" } as const;

// Widened to string[] so `.includes(sku)` accepts any SKU string.
const GIFT_VARIANT_IDS: string[] = [JAR_VARIANT_ID, DABBA_VARIANT_ID];

export function tierForSku(sku: string): TierId | null {
  return TIER_ORDER.find((id) => TIER_SKUS[id] === sku) ?? null;
}

export function isJarGiftLine(line: Pick<CartLine, "merchandise">): boolean {
  return (
    line.merchandise.id === JAR_VARIANT_ID ||
    line.merchandise.sku === GIFT_SKUS.jar
  );
}

export function isDabbaGiftLine(line: Pick<CartLine, "merchandise">): boolean {
  return (
    line.merchandise.id === DABBA_VARIANT_ID ||
    line.merchandise.sku === GIFT_SKUS.dabba
  );
}

export function isGiftVariantId(id: string): boolean {
  return GIFT_VARIANT_IDS.includes(id);
}

// True for the free jar / dabba lines. Matches by variant GID first, SKU as a
// fallback (a cart mutated outside the site could carry either).
export function isGiftLine(line: Pick<CartLine, "merchandise">): boolean {
  return isJarGiftLine(line) || isDabbaGiftLine(line);
}

// ?v= busts the Next image-optimizer cache when a shot is regenerated in place.
// Reshot 4 Sep 2026 for the new line-up: the engraved brass jar and its gold
// spoon replace the plain unengraved jar, the cotton tote replaces the masala
// dabba, and no shot shows more than two pouches, because two is the ceiling.
// The `triple` key survives only because TierId still has three members; it
// now carries the mixed pair, which is a basket a customer can actually buy.
// It goes when the tier model does.
const TIER_IMAGES: Record<TierId, { url: string; altText: string }> = {
  single: { url: "/images/shop/khana-1.webp?v=5", altText: "A Heldi Khana pouch beside the engraved brass table jar and its gold spoon" },
  double: { url: "/images/shop/khana-bundle-2.webp?v=6", altText: "Two Heldi Khana pouches with the engraved brass jar, its gold spoon and the cotton tote bag" },
  triple: { url: "/images/shop/khana-chai-pair.webp?v=2", altText: "One Heldi Khana pouch and one Heldi Chai pouch with the engraved brass jar, its gold spoon and the cotton tote bag" }
};
const SAMPLE_IMAGE = { url: "/images/shop/sample.webp?v=4", altText: "Heldi Sample sachet" };

// Clean pouch-only shot for contents breakdowns (the gallery images show
// the pouches with their jar and tote).
export const POUCH_THUMB = "/images/shop/pouch-solo.webp?v=4";

// New filenames rather than in-place swaps: neither of the old gift thumbs
// carried a ?v=, and next.config.ts holds optimized images for 31 days, so
// overwriting them would have served the unengraved jar and the withdrawn
// dabba for a month.
export const JAR_THUMB = "/images/shop/gift-jar-brass.webp";
export const TOTE_THUMB = "/images/shop/gift-tote.webp";
/** @deprecated The dabba is withdrawn. Kept until the cart stops reading it. */
export const DABBA_THUMB = TOTE_THUMB;
export const SAMPLE_THUMB = "/images/shop/sample.webp?v=4";

// A 300g pouch at a 12g serving (see the nutrition declaration; the gram is
// the declared portion and the heaped tablespoon is an approximation of it,
// not the other way round) gives exactly 25 servings.
export const SERVINGS_PER_POUCH = 25;

// The sachet fill, confirmed 4 Sep 2026 at 30g for both products. One fill,
// two different serving counts, because Khana's declared portion is 12g and
// Chai's is 8g. Derived rather than typed so the two cannot drift, and rounded
// DOWN: 30g is two and a half Khana portions, and the pack may only promise
// what it can certainly deliver.
//
// 30g is the declared net quantity for both sachets and it must appear on the
// pack. Chai's sachet is gated on the same blend sign-off as the Chai pouch.
export const SAMPLE_GRAMS = 30;

/** Khana sachet: 30g at a 12g portion. */
export const SERVINGS_PER_SAMPLE = Math.floor(SAMPLE_GRAMS / SERVING_GRAMS);

/** Chai sachet: 30g at an 8g portion. */
export const MUGS_PER_SAMPLE = Math.floor(SAMPLE_GRAMS / CHAI_SERVING_GRAMS);

const PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/15790466957695",
    handle: "khana",
    title: "Heldi Khana",
    shortDescription: "Protein that disappears into dal, curry and raita.",
    description:
      "One pouch for the whole table. Heldi Khana is a high-protein blend made to disappear into the food you already cook. Stir it into dal, curry, sabzi or raita and the taste stays exactly where your family left it. High in protein. Protein contributes to the maintenance of muscle mass. Contains milk (whey).",
    images: [
      TIER_IMAGES.single,
      TIER_IMAGES.double,
      TIER_IMAGES.triple,
      SAMPLE_IMAGE
    ],
    tags: ["contains-milk"],
    variants: [
      ...TIER_ORDER.map((id) => ({
        id: TIER_VARIANT_IDS[id],
        title: TIERS[id].name,
        sku: TIER_SKUS[id],
        price: penceToMoney(TIERS[id].launchPence),
        compareAtPrice: penceToMoney(TIERS[id].rrpPence),
        availableForSale: true,
        image: TIER_IMAGES[id]
      })),
      {
        id: SAMPLE_VARIANT_ID,
        title: "Sample",
        sku: SAMPLE_SKU,
        price: penceToMoney(SAMPLE_PRICE_PENCE),
        compareAtPrice: null,
        availableForSale: true,
        image: SAMPLE_IMAGE
      }
    ]
  }
];

// The gift products, kept out of PRODUCTS on purpose: they never appear in the
// PDP gallery, the shop listing or the /shop AggregateOffer schema. The variant
// finders below still see them so the mock cart can price their £0.00 lines.
const GIFT_PRODUCTS: Product[] = [
  {
    id: JAR_PRODUCT_ID,
    handle: "table-jar",
    title: "Refillable table jar",
    shortDescription: "The jar that lives on the table.",
    description:
      "The stainless steel jar that lives on the dinner table, filled straight from the Heldi pouch. Ships free with every order, never sold on its own.",
    images: [{ url: JAR_THUMB, altText: "Heldi refillable table jar" }],
    tags: ["gift-with-order"],
    variants: [
      {
        id: JAR_VARIANT_ID,
        title: "Refillable table jar",
        sku: GIFT_SKUS.jar,
        price: penceToMoney(0),
        compareAtPrice: penceToMoney(EXTRA_VALUE_PENCE.jar),
        availableForSale: true,
        image: { url: JAR_THUMB, altText: "Heldi refillable table jar" }
      }
    ]
  },
  {
    id: DABBA_PRODUCT_ID,
    handle: "masala-dabba",
    title: "Masala dabba",
    shortDescription: "The tin for the whole table.",
    description:
      "The steel spice tin that holds the whole table's worth of Heldi. Ships free with the full table, never sold on its own.",
    images: [{ url: DABBA_THUMB, altText: "Heldi masala dabba" }],
    tags: ["gift-with-order"],
    variants: [
      {
        id: DABBA_VARIANT_ID,
        title: "Masala dabba",
        sku: GIFT_SKUS.dabba,
        price: penceToMoney(0),
        compareAtPrice: penceToMoney(EXTRA_VALUE_PENCE.dabba),
        availableForSale: true,
        image: { url: DABBA_THUMB, altText: "Heldi masala dabba" }
      }
    ]
  }
];

// Everything the cart can price: the sellable catalog plus the gift products.
const ALL_PRODUCTS: Product[] = [...PRODUCTS, ...GIFT_PRODUCTS];

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProduct(handle: string): Promise<Product | null> {
  return PRODUCTS.find((product) => product.handle === handle) ?? null;
}

// Synchronous lookup for client-side cart math against the static catalog.
// Searches the gift products too so the mock cart can build their lines.
export function findProductByVariantId(variantId: string): Product | null {
  return (
    ALL_PRODUCTS.find((product) =>
      product.variants.some((variant) => variant.id === variantId)
    ) ?? null
  );
}

export function findVariantById(
  variantId: string
): { product: Product; variant: ProductVariant } | null {
  for (const product of ALL_PRODUCTS) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

export type DisplayPrice = {
  current: Money;
  // RRP total (compare-at price × quantity); null when nothing is
  // discounted.
  compareAt: Money | null;
};

// Price to show for buying `quantity` of a variant: the launch price with
// the RRP as the strikethrough.
export function displayPrice(variant: ProductVariant, quantity: number): DisplayPrice {
  const current = Math.round(parseFloat(variant.price.amount) * 100) * quantity;
  const compareAt = variant.compareAtPrice
    ? Math.round(parseFloat(variant.compareAtPrice.amount) * 100) * quantity
    : null;
  return {
    current: penceToMoney(current),
    compareAt: compareAt !== null && compareAt > current ? penceToMoney(compareAt) : null
  };
}

function buildIncludedItems(jars: number, dabbas: number): IncludedItem[] {
  if (jars < 1) return [];
  const items: IncludedItem[] = [
    {
      title: jars === 1 ? "1 refillable table jar" : `${jars} refillable table jars`,
      image: JAR_THUMB,
      valuePence: jars * EXTRA_VALUE_PENCE.jar
    }
  ];
  if (dabbas > 0) {
    items.push({
      title: dabbas === 1 ? "1 masala dabba" : `${dabbas} masala dabbas`,
      image: DABBA_THUMB,
      valuePence: dabbas * EXTRA_VALUE_PENCE.dabba
    });
  }
  return items;
}

// Items included with `quantity` bundles of a tier variant, after the
// per-order gift caps (so the PDP Includes panel matches the cart): a jar per
// pouch up to the cap, the masala dabba once a full table is in the basket.
// The Sample never carries included items.
export function includedItemsForQuantity(
  variant: Pick<ProductVariant, "sku">,
  quantity: number
): IncludedItem[] {
  const tier = tierForSku(variant.sku);
  if (!tier || quantity < 1) return [];
  const { jars, dabbas } = giftCountsForPouches(TIERS[tier].pouches * quantity);
  return buildIncludedItems(jars, dabbas);
}

// Items included with a basket of `pouches` pouches, after the per-order caps.
export function includedItemsForPouches(pouches: number): IncludedItem[] {
  const { jars, dabbas } = giftCountsForPouches(pouches);
  return buildIncludedItems(jars, dabbas);
}

// The gift lines a basket of `pouches` pouches should hold, capped per order
// (GIFT_CAPS). Mapped onto the £0.00 gift variants so the same repack drives
// the mock cart and the real Shopify one. Empty below one pouch.
export function giftLinesForPouchCount(pouches: number): CartLineInput[] {
  const { jars, dabbas } = giftCountsForPouches(pouches);
  const lines: CartLineInput[] = [];
  if (jars > 0) lines.push({ merchandiseId: JAR_VARIANT_ID, quantity: jars });
  if (dabbas > 0) lines.push({ merchandiseId: DABBA_VARIANT_ID, quantity: dabbas });
  return lines;
}

// Included-item rows for the gift lines actually in a basket: title from the
// line quantity, worth from the line's compare-at (falling back to the
// per-item worth). Sourcing the drawer's struck-out "Free" rows from the real
// cart rather than recomputing them keeps the two in step. Jars before dabba.
export function includedItemsForGiftLines(lines: CartLine[]): IncludedItem[] {
  const items: IncludedItem[] = [];
  const jar = lines.find(isJarGiftLine);
  if (jar) {
    items.push({
      title:
        jar.quantity === 1
          ? "1 refillable table jar"
          : `${jar.quantity} refillable table jars`,
      image: JAR_THUMB,
      valuePence: jar.cost.compareAtAmount
        ? moneyToPence(jar.cost.compareAtAmount)
        : EXTRA_VALUE_PENCE.jar * jar.quantity
    });
  }
  const dabba = lines.find(isDabbaGiftLine);
  if (dabba) {
    items.push({
      title:
        dabba.quantity === 1
          ? "1 masala dabba"
          : `${dabba.quantity} masala dabbas`,
      image: DABBA_THUMB,
      valuePence: dabba.cost.compareAtAmount
        ? moneyToPence(dabba.cost.compareAtAmount)
        : EXTRA_VALUE_PENCE.dabba * dabba.quantity
    });
  }
  return items;
}

// Total pouches across the tier lines of a basket (samples don't count).
export function khanaPouchCount(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    const tier = tierForSku(line.merchandise.sku);
    return tier ? sum + TIERS[tier].pouches * line.quantity : sum;
  }, 0);
}

// The tier lines a basket should hold for a pouch count: the greedy
// packing from lib/pricing.ts mapped onto the fixed bundle SKUs, so the
// same repack works against the mock cart and the real Shopify one.
export function linesForPouchCount(pouches: number): CartLineInput[] {
  const packing = packPouches(pouches);
  return TIER_ORDER.filter((id) => packing[id] > 0).map((id) => ({
    merchandiseId: TIER_VARIANT_IDS[id],
    quantity: packing[id]
  }));
}

// Basket badge count: pouches count one by one, anything else (the Sample)
// by its line quantity. The free gift lines never count.
export function cartItemCount(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    if (isGiftLine(line)) return sum;
    const tier = tierForSku(line.merchandise.sku);
    return sum + (tier ? TIERS[tier].pouches : 1) * line.quantity;
  }, 0);
}

// Bundle gallery shot matching a pouch count; three or more pouches use
// the full-table shot.
export function khanaImageForPouches(pouches: number): ProductImage {
  return TIER_IMAGES[pouches >= 3 ? "triple" : pouches === 2 ? "double" : "single"];
}

// The portion of a basket the gifting discount applies to: One pouch and
// The pair lines at the launch price. The full table and Sample lines
// are excluded.
export function giftingEligiblePenceForLines(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    const tier = tierForSku(line.merchandise.sku);
    if (tier === "single" || tier === "double") {
      return sum + TIERS[tier].launchPence * line.quantity;
    }
    return sum;
  }, 0);
}

// The portion of a basket a founders code applies to: every pouch tier at its
// launch price. Only the Sample is excluded. Wider than the gifting discount
// above (single and pair only), so the two do not share a helper yet. Under
// the agreed ladder both codes apply to every pouch, so Phase 2 collapses
// giftingEligiblePenceForLines into this one.
export function pouchPenceForLines(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    const tier = tierForSku(line.merchandise.sku);
    return tier ? sum + TIERS[tier].launchPence * line.quantity : sum;
  }, 0);
}

// ---------------------------------------------------------------------------
// The mix model
// ---------------------------------------------------------------------------
// Added 4 Sep 2026 beside the tier model above rather than replacing it, so the
// build stays green while the cart, the drawer and the buy box move over one at
// a time. Nothing here is wired up yet. When the last caller of tierForSku /
// packPouches / linesForPouchCount is gone, everything above the divider goes
// with it.
//
// A basket holds AT MOST ONE pouch line. Its variant encodes the whole order:
// HELDI-K{khana}C{chai}, so two Khana and one Chai would be K2C1. Changing a
// count swaps the variant rather than editing a quantity, which is why the cart
// diff replaces the line instead of stepping it. Five variants exist, because
// two pouches is the ceiling (lib/pricing.ts MAX_POUCHES).
//
// Created in Shopify 4 Sep 2026, all DRAFT. Ids also recorded in
// docs/two-product-cart-plan.md Phase 1.

export const MIX_PRODUCT_ID = "gid://shopify/Product/15876757979519";

/** Mix SKU to variant GID. The five things a customer can buy. */
export const MIX_VARIANT_IDS: Record<string, string> = {
  "HELDI-K1C0": "gid://shopify/ProductVariant/58361529893247",
  "HELDI-K0C1": "gid://shopify/ProductVariant/58361529926015",
  "HELDI-K2C0": "gid://shopify/ProductVariant/58361529958783",
  "HELDI-K0C2": "gid://shopify/ProductVariant/58361529991551",
  "HELDI-K1C1": "gid://shopify/ProductVariant/58361530024319"
};

export const SAMPLE_PRODUCT_ID = "gid://shopify/Product/15876758110591";
export const SAMPLE_CHAI_SKU = "HELDI-SAMPLE-CHAI";
export const SAMPLE_PAIR_SKU = "HELDI-SAMPLE-PAIR";

/** Sachet SKU to variant GID. SAMPLE_SKU above keeps its old string on purpose:
 *  the orders webhook keys off it. Note it now exists on TWO products until the
 *  old "Heldi Khana" is archived on launch day. */
export const SAMPLE_VARIANT_IDS: Record<string, string> = {
  "HELDI-SAMPLE": "gid://shopify/ProductVariant/58361530188159",
  "HELDI-SAMPLE-CHAI": "gid://shopify/ProductVariant/58361530220927",
  "HELDI-SAMPLE-PAIR": "gid://shopify/ProductVariant/58361530253695"
};

// The free trial pair. Gated by INVENTORY, not by code: that variant is the one
// item in the store with tracking ON, stocked at 100, so it closes itself when
// the hundredth is claimed. No discount code, no cart rule, nothing to expire.
export const FREE_PAIR_PRODUCT_ID = "gid://shopify/Product/15876777116031";
export const FREE_PAIR_VARIANT_ID = "gid://shopify/ProductVariant/58361566790015";
export const FREE_PAIR_SKU = "HELDI-SAMPLE-PAIR-FREE";

export const TOTE_PRODUCT_ID = "gid://shopify/Product/15876954128767";
export const TOTE_VARIANT_ID = "gid://shopify/ProductVariant/58362101268863";
export const TOTE_SKU = "HELDI-TOTE";

export function isToteGiftLine(line: Pick<CartLine, "merchandise">): boolean {
  return (
    line.merchandise.id === TOTE_VARIANT_ID || line.merchandise.sku === TOTE_SKU
  );
}

/** `HELDI-K2C1` for two Khana and one Chai. */
export function mixSku(khana: number, chai: number): string {
  return `HELDI-K${khana}C${chai}`;
}

/** The counts back out of a SKU, or null if it is not one of ours. Deliberately
 *  strict: an unknown or out-of-range SKU returns null rather than a guess, so a
 *  hand-crafted cart line cannot inflate a pouch count. */
export function parseMixSku(
  sku: string | null | undefined
): { khana: number; chai: number; pouches: number } | null {
  if (!sku) return null;
  const match = /^HELDI-K(\d+)C(\d+)$/.exec(sku);
  if (!match) return null;
  const khana = Number(match[1]);
  const chai = Number(match[2]);
  const pouches = khana + chai;
  if (pouches < 1 || pouches > MAX_POUCHES) return null;
  return { khana, chai, pouches };
}

export function isMixSku(sku: string | null | undefined): boolean {
  return parseMixSku(sku) !== null;
}

/** The variant a (khana, chai) selection maps to, or null if it is not buyable. */
export function mixVariantIdFor(khana: number, chai: number): string | null {
  return MIX_VARIANT_IDS[mixSku(khana, chai)] ?? null;
}

/** True for the single pouch line of a basket. Matches by GID first, SKU as a
 *  fallback, mirroring isGiftLine. */
export function isMixLine(line: Pick<CartLine, "merchandise">): boolean {
  return (
    Object.values(MIX_VARIANT_IDS).includes(line.merchandise.id) ||
    isMixSku(line.merchandise.sku)
  );
}

/** What a basket actually holds. Multiplies by line quantity so a cart mutated
 *  outside the site reports the truth rather than what it should have been; the
 *  server-side clamp is what refuses it. */
export function pouchCounts(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): { khana: number; chai: number; pouches: number } {
  return lines.reduce(
    (totals, line) => {
      const mix = parseMixSku(line.merchandise.sku);
      if (!mix) return totals;
      return {
        khana: totals.khana + mix.khana * line.quantity,
        chai: totals.chai + mix.chai * line.quantity,
        pouches: totals.pouches + mix.pouches * line.quantity
      };
    },
    { khana: 0, chai: 0, pouches: 0 }
  );
}

/** The one pouch line a (khana, chai) selection should become. Null for an
 *  empty or unbuyable selection, which the caller reads as "no pouch line". */
export function mixLineForCounts(
  khana: number,
  chai: number
): CartLineInput | null {
  const id = mixVariantIdFor(khana, chai);
  return id ? { merchandiseId: id, quantity: 1 } : null;
}

/** The free lines a basket of `pouches` pouches earns: a jar with a single, a
 *  jar and a tote with a pair. One set per order, never per pouch. */
export function presentLinesForPouches(pouches: number): CartLineInput[] {
  if (pouches < 1 || pouches > MAX_POUCHES) return [];
  const { jars, totes } = presentsForPouches(pouches);
  const lines: CartLineInput[] = [];
  if (jars > 0) lines.push({ merchandiseId: JAR_VARIANT_ID, quantity: jars });
  if (totes > 0) lines.push({ merchandiseId: TOTE_VARIANT_ID, quantity: totes });
  return lines;
}

/** Gallery shot for a selection: the product's own shot when the basket is all
 *  one thing, the mixed pair when it is one of each. */
export function imageForCounts(khana: number, chai: number): ProductImage {
  if (khana > 0 && chai > 0) return TIER_IMAGES.triple;
  if (chai > 0) return CHAI_IMAGES[chai >= 2 ? 2 : 0];
  return TIER_IMAGES[khana >= 2 ? "double" : "single"];
}

/** Every pouch in a basket at its ladder price. Both product discount classes
 *  key off this; the Sample and the free gifts are excluded. Replaces the split
 *  between giftingEligiblePenceForLines and pouchPenceForLines, which existed
 *  only because the old tiers discounted differently. */
export function pouchPenceForCounts(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  const { pouches } = pouchCounts(lines);
  return pouches >= 1 && pouches <= MAX_POUCHES ? ladderPence(pouches) : 0;
}

/** Basket badge count: pouches one by one, plus sachets. Gifts never count. */
export function cartItemCountV2(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  const { pouches } = pouchCounts(lines);
  const sachets = lines.reduce((sum, line) => {
    const sku = line.merchandise.sku;
    if (!sku) return sum;
    const isSachet =
      sku === SAMPLE_SKU ||
      sku === SAMPLE_CHAI_SKU ||
      sku === SAMPLE_PAIR_SKU ||
      sku === FREE_PAIR_SKU;
    return isSachet ? sum + line.quantity : sum;
  }, 0);
  return pouches + sachets;
}

/** What a sachet line costs, by SKU. */
export function samplePenceForSku(sku: string): number {
  if (sku === FREE_PAIR_SKU) return 0;
  if (sku === SAMPLE_PAIR_SKU) return samplePairPence();
  if (sku === SAMPLE_SKU || sku === SAMPLE_CHAI_SKU) return SAMPLE_PRICE_PENCE;
  return 0;
}

/** Worth of the free items in a basket, for the drawer's "You're saving" row. */
export function presentWorthForLines(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    if (isJarGiftLine(line)) return sum + EXTRA_VALUE_PENCE.jar * line.quantity;
    if (isToteGiftLine(line)) return sum + EXTRA_VALUE_PENCE.tote * line.quantity;
    return sum;
  }, 0);
}
