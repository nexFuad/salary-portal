import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

if (process.env.NODE_ENV === "production" && !backendApiUrl) {
  throw new Error("BACKEND_API_URL is required for production API requests.");
}

if (backendApiUrl) {
  const url = new URL(backendApiUrl);
  if (!(["http:", "https:"].includes(url.protocol)) || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("BACKEND_API_URL must be an origin without a path, query, or fragment.");
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    if (!backendApiUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
