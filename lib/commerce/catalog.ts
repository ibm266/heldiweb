import {
  EXTRA_VALUE_PENCE,
  SAMPLE_PRICE_PENCE,
  TIERS,
  TIER_ORDER,
  packPouches,
  type TierId
} from "@/lib/pricing";
import { penceToMoney } from "./money";
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

export const KHANA_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_KHANA_300";
export const KHANA_DOUBLE_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_KHANA_300_X2";
export const KHANA_TRIPLE_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_KHANA_300_X3";
export const SAMPLE_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_SAMPLE";

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

export function tierForSku(sku: string): TierId | null {
  return TIER_ORDER.find((id) => TIER_SKUS[id] === sku) ?? null;
}

// ?v= busts the Next image-optimizer cache when a shot is regenerated in place.
const TIER_IMAGES: Record<TierId, { url: string; altText: string }> = {
  single: { url: "/images/shop/khana-1.png?v=2", altText: "Heldi Khana pouch with its refillable gold table jar" },
  double: { url: "/images/shop/khana-bundle-2.png?v=2", altText: "Two Heldi Khana pouches with their refillable gold and silver table jars" },
  triple: { url: "/images/shop/khana-bundle-3.png?v=2", altText: "Three Heldi Khana pouches with their refillable table jars and masala dabba" }
};
const SAMPLE_IMAGE = { url: "/images/shop/sample.png", altText: "Heldi Sample sachet" };

// Clean pouch-only shot for contents breakdowns (the gallery images show
// the pouches with their jars and dabba).
export const POUCH_THUMB = "/images/shop/pouch-solo.png";

export const JAR_THUMB = "/images/shop/gift-jar-gold.png";
export const DABBA_THUMB = "/images/shop/gift-masala-dabba.png";
export const SAMPLE_THUMB = "/images/shop/sample.png";

// A 300g pouch at a 12g heaped-tbsp serving (see nutrition declaration)
// gives 25 servings; the Sample holds 3.
export const SERVINGS_PER_POUCH = 25;
export const SERVINGS_PER_SAMPLE = 3;

const PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/PLACEHOLDER_KHANA",
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

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProduct(handle: string): Promise<Product | null> {
  return PRODUCTS.find((product) => product.handle === handle) ?? null;
}

// Synchronous lookup for client-side cart math against the static catalog.
export function findProductByVariantId(variantId: string): Product | null {
  return (
    PRODUCTS.find((product) =>
      product.variants.some((variant) => variant.id === variantId)
    ) ?? null
  );
}

export function findVariantById(
  variantId: string
): { product: Product; variant: ProductVariant } | null {
  for (const product of PRODUCTS) {
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

// Items included with `quantity` bundles of a tier variant: a refillable
// table jar with every pouch, plus the masala dabba with the full table.
// The Sample never carries included items.
export function includedItemsForQuantity(
  variant: Pick<ProductVariant, "sku">,
  quantity: number
): IncludedItem[] {
  const tier = tierForSku(variant.sku);
  if (!tier || quantity < 1) return [];
  return buildIncludedItems(TIERS[tier].jars * quantity, TIERS[tier].dabbas * quantity);
}

// Items included with a basket of `pouches` pouches: a jar per pouch, a
// dabba per full-table block of the greedy packing.
export function includedItemsForPouches(pouches: number): IncludedItem[] {
  return buildIncludedItems(pouches, packPouches(pouches).triple);
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
// by its line quantity.
export function cartItemCount(
  lines: Pick<CartLine, "quantity" | "merchandise">[]
): number {
  return lines.reduce((sum, line) => {
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
