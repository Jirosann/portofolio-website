import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Manual WebP optimization via Sharp
  },
};

export default nextConfig;
