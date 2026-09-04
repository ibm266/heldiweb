// Server-side clamp on what a cart is allowed to hold: defence in depth behind
// the cart's own sync (components/cart/cart-context.tsx). The /api/cart routes
// have no login and take a cart id from the caller, so a hand-crafted sequence
// of requests can build a basket the site would never build: two pouch lines,
// a pouch line with quantity 9, Chai while Chai is not on sale, free presents
// with no pouches under them, or something we do not sell at all. Every route
// that mutates a cart runs the result through here before handing it back.
//
// It only ever REDUCES a cart. Presents are added by the storefront (see
// presentLinesForPouches), so adding them here as well would double them.
//
// The pouch model this enforces lives in lib/pricing.ts (MAX_POUCHES,
// presentsForPouches) and lib/commerce/catalog.ts (the mix SKUs). A basket is
// packed into as many PAIR lines as it will make plus at most one single, out
// of the five variants the store holds, so a big order is more lines rather
// than a bigger variant. This file rewrites whatever it is given into that one
// canonical arrangement, because it is the arrangement the site quotes.

import { MAX_POUCHES, presentsForPouches } from "@/lib/pricing";
import {
  FREE_PAIR_SKU,
  FREE_PAIR_VARIANT_ID,
  SAMPLE_CHAI_SKU,
  SAMPLE_PAIR_SKU,
  SAMPLE_SKU,
  SAMPLE_VARIANT_ID,
  SAMPLE_VARIANT_IDS,
  isDabbaGiftLine,
  isJarGiftLine,
  isToteGiftLine,
  mixLinesForCounts,
  parseMixSku,
  pouchCounts
} from "../catalog";
import { CHAI_SELLABLE } from "../config";
import type { Cart, CartLine, CartLineInput } from "../types";
import { addLines, removeLines, updateLines } from "./cart-actions";

/** The sachets, which sit outside the ladder: no ladder price, no presents,
 *  and they never count towards MAX_POUCHES. Matched by SKU with the variant
 *  GID as a fallback, because HELDI-SAMPLE currently exists on two products
 *  and the gift variants carry no SKU at all. */
const SACHET_SKUS: string[] = [
  SAMPLE_SKU,
  SAMPLE_CHAI_SKU,
  SAMPLE_PAIR_SKU,
  FREE_PAIR_SKU
];

const SACHET_VARIANT_IDS: string[] = [
  SAMPLE_VARIANT_ID,
  FREE_PAIR_VARIANT_ID,
  ...Object.values(SAMPLE_VARIANT_IDS)
];

/** The £0 trial pair, capped at one per basket. Matched by SKU with the GID as
 *  a fallback, the same way every other line in this file is. */
function isFreePairLine(line: Pick<CartLine, "merchandise">): boolean {
  return (
    line.merchandise.sku === FREE_PAIR_SKU ||
    line.merchandise.id === FREE_PAIR_VARIANT_ID
  );
}

function isSachetLine(line: Pick<CartLine, "merchandise">): boolean {
  const sku = line.merchandise.sku;
  return (
    (!!sku && SACHET_SKUS.includes(sku)) ||
    SACHET_VARIANT_IDS.includes(line.merchandise.id)
  );
}

/** The free lines. The dabba is withdrawn but a cart made before it was
 *  withdrawn can still be carrying one, so it is still recognised here: that
 *  is the only way it can be taken back out. */
function isPresentLine(line: Pick<CartLine, "merchandise">): boolean {
  return isJarGiftLine(line) || isToteGiftLine(line) || isDabbaGiftLine(line);
}

type Repairs = {
  updates: { id: string; quantity: number }[];
  removals: string[];
  /** Only ever the canonical packing of pouches the cart ALREADY holds; never
   *  presents, and never a pouch the shopper did not ask for. */
  additions: CartLineInput[];
};

/**
 * What has to change about the pouch lines and anything foreign, before the
 * presents can be counted. Pure, so the decision is readable on its own.
 */
