import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "aarambd.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aarambd.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
