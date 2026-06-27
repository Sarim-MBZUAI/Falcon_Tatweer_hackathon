import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp is a native module; keep it external so it loads correctly at runtime.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
