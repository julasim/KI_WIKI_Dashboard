// Page 4 — Goals (5y-2031)

function SaeuleCard({ s }) {
  const dotCls = s.status === "ok" ? "text-ok" : s.status === "warn" ? "text-warn" : "text-bad";
  const label  = s.status === "ok" ? "auf Kurs" : s.status === "warn" ? "achten" : "Drift";
  return (
    <div className="card card-hover p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-[16px] font-medium tracking-[-0.01em] capitalize">{s.label}</h3>
        <span className={"flex items-center gap-1.5 text-[11px] font-mono " + dotCls}>
          <Ic.Dot/>
          <span>{label}</span>
        </span>
      </div>
      <div className="text-[13.5px] text-[var(--ink-2)] leading-relaxed mb-5">{s.note}</div>
      <div className="num-mono text-[13px] text-[var(--ink-mute)]">{s.metric}</div>
    </div>
  );
}

function DriftRow({ label, info }) {
  const cls = info.status === "ok" ? "text-ok" : info.status === "warn" ? "text-warn" : "text-bad";
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4 border-b hairline last:border-0">
      <div>
        <div className="text-[14px] font-medium">{label}</div>
        <div className="text-[11.5px] font-mono text-[var(--ink-mute)] mt-1">{info.note}</div>
      </div>
      <div className="num-mono text-[12px] text-[var(--ink-2)]">{info.last}</div>
      <div className={"num-mono text-[12px] tabular-nums w-[70px] text-right " + cls}>
        {info.daysAgo === 0 ? "heute" : info.daysAgo + " T"}
      </div>
    </div>
  );
}

function PageGoals() {
  const restTage = daysUntil(STICHTAG);
  const tag = daysSinceStart();
  const total = 1826;
  const stichtag = STICHTAG.toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Page>
      <TopBar
        sub="5-Jahres-System · 6 Säulen"
        title="Goals."
      />

      {/* Countdown */}
      <div className="card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12">
          <div>
            <div className="eyebrow mb-2">Stichtag</div>
            <div className="display text-[28px] md:text-[34px] leading-none">{stichtag}</div>
          </div>
          <div className="flex gap-8 md:gap-12 md:ml-auto">
            <div>
              <div className="num-mono text-[34px] md:text-[40px] leading-none tracking-tight">{restTage}</div>
              <div className="eyebrow mt-2">Tage übrig</div>
            </div>
            <div>
              <div className="num-mono text-[34px] md:text-[40px] leading-none tracking-tight">{tag}</div>
              <div className="eyebrow mt-2">Tag {tag} / {total}</div>
            </div>
            <div className="hidden md:block">
              <div className="num-mono text-[34px] md:text-[40px] leading-none tracking-tight">{((tag/total)*100).toFixed(1)}%</div>
              <div className="eyebrow mt-2">absolviert</div>
            </div>
          </div>
        </div>
        <div className="progress mt-7">
          <i style={{ width: ((tag / total) * 100).toFixed(2) + "%" }}/>
        </div>
      </div>

      {/* 6 Säulen grid */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="text-[14px] font-medium tracking-[-0.005em]">Sechs Säulen</h2>
          <div className="eyebrow">säulen.md</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAEULEN.map(s => <SaeuleCard key={s.key} s={s}/>)}
        </div>
      </section>

      {/* Drift-Detektor */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-medium">Drift-Detektor</h3>
            <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-1">Anker-Disziplin · readme.md</div>
          </div>
          <div className="eyebrow">letzter / vor</div>
        </div>
        <DriftRow label="Wochen-Anker"   info={DRIFT.wochenAnker}/>
        <DriftRow label="Monats-Anker"   info={DRIFT.monatAnker}/>
        <DriftRow label="Quartals-Anker" info={DRIFT.quartalAnker}/>
      </div>
    </Page>
  );
}

window.PageGoals = PageGoals;
