import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // or higher
    },
  },
};

export default nextConfig;
