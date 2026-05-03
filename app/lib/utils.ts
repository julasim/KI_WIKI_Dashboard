import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STICHTAG = new Date(2031, 4, 1); // 2031-05-01

export function daysUntilStichtag(from: Date = new Date()): number {
  const diff = STICHTAG.getTime() - from.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function formatDateLongDe(d: Date = new Date()): string {
  return d.toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function weekdayDe(d: Date = new Date()): string {
  return d.toLocaleDateString("de-AT", { weekday: "long" });
}

export function formatDateDe(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export const PRIO_DOT: Record<string, string> = {
  urgent: "bg-bad",
  high: "bg-warn",
  medium: "bg-info",
  low: "bg-ok",
};

export const PRIO_LABEL: Record<string, string> = {
  urgent: "urgent",
  high: "high",
  medium: "med",
  low: "low",
};
