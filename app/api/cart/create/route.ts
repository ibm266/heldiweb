import { createCart } from "@/lib/commerce/shopify/cart-actions";
import { enforceCartPolicy } from "@/lib/commerce/shopify/cart-policy";
import {
  MAX_LINES,
  badRequest,
  cartGuard,
  cartResponse,
  isLineInput,
  readJson,
  tooManyItems
} from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const blocked = cartGuard(request);
  if (blocked) return blocked;

  const body = await readJson<{ lines?: unknown }>(request);
  if (!body) return badRequest("Expected JSON.");

  // An empty cart is legitimate (the drawer creates one before anything is
  // added), so only the presence of a non-array is wrong here.
  const lines = body.lines ?? [];
  if (!Array.isArray(lines)) return badRequest("lines must be an array");
  if (lines.length > MAX_LINES) return tooManyItems("lines", MAX_LINES);
  if (!lines.every(isLineInput)) return badRequest("That is not a cart line.");

  return cartResponse(async () => enforceCartPolicy(await createCart(lines)));
}
