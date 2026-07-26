import { NextResponse } from "next/server";
import { guard } from "@/lib/rate-limit";
import { ShopifyConfigError, ShopifyUserError } from "./client";

// Every /api/cart route proxies to the Shopify Storefront API with our own
// token, so an uncapped flood burns the shop's API allowance and real
// customers start seeing checkout errors. Each handler calls this first.
export function cartGuard(request: Request): NextResponse | null {
  return guard(request, "cart");
}

/**
 * Parses a JSON body without letting malformed input become a 500. Returns
 * null when the body is not JSON, which handlers turn into a 400.
 */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** The 400 for a body that was not usable JSON. */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

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
