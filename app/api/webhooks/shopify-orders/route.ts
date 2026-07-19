import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PostHog } from "posthog-node";
import { giftingAudienceForCode } from "@/lib/pricing";

// Shopify orders/create webhook -> PostHog `purchase` event. This is the
// ground truth for revenue: it fires server to server, so checkout-side ad
// blockers cannot lose it. The _heldi_* cart attributes written at the
// checkout handoff arrive here as note_attributes and stitch the order to
// the storefront journey; without them the order is still counted under a
// synthetic id. Registration steps: docs/launch-runbook.md (analytics
// connect phase).

export const runtime = "nodejs";

type ShopifyOrder = {
  id: number;
  order_number?: number;
  currency?: string;
  current_total_price?: string;
  note_attributes?: { name: string; value: string }[];
  discount_codes?: { code: string }[];
  line_items?: { quantity?: number; sku?: string | null }[];
  landing_site?: string | null;
  referring_site?: string | null;
};

function validSignature(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const digest = createHmac("sha256", secret).update(raw, "utf8").digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(header, "base64");
  } catch {
    return false;
  }
  if (provided.length !== digest.length) return false;
  return timingSafeEqual(digest, provided);
}

// Deterministic v4-shaped uuid from the order id: Shopify retries failed
// deliveries for 48h, and identical uuids dedupe in PostHog.
function orderEventUuid(orderId: number): string {
  const hex = createHash("sha256").update(`heldi-order-${orderId}`).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32)
  ].join("-");
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function capturePurchase(order: ShopifyOrder): Promise<void> {
  // The project API key is public and write-only, so the client-side env
  // var is safe to reuse here.
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const attrs = new Map(
    (order.note_attributes ?? []).map((entry) => [entry.name, entry.value])
  );
  const stitchedId = attrs.get("_heldi_ph_id");

  let firstTouch: Record<string, unknown> = {};
  try {
    firstTouch = JSON.parse(attrs.get("_heldi_utm") ?? "{}") as Record<string, unknown>;
  } catch {
    // Malformed attribute: attribution is best-effort.
  }

  const codes = (order.discount_codes ?? []).map((entry) => entry.code);
  const audience =
    codes.map((code) => giftingAudienceForCode(code)).find((match) => match) ?? null;

  const client = new PostHog(key, {
    host: "https://eu.i.posthog.com",
    // Serverless: flush per event and shut down before responding, or the
    // frozen function drops the capture.
    flushAt: 1,
    flushInterval: 0
  });
  client.capture({
    distinctId: stitchedId ?? `shopify-order-${order.id}`,
    event: "purchase",
    uuid: orderEventUuid(order.id),
    properties: {
      order_id: order.id,
      order_number: order.order_number,
      value: Number(order.current_total_price ?? 0),
      currency: order.currency ?? "GBP",
      item_count: (order.line_items ?? []).reduce(
        (sum, line) => sum + (line.quantity ?? 0),
        0
      ),
      skus: (order.line_items ?? [])
        .map((line) => line.sku)
        .filter(Boolean)
        .join(","),
      discount_codes: codes.join(","),
      ...(audience ? { gifting_audience: audience } : {}),
      first_touch_source: asString(firstTouch.source),
      first_touch_medium: asString(firstTouch.medium),
      first_touch_campaign: asString(firstTouch.campaign),
      first_touch_referrer: asString(firstTouch.referrer),
      first_touch_landing_path: asString(firstTouch.landing_path),
      $session_id: attrs.get("_heldi_ph_session"),
      landing_site: order.landing_site ?? undefined,
      referring_site: order.referring_site ?? undefined,
      stitched: Boolean(stitchedId),
      source: "shopify_webhook"
    }
  });
  await client.shutdown();
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    // Same convention as the cart routes: unconfigured is a 503, so a
    // misfired webhook before launch setup is loud rather than silent.
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Past the signature check, always 200: Shopify deregisters webhooks that
  // keep failing, and its 48h retries dedupe via the deterministic uuid.
  try {
    await capturePurchase(JSON.parse(raw) as ShopifyOrder);
  } catch (error) {
    console.error("shopify-orders webhook: purchase capture failed", error);
  }
  return NextResponse.json({ ok: true });
}
