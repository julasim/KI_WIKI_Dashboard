import { readHabits, HABIT_KEYS } from "@/lib/vault";
import { HabitsYearHeatmap } from "@/components/charts/habits-year-heatmap";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [days, yearDays] = await Promise.all([
    readHabits(30),
    readHabits(365),
  ]);
  const todayISO = new Date().toISOString().slice(0, 10);

  // Streak pro Habit
  const streaks: Record<string, number> = {};
  for (const h of HABIT_KEYS) {
    let s = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].values[h.key] === "ok") s++;
      else break;
    }
    streaks[h.key] = s;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Tracking</div>
          <h1 className="display text-3xl md:text-4xl">Habits</h1>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-[var(--ink-mute)]">
          <span className="flex items-center gap-1.5">
            <span className="hm-cell ok" style={{ width: 12, height: 12 }} /> erfüllt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="hm-cell bad" style={{ width: 12, height: 12 }} /> nicht
          </span>
          <span className="flex items-center gap-1.5">
            <span className="hm-cell skip" style={{ width: 12, height: 12 }} /> skip
          </span>
        </div>
      </header>

      <section className="card p-5 md:p-6 overflow-x-auto">
        <div className="space-y-3 min-w-[600px]">
          {HABIT_KEYS.map((h) => (
            <div key={h.key} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <div className="text-sm">{h.label}</div>
                <div className="text-[11px] num-mono text-[var(--ink-mute)]">{h.target}</div>
              </div>
              <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: "repeat(30, 1fr)" }}>
                {days.map((d) => {
                  const v = d.values[h.key];
                  const cls = v === "ok" ? "ok" : v === "bad" ? "bad" : "skip";
                  const isToday = d.date === todayISO;
                  return (
                    <div
                      key={d.date}
                      className={`hm-cell ${cls} ${isToday ? "today" : ""}`}
                      title={`${d.date}: ${v ?? "skip"}`}
                    />
                  );
                })}
              </div>
              <div className="w-16 text-right num-mono text-xs text-[var(--ink-mute)] shrink-0">
                Streak {streaks[h.key]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-[var(--ink-soft)]">
        30 Tage rückwärts. Quelle: <code>10_Life/goals/5y-2031/tracker/habits.md</code>
      </p>

      {/* Year-Heatmap (GitHub-Style) */}
      <section>
        <HabitsYearHeatmap habits={yearDays} />
      </section>
    </div>
  );
}
