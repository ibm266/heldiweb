// Single source of truth for everything Heldi charges. Every price, saving,
// percentage and cap shown anywhere on the site comes from here.
//
// All amounts are integer pence (see lib/commerce/money.ts for formatting).
//
// SECTION 1 is the agreed commercial model, settled 4 September 2026. Three
// numbers define every pouch price on the site: change RRP_PENCE or
// BUNDLE_DISCOUNT_PENCE and the ladder, both buy boxes, the drawer, the
// product schema and scripts/pricing-check.mjs all follow together.
//
// The one thing that does NOT follow: Shopify holds its own copy of every
// variant price, because the pouches are sold as fixed-price size-and-mix
// variants rather than through a discount app. A change here is half the job;
// the other half is repricing the variants in Shopify. Never let them drift.
//
// SECTION 6 is the superseded July model (three fixed Khana tiers, a
// struck-through launch price, 10% on single and pair, a 20% waitlist code).
// It is still wired to the cart and the buy box and is removed phase by
// phase. Do not add new callers. See docs/two-product-cart-plan.md.

// ---------------------------------------------------------------------------
// 1. The pouch ladder
// ---------------------------------------------------------------------------
// Agreed 4 Sep 2026, simplified the same day to singles and pairs only.
// One pouch is £35. The second is £5 less, so a pair is £65 against a £70 RRP.
// Khana (300g) and Chai (250g) are priced identically, and the count is across
// both, which gives exactly five things a customer can buy: one Khana, one
// Chai, two Khana, two Chai, or one of each.
//
// Priced this way rather than as "£35 then £30" because they are the same
// arithmetic and this one can show an honest RRP: £35 is a price a customer can
// actually buy a single pouch at today, so £70 struck through beside £65 is a
// real comparison rather than a launch-price framing.
//
// The ceiling is deliberately low for run 1. It keeps Shopify at five variants
// instead of twenty-seven, keeps the picker to two choices, and keeps one set
// of presents per order true by construction. Raising it later is this one
// number plus the extra Shopify variants: nothing else in the model changes.

/** What one pouch costs on its own. The RRP, and the real single-pouch price. */
export const RRP_PENCE = 3500;

/** Off every pouch after the first. The bundle discount. */
export const BUNDLE_DISCOUNT_PENCE = 500;

/**
 * The most pouches one order can carry, across both products. Two for run 1:
 * a single or a pair, in any mix. Adjust on feedback.
 */
export const MAX_POUCHES = 2;

/** Undiscounted worth of `pouches` pouches: what they cost bought one at a time. */
export function rrpPence(pouches: number): number {
  return RRP_PENCE * assertPouchCount(pouches);
}

/** What `pouches` pouches actually cost. £35 for one, £65 for a pair. */
export function ladderPence(pouches: number): number {
  const n = assertPouchCount(pouches);
  if (n === 0) return 0;
  return RRP_PENCE * n - BUNDLE_DISCOUNT_PENCE * (n - 1);
}

/** The bundle discount earned at `pouches`: £0 on a single, £5 on a pair. */
export function bundleSavingPence(pouches: number): number {
  return rrpPence(pouches) - ladderPence(pouches);
}

/** Average price per pouch at this basket size. Display only; never charged. */
export function perPouchPence(pouches: number): number {
  const n = assertPouchCount(pouches);
  return n === 0 ? 0 : Math.round(ladderPence(n) / n);
}

/**
 * What adding one more pouch costs from a basket of `pouches`: £35 for the
 * first, £30 for the second. Callers must check `pouches < MAX_POUCHES` first;
 * there is no third pouch to price.
 */
export function nextPouchPence(pouches: number): number {
  const n = assertPouchCount(pouches);
  if (n >= MAX_POUCHES) {
    throw new RangeError(`No pouch after ${MAX_POUCHES}: the basket is full.`);
  }
  return ladderPence(n + 1) - ladderPence(n);
}

// A wrong price is a commercial and legal problem, so an out-of-range count
// throws rather than clamping to something plausible. Every picker and the
// server-side cart clamp gate on MAX_POUCHES before they get here (decision
// D8: refuse the extra pouch out loud, never silently).
function assertPouchCount(pouches: number): number {
  if (!Number.isInteger(pouches) || pouches < 0 || pouches > MAX_POUCHES) {
    throw new RangeError(
      `Pouch count must be a whole number from 0 to ${MAX_POUCHES}, got ${pouches}.`
    );
  }
  return pouches;
}

