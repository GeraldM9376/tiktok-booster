import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false, // Turns off the strict prerender cache that's causing the Date.now() errors
};

export default nextConfig;