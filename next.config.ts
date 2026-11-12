import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is prerendered to plain files in `out/`. There is no
  // server, no API routes and no database to deploy or to trust.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
