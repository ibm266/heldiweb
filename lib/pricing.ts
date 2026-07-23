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
  rrpPence: number;
  launchPence: number;
};

// A tier is only pouches, RRP and launch price. The free jars and dabba a
// basket earns are never a fixed per-tier number: they come from
// `giftCountsForPouches` below (a jar per pouch up to the cap, one dabba once
// the basket holds a full table), so the counts stay right when tiers are
// combined. Don't reintroduce jars/dabbas fields here.
export const TIERS: Record<TierId, Tier> = {
  single: {
    id: "single",
    name: "One pouch",
    pouches: 1,
    rrpPence: 3500,
    launchPence: 3000
  },
  double: {
    id: "double",
    name: "The pair",
    pouches: 2,
    rrpPence: 7000,
    launchPence: 5500
  },
  triple: {
    id: "triple",
    name: "The full table",
    pouches: 3,
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

/** How many of each tier block a pouch count packs into. */
export type PouchPacking = Record<TierId, number>;

// The cart thinks in pouches; this is how a pouch count becomes tier
// blocks: as many full tables as possible, then the remainder as a pair or
// a single. Because the per-pouch price only falls as blocks get bigger,
// this packing is always the cheapest one (the only tie is 4 pouches,
// where full table + one pouch equals two pairs, and the full table side
// carries the free dabba).
export function packPouches(pouches: number): PouchPacking {
  const whole = Math.max(0, Math.floor(pouches));
  const remainder = whole % 3;
  return {
    triple: Math.floor(whole / 3),
    double: remainder === 2 ? 1 : 0,
    single: remainder === 1 ? 1 : 0
  };
}

// Per-order caps on the free gift items. "For now" reflects limited jar and
// dabba stock at launch; raise the caps here and the cart, the PDP Includes
// panel and the pick-pack sheet all follow.
export const GIFT_CAPS = { jars: 2, dabbas: 1 } as const;

// How many free jars and masala dabbas a basket of `pouches` pouches earns,
// after the per-order caps: a jar per pouch up to the cap, one dabba once the
// basket holds a full-table block. The single source of truth for gift counts
// everywhere (cart lines, the PDP Includes panel, the pick-pack sheet).
export function giftCountsForPouches(pouches: number): {
  jars: number;
  dabbas: number;
} {
  const whole = Math.max(0, Math.floor(pouches));
  if (whole <= 0) return { jars: 0, dabbas: 0 };
  return {
    jars: Math.min(whole, GIFT_CAPS.jars),
    dabbas: packPouches(whole).triple > 0 ? GIFT_CAPS.dabbas : 0
  };
}

// Sample: £5, unchanged at launch, ships free.
export const SAMPLE_PRICE_PENCE = 500;

// Worth of the free gift items, shown struck out next to "Free" on the product
// page and in the cart. The Shopify compare-at prices on the £0.00 HELDI-JAR
// and HELDI-DABBA variants mirror these exact figures; change them together
// (BRAND.md §11.3).
export const EXTRA_VALUE_PENCE = {
  jar: 800,
  dabba: 1500
} as const;

export const SHIPPING = {
  /** Orders at or over this (after discounts) ship free. */
  freeOverPence: 4000,
  /** Royal Mail Tracked 48, charged under the free threshold. */
  standardPence: 355,
  /** Royal Mail Large Letter for a Sample on its own — Heldi absorbs
      this, so sample-only orders ship free. */
  sampleLetterPence: 275
} as const;

// Gifting discount: 10% off the launch price of single and double blocks
// only — never triple blocks or the Sample. One discount per order, no
// stacking. The same discount sits behind three codes so we can see who's
// buying: ACHABETA for the kids sorting out their parents, RISHTA for
// buying for uncle and aunty, SHABASH for the aunties and uncles sorting
// themselves out.
export const GIFTING = {
  percent: 10,
  codes: {
    beta: "ACHABETA",
    rishta: "RISHTA",
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

// Waitlist launch offer: the reward for joining the list before launch.
// 20% off the first order, handed out in the launch-day email. Unlike the
// gifting codes it applies to every pouch tier's launch price (single, pair
// and full table), never the Sample. One use per customer, one code per
// order, and — like everything else — it combines with nothing. The window
// closes `windowDays` after launch. Shown as a percentage in waitlist-mode
// copy (the ticker, the join forms, the launch FAQ); the code string itself
// stays out of the site and only travels in the launch email.
export const WAITLIST_OFFER = {
  percent: 20,
  code: "PEHLEAAP",
  windowDays: 14
} as const;

export function isWaitlistCode(code: string): boolean {
  return code.toUpperCase() === WAITLIST_OFFER.code;
}

export function waitlistDiscountPence(eligiblePence: number): number {
  return Math.round((eligiblePence * WAITLIST_OFFER.percent) / 100);
}
