import type { NextConfig } from "next";

// Security response headers. Applied to every route. The Content-Security-Policy
// is deliberately functional-first: Next's App Router injects inline bootstrap
// scripts and next/font + styled-jsx inject inline styles, so 'unsafe-inline'
// stays for script/style (tightening to per-request nonces needs middleware and
// is a later hardening step). 'unsafe-eval' and the ws: connect source are
// gated to dev so React Fast Refresh keeps working without loosening prod.
const isDev = process.env.NODE_ENV === "development";

// Review photos and videos upload from the browser straight to Supabase
// storage (app/api/reviews/upload-url mints the signed URL), which is a
// cross-origin request and so needs an explicit connect-src entry: the default
// 'self' blocks it, and the only symptom is "Failed to fetch" in the console.
//
// Derived from SUPABASE_URL so the project ref stays out of the repo. That env
// var must therefore be present at BUILD time, not just at runtime: without it
// this entry is silently absent and every upload fails. Vercel exposes project
// env vars to builds, so setting it for Production and Preview is enough.
const supabaseOrigin = (() => {
  const url = process.env.SUPABASE_URL;
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // https: covers Shopify CDN product imagery; data:/blob: cover next/image.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}${isDev ? " ws: wss:" : ""}`,
  // PostHog's session-replay recorder compresses in a blob-URL worker;
  // without an explicit worker-src, browsers fall back to script-src, which
  // blocks blob:.
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Browsers ignore HSTS over plain http (localhost dev), so this is inert
  // until served over https.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains"
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()"
  }
];

// heldi.co.uk used to serve a Shopify theme, and Google still holds those URLs
// in its index (a site: query on 26 Jul 2026 returned /pages/about-us and
// /collections/dahi, both 404 now). A 404 drops out of the index eventually,
// but slowly, and it throws away whatever link equity the URL had. A 301 moves
// the URL and its equity to the live page in one recrawl, so every Shopify URL
// shape gets a home here.
//
// Ordering matters: Next matches top to bottom, so the named /pages/* entries
// must sit above the /pages/:slug* catch-all. These are permanent (308) because
// the Shopify theme is gone and nothing will ever serve these paths again.
const shopifyLegacyRedirects = [
  // Shopify's default page slugs, in every spelling the old theme could have used.
  { source: "/pages/about-us", destination: "/our-story" },
  { source: "/pages/about", destination: "/our-story" },
  { source: "/pages/our-story", destination: "/our-story" },
  { source: "/pages/faq", destination: "/faq" },
  { source: "/pages/faqs", destination: "/faq" },
  { source: "/pages/contact", destination: "/faq" },
  { source: "/pages/how-to-use", destination: "/ways-to-use" },
  { source: "/pages/ingredients", destination: "/inside-the-pouch" },
  // Shopify serves its legal docs under /policies/; ours live under /legal/.
  { source: "/policies/privacy-policy", destination: "/legal/privacy" },
  { source: "/policies/terms-of-service", destination: "/legal/terms" },
  { source: "/policies/refund-policy", destination: "/legal/returns" },
  { source: "/policies/shipping-policy", destination: "/legal/shipping" },
  { source: "/policies/:slug*", destination: "/legal/terms" },
  // Blog: Shopify nests posts as /blogs/<blog-handle>/<post-handle>. None of
  // the old handles match ours, so the index page is the honest target.
  { source: "/blogs/:path*", destination: "/heldi-living" },
  // Catalogue: every collection, product and variant URL becomes the shop.
  { source: "/collections/:path*", destination: "/shop" },
  { source: "/products/:path*", destination: "/shop" },
  { source: "/cart", destination: "/shop" },
  { source: "/cart/:path*", destination: "/shop" },
  { source: "/search", destination: "/shop" },
  // Storefront chrome that has no equivalent here.
  { source: "/account/:path*", destination: "/" },
  { source: "/challenge", destination: "/" },
  { source: "/pages/:slug*", destination: "/" }
].map((rule) => ({ ...rule, permanent: true }));

const nextConfig: NextConfig = {
  // PostHog API paths end in a slash; Next's default 308 to the non-slash
  // form would break them. Internal links never use trailing slashes.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return shopifyLegacyRedirects;
  },
  // Same-origin proxy for PostHog EU: beacons stay within connect-src 'self'
  // and off ad-blocker lists. The static host serves the lazy-loaded
  // replay recorder.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*"
      }
    ];
  },
  images: {
    // Image URLs are versioned (?v= or renamed on regeneration), so transforms
    // can stay cached for a month without ever serving a stale asset.
    minimumCacheTTL: 2678400,
    localPatterns: [
      {
        pathname: "/images/**"
      },
      {
        pathname: "/images/pouch-badges/**"
      }
    ],
    // Cart lines carry whatever image Shopify holds for the variant, so with
    // the real provider every drawer thumbnail is a cdn.shopify.com URL. Without
    // this next/image throws "Invalid src prop" and the throw happens inside the
    // drawer, which is mounted in the root layout: it takes the whole page down,
    // not just the picture. It only started biting once the Shopify products got
    // images (4 Sep 2026); before that the Storefront returned none.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
