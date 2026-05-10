/**
 * Client-safe Habit-Konstanten + Types.
 *
 * Wichtig: dieses File darf KEINE Node-only-Imports (`node:fs`,
 * `node:path`, etc.) haben — wird sowohl von Server-Components
 * (lib/vault.ts → server-side Reads) als auch von Client-Components
 * (components/charts/habits-year-heatmap.tsx → "use client") importiert.
 *
 * Next 16 / Turbopack ist strenger als Next 15: ein "use client" Modul
 * darf nicht transitiv `node:fs/promises` ziehen — daher diese
 * Trennung.
 */

export type HabitStatus = "ok" | "bad" | "skip";

export const HABIT_KEYS = [
  { key: "sport", label: "Sport", target: "3-5 km" },
  { key: "lesen", label: "Lesen", target: "30 min" },
  { key: "schlaf", label: "Schlaf", target: "7+ h" },
  { key: "bildschirm", label: "Bildschirm", target: "< 22:30" },
  { key: "vision", label: "Vision", target: "1× lesen" },
  { key: "wasser", label: "Wasser", target: "2 L" },
] as const;

export type HabitKey = (typeof HABIT_KEYS)[number]["key"];

export type HabitDay = {
  date: string;
  values: Partial<Record<HabitKey, HabitStatus>>;
};
