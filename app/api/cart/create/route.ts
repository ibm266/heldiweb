import { createCart } from "@/lib/commerce/shopify/cart-actions";
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
    lines?: { merchandiseId: string; quantity: number }[];
  }>(request);
  if (!body) return badRequest("Expected JSON.");

  return cartResponse(async () =>
    enforceGiftPolicy(await createCart(body.lines ?? []))
  );
}
