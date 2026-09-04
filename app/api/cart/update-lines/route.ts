import { updateLines } from "@/lib/commerce/shopify/cart-actions";
import { enforceCartPolicy } from "@/lib/commerce/shopify/cart-policy";
import {
  MAX_LINES,
  badRequest,
  cartGuard,
  cartResponse,
  isCartId,
  isLineUpdate,
  readJson,
  tooManyItems
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: unknown; lines?: unknown }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, lines } = body;
  if (!isCartId(cartId) || !Array.isArray(lines) || lines.length === 0) {
    return badRequest("cartId and lines are required");
  }
  if (lines.length > MAX_LINES) return tooManyItems("lines", MAX_LINES);
  if (!lines.every(isLineUpdate)) return badRequest("That is not a cart line.");

  return cartResponse(async () =>
    enforceCartPolicy(await updateLines(cartId, lines))
  );
}
