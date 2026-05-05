"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyFM } from "@/lib/vault";

/**
 * Energy + Mood-Trend (Linienchart) über die letzten N Tage.
 * Skala 1-10 (oder was im FM steht). Nullwerte werden ausgelassen.
 */
export function EnergyMoodTrend({ data }: { data: DailyFM[] }) {
  // Nur Tage mit mindestens einem Wert anzeigen
  const filtered = data.filter((d) => d.energy !== null || d.mood !== null);
  if (filtered.length < 2) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Noch zu wenig Daten. Trage Energy + Mood in deine Dailies ein
        (im Tagebuch oder via FAB → Tagebuch).
      </div>
    );
  }

  const chart = filtered.map((d) => ({
    date: d.date.slice(5), // MM-DD
    energy: d.energy,
    mood: d.mood,
  }));

  return (
    <div className="card p-4">
      <div className="eyebrow mb-3 px-2">Energy & Mood — letzte 30 Tage</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chart} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--ink-soft)" strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--ink-mute)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ink-soft)" }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: "var(--ink-mute)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ink-soft)" }}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--ink-soft)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            name="Energy"
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            name="Mood"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
