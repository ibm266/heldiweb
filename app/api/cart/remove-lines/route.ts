import { removeLines } from "@/lib/commerce/shopify/cart-actions";
import {
  badRequest,
  cartGuard,
  cartResponse,
  readJson
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: string; lineIds?: string[] }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, lineIds } = body;
  if (!cartId || !lineIds?.length) {
    return badRequest("cartId and lineIds are required");
  }

  return cartResponse(() => removeLines(cartId, lineIds));
}
