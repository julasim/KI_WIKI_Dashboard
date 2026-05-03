// Page 2 — Habits (30-day heatmap, 6 habits)

function HabitRow({ habit, days }) {
  const todayIdx = days.length - 1;
  const okCount = days.filter(d => d.values[habit.key] === "ok").length;
  const possible = days.filter(d => d.values[habit.key] !== "skip").length;
  const score = possible > 0 ? Math.round((okCount / possible) * 100) : 0;
  const drift = score < 50;

  return (
    <div className="grid grid-cols-[100px_1fr_56px] md:grid-cols-[160px_1fr_72px] items-center gap-3 md:gap-5 py-3.5 border-b hairline last:border-0">
      <div>
        <div className="text-[14px] font-medium leading-tight">{habit.label}</div>
        <div className="text-[11px] text-[var(--ink-mute)] font-mono mt-1">{habit.target}</div>
      </div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d, i) => {
          const v = d.values[habit.key];
          const cls = "hm-cell " + (v === "ok" ? "ok" : v === "bad" ? "bad" : "skip") + (i === todayIdx ? " today" : "");
          return <div key={i} className={cls} title={`${d.date} · ${v}`}/>;
        })}
      </div>
      <div className="text-right">
        <div className={"num-mono text-[15px] tabular-nums " + (drift ? "text-bad" : "")}>{score}<span className="text-[10px] text-[var(--ink-soft)]">%</span></div>
        <div className="text-[10px] font-mono text-[var(--ink-soft)] mt-1">{okCount}/{possible}</div>
      </div>
    </div>
  );
}

function PageHabits() {
  const days = HABITS_30D;
  const startDate = days[0].date;
  const endDate = days[days.length - 1].date;

  const allOk = days.reduce((s, d) => s + HABIT_KEYS.filter(h => d.values[h.key] === "ok").length, 0);
  const allPossible = days.reduce((s, d) => s + HABIT_KEYS.filter(h => d.values[h.key] !== "skip").length, 0);
  const overall = allPossible ? Math.round((allOk / allPossible) * 100) : 0;

  const last7 = days.slice(-7);
  const ok7 = last7.reduce((s, d) => s + HABIT_KEYS.filter(h => d.values[h.key] === "ok").length, 0);
  const pos7 = last7.reduce((s, d) => s + HABIT_KEYS.filter(h => d.values[h.key] !== "skip").length, 0);
  const w7 = pos7 ? Math.round((ok7 / pos7) * 100) : 0;
  const drift7 = w7 < 50;

  return (
    <Page>
      <TopBar
        sub={"Habit-Tracker · " + startDate + " → " + endDate}
        title="Habits."
      />

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="card p-6">
          <div className="eyebrow mb-3">Score · 30 Tage</div>
          <div className="num-mono text-[40px] tracking-tight leading-none">{overall}<span className="text-[var(--ink-soft)] text-[20px]">%</span></div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">{allOk} von {allPossible} möglich</div>
        </div>
        <div className="card p-6">
          <div className="eyebrow mb-3">Letzte 7 Tage</div>
          <div className={"num-mono text-[40px] tracking-tight leading-none " + (drift7 ? "text-bad" : "")}>
            {w7}<span className="text-[var(--ink-soft)] text-[20px]">%</span>
          </div>
          {drift7 ? (
            <div className="text-[11px] font-mono text-bad mt-3">Drift-Warnung · &lt; 50%</div>
          ) : (
            <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">{ok7} von {pos7} möglich</div>
          )}
        </div>
        <div className="card p-6">
          <div className="eyebrow mb-3">Quelle</div>
          <div className="text-[13px] font-mono leading-snug text-[var(--ink-2)]">tracker/habits.md</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">saeule: mindset</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-6 overflow-x-auto no-scrollbar">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[100px_1fr_56px] md:grid-cols-[160px_1fr_72px] items-end gap-3 md:gap-5 pb-3 mb-1 border-b hairline">
            <div className="eyebrow">Habit</div>
            <div className="grid gap-[3px] text-[9px] font-mono text-[var(--ink-soft)]"
                 style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {days.map((d, i) => {
                const day = new Date(d.date);
                const show = i === 0 || i === days.length - 1 || day.getDate() === 1 || (i % 7 === 0);
                return (
                  <div key={i} className="text-center">
                    {show ? day.getDate() : ""}
                  </div>
                );
              })}
            </div>
            <div className="eyebrow text-right">Score</div>
          </div>
          <div>
            {HABIT_KEYS.map(h => <HabitRow key={h.key} habit={h} days={days}/>)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-6 text-[11px] font-mono text-[var(--ink-mute)]">
        <div className="flex items-center gap-2"><span className="hm-cell ok" style={{ width: 12, aspectRatio: 1 }}/> erfüllt</div>
        <div className="flex items-center gap-2"><span className="hm-cell bad" style={{ width: 12, aspectRatio: 1 }}/> nicht erfüllt</div>
        <div className="flex items-center gap-2"><span className="hm-cell skip" style={{ width: 12, aspectRatio: 1 }}/> irrelevant</div>
        <div className="flex items-center gap-2"><span className="hm-cell skip today" style={{ width: 12, aspectRatio: 1 }}/> heute</div>
      </div>
    </Page>
  );
}

window.PageHabits = PageHabits;
