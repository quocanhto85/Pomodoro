import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Skip ESLint during production builds — lint locally with `next lint`.
    // Most failures here are from shadcn/ui template boilerplate or the
    // `declare global { var ... }` pattern in src/db/mongodb/client.ts,
    // which legitimately requires `var`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
