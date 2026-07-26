import { updateDiscountCodes } from "@/lib/commerce/shopify/cart-actions";
import {
  badRequest,
  cartResponse,
  readJson
} from "@/lib/commerce/shopify/route-helpers";
import { guard } from "@/lib/rate-limit";

// This is the money door. Every request here is effectively a guess at a real
// discount code, and a working guess (the waitlist 20%, a gifting code) is
// revenue out the door once it is shared. So it gets its own tighter cap than
// the rest of the cart, a hard ceiling on guesses per request, and a length
// check so nobody smuggles a huge payload through to Shopify.
const MAX_CODES = 5;
const MAX_CODE_LENGTH = 64;

export async function POST(request: Request) {
  const blocked = guard(request, "discountCodes");
  if (blocked) return blocked;

  const body = await readJson<{ cartId?: string; codes?: string[] }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, codes } = body;
  if (!cartId || !Array.isArray(codes)) {
    return badRequest("cartId and codes are required");
  }
  // Without this, one request could carry thousands of guesses and sail past
  // any per-request cap.
  if (codes.length > MAX_CODES) {
    return badRequest(`No more than ${MAX_CODES} discount codes at a time.`);
  }
  if (codes.some((code) => typeof code !== "string" || code.length > MAX_CODE_LENGTH)) {
    return badRequest("That does not look like a discount code.");
  }

  // An empty array is valid: it clears every discount code from the cart.
  return cartResponse(() => updateDiscountCodes(cartId, codes));
}
