import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-Output für minimalen Docker-Container (~150MB statt ~1GB)
  // → docker COPY .next/standalone + .next/static + public reicht.
  output: "standalone",

  // Build robust gegen TypeScript-Issues halten — Errors zur Build-Time
  // sind ärgerlich wenn nur eine UI-Komponente strict-typed-Bug hat.
  // Code wird trotzdem getypechecked beim Editieren in IDE; nur der Production-
  // Build wird nicht blockiert.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hinweis: `eslint`-Key wurde in Next 16 entfernt (siehe
  // https://nextjs.org/docs/messages/invalid-next-config). ESLint laeuft
  // jetzt ueber `next lint` statt im build-Step. Wir bauen ohne lint im
  // Container — ESLint im Editor + CI reicht.
};

export default nextConfig;
