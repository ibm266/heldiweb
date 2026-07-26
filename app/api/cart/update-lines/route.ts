import { updateLines } from "@/lib/commerce/shopify/cart-actions";
import { enforceGiftPolicy } from "@/lib/commerce/shopify/gift-policy";
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
    lines?: { id: string; quantity: number }[];
  }>(request);
  if (!body) return badRequest("Expected JSON.");

  const { cartId, lines } = body;
  if (!cartId || !lines?.length) {
    return badRequest("cartId and lines are required");
  }

  return cartResponse(async () => enforceGiftPolicy(await updateLines(cartId, lines)));
}
