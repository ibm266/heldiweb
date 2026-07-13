import type { CommerceProvider } from "./provider";
import type { Cart, CartLineInput } from "./types";

// Stub until the Shopify store exists. At connect time the methods POST to
// Next.js route handlers under /api/cart which run the GraphQL documents in
// ./shopify/queries.ts against the Storefront API server-side (the access
// token never reaches the client bundle). See the plan's "Connect Shopify
// later" section.

async function callCartApi(action: string, payload: unknown): Promise<Cart> {
  const response = await fetch(`/api/cart/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Cart API ${action} failed: ${response.status}`);
  }
  return (await response.json()) as Cart;
}

export class ShopifyProvider implements CommerceProvider {
  async createCart(lines: CartLineInput[] = []): Promise<Cart> {
    return callCartApi("create", { lines });
  }

  async getCart(cartId: string): Promise<Cart | null> {
    const response = await fetch(`/api/cart/get?cartId=${encodeURIComponent(cartId)}`);
    if (!response.ok) return null;
    return (await response.json()) as Cart | null;
  }

  async addLines(cartId: string, lines: CartLineInput[]): Promise<Cart> {
    return callCartApi("add-lines", { cartId, lines });
  }

  async updateLines(
    cartId: string,
    lines: { id: string; quantity: number }[]
  ): Promise<Cart> {
    return callCartApi("update-lines", { cartId, lines });
  }

  async removeLines(cartId: string, lineIds: string[]): Promise<Cart> {
    return callCartApi("remove-lines", { cartId, lineIds });
  }

  async updateDiscountCodes(cartId: string, codes: string[]): Promise<Cart> {
    return callCartApi("discount-codes", { cartId, codes });
  }
}
