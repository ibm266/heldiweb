// Journey stitching for the Shopify handoff: just before navigating to the
// Shopify-hosted checkout, the cart gets attributes carrying the PostHog ids
// and first-touch attribution. The custom pixel in Shopify admin reads them
// off checkout events and the orders/create webhook reads them off
// note_attributes, so the storefront journey and the checkout join up as one
// person. Written at click time rather than cart creation because the
// anonymous distinct_id rotates between page loads; only the value at
// handoff is fresh. Attribute keys start with an underscore so Shopify keeps
// them out of customer-facing order summaries.

import { analyticsIds } from "./analytics";
import { firstTouchForCart } from "./attribution";
import { COMMERCE_PROVIDER } from "./commerce/config";
import { getCommerceProvider } from "./commerce/provider";
import type { Cart } from "./commerce/types";

export async function prepareCheckoutHandoff(cart: Cart): Promise<void> {
  // The mock has no checkout to stitch; with PostHog not running (no key, or
  // the visitor opted all measurement off) there is nothing to stitch with.
  if (COMMERCE_PROVIDER === "mock") return;
  const ids = analyticsIds();
  if (!ids) return;

  await getCommerceProvider().updateAttributes(cart.id, [
    { key: "_heldi_ph_id", value: ids.distinctId },
    { key: "_heldi_ph_session", value: ids.sessionId },
    { key: "_heldi_utm", value: firstTouchForCart() }
  ]);
}
