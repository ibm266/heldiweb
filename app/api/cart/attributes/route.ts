import { NextResponse } from "next/server";
import { updateAttributes } from "@/lib/commerce/shopify/cart-actions";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function POST(request: Request) {
  const { cartId, attributes } = (await request.json()) as {
    cartId?: string;
    attributes?: { key: string; value: string }[];
  };
  if (!cartId || !Array.isArray(attributes)) {
    return NextResponse.json(
      { error: "cartId and attributes are required" },
      { status: 400 }
    );
  }
  return cartResponse(() => updateAttributes(cartId, attributes));
}
