"use client";

import type { Win } from "@/lib/vault";
import { cn } from "@/lib/utils";

/**
 * Wins-Frequency: 12-Monats-Heatmap nach Monat × Wochentag.
 * Zeigt wann du am meisten Wins loggst.
 */
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function WinsFrequency({ wins }: { wins: Win[] }) {
  // Bucket: weekday (0-6, Mo-So) × month (last 12)
  const today = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: d.toLocaleDateString("de", { month: "short" }) });
  }

  const grid: Record<string, Record<number, number>> = {}; // monthKey → weekday → count
  for (const m of months) grid[m.key] = {};

  for (const w of wins) {
    if (!w.date) continue;
    const d = new Date(w.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!(monthKey in grid)) continue; // außerhalb der 12 Monate
    const wd = (d.getDay() + 6) % 7; // Mo=0 ... So=6
    grid[monthKey][wd] = (grid[monthKey][wd] || 0) + 1;
  }

  // Max für Color-Scale
  let maxCount = 0;
  for (const m of months)
    for (let wd = 0; wd < 7; wd++)
      maxCount = Math.max(maxCount, grid[m.key][wd] || 0);

  if (maxCount === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Noch keine Wins in den letzten 12 Monaten getrackt.
      </div>
    );
  }

  const intensity = (n: number) => (maxCount > 0 ? n / maxCount : 0);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="eyebrow">Wins-Frequenz — Monat × Wochentag</div>
        <div className="text-[11px] num-mono text-[var(--ink-mute)]">
          {wins.length} insgesamt
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[40px_repeat(12,1fr)] gap-[3px] min-w-[600px]">
          <div />
          {months.map((m) => (
            <div
              key={m.key}
              className="text-[10px] text-[var(--ink-mute)] text-center pb-1"
            >
              {m.label}
            </div>
          ))}
          {WEEKDAYS.map((wd, wi) => (
            <div key={wd} className="contents">
              <div className="text-[10px] text-[var(--ink-mute)] flex items-center justify-end pr-2">
                {wd}
              </div>
              {months.map((m) => {
                const n = grid[m.key][wi] || 0;
                const i = intensity(n);
                return (
                  <div
                    key={m.key + wi}
                    className={cn(
                      "h-5 rounded-[2px]",
                      i === 0 && "bg-[var(--bg-2)]",
                      i > 0 && i < 0.25 && "bg-amber-900/60",
                      i >= 0.25 && i < 0.5 && "bg-amber-700/60",
                      i >= 0.5 && i < 0.75 && "bg-amber-500",
                      i >= 0.75 && "bg-amber-400",
                    )}
                    title={`${m.label} ${wd}: ${n} Wins`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
