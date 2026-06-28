import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