// ---------------------------------------------------------------------------
// 2. Samples
// ---------------------------------------------------------------------------
// The trial sachet: a 30g fill (SAMPLE_GRAMS in lib/commerce/catalog.ts, which
// is 2 Khana meals at a 12g portion or 3 Chai mugs at 8g), outside the pouch
// ladder, in no discount code, and earning no presents. Three ways to buy one,
// agreed 4 Sep 2026:
//
//   Khana sachet        £5
//   Chai sachet         £5
//   Pair pack           £8   one of each, £2 off the two singles
//
// The pair is a fixed one-of-each pack, not a mix: there is no two-Khana
// sample. That is why this is a flat set of prices rather than a ladder like
// the pouches, and why the mix SKU parser does not run over sample lines.
//
// Samples ship free on their own, because Heldi absorbs the Royal Mail Large
// Letter (SHIPPING.sampleLetterPence). CONFIRM the pair pack still clears the
// Large Letter thickness before it goes on sale; two sachets have never been
// weighed together and a parcel rate would eat the whole margin.
//
// A single pouch plus a sachet is exactly £40, the free-postage threshold, so
// the Sample nudge pays for itself on every one-pouch basket. A pouch plus the
// pair pack is £43 and ships free too.

/** One sachet, either product. */
export const SAMPLE_PRICE_PENCE = 500;

/** Off the pair pack, against buying the two sachets separately. */
export const SAMPLE_PAIR_DISCOUNT_PENCE = 200;

/** Undiscounted worth of the pair pack: the two sachets bought on their own. */
export function samplePairRrpPence(): number {
  return SAMPLE_PRICE_PENCE * 2;
}

/** What the pair pack actually costs. £8. */
export function samplePairPence(): number {
  return samplePairRrpPence() - SAMPLE_PAIR_DISCOUNT_PENCE;
}

// ---------------------------------------------------------------------------
// 3. Shipping
// ---------------------------------------------------------------------------

export const SHIPPING = {
  /** Orders at or over this (after discounts) ship free. */
  freeOverPence: 4000,
  /** Royal Mail Tracked 48, charged under the free threshold. */
  standardPence: 355,
  /** Royal Mail Large Letter for a Sample on its own. Heldi absorbs this,
      so sample-only orders ship free. */
  sampleLetterPence: 275
} as const;

// Only a single pouch ever pays postage: a pair is £65 and stays above £40
// even after the 25% founders code (£48.75).

// ---------------------------------------------------------------------------
// 4. Discount codes
// ---------------------------------------------------------------------------
// Three classes, and only one pair of them combines.
//
//   Family (public, 15%)    printed openly on the site, one per order
//   Founders (private, 25%) one unique code per person, in the launch email
//   Welcome (free postage)  given for an email after launch
//
// Family and Founders are both PRODUCT discounts on pouches: a basket may
// carry one or the other, never both, and never on the Sample or the presents.
// Welcome is a SHIPPING discount, which is the only thing that stacks with a
// product code. Nothing else combines with anything.

// Family rate. The same discount sits behind three names so the order data
// says who is buying: ACHABETA for the kids sorting out their parents, RISHTA
// for buying for uncle and aunty, SHABASH for the aunties and uncles sorting
// themselves out. Any quantity, one use per customer.
//
// SHOPIFY IS BEHIND THIS NUMBER. The three live codes are still the July 10%
// on single and pair only. They must be deleted and rebuilt at 15% before
// NEXT_PUBLIC_COMMERCE_MODE is flipped to live, or the site promises a rate
// checkout will not give. Every surface reading this is live-mode gated, so
// nothing is visibly wrong today.
export const GIFTING = {
  percent: 15,
  codes: {
    beta: "ACHABETA",
    rishta: "RISHTA",
    elder: "SHABASH"
  }
} as const;

/** Who the buyer says they are: the keys of GIFTING.codes. */
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

// Founders rate: the reward for being on the list before launch, and for the
// friends who backed it early. One unique code per person, single use, sent in
// the launch email. It replaces the 20% PEHLEAAP promise, which is never
// created: the people already on the list sit inside the first 100, so 25%
// honours the old promise with room to spare (decision D3).
export const FOUNDERS = {
  percent: 25,
  /** Close friends get a named code. First-100 joiners get a generated one. */
  friendPrefix: "SHUKRIYA-",
  /** How many waitlist joiners, in joined_at order, are offered a code. */
  firstJoiners: 100
} as const;

