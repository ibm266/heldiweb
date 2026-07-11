import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
