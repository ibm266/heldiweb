import type { CommerceMode, CommerceProviderName } from "./types";

// waitlist = products browsable, purchase disabled (default until launch).
// live = add to cart + checkout enabled.
export const COMMERCE_MODE: CommerceMode =
  process.env.NEXT_PUBLIC_COMMERCE_MODE === "live" ? "live" : "waitlist";

export const COMMERCE_PROVIDER: CommerceProviderName =
  process.env.NEXT_PUBLIC_COMMERCE_PROVIDER === "shopify" ? "shopify" : "mock";

// Pounds. Mirrors the Shopify shipping profile; shown in the cart meter.
export const FREE_SHIPPING_THRESHOLD = 40;

// Sitewide launch sale. Display-only mirror of the Shopify automatic
// discount — flip `active` and keep the percent in sync with admin.
export const SALE = {
  active: false,
  percent: 15,
  label: "Launch sale"
};

export function salePricePence(basePence: number): number {
  if (!SALE.active) return basePence;
  return Math.round((basePence * (100 - SALE.percent)) / 100);
}