export function isFoundersCode(code: string): boolean {
  return code.toUpperCase().startsWith(FOUNDERS.friendPrefix);
}

export function foundersDiscountPence(eligiblePence: number): number {
  return Math.round((eligiblePence * FOUNDERS.percent) / 100);
}

/** Family and founders codes are both product discounts, so one basket takes one. */
export function isProductDiscountCode(code: string): boolean {
  return isGiftingCode(code) || isFoundersCode(code);
}

// Welcome postage: free first-order shipping in exchange for an email, issued
// after launch. A shipping discount, so it is the one code that combines with
// a product discount. Static for run 1 because Klaviyo can only mint unique
// codes through its Shopify integration, which is not connected: it leaks at
// most £3.55 per single-pouch order and nothing at all above that, since
// everything from two pouches up already ships free (decision D4).
export const WELCOME_POSTAGE = {
  code: "WELCOME"
} as const;

export function isWelcomeCode(code: string): boolean {
  return code.toUpperCase() === WELCOME_POSTAGE.code;
}

// ---------------------------------------------------------------------------
// 5. Presents
// ---------------------------------------------------------------------------
// One set per order, agreed 4 Sep 2026:
//
//   1 pouch    1 refillable table jar
//   2 pouches  1 refillable table jar and 1 tote bag
//
// One set, not a set per pouch. With the ceiling at two that is true by
// construction rather than by a cap, which is most of why the ceiling is
// there. The masala dabba is withdrawn.

export const GIFT_CAPS = { jars: 1, totes: 1 } as const;

/** What ships free with a basket of `pouches` pouches. The agreed model. */
export function presentsForPouches(pouches: number): {
  jars: number;
  totes: number;
} {
  const n = assertPouchCount(pouches);
  return {
    jars: n >= 1 ? GIFT_CAPS.jars : 0,
    totes: n >= 2 ? GIFT_CAPS.totes : 0
  };
}

// Worth of the free items, shown struck out next to "Free" on the product page
// and in the cart. The Shopify compare-at prices on the £0.00 gift variants
// mirror these exact figures; change them together (BRAND.md §11.3).
//
// `tote` IS PROVISIONAL and must not ship. It is a stated worth on a free item,
// so it has to be defensible against a real retail price, and no tote has been
// quoted yet (plan decision D6). Settle it before the tote goes in a basket.
// `dabba` is retired and stays only until the cart stops reading it.
export const EXTRA_VALUE_PENCE = {
  jar: 800,
  tote: 600,
  dabba: 1500
} as const;

// RETIRED SHAPE. The cart, the server-side clamp and the PDP Includes panel
// still call this and still speak in dabbas; they move to presentsForPouches
// when the tote has a Shopify variant, a thumbnail and a settled worth. Until
// then it hands back the jar and nothing else, so the wiring that exists can
// only ever give less than the agreed set, never more.
export function giftCountsForPouches(pouches: number): {
  jars: number;
  dabbas: number;
} {
  const whole = Math.max(0, Math.floor(pouches));
  return { jars: whole >= 1 ? GIFT_CAPS.jars : 0, dabbas: 0 };
}

// ---------------------------------------------------------------------------
// 6. SUPERSEDED: the July tier model
// ---------------------------------------------------------------------------
// Replaced by section 1 on 4 Sep 2026 and kept only because the cart, the buy
// box, the drawer and lib/commerce/catalog.ts still read it. Removed phase by
// phase in docs/two-product-cart-plan.md. Do not add new callers, and do not
// take a number from here: every one of them is either the old launch price or
// the old discount rate.

export type TierId = "single" | "double" | "triple";

export type Tier = {
  id: TierId;
  /** Display name on the tier card. */
  name: string;
  pouches: number;
  rrpPence: number;
  launchPence: number;
};

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

export function packPouches(pouches: number): PouchPacking {
  const whole = Math.max(0, Math.floor(pouches));
  const remainder = whole % 3;
  return {
    triple: Math.floor(whole / 3),
    double: remainder === 2 ? 1 : 0,
    single: remainder === 1 ? 1 : 0
  };
}

// SUPERSEDED by FOUNDERS above. The 20% first-order promise is withdrawn and
// PEHLEAAP is never created, but eight surfaces still render this percentage
// and the copy around them still describes the old offer. They are rewritten
// together in the Phase 0 copy sweep; changing the number here alone would
// make those surfaces say 25% while still promising the wrong terms.
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
