import { NextResponse } from "next/server";
import { addLines } from "@/lib/commerce/shopify/cart-actions";
import { enforceGiftPolicy } from "@/lib/commerce/shopify/gift-policy";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const { cartId, lines } = (await request.json()) as {
    cartId?: string;
    lines?: { merchandiseId: string; quantity: number }[];
  };
  if (!cartId || !lines?.length) {
    return NextResponse.json(
      { error: "cartId and lines are required" },
      { status: 400 }
    );
  }
  return cartResponse(async () => enforceGiftPolicy(await addLines(cartId, lines)));
}
