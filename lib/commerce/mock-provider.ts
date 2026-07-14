import { GIFTING, giftingDiscountPence } from "@/lib/pricing";
import { findVariantById, giftingEligiblePenceForLines } from "./catalog";
import { moneyToPence, penceToMoney } from "./money";
import type { CommerceProvider } from "./provider";
import type {
  Cart,
  CartDiscountCode,
  CartLine,
  CartLineInput
} from "./types";

// Browser-only cart that mimics the Shopify Storefront Cart API: persists
// merchandise ids + quantities in localStorage and recomputes all pricing
// (launch quantity tiers, gifting discount) from the config on every
// mutation. Discarded wholesale once the real Shopify provider takes over.

const STORAGE_KEY = "heldi_cart_v1";

type StoredCart = {
  provider: "mock";
  version: 1;
  id: string;
  lines: { merchandiseId: string; quantity: number }[];
  discountCodes: string[];
};

function readStorage(): StoredCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCart;
    if (parsed.provider !== "mock" || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(cart: StoredCart) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function buildLine(merchandiseId: string, quantity: number): CartLine | null {
  const found = findVariantById(merchandiseId);
  if (!found) return null;
  const { product, variant } = found;

  const pricedPence = moneyToPence(variant.price) * quantity;
  const fullPence = variant.compareAtPrice
    ? moneyToPence(variant.compareAtPrice) * quantity
    : pricedPence;

  return {
    id: `line_${merchandiseId}`,
    quantity,
    merchandise: {
      ...variant,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        images: product.images
      }
    },
    cost: {
      totalAmount: penceToMoney(pricedPence),
      compareAtAmount: pricedPence < fullPence ? penceToMoney(fullPence) : null
    }
  };
}

function materialize(stored: StoredCart): Cart {
  const lines = stored.lines
    .map((line) => buildLine(line.merchandiseId, line.quantity))
    .filter((line): line is CartLine => line !== null);

  const subtotalPence = lines.reduce(
    (sum, line) => sum + moneyToPence(line.cost.totalAmount),
    0
  );

  // ACHABETA is the only code the mock recognises. It only counts as
  // applicable when the basket has an eligible portion (single or double
  // blocks), mirroring how Shopify will reject it on excluded-only baskets.
  const eligiblePence = giftingEligiblePenceForLines(lines);
  const discountCodes: CartDiscountCode[] = stored.discountCodes.map((code) => ({
    code,
    applicable: code.toUpperCase() === GIFTING.code && eligiblePence > 0
  }));

  // One discount per order, never stacked, and only on the eligible portion.
  const giftingApplied = discountCodes.some((entry) => entry.applicable);
  const totalPence =
    subtotalPence - (giftingApplied ? giftingDiscountPence(eligiblePence) : 0);

  return {
    id: stored.id,
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    cost: {
      subtotalAmount: penceToMoney(subtotalPence),
      totalAmount: penceToMoney(totalPence)
    },
    discountCodes,
    checkoutUrl: "#checkout-at-launch"
  };
}

export class MockProvider implements CommerceProvider {
  private load(cartId: string): StoredCart {
    const stored = readStorage();
    if (stored && stored.id === cartId) return stored;
    return { provider: "mock", version: 1, id: cartId, lines: [], discountCodes: [] };
  }

  private save(stored: StoredCart): Cart {
    // Drop emptied lines before persisting.
    stored.lines = stored.lines.filter((line) => line.quantity > 0);
    writeStorage(stored);
    return materialize(stored);
  }

  async createCart(lines: CartLineInput[] = []): Promise<Cart> {
    const stored: StoredCart = {
      provider: "mock",
      version: 1,
      id: `mock_cart_${Date.now().toString(36)}`,
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity
      })),
      discountCodes: []
    };
    return this.save(stored);
  }

  async getCart(cartId: string): Promise<Cart | null> {
    const stored = readStorage();
    if (!stored || stored.id !== cartId) return null;
    return materialize(stored);
  }

  async addLines(cartId: string, lines: CartLineInput[]): Promise<Cart> {
    const stored = this.load(cartId);
    for (const input of lines) {
      const existing = stored.lines.find(
        (line) => line.merchandiseId === input.merchandiseId
      );
      if (existing) {
        existing.quantity += input.quantity;
      } else {
        stored.lines.push({
          merchandiseId: input.merchandiseId,
          quantity: input.quantity
        });
      }
    }
    return this.save(stored);
  }

  async updateLines(
    cartId: string,
    lines: { id: string; quantity: number }[]
  ): Promise<Cart> {
    const stored = this.load(cartId);
    for (const update of lines) {
      const merchandiseId = update.id.replace(/^line_/, "");
      const line = stored.lines.find(
        (entry) => entry.merchandiseId === merchandiseId
      );
      if (line) line.quantity = update.quantity;
    }
    return this.save(stored);
  }

  async removeLines(cartId: string, lineIds: string[]): Promise<Cart> {
    const stored = this.load(cartId);
    const merchandiseIds = lineIds.map((id) => id.replace(/^line_/, ""));
    stored.lines = stored.lines.filter(
      (line) => !merchandiseIds.includes(line.merchandiseId)
    );
    return this.save(stored);
  }

  async updateDiscountCodes(cartId: string, codes: string[]): Promise<Cart> {
    const stored = this.load(cartId);
    stored.discountCodes = codes;
    return this.save(stored);
  }
}
