import { NextResponse } from "next/server";
import { updateDiscountCodes } from "@/lib/commerce/shopify/cart-actions";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const { cartId, codes } = (await request.json()) as {
    cartId?: string;
    codes?: string[];
  };
  if (!cartId || !Array.isArray(codes)) {
    return NextResponse.json(
      { error: "cartId and codes are required" },
      { status: 400 }
    );
  }
  // An empty array is valid: it clears every discount code from the cart.
  return cartResponse(() => updateDiscountCodes(cartId, codes));
}
