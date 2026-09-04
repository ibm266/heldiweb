import type { CommerceMode, CommerceProviderName } from "./types";

// waitlist = products browsable, purchase disabled (default until launch).
// live = add to cart + checkout enabled.
export const COMMERCE_MODE: CommerceMode =
  process.env.NEXT_PUBLIC_COMMERCE_MODE === "live" ? "live" : "waitlist";

export const COMMERCE_PROVIDER: CommerceProviderName =
  process.env.NEXT_PUBLIC_COMMERCE_PROVIDER === "shopify" ? "shopify" : "mock";

// Whether Chai can be added to a basket. Chai IS in run 1 (decided 4 Sep 2026),
// but it cannot be SOLD until its printed label, its finished-product gluten
// result and physical stock all land: NEXT_STEPS.md §1b tracks those. Until
// then the buy box, the cart and the server-side clamp all refuse it, and the
// Chai page stays a browsable, joinable surface.
//
// SAME BUILD-TIME TRAP AS COMMERCE_MODE ABOVE: NEXT_PUBLIC_* is inlined at
// build time, so flipping this needs a redeploy with the build cache cleared,
// not just an env change. docs/go-live-checklist.md calls that "the single most
// likely way launch day appears to fail for no reason". A client-side override
// for previewing the Chai buy path comes with the buy box work.
export const CHAI_SELLABLE: boolean =
  process.env.NEXT_PUBLIC_CHAI_SELLABLE === "true";

// Shipping rates and the free-shipping threshold live in lib/pricing.ts,
// the single source of truth for everything customers are charged.
