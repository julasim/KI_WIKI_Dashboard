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
import type { Book } from "@/lib/vault";

/**
 * Reading-Pace: Bücher abgeschlossen pro Monat, letzte 12 Monate.
 */
export function ReadingPace({ books }: { books: Book[] }) {
  const today = new Date();
  const months: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ month: key.slice(2), count: 0 });
  }

  for (const b of books) {
    // Bücher: status=abgeschlossen + ende-Datum vorhanden
    if (b.status !== "abgeschlossen" || !b.ende) continue;
    const key = b.ende.slice(2, 7); // YY-MM
    const month = months.find((m) => m.month === key);
    if (month) month.count++;
  }

  const total = months.reduce((s, m) => s + m.count, 0);

  if (total === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Noch keine abgeschlossenen Bücher in den letzten 12 Monaten getrackt.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="eyebrow">Reading-Pace — Bücher pro Monat (12M)</div>
        <div className="text-[11px] num-mono text-[var(--ink-mute)]">
          {total} insgesamt
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={months} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--ink-soft)" strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tick={{ fill: "var(--ink-mute)", fontSize: 10 }} />
          <YAxis tick={{ fill: "var(--ink-mute)", fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--ink-soft)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
