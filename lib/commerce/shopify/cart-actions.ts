// Server-side cart actions: the bridge between the /api/cart route handlers
// and the Storefront API. Each action runs one GraphQL document and returns
// the app's Cart shape. Kept out of the route files so the mapping is
// testable and the six handlers stay one line each.

import type { Cart, CartLineInput } from "../types";
import {
  mapCart,
  shopifyFetch,
  unwrapMutation,
  type ShopifyCart
} from "./client";
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY
} from "./queries";

type MutationPayload = {
  cart: ShopifyCart | null;
  userErrors: { field: string[] | null; message: string }[];
};

export async function createCart(lines: CartLineInput[] = []): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: MutationPayload }>(
    CART_CREATE_MUTATION,
    { lines }
  );
  return unwrapMutation(data.cartCreate);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(CART_QUERY, {
    cartId
  });
  return data.cart ? mapCart(data.cart) : null;
}

export async function addLines(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: MutationPayload }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines }
  );
  return unwrapMutation(data.cartLinesAdd);
}

export async function updateLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: MutationPayload }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines }
  );
  return unwrapMutation(data.cartLinesUpdate);
}

export async function removeLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: MutationPayload }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds }
  );
  return unwrapMutation(data.cartLinesRemove);
}

export async function updateDiscountCodes(
  cartId: string,
  codes: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{ cartDiscountCodesUpdate: MutationPayload }>(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    { cartId, discountCodes: codes }
  );
  return unwrapMutation(data.cartDiscountCodesUpdate);
}
