// Page 3 — Sport

const { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } = Recharts;

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="card px-3 py-2 text-[12px] font-mono shadow-sm">
      <div className="text-[var(--ink-mute)] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.color }}/>
          <span className="capitalize">{p.dataKey}</span>
          <span className="num-mono ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function KPI({ label, value, suffix, sub, tone }) {
  const toneCls = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "";
  return (
    <div className="card p-6">
      <div className="eyebrow mb-3">{label}</div>
      <div className={"num-mono text-[40px] tracking-tight leading-none " + toneCls}>
        {value}{suffix && <span className="text-[var(--ink-soft)] text-[20px]">{suffix}</span>}
      </div>
      <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-3">{sub}</div>
    </div>
  );
}

function PageSport() {
  const weeks = SPORT_WEEKS;
  const total = SPORT_SESSIONS.length;
  const cardioCount = SPORT_SESSIONS.filter(s => s.art === "cardio").length;
  const kraftCount = SPORT_SESSIONS.filter(s => s.art === "kraft").length;

  const lastWeek = weeks[weeks.length - 1];
  const ist = lastWeek.cardio + lastWeek.kraft;
  const soll = 3;
  const sollOk = ist >= soll;

  return (
    <Page>
      <TopBar
        sub="Sport-Verlauf · letzte 12 Wochen"
        title="Sport."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <KPI label="Diese Woche" value={ist} suffix={"/" + soll}
             sub={(sollOk ? "Soll erfüllt" : "Soll offen") + " · 2× Cardio + 1× Kraft"}
             tone={sollOk ? "ok" : "warn"}/>
        <KPI label="km · Jahr" value={SPORT_TOTALS.km} sub="gelaufen · 2026"/>
        <KPI label="Stunden" value={SPORT_TOTALS.hours} suffix="h" sub="Sport · 2026"/>
        <KPI label="Sessions" value={total} sub={cardioCount + " Cardio · " + kraftCount + " Kraft"}/>
      </div>

      {/* Bar chart */}
      <div className="card p-6 mb-8">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-[14px] font-medium">Sessions pro Woche</h3>
            <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-1">cardio + kraft · stacked</div>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-mono text-[var(--ink-mute)]">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--ink)" }}/> Cardio</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm border hairline-2" style={{ background: "var(--bg-2)" }}/> Kraft</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={weeks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="week" stroke="var(--ink-mute)" tick={{ fontSize: 11, fontFamily: "Geist Mono" }}
                     tickLine={false} axisLine={{ stroke: "var(--border)" }}/>
              <YAxis stroke="var(--ink-mute)" tick={{ fontSize: 11, fontFamily: "Geist Mono" }}
                     tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip content={<ChartTooltip/>} cursor={{ fill: "var(--bg-2)" }}/>
              <Bar dataKey="cardio" stackId="a" fill="var(--ink)" maxBarSize={28}/>
              <Bar dataKey="kraft"  stackId="a" fill="var(--bg-2)" stroke="var(--border-2)" maxBarSize={28}
                   radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-4 pt-4 border-t hairline">
          Wochen-Soll: 3 Sessions (2× Cardio + 1× Kraft)
        </div>
      </div>

      {/* Last sessions */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[14px] font-medium">Letzte Sessions</h3>
          <div className="eyebrow">tracker/sport-log.md</div>
        </div>
        <ul className="divide-y hairline -mx-1">
          {SPORT_SESSIONS.slice(0, 6).map((s, i) => (
            <li key={i} className="grid grid-cols-[80px_70px_50px_1fr] md:grid-cols-[100px_90px_60px_1fr] gap-3 px-1 py-3.5 items-center">
              <div className="num-mono text-[12px] text-[var(--ink-mute)]">{s.date}</div>
              <div>
                <span className={"pill " + (s.art === "cardio" ? "" : "pill-solid")}>
                  {s.art}
                </span>
              </div>
              <div className="num-mono text-[13px] tabular-nums">{s.dauer}<span className="text-[var(--ink-soft)] text-[10px]"> min</span></div>
              <div className="text-[13px] text-[var(--ink-2)] truncate">{s.notiz}</div>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}

window.PageSport = PageSport;
