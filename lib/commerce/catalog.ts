import { salePricePence } from "./config";
import { penceToMoney } from "./money";
import type { GiftItem, Money, Product, ProductVariant } from "./types";

// Static catalog until the Shopify store exists. At connect time the
// placeholder GIDs get replaced with real Product/ProductVariant ids (or the
// whole file switches to a server-side Storefront API fetch) — callers of
// getProducts/getProduct don't change either way.

export const KHANA_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_KHANA_300";
export const SAMPLE_VARIANT_ID = "gid://shopify/ProductVariant/PLACEHOLDER_SAMPLE";

// ?v= busts the Next image-optimizer cache when a shot is regenerated in place.
const KHANA_IMAGE = { url: "/images/shop/khana-1.png?v=2", altText: "Heldi Khana pouch with the free gold jar" };
const SAMPLE_IMAGE = { url: "/images/shop/sample.png", altText: "Heldi sample sachet" };

// Clean pouch-only shot for line items and the Includes breakdown (the
// gallery images now show the pouches with their free gifts).
export const POUCH_THUMB = "/images/shop/pouch-solo.png";

// A 300g pouch at a 12g heaped-tbsp serving (see nutrition declaration)
// gives 25 servings; the sample sachet holds 3.
export const SERVINGS_PER_POUCH = 25;
export const SERVINGS_PER_SAMPLE = 3;

const PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/PLACEHOLDER_KHANA",
    handle: "khana",
    title: "Heldi Khana",
    shortDescription: "Protein that disappears into dal, curry and raita.",
    description:
      "One pouch for the whole table. Heldi Khana is a high-protein blend made to disappear into the food you already cook — stir it into dal, curry, sabzi or raita and the taste stays exactly where your family left it. High in protein. Protein contributes to the maintenance of muscle mass. Contains milk (whey).",
    images: [
      KHANA_IMAGE,
      { url: "/images/shop/khana-bundle-2.png?v=2", altText: "Two Heldi Khana pouches with the free gold and silver jars" },
      { url: "/images/shop/khana-bundle-3.png?v=2", altText: "Three Heldi Khana pouches with the free jars and masala dabba" },
      SAMPLE_IMAGE
    ],
    tags: ["contains-milk"],
    variants: [
      {
        id: KHANA_VARIANT_ID,
        title: "300g pouch",
        sku: "HELDI-KHANA-300",
        price: { amount: "35.00", currencyCode: "GBP" },
        compareAtPrice: null,
        availableForSale: true,
        image: KHANA_IMAGE,
        quantityTiers: [
          { minQty: 2, totalPence: 6500 },
          { minQty: 3, totalPence: 9500 }
        ]
      },
      {
        id: SAMPLE_VARIANT_ID,
        title: "Sample sachet",
        sku: "HELDI-SAMPLE",
        price: { amount: "5.00", currencyCode: "GBP" },
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

function unitPricePence(variant: ProductVariant): number {
  return Math.round(parseFloat(variant.price.amount) * 100);
}

// Best price for `quantity` units using the tier table greedily from the
// largest block down (3-packs, then 2-packs, then singles). Mirrors the
// quantity-break automatic discounts configured in Shopify admin.
export function priceForQuantityPence(variant: ProductVariant, quantity: number): number {
  const unit = unitPricePence(variant);
  const tiers = [...(variant.quantityTiers ?? [])].sort(
    (a, b) => b.minQty - a.minQty
  );
  let remaining = quantity;
  let total = 0;
  for (const tier of tiers) {
    while (remaining >= tier.minQty) {
      total += tier.totalPence;
      remaining -= tier.minQty;
    }
  }
  return total + remaining * unit;
}

export type DisplayPrice = {
  current: Money;
  // Pre-discount total (full unit price × quantity, before tiers and sale);
  // null when nothing is discounted.
  compareAt: Money | null;
};

// Price to show for buying `quantity` of a variant, with tier pricing and
// the sitewide sale applied.
export function displayPrice(variant: ProductVariant, quantity: number): DisplayPrice {
  const full = unitPricePence(variant) * quantity;
  const current = salePricePence(priceForQuantityPence(variant, quantity));
  return {
    current: penceToMoney(current),
    compareAt: current < full ? penceToMoney(full) : null
  };
}

// Gift-with-purchase tiers for the 300g pouch, keyed by quantity purchased.
// Values are placeholders for the user to edit once real retail prices are
// set.
export const GIFT_TIERS: Record<1 | 2 | 3, GiftItem[]> = {
  1: [
    {
      title: "Gold jar",
      image: "/images/shop/gift-jar-gold.png",
      valuePence: 800,
      note: "with your first order"
    }
  ],
  2: [
    { title: "Gold jar", image: "/images/shop/gift-jar-gold.png", valuePence: 800 },
    { title: "Silver jar", image: "/images/shop/gift-jar-silver.png", valuePence: 800 }
  ],
  3: [
    { title: "Gold jar", image: "/images/shop/gift-jar-gold.png", valuePence: 800 },
    { title: "Silver jar", image: "/images/shop/gift-jar-silver.png", valuePence: 800 },
    { title: "Masala dabba", image: "/images/shop/gift-masala-dabba.png", valuePence: 1500 }
  ]
};

// Free gifts included for buying `quantity` of `variant`. Only the 300g
// pouch carries gifts; the sample sachet never does.
export function giftsForQuantity(variant: ProductVariant, quantity: number): GiftItem[] {
  if (variant.sku !== "HELDI-KHANA-300") return [];
  const tier = Math.min(Math.max(quantity, 1), 3) as 1 | 2 | 3;
  return GIFT_TIERS[tier];
}
