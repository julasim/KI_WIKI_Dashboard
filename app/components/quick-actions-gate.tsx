"use client";

import { usePathname } from "next/navigation";
import { QuickActions } from "./quick-actions";

/**
 * Zeigt QuickActions auf allen Pages außer /login.
 * Projekte werden vom Server-Component (Layout) als Prop reingereicht.
 */
export function QuickActionsGate({ projects }: { projects: string[] }) {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <QuickActions projects={projects} />;
}
