import { updateAttributes } from "@/lib/commerce/shopify/cart-actions";
import {
  MAX_ATTRIBUTES,
  badRequest,
  cartGuard,
  cartResponse,
  isAttribute,
  isCartId,
  readJson,
  tooManyItems
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: unknown; attributes?: unknown }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, attributes } = body;
  if (!isCartId(cartId) || !Array.isArray(attributes)) {
    return badRequest("cartId and attributes are required");
  }
  if (attributes.length > MAX_ATTRIBUTES) {
    return tooManyItems("attributes", MAX_ATTRIBUTES);
  }
  if (!attributes.every(isAttribute)) {
    return badRequest("That is not a cart attribute.");
  }

  // No clamp: attributes carry the analytics handoff and cannot change what is
  // in the basket. An empty array is valid, and clears them.
  return cartResponse(() => updateAttributes(cartId, attributes));
}
