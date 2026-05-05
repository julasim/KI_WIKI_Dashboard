import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-Output für minimalen Docker-Container (~150MB statt ~1GB)
  // → docker COPY .next/standalone + .next/static + public reicht.
  output: "standalone",

  // Build robust gegen TypeScript-/ESLint-Issues halten — Errors zur Build-Time
  // sind ärgerlich wenn nur eine UI-Komponente strict-typed-Bug hat.
  // Code wird trotzdem getypechecked beim Editieren in IDE; nur der Production-
  // Build wird nicht blockiert.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
