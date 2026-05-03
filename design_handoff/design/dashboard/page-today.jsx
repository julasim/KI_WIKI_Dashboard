// Page 1 — Today / Home

function StatusDot({ status }) {
  const cls = status === "ok" ? "text-ok" : status === "warn" ? "text-warn" : status === "bad" ? "text-bad" : "text-[var(--ink-soft)]";
  return <span className={cls}><Ic.Dot/></span>;
}

function PriorityPill({ p }) {
  const map = {
    urgent: { cls: "bg-bad-soft",  label: "Dringend" },
    high:   { cls: "bg-warn-soft", label: "Hoch" },
    medium: { cls: "bg-info-soft", label: "Mittel" },
    low:    { cls: "",              label: "Niedrig" },
  };
  const m = map[p] || map.low;
  return <span className={"pill " + m.cls} style={{ borderColor: "transparent" }}>{m.label}</span>;
}

function SectionHead({ title, count, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div className="flex items-baseline gap-3">
        <h3 className="text-[14px] font-medium tracking-[-0.005em]">{title}</h3>
        {count != null && <span className="num-mono text-[11px] text-[var(--ink-soft)]">{count}</span>}
      </div>
      {hint && <div className="eyebrow">{hint}</div>}
    </div>
  );
}

function PageToday() {
  const day = TODAY;
  const tag = daysSinceStart();
  const total = 1826;
  const restTage = daysUntil(STICHTAG);

  return (
    <Page>
      <TopBar
        sub={"Sonntag · " + fmtDe(day)}
        title="Guten Morgen, Julius."
      />

      {/* Vision strip */}
      <div className="card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <div className="eyebrow mb-3">Vision · 5y-2031</div>
            <p className="serif text-[22px] md:text-[26px] leading-[1.3] text-[var(--ink)]">
              {VISION}
            </p>
          </div>
          <div className="flex md:flex-col gap-8 md:gap-2 md:text-right shrink-0">
            <div>
              <div className="num-mono text-[32px] md:text-[36px] tracking-tight leading-none">{tag}</div>
              <div className="eyebrow mt-1.5">Tag von {total}</div>
            </div>
            <div>
              <div className="num-mono text-[13px] text-[var(--ink-mute)]">{restTage} Tage bis 01.05.2031</div>
            </div>
          </div>
        </div>
        <div className="progress mt-6">
          <i style={{ width: ((tag / total) * 100).toFixed(2) + "%" }}/>
        </div>
      </div>

      {/* 4 quick cards */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Heute fällig */}
        <div className="card p-6">
          <SectionHead title="Heute fällig" count={TASKS_TODAY.length} hint="tasks"/>
          <ul className="divide-y hairline -mx-1">
            {TASKS_TODAY.map(t => (
              <li key={t.id} className="flex items-start gap-3 px-1 py-3">
                <div className="mt-1"><StatusDot status={t.overdue ? "bad" : "ok"}/></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] leading-snug truncate">{t.title}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--ink-mute)] font-mono">
                    {t.overdue && <span className="text-bad">überfällig · {t.due}</span>}
                    {!t.overdue && <span>fällig · heute</span>}
                    {t.project && <span>· {t.project}</span>}
                  </div>
                </div>
                <PriorityPill p={t.priority}/>
              </li>
            ))}
          </ul>
        </div>

        {/* Heutige Reminders */}
        <div className="card p-6">
          <SectionHead title="Reminders" count={REMINDERS_TODAY.length} hint="reminders.json"/>
          <ul className="space-y-3.5">
            {REMINDERS_TODAY.map(r => {
              const t = new Date(r.fire_at);
              const hh = String(t.getHours()).padStart(2, "0");
              const mm = String(t.getMinutes()).padStart(2, "0");
              return (
                <li key={r.id} className="flex items-start gap-4">
                  <div className="num-mono text-[13px] text-[var(--ink)] tabular-nums w-12 shrink-0 pt-0.5">{hh}:{mm}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] leading-snug">{r.message}</div>
                    <div className="text-[11px] text-[var(--ink-mute)] font-mono mt-1">↻ {r.recurrence}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Gestern Abends */}
        <div className="card p-6">
          <SectionHead title="Gestern Abends" hint={YESTERDAY.date}/>
          <blockquote className="serif text-[17px] md:text-[19px] leading-[1.45] text-[var(--ink)] mb-5">
            „{YESTERDAY.key_insight}"
          </blockquote>
          <div className="flex items-center gap-8 pt-4 border-t hairline">
            <div>
              <div className="eyebrow">Mood</div>
              <div className="num-mono text-[16px] mt-1">{YESTERDAY.mood} <span className="text-[var(--ink-soft)] text-[12px]">/ 10</span></div>
            </div>
            <div>
              <div className="eyebrow">Energy</div>
              <div className="num-mono text-[16px] mt-1">{YESTERDAY.energy} <span className="text-[var(--ink-soft)] text-[12px]">/ 10</span></div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card p-6">
          <SectionHead title="Routine-Streak" hint="daily-anker"/>
          <div className="flex items-end gap-8 mb-5">
            <div>
              <div className="num-mono text-[48px] md:text-[56px] leading-none tracking-tight">{STREAK.current}</div>
              <div className="eyebrow mt-2">Tage in Folge</div>
            </div>
            <div className="pb-1.5">
              <div className="eyebrow">Bestmarke</div>
              <div className="num-mono text-[16px] mt-1">{STREAK.best}</div>
            </div>
          </div>
          <div className="flex gap-[3px]">
            {Array.from({ length: STREAK.current }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-[var(--ink)]"/>
            ))}
            {Array.from({ length: STREAK.best - STREAK.current }).map((_, i) => (
              <div key={"r"+i} className="flex-1 h-1 rounded-full bg-[var(--bg-2)]"/>
            ))}
          </div>
          <div className="text-[11px] text-[var(--ink-mute)] font-mono mt-3">{STREAK.current} / {STREAK.best} bis Bestmarke</div>
        </div>

      </div>
    </Page>
  );
}

window.PageToday = PageToday;
