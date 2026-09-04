import { getCart } from "@/lib/commerce/shopify/cart-actions";
import { enforceCartPolicy } from "@/lib/commerce/shopify/cart-policy";
import { badRequest, cartResponse } from "@/lib/commerce/shopify/route-helpers";
import { checkRate, tooManyRequests } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limit only, no origin check: browsers do not send an Origin header on
  // a same-origin GET, so requiring one here would block our own cart reads.
  // Cross-origin reads are not a leak anyway (the browser withholds the
  // response without CORS headers, and a cart id is not a secret), but the
  // Shopify API allowance still needs protecting.
  const rate = checkRate(request, "cart");
  if (!rate.ok) return tooManyRequests(rate.retryAfterSeconds);

  const cartId = new URL(request.url).searchParams.get("cartId");
  if (!cartId) return badRequest("cartId is required");

  // An expired or unknown cart returns JSON null; the client provider then
  // starts a fresh cart (same contract as the mock provider).
  //
  // Clamped on the way out, which the other four routes already do on the way
  // in. This was the hole: a cart left over cap by a half-finished swap, or by
  // a crafted request whose repair failed, came back through here unclamped
  // and hydrated straight into the drawer. The drawer prices pouches from the
  // ladder, and the ladder REFUSES a count above the cap, so an unclamped read
  // was a thrown RangeError in a component mounted in the root layout: not a
  // broken basket, a broken site.
  return cartResponse(async () => {
    const cart = await getCart(cartId);
    return cart ? await enforceCartPolicy(cart) : cart;
  });
}
