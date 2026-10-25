import type { NextConfig } from "next";

// Allow next/image to optimize S3-hosted uploads when that driver is configured.
const s3Base = process.env.S3_PUBLIC_BASE_URL ? new URL(process.env.S3_PUBLIC_BASE_URL) : null;

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@node-rs/argon2", "sharp"],
  images: {
    localPatterns: [{ pathname: "/media/**", search: "" }],
    remotePatterns: s3Base
      ? [
          {
            protocol: s3Base.protocol.replace(":", "") as "http" | "https",
            hostname: s3Base.hostname,
            pathname: `${s3Base.pathname.replace(/\/$/, "")}/**`,
          },
        ]
      : [],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
