import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "?v=ink-blue-2"
      }
    ]
  }
};

export default nextConfig;
