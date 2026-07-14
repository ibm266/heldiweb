import type { CommerceMode, CommerceProviderName } from "./types";

// waitlist = products browsable, purchase disabled (default until launch).
// live = add to cart + checkout enabled.
export const COMMERCE_MODE: CommerceMode =
  process.env.NEXT_PUBLIC_COMMERCE_MODE === "live" ? "live" : "waitlist";

export const COMMERCE_PROVIDER: CommerceProviderName =
  process.env.NEXT_PUBLIC_COMMERCE_PROVIDER === "shopify" ? "shopify" : "mock";

// Shipping rates and the free-shipping threshold live in lib/pricing.ts,
// the single source of truth for everything customers are charged.
