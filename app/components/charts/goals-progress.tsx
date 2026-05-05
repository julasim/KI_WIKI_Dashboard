"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Saeule } from "@/lib/vault";

/**
 * Goals-Progress: Radial-Chart pro Säule.
 * Status-Mapping zu numerischem Score:
 *   ok=100, info=80, warn=50, bad=20
 */
const STATUS_TO_SCORE: Record<string, number> = {
  ok: 100,
  info: 80,
  warn: 50,
  bad: 20,
};

const STATUS_TO_COLOR: Record<string, string> = {
  ok: "#10b981",
  info: "#3b82f6",
  warn: "#f59e0b",
  bad: "#ef4444",
};

export function GoalsProgress({ saeulen }: { saeulen: Saeule[] }) {
  if (saeulen.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Keine Säulen-Daten in 10_Life/goals/5y-2031/readme.md
      </div>
    );
  }

  const data = saeulen.map((s) => ({
    name: s.label,
    score: STATUS_TO_SCORE[s.status] ?? 50,
    fill: STATUS_TO_COLOR[s.status] ?? "#6b7280",
    status: s.status,
  }));

  return (
    <div className="card p-4">
      <div className="eyebrow mb-3 px-2">Goals — Säulen-Status</div>
      <ResponsiveContainer width="100%" height={Math.max(220, saeulen.length * 36)}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="score"
            cornerRadius={6}
            background={{ fill: "var(--bg-2)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--ink-soft)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
