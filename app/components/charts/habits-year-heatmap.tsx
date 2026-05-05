"use client";

import { HABIT_KEYS, type HabitDay, type HabitKey } from "@/lib/vault";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Year-Heatmap (GitHub-Style): 365 Tage rückwärts, 7 Zeilen × 53 Spalten.
 * Color-Coded nach Anzahl ok-Habits pro Tag (0-N).
 *
 * Habit-Definitionen werden direkt aus lib/vault HABIT_KEYS importiert
 * (Single Source of Truth — kein Drift möglich).
 */
const HABIT_DEFS: readonly { key: HabitKey; label: string }[] = HABIT_KEYS;

export function HabitsYearHeatmap({ habits }: { habits: HabitDay[] }) {
  const [selectedHabit, setSelectedHabit] = useState<HabitKey | "all">("all");

  // Index by date für O(1)-Lookup
  const byDate = new Map(habits.map((h) => [h.date, h]));

  // 365 Tage rückwärts
  const today = new Date();
  const days: { date: string; weekday: number; count: number; total: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const habit = byDate.get(iso);
    let count = 0;
    let total = HABIT_DEFS.length;
    if (selectedHabit === "all") {
      if (habit) {
        for (const def of HABIT_DEFS) {
          if (habit.values[def.key] === "ok") count++;
        }
      }
    } else {
      total = 1;
      if (habit?.values[selectedHabit] === "ok") count = 1;
    }
    days.push({ date: iso, weekday: d.getDay(), count, total });
  }

  // 53 Wochen × 7 Tage Grid
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  for (const d of days) {
    if (d.weekday === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="eyebrow">Habits — Jahresübersicht</div>
        <select
          value={selectedHabit}
          onChange={(e) => setSelectedHabit(e.target.value as HabitKey | "all")}
          className="h-7 px-2 rounded border hairline bg-[var(--bg)] text-[11px]"
        >
          <option value="all">Alle</option>
          {HABIT_DEFS.map((h) => (
            <option key={h.key} value={h.key}>{h.label}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[2px] min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find((d) => d.weekday === (di + 1) % 7);
                if (!day) return <div key={di} className="w-[10px] h-[10px]" />;
                const intensity = day.total > 0 ? day.count / day.total : 0;
                return (
                  <div
                    key={di}
                    className={cn(
                      "w-[10px] h-[10px] rounded-[2px]",
                      intensity === 0 && "bg-[var(--bg-2)]",
                      intensity > 0 && intensity < 0.34 && "bg-emerald-900",
                      intensity >= 0.34 && intensity < 0.67 && "bg-emerald-600",
                      intensity >= 0.67 && intensity < 1 && "bg-emerald-400",
                      intensity === 1 && "bg-emerald-300",
                    )}
                    title={`${day.date}: ${day.count}/${day.total}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--ink-mute)] num-mono px-2">
        <span>weniger</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[var(--bg-2)]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-300" />
        <span>mehr</span>
      </div>
    </div>
  );
}
