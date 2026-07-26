// Request caps and same-origin checks for the /api routes.
//
// Why this exists: every route under app/api is a public door. Without a cap,
// one script can call the review upload a thousand times (filling the Supabase
// bucket), spray the waitlist (polluting Klaviyo, which bills per profile),
// guess discount codes until one works, or burn the Shopify Storefront API
// allowance so real customers hit checkout errors. None of that needs a break
// in; it just needs repetition.
//
// HONEST LIMITATION: the counters below live in the memory of one serverless
// instance. Vercel runs several instances and recycles them, so a distributed
// flood can get more through than the numbers suggest, and a cold start
// forgets everything. This is a speed bump that makes casual abuse boring and
// costs nothing to run. The durable fix is a Vercel WAF rate-limit rule (it
// blocks at the edge, before a function is ever invoked, so it also stops the
// billing) or a shared store such as Upstash Redis. See docs/security.md.
//
// The webhook route is deliberately exempt: it verifies a Shopify HMAC
// signature before doing any work, and a genuine order burst must never be
// dropped.

import { NextResponse } from "next/server";

export type RateRule = {
  /** Requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

/** The caps, one per route family. Tuned so a real person never notices. */
export const RATE_RULES = {
  // A person joins once. Five allows fat fingers and a shared office address.
  waitlist: { limit: 5, windowMs: 60_000 },
  // Reviews are rare and each one can carry a multi-megabyte upload.
  reviews: { limit: 3, windowMs: 60 * 60_000 },
  // Minting a signed upload URL is the load-bearing cap on storage abuse, and
  // the only one that applies: the upload itself goes browser to Supabase, so
  // neither this code nor the Vercel WAF ever sees the bytes. Each mint is
  // permission to store one file up to REVIEW_LIMITS.mediaMaxBytes, so 3 per
  // hour per address is the ceiling on how fast one attacker can fill the
  // bucket. Do not loosen this without also lowering the file size limit.
  reviewUploadUrl: { limit: 3, windowMs: 60 * 60_000 },
  // Password guessing. Tight, because the only cost of being wrong is asking
  // the one consultant who has the password to wait a quarter of an hour.
  previewUnlock: { limit: 5, windowMs: 15 * 60_000 },
  // Discount codes are the money door: every request is a guess at a real code.
  discountCodes: { limit: 10, windowMs: 60_000 },
  // Normal shopping is chatty (add, update, re-read), so this is generous.
  cart: { limit: 60, windowMs: 60_000 }
} as const satisfies Record<string, RateRule>;

/** timestamps of recent hits, newest last, keyed by "rule:ip". */
const hits = new Map<string, number[]>();

// Stop the map growing without bound on a long-lived instance. Swept on a
// counter rather than a timer so no work happens on an idle instance.
let callsSinceSweep = 0;
const SWEEP_EVERY = 500;
const MAX_KEYS = 10_000;

function sweep(now: number, windowMs: number): void {
  for (const [key, stamps] of hits) {
    // A bucket whose newest hit is older than the window can never block.
    if (stamps.length === 0 || now - stamps[stamps.length - 1] > windowMs) {
      hits.delete(key);
    }
  }
  // Pathological case (huge spread of addresses): drop everything rather than
  // let the instance grow. Callers get a clean slate, which fails open, but an
  // out-of-memory function fails open too and takes the site with it.
  if (hits.size > MAX_KEYS) hits.clear();
}

/**
 * Best-effort client address. Vercel sets x-forwarded-for at the edge; the
 * first entry is the real client. Anything unattributable shares one bucket,
 * which errs towards limiting rather than waving it through.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Records a hit and reports whether it is allowed. Call once per request,
 * before doing any real work.
 */
export function checkRate(
  request: Request,
  name: keyof typeof RATE_RULES
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const rule = RATE_RULES[name];
  const now = Date.now();

  if (++callsSinceSweep >= SWEEP_EVERY) {
    callsSinceSweep = 0;
    sweep(now, rule.windowMs);
  }

  const key = `${name}:${clientIp(request)}`;
  const cutoff = now - rule.windowMs;
  const recent = (hits.get(key) ?? []).filter((stamp) => stamp > cutoff);

  if (recent.length >= rule.limit) {
    hits.set(key, recent);
    // How long until the oldest hit ages out of the window.
    const waitMs = recent[0] + rule.windowMs - now;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true };
}

/** The 429 every caller should return when checkRate says no. */
export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Give it a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

/**
 * True when the request came from a page on this same site.
 *
 * Every one of these routes is only ever called by our own client code, so a
 * request carrying someone else's Origin is either a mistake or a cross-site
 * attempt to drive a visitor's cart. Comparing Origin against the request's
 * own Host means production, Vercel preview URLs and localhost all pass with
 * no domain list to maintain.
 *
 * Browsers always send Origin on POST, so a missing one means the caller is
 * not a browser, and none of these routes are a public API. Curl needs
 * -H "Origin: https://<host>" to test them.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** The 403 for a cross-origin write. */
export function crossOriginBlocked(): NextResponse {
  return NextResponse.json({ error: "Cross-origin requests are not allowed." }, {
    status: 403
  });
}

/**
 * One call that applies both gates to a state-changing route. Returns a
 * response to send back, or null when the request may proceed.
 */
export function guard(
  request: Request,
  name: keyof typeof RATE_RULES
): NextResponse | null {
  if (!sameOrigin(request)) return crossOriginBlocked();
  const rate = checkRate(request, name);
  if (!rate.ok) return tooManyRequests(rate.retryAfterSeconds);
  return null;
}
