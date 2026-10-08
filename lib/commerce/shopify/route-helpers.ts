import { NextResponse } from "next/server";
import { guard } from "@/lib/rate-limit";
import { MAX_POUCHES } from "@/lib/pricing";
import { ADDABLE_VARIANT_IDS } from "../catalog";
import { isHandoffAttributeKey } from "../handoff-attributes";
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
//
// The 503 and 502 bodies are deliberately generic, with the detail going to
// the function log instead. They used to carry the env var names and
// Shopify's raw GraphQL errors, which tell a stranger how the shop is wired
// and help nobody shopping: the storefront never reads these bodies, only the
// status (lib/commerce/shopify-provider.ts).
export async function cartResponse(
  action: () => Promise<unknown>
): Promise<NextResponse> {
  try {
    return NextResponse.json(await action());
  } catch (error) {
    if (error instanceof ShopifyConfigError) {
      console.error("[cart]", error.message);
      return NextResponse.json(
        { error: "The basket is not available right now." },
        { status: 503 }
      );
    }
    if (error instanceof ShopifyUserError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[cart]", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "The basket could not be updated. Try again shortly." },
      { status: 502 }
    );
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

/** `{ merchandiseId, quantity }` for cartLinesAdd and cartCreate. The variant
 *  has to be one the storefront itself adds (ADDABLE_VARIANT_IDS). */
export function isLineInput(
  value: unknown
): value is { merchandiseId: string; quantity: number } {
  if (typeof value !== "object" || value === null) return false;
  const line = value as { merchandiseId?: unknown; quantity?: unknown };
  return (
    isId(line.merchandiseId) &&
    ADDABLE_VARIANT_IDS.has(line.merchandiseId) &&
    isQuantity(line.quantity, 1)
  );
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

/** `{ key, value }` for cartAttributesUpdate. Only the checkout handoff's own
 *  keys: anything else would land on the order as a note attribute. */
export function isAttribute(
  value: unknown
): value is { key: string; value: string } {
  if (typeof value !== "object" || value === null) return false;
  const attribute = value as { key?: unknown; value?: unknown };
  return (
    typeof attribute.key === "string" &&
    attribute.key.length <= MAX_ATTRIBUTE_KEY_LENGTH &&
    isHandoffAttributeKey(attribute.key) &&
    typeof attribute.value === "string" &&
    attribute.value.length <= MAX_ATTRIBUTE_VALUE_LENGTH
  );
}

// The checks above look at two fields, but the objects they pass used to be
// forwarded whole, and Shopify accepts more on a line than we check (line
// attributes of any size, a selling plan, a new merchandiseId on an update).
// So the routes forward these rebuilt copies, never the caller's objects.

export function toLineInputs(
  lines: { merchandiseId: string; quantity: number }[]
): { merchandiseId: string; quantity: number }[] {
  return lines.map(({ merchandiseId, quantity }) => ({ merchandiseId, quantity }));
}

export function toLineUpdates(
  lines: { id: string; quantity: number }[]
): { id: string; quantity: number }[] {
  return lines.map(({ id, quantity }) => ({ id, quantity }));
}

export function toAttributes(
  attributes: { key: string; value: string }[]
): { key: string; value: string }[] {
  return attributes.map(({ key, value }) => ({ key, value }));
}

/** The 400 for an array longer than its cap. One wording, five routes. */
export function tooManyItems(what: string, max: number): NextResponse {
  return badRequest(`No more than ${max} ${what} at a time.`);
}
