import { createCart } from "@/lib/commerce/shopify/cart-actions";
import { enforceGiftPolicy } from "@/lib/commerce/shopify/gift-policy";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const { lines } = (await request.json()) as {
    lines?: { merchandiseId: string; quantity: number }[];
  };
  return cartResponse(async () => enforceGiftPolicy(await createCart(lines ?? [])));
}
