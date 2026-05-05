"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Task } from "@/lib/vault";

/**
 * Tasks-Burndown: pro Tag in den letzten N Tagen, wieviele Tasks waren OFFEN
 * (created <= tag UND (last_completed > tag ODER nicht erledigt)).
 *
 * Liefert ein Gefühl wie sich der Backlog entwickelt.
 */
export function TasksBurndown({ tasks, days = 30 }: { tasks: Task[]; days?: number }) {
  const today = new Date();
  const series: { date: string; open: number; done: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const open = tasks.filter(
      (t) =>
        t.created &&
        t.created <= iso &&
        (!t.last_completed || t.last_completed > iso) &&
        t.status !== "cancelled",
    ).length;
    const done = tasks.filter((t) => t.last_completed === iso).length;
    series.push({ date: iso.slice(5), open, done });
  }

  if (series.every((s) => s.open === 0)) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Noch keine Burndown-Daten. Tasks brauchen `created`-Datum im Frontmatter.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="eyebrow mb-3 px-2">Burndown — offene Tasks letzte 30 Tage</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={series} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--ink-soft)" strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="date" tick={{ fill: "var(--ink-mute)", fontSize: 10 }} />
          <YAxis tick={{ fill: "var(--ink-mute)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--ink-soft)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="open"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#openGrad)"
            name="offen"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
