import path from "path";
import type { NextConfig } from "next";

const storageUrl = new URL(
  process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:9000",
);

const nextConfig: NextConfig = {
  output: "standalone",
  // Needed for pnpm monorepo: traces files from the repo root
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      {
        protocol: storageUrl.protocol.replace(":", "") as "http" | "https",
        hostname: storageUrl.hostname,
        port: storageUrl.port,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
