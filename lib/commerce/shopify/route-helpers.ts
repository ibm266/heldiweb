import { NextResponse } from "next/server";
import { ShopifyConfigError, ShopifyUserError } from "./client";

// Uniform error mapping for the /api/cart handlers: missing configuration is
// 503 (the mock provider should be in use instead), a Shopify userError is
// the caller's fault (400), anything else is upstream (502).
export async function cartResponse(
  action: () => Promise<unknown>
): Promise<NextResponse> {
  try {
    return NextResponse.json(await action());
  } catch (error) {
    if (error instanceof ShopifyConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof ShopifyUserError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Cart request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
