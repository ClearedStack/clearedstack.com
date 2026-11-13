import createMDX from "@next/mdx";
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

// Guides are written as .mdx files in src/guides.
const withMDX = createMDX({});

export default withMDX(nextConfig);
