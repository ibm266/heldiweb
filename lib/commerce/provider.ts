import { COMMERCE_PROVIDER } from "./config";
import { MockProvider } from "./mock-provider";
import { ShopifyProvider } from "./shopify-provider";
import type { Cart, CartLineInput } from "./types";

// Maps 1:1 onto the Shopify Storefront Cart API mutations (cartCreate,
// cartLinesAdd, cartLinesUpdate, cartLinesRemove, cartDiscountCodesUpdate,
// cartAttributesUpdate).
export interface CommerceProvider {
  createCart(lines?: CartLineInput[]): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | null>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateLines(
    cartId: string,
    lines: { id: string; quantity: number }[]
  ): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
  updateDiscountCodes(cartId: string, codes: string[]): Promise<Cart>;
  // Cart attributes ride through to the order (note_attributes); the
  // checkout handoff uses them to stitch analytics across the Shopify hop.
  updateAttributes(
    cartId: string,
    attributes: { key: string; value: string }[]
  ): Promise<Cart>;
}

let provider: CommerceProvider | null = null;

export function getCommerceProvider(): CommerceProvider {
  if (!provider) {
    provider =
      COMMERCE_PROVIDER === "shopify" ? new ShopifyProvider() : new MockProvider();
  }
  return provider;
}
