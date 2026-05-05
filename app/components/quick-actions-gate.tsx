"use client";

import { usePathname } from "next/navigation";
import { QuickActions } from "./quick-actions";

/**
 * Zeigt QuickActions auf allen Pages außer /login.
 */
export function QuickActionsGate() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <QuickActions />;
}
