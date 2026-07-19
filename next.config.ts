import type { NextConfig } from "next";

// Security response headers. Applied to every route. The Content-Security-Policy
// is deliberately functional-first: Next's App Router injects inline bootstrap
// scripts and next/font + styled-jsx inject inline styles, so 'unsafe-inline'
// stays for script/style (tightening to per-request nonces needs middleware and
// is a later hardening step). 'unsafe-eval' and the ws: connect source are
// gated to dev so React Fast Refresh keeps working without loosening prod.
const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // https: covers Shopify CDN product imagery; data:/blob: cover next/image.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
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

const nextConfig: NextConfig = {
  // PostHog API paths end in a slash; Next's default 308 to the non-slash
  // form would break them. Internal links never use trailing slashes.
  skipTrailingSlashRedirect: true,
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
