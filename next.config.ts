// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⬇️ This line makes builds ignore ESLint errors
  eslint: { ignoreDuringBuilds: true },

  webpack(config) {
    config.module?.rules?.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
