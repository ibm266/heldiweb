import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  }
};

export default nextConfig;
