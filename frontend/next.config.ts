import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3001",
        process.env.NEXT_PUBLIC_APP_URL ?? "",
      ].filter(Boolean) as string[],
    },
  },
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path((?!auth/).*)",
          destination: "http://localhost:5000/api/:path",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
