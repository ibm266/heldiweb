import { removeLines } from "@/lib/commerce/shopify/cart-actions";
import { enforceCartPolicy } from "@/lib/commerce/shopify/cart-policy";
import {
  MAX_LINES,
  badRequest,
  cartGuard,
  cartResponse,
  isCartId,
  isLineId,
  readJson,
  tooManyItems
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: unknown; lineIds?: unknown }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, lineIds } = body;
  if (!isCartId(cartId) || !Array.isArray(lineIds) || lineIds.length === 0) {
    return badRequest("cartId and lineIds are required");
  }
  if (lineIds.length > MAX_LINES) return tooManyItems("line ids", MAX_LINES);
  if (!lineIds.every(isLineId)) return badRequest("That is not a cart line id.");

  // The clamp matters most here, not least. Removing the pouch line is exactly
  // how a crafted sequence strips the thing being paid for and leaves the free
  // presents behind, then walks to checkoutUrl with a box of gifts.
  return cartResponse(async () =>
    enforceCartPolicy(await removeLines(cartId, lineIds))
  );
}
