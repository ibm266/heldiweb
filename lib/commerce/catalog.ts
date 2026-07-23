import {
  EXTRA_VALUE_PENCE,
  SAMPLE_PRICE_PENCE,
  TIERS,
  TIER_ORDER,
  giftCountsForPouches,
  packPouches,
  type TierId
} from "@/lib/pricing";
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
const TIER_IMAGES: Record<TierId, { url: string; altText: string }> = {
  single: { url: "/images/shop/khana-1.webp", altText: "Heldi Khana pouch with its refillable gold table jar" },
  double: { url: "/images/shop/khana-bundle-2.webp", altText: "Two Heldi Khana pouches with their refillable gold and silver table jars" },
  triple: { url: "/images/shop/khana-bundle-3.webp", altText: "The full table bundle: three Heldi Khana pouches with refillable table jars and a masala dabba" }
};
const SAMPLE_IMAGE = { url: "/images/shop/sample.webp", altText: "Heldi Sample sachet" };

// Clean pouch-only shot for contents breakdowns (the gallery images show
// the pouches with their jars and dabba).
export const POUCH_THUMB = "/images/shop/pouch-solo.webp";

export const JAR_THUMB = "/images/shop/gift-jar-gold.webp";
export const DABBA_THUMB = "/images/shop/gift-masala-dabba.webp";
export const SAMPLE_THUMB = "/images/shop/sample.webp";

// A 300g pouch at a 12g heaped-tbsp serving (see nutrition declaration)
// gives 25 servings; the Sample holds 3.
export const SERVINGS_PER_POUCH = 25;
export const SERVINGS_PER_SAMPLE = 3;

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

// The portion of a basket the waitlist launch code applies to: every pouch
// tier at its launch price. Only the Sample is excluded. Wider than the
// gifting discount above (single and pair only), so the two never share a
// helper.
export function waitlistEligiblePenceForLines(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
    const tier = tierForSku(line.merchandise.sku);
    return tier ? sum + TIERS[tier].launchPence * line.quantity : sum;
  }, 0);
}
