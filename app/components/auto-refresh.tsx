"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 60_000; // 60s

/**
 * Triggert minütlich router.refresh() — re-fetched alle Server-Components
 * mit aktuellen Vault-Daten ohne Page-Reload. Client-State (Tab-Filter,
 * Theme, Scroll-Position) bleibt erhalten.
 *
 * Plus: beim Tab-Wechsel (visibility wieder "visible") sofort refresh,
 * damit man bei Rückkehr nicht 60s alte Daten sieht.
 *
 * Mounted im RootLayout → aktiv auf ALLEN Pages.
 */
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Periodischer Refresh
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    // Refresh sobald User zur Tab/Window zurückkommt
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null; // Render nichts, nur Side-Effect
}
