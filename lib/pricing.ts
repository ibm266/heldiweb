// Single source of truth for Heldi's launch pricing. Every price shown
// anywhere on the site must come from here — the strikethrough RRP becomes
// the real price after the launch period, so nothing may hard-code it.
//
// All amounts are integer pence (see lib/commerce/money.ts for formatting).
//
// The launch flag already exists as COMMERCE_MODE in lib/commerce/config.ts
// ("waitlist" | "live"); CTAs switch on that rather than a separate
// LAUNCH_MODE boolean here.

export type TierId = "single" | "double" | "triple";

export type Tier = {
  id: TierId;
  /** Display name on the tier card. */
  name: string;
  pouches: number;
  jars: number;
  dabbas: number;
  rrpPence: number;
  launchPence: number;
};

export const TIERS: Record<TierId, Tier> = {
  single: {
    id: "single",
    name: "One pouch",
    pouches: 1,
    jars: 1,
    dabbas: 0,
    rrpPence: 3500,
    launchPence: 3000
  },
  double: {
    id: "double",
    name: "The pair",
    pouches: 2,
    jars: 2,
    dabbas: 0,
    rrpPence: 7000,
    launchPence: 5500
  },
  triple: {
    id: "triple",
    name: "The full table",
    pouches: 3,
    jars: 3,
    dabbas: 1,
    rrpPence: 10500,
    launchPence: 8000
  }
};

export const TIER_ORDER: TierId[] = ["single", "double", "triple"];

/** The tier highlighted as "Most popular" on the shop page. */
export const FEATURED_TIER: TierId = "double";

export function tierSavingsPence(id: TierId): number {
  return TIERS[id].rrpPence - TIERS[id].launchPence;
}

// Sample Trio: £5, unchanged at launch, ships free.
export const SAMPLE_PRICE_PENCE = 500;

// Display-only "worth" of the items included with pouch tiers, shown struck
// out next to "Free" on the product page and in the cart.
export const EXTRA_VALUE_PENCE = {
  jar: 800,
  dabba: 1500
} as const;

export const SHIPPING = {
  /** Orders at or over this (after discounts) ship free. */
  freeOverPence: 4000,
  /** Royal Mail Tracked 48, charged under the free threshold. */
  standardPence: 355,
  /** Royal Mail Large Letter for a Sample Trio on its own — Heldi absorbs
      this, so sample-only orders ship free. */
  sampleLetterPence: 275
} as const;

// Gifting discount: 10% off the launch price of single and double blocks
// only — never triple blocks or the Sample Trio. One discount per order, no
// stacking. The same discount sits behind two codes so we can see who's
// buying: ACHABETA for the kids sorting out their parents, SHABASH for the
// aunties and uncles sorting themselves out.
export const GIFTING = {
  percent: 10,
  codes: {
    beta: "ACHABETA",
    elder: "SHABASH"
  }
} as const;

/** Who the buyer says they are — the keys of GIFTING.codes. */
export type GiftingAudience = keyof typeof GIFTING.codes;

export type GiftingMethod = "code" | "checkbox";

export function isGiftingCode(code: string): boolean {
  const upper = code.toUpperCase();
  return Object.values(GIFTING.codes).some((entry) => entry === upper);
}

export function giftingAudienceForCode(code: string): GiftingAudience | null {
  const upper = code.toUpperCase();
  const match = (Object.keys(GIFTING.codes) as GiftingAudience[]).find(
    (audience) => GIFTING.codes[audience] === upper
  );
  return match ?? null;
}

export function giftingDiscountPence(eligiblePence: number): number {
  return Math.round((eligiblePence * GIFTING.percent) / 100);
}
