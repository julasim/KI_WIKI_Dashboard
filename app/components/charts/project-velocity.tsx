"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Task } from "@/lib/vault";

/**
 * Project-Velocity: erledigte Tasks pro Projekt über letzte 4 Wochen.
 * Zeigt welches Projekt aktiv ist.
 */
export function ProjectVelocity({ tasks, weeks = 4 }: { tasks: Task[]; weeks?: number }) {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Tasks die in den letzten X Wochen done wurden
  const recent = tasks.filter(
    (t) => t.last_completed && t.last_completed >= cutoffStr,
  );

  // Group by project
  const byProject: Record<string, number> = {};
  for (const t of recent) {
    const key = t.project || "(ohne Projekt)";
    byProject[key] = (byProject[key] || 0) + 1;
  }

  const data = Object.entries(byProject)
    .map(([project, done]) => ({ project, done }))
    .sort((a, b) => b.done - a.done)
    .slice(0, 10); // Top 10

  if (data.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Keine erledigten Tasks in den letzten {weeks} Wochen.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="eyebrow mb-3 px-2">
        Velocity — erledigte Tasks pro Projekt (letzte {weeks} Wochen)
      </div>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid stroke="var(--ink-soft)" strokeDasharray="3 3" opacity={0.2} horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--ink-mute)", fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="project"
            tick={{ fill: "var(--ink-mute)", fontSize: 11 }}
            width={140}
            interval={0}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--ink-soft)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="done" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
