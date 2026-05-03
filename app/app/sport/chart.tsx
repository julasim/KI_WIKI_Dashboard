"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function SportChart({ weeks }: { weeks: { week: string; cardio: number; kraft: number }[] }) {
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={weeks} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="week" stroke="var(--ink-mute)" fontSize={11} />
          <YAxis stroke="var(--ink-mute)" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="cardio" stackId="a" fill="var(--info)" />
          <Bar dataKey="kraft" stackId="a" fill="var(--ok)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
