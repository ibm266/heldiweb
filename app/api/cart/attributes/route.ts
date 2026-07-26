import { updateAttributes } from "@/lib/commerce/shopify/cart-actions";
import {
  badRequest,
  cartGuard,
  cartResponse,
  readJson
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{
    cartId?: string;
    attributes?: { key: string; value: string }[];
  }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, attributes } = body;
  if (!cartId || !Array.isArray(attributes)) {
    return badRequest("cartId and attributes are required");
  }

  return cartResponse(() => updateAttributes(cartId, attributes));
}