function pouchRepairs(lines: CartLine[]): Repairs {
  const updates: Repairs["updates"] = [];
  const removals: string[] = [];
  const additions: CartLineInput[] = [];
  const pouchLines: { line: CartLine; khana: number; chai: number }[] = [];

  for (const line of lines) {
    if (isPresentLine(line)) continue; // counted against the pouches, below.

    // The free trial pair is the one giveaway a basket can hold, and one is
    // the whole offer: "free for the first hundred", one per person. The
    // storefront's claim is idempotent and the drawer offers no way to add a
    // second, but neither of those binds a hand-crafted request, and the
    // variant is untracked in Shopify so inventory will not refuse a tenth
    // either. This is the only thing that does.
    if (isFreePairLine(line)) {
      if (line.quantity !== 1) updates.push({ id: line.id, quantity: 1 });
      continue;
    }

    if (isSachetLine(line)) continue; // outside the ladder entirely.

    // Deliberately the same reader as pouchCounts and the drawer: a line whose
    // SKU will not parse is a line nothing in the app can price or count, even
    // if it carries a mix variant id, so it goes rather than being guessed at.
    const mix = parseMixSku(line.merchandise.sku);
    if (!mix) {
      removals.push(line.id);
      continue;
    }

    // The Chai gate. NEXT_STEPS.md §1b lists what has to land before Chai can
    // be sold; until then there is no label, no gluten result and no stock, so
    // a Chai line is an order that cannot be shipped.
    if (mix.chai > 0 && !CHAI_SELLABLE) {
      removals.push(line.id);
      continue;
    }

    pouchLines.push({
      line,
      khana: mix.khana * line.quantity,
      chai: mix.chai * line.quantity
    });
  }

  // A basket is no longer one line. Since MAX_POUCHES was raised past a pair,
  // a larger order is MORE lines out of the same five variants: seven pouches
  // is three pair lines and a single. So the job here is not "keep one line",
  // it is "make the lines say exactly what the counts say, in the one
  // arrangement the site prices".
  //
  // WHY IT NORMALISES RATHER THAN JUST CAPPING. The site quotes ladderPence(n),
  // which is the canonical packing's total. A cart holding three separate
  // HELDI-K1C0 lines is also three pouches, but Shopify would charge £105 for
  // it where the page says £100. Rewriting to the canonical packing is what
  // keeps the page and the checkout from ever disagreeing, which is the same
  // rule the shipping rates follow. mixLinesForCounts is deterministic, so a
  // cart that is already canonical produces no repair at all and this is
  // idempotent.
  let khana = pouchLines.reduce((n, entry) => n + entry.khana, 0);
  let chai = pouchLines.reduce((n, entry) => n + entry.chai, 0);

  // Over the ceiling, take pouches off the larger count until it fits. Reached
  // only by a crafted request; the storefront refuses out loud before it gets
  // here (decision D8).
  while (khana + chai > MAX_POUCHES) {
    if (khana >= chai) khana -= 1;
    else chai -= 1;
  }

  const target = mixLinesForCounts(khana, chai);
  const byVariant = new Map<string, CartLine>();
  for (const entry of pouchLines) {
    // Two lines on one variant collapse into the first; the second is spare.
    if (byVariant.has(entry.line.merchandise.id)) removals.push(entry.line.id);
    else byVariant.set(entry.line.merchandise.id, entry.line);
  }
  const wanted = new Set(target.map((input) => input.merchandiseId));

  for (const input of target) {
    const existing = byVariant.get(input.merchandiseId);
    if (!existing) additions.push(input);
    else if (existing.quantity !== input.quantity) {
      updates.push({ id: existing.id, quantity: input.quantity });
    }
  }
  for (const [variantId, line] of byVariant) {
    if (!wanted.has(variantId)) removals.push(line.id);
  }

  return { updates, removals, additions };
}

/** What the present lines should be reduced to, given the surviving pouches. */
function presentRepairs(lines: CartLine[], pouches: number): Repairs {
  const { jars, totes } = presentsForPouches(pouches);
  const updates: Repairs["updates"] = [];
  const removals: string[] = [];
  // Presents are added by the storefront, never here: adding them would double
  // them. This half only ever takes away.
  const additions: CartLineInput[] = [];

  for (const line of lines) {
    if (!isPresentLine(line)) continue;
    // Anything that is not a jar or a tote has a cap of zero, which is how the
    // withdrawn dabba leaves a stale cart.
    const cap = isJarGiftLine(line) ? jars : isToteGiftLine(line) ? totes : 0;
    if (cap <= 0) removals.push(line.id);
    else if (line.quantity > cap) updates.push({ id: line.id, quantity: cap });
  }

  return { updates, removals, additions };
}

async function applyRepairs(cart: Cart, repairs: Repairs): Promise<Cart> {
  const { updates, removals, additions } = repairs;
  if (updates.length === 0 && removals.length === 0 && additions.length === 0) {
    return cart;
  }
  let next = cart;
  // Remove BEFORE adding, for the same reason cart-context does: it keeps the
  // cart from momentarily holding two arrangements of the same pouches.
  if (removals.length > 0) next = await removeLines(cart.id, removals);
  if (updates.length > 0) next = await updateLines(cart.id, updates);
  if (additions.length > 0) next = await addLines(cart.id, additions);
  return next;
}

/**
 * Clamp a cart to what Heldi actually sells, and hand back the clamped cart.
 *
 * THE ERROR HANDLING IS SPLIT ON PURPOSE. Do not collapse the two halves back
 * into one try/catch: the old version wrapped everything and returned the
 * un-clamped cart on any failure, which is right for one half and exactly
 * wrong for the other.
 *
 *   FAIL CLOSED on the pouch lines (the Chai gate, the over-cap basket, a
 *   second mix line, a foreign line). If the repair cannot be applied, the
 *   un-clamped cart IS the attack: handing it back publishes a checkout URL
 *   for Chai we cannot ship or for pouches we have not priced. An error here
 *   costs a failed cart mutation, which the shopper can retry.
 *
 *   FAIL OPEN on the presents. The worst case of a present clamp that did not
 *   land is a free jar in a box that had not earned it, caught by eye on the
 *   pick-pack sheet. Turning a valid add-to-basket into an error because a
 *   follow-up gift adjustment hiccuped costs a real sale, which is worse.
 */
export async function enforceCartPolicy(cart: Cart): Promise<Cart> {
  // Half one: no catch. Anything thrown here reaches the route, which turns it
  // into an error response rather than a usable cart.
  const clamped = await applyRepairs(cart, pouchRepairs(cart.lines));

  const { pouches } = pouchCounts(clamped.lines);
  if (pouches > MAX_POUCHES) {
    // Unreachable by construction (pouchRepairs above trims the counts to the
    // ceiling before it packs them), which is exactly why
    // it throws rather than clamping: if it ever fires, the model and the
    // catalog have drifted apart and no price on the page can be trusted.
    throw new Error("That basket holds more pouches than one order can carry.");
  }

  // Half two: caught. The presents follow whatever survived above.
  try {
    return await applyRepairs(clamped, presentRepairs(clamped.lines, pouches));
  } catch {
    return clamped;
  }
}
