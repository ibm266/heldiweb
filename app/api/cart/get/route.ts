import { NextResponse } from "next/server";
import { getCart } from "@/lib/commerce/shopify/cart-actions";
import { cartResponse } from "@/lib/commerce/shopify/route-helpers";

export async function GET(request: Request) {
  const cartId = new URL(request.url).searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ error: "cartId is required" }, { status: 400 });
  }
  // An expired or unknown cart returns JSON null; the client provider then
  // starts a fresh cart (same contract as the mock provider).
  return cartResponse(() => getCart(cartId));
}
