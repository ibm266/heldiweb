import { updateDiscountCodes } from "@/lib/commerce/shopify/cart-actions";
import {
  badRequest,
  cartResponse,
  isCartId,
  readJson,
  tooManyItems
} from "@/lib/commerce/shopify/route-helpers";
import { guard } from "@/lib/rate-limit";

// This is the money door. Every request here is effectively a guess at a real
// discount code, and a working guess (a family code at 15%, a founders code at
// 25%) is revenue out the door once it is shared. So it gets its own tighter
// cap than the rest of the cart, a hard ceiling on guesses per request, and a
// length check so nobody smuggles a huge payload through to Shopify.
const MAX_CODES = 5;
const MAX_CODE_LENGTH = 64;

export async function POST(request: Request) {
  const blocked = guard(request, "discountCodes");
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: unknown; codes?: unknown }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, codes } = body;
  if (!isCartId(cartId) || !Array.isArray(codes)) {
    return badRequest("cartId and codes are required");
  }
  // Without this, one request could carry thousands of guesses and sail past
  // any per-request cap.
  if (codes.length > MAX_CODES) return tooManyItems("discount codes", MAX_CODES);
  if (
    codes.some(
      (code) =>
        typeof code !== "string" ||
        code.length === 0 ||
        code.length > MAX_CODE_LENGTH
    )
  ) {
    return badRequest("That does not look like a discount code.");
  }

  // An empty array is valid: it clears every discount code from the cart. No
  // clamp either, for the same reason as attributes: a code cannot add a line.
  return cartResponse(() => updateDiscountCodes(cartId, codes as string[]));
}
