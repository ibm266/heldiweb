// The cart attribute keys the checkout handoff writes (lib/checkout-handoff.ts)
// and the only ones /api/cart/attributes accepts. Kept in a file of its own so
// the server route can import them without pulling in the client analytics
// that checkout-handoff.ts loads. The orders/create webhook reads the same keys
// off note_attributes, which is why nothing else may land there: anything a
// caller wrote would show up on an order the packing staff read.
export const HANDOFF_ATTRIBUTE_KEYS = {
  distinctId: "_heldi_ph_id",
  sessionId: "_heldi_ph_session",
  firstTouch: "_heldi_utm"
} as const;

const ALLOWED_KEYS: ReadonlySet<string> = new Set(Object.values(HANDOFF_ATTRIBUTE_KEYS));

export function isHandoffAttributeKey(key: string): boolean {
  return ALLOWED_KEYS.has(key);
}
