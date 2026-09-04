import { NextResponse } from "next/server";
import { guard } from "@/lib/rate-limit";
import { MAX_POUCHES } from "@/lib/pricing";
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

// ---------------------------------------------------------------------------
// Request-shape caps
// ---------------------------------------------------------------------------
// The cart routes have no login and forward what they are given straight to
// the Storefront API, so without a ceiling one request can ask Shopify to do
// thousands of things. The rate limit caps requests per minute; these cap the
// work inside a single request. Same reasoning as MAX_CODES in
// app/api/cart/discount-codes/route.ts, applied to the routes that take
// arrays. See docs/security.md.
//
// The numbers sit far above any basket the site can build and far below
// anything that costs money. The largest real basket is a few pouch lines, a
// jar, a tote and a sachet or two, and the largest real mutation touches three
// of them at once.

/** Line inputs, line updates or line ids in one request. */
export const MAX_LINES = 10;

/**
 * Per line. Raised from 10 with MAX_POUCHES on 4 Sep 2026: a basket is packed
 * into pair variants, so the largest legitimate one is HELDI-K2C0 at quantity
 * 12, and a cap of 10 refused a basket the storefront had just built. Tied to
 * MAX_POUCHES so the two cannot drift apart again.
 */
export const MAX_LINE_QUANTITY = MAX_POUCHES;

/** Attributes in one request. The checkout handoff writes three. */
export const MAX_ATTRIBUTES = 10;

/** Cart ids and line ids are Shopify GIDs, which are nowhere near this long. */
const MAX_ID_LENGTH = 256;

const MAX_ATTRIBUTE_KEY_LENGTH = 64;

// Generous, because the first-touch attribution value carries a referrer URL
// and whatever utm parameters a campaign link happened to use. Truncating a
// legitimate one would lose the channel a sale came from.
const MAX_ATTRIBUTE_VALUE_LENGTH = 1024;

function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_ID_LENGTH;
}

/** A usable cart id. Shape only: whether it exists is Shopify's answer. */
export function isCartId(value: unknown): value is string {
  return isId(value);
}

/** Same shape, different job: the id of one line inside a cart. */
export function isLineId(value: unknown): value is string {
  return isId(value);
}

function isQuantity(value: unknown, min: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= MAX_LINE_QUANTITY
  );
}

/** `{ merchandiseId, quantity }` for cartLinesAdd and cartCreate. */
export function isLineInput(
  value: unknown
): value is { merchandiseId: string; quantity: number } {
  if (typeof value !== "object" || value === null) return false;
  const line = value as { merchandiseId?: unknown; quantity?: unknown };
  return isId(line.merchandiseId) && isQuantity(line.quantity, 1);
}

/** `{ id, quantity }` for cartLinesUpdate. Quantity zero is legitimate: it is
 *  how Shopify removes a line through an update. */
export function isLineUpdate(
  value: unknown
): value is { id: string; quantity: number } {
  if (typeof value !== "object" || value === null) return false;
  const line = value as { id?: unknown; quantity?: unknown };
  return isId(line.id) && isQuantity(line.quantity, 0);
}

/** `{ key, value }` for cartAttributesUpdate. */
export function isAttribute(
  value: unknown
): value is { key: string; value: string } {
  if (typeof value !== "object" || value === null) return false;
  const attribute = value as { key?: unknown; value?: unknown };
  return (
    typeof attribute.key === "string" &&
    attribute.key.length > 0 &&
    attribute.key.length <= MAX_ATTRIBUTE_KEY_LENGTH &&
    typeof attribute.value === "string" &&
    attribute.value.length <= MAX_ATTRIBUTE_VALUE_LENGTH
  );
}

/** The 400 for an array longer than its cap. One wording, five routes. */
export function tooManyItems(what: string, max: number): NextResponse {
  return badRequest(`No more than ${max} ${what} at a time.`);
}
