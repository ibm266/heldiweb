import { NextResponse } from "next/server";
import { removeLines } from "@/lib/commerce/shopify/cart-actions";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const { cartId, lineIds } = (await request.json()) as {
    cartId?: string;
    lineIds?: string[];
  };
  if (!cartId || !lineIds?.length) {
    return NextResponse.json(
      { error: "cartId and lineIds are required" },
      { status: 400 }
    );
  }
  return cartResponse(() => removeLines(cartId, lineIds));
}
