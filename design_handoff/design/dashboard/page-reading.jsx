// Page 9 — Reading

function BookCard({ b }) {
  const statusCls =
    b.status === "reading" ? "text-info" :
    b.status === "done"    ? "text-ok" : "text-[var(--ink-soft)]";
  const statusLabel = { reading: "lese gerade", done: "gelesen", queued: "geplant" }[b.status];
  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold tracking-[-0.005em] leading-snug">{b.title}</h3>
          <div className="text-[12px] font-mono text-[var(--ink-mute)] mt-1">{b.author} · {b.pages} S.</div>
        </div>
        <span className={"flex items-center gap-1.5 text-[11px] font-mono shrink-0 " + statusCls}>
          <Ic.Dot/><span>{statusLabel}</span>
        </span>
      </div>
      {b.status !== "queued" && (
        <div className="mb-3">
          <div className="progress"><i style={{ width: (b.progress * 100) + "%" }}/></div>
          <div className="flex justify-between text-[10.5px] font-mono text-[var(--ink-mute)] mt-1.5">
            <span>{Math.round(b.progress * 100)} %</span>
            <span>{b.started}{b.finished ? " → " + b.finished : ""}</span>
          </div>
        </div>
      )}
      <p className="text-[12.5px] text-[var(--ink-2)] leading-snug border-t hairline pt-3 mt-3">{b.note}</p>
    </div>
  );
}

function PageReading() {
  const done = BOOKS.filter(b => b.status === "done").length;
  const reading = BOOKS.filter(b => b.status === "reading");
  const minutes30 = READING_MINUTES_30D.reduce((s, d) => s + d.minutes, 0);
  const days30 = READING_MINUTES_30D.filter(d => d.minutes > 0).length;
  const avg = Math.round(minutes30 / 30);

  // streak
  let streak = 0;
  for (let i = READING_MINUTES_30D.length - 1; i >= 0; i--) {
    if (READING_MINUTES_30D[i].minutes >= 15) streak++;
    else break;
  }

  const max = Math.max(...READING_MINUTES_30D.map(d => d.minutes), 60);

  return (
    <Page>
      <TopBar sub={"Lese-Tracker · " + done + " / " + READING_GOAL + " Bücher · 2026"} title="Reading."/>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="card p-5">
          <div className="eyebrow mb-2">Bücher · Jahr</div>
          <div className="num-mono text-[36px] leading-none">{done}<span className="text-[var(--ink-soft)] text-[20px]">/{READING_GOAL}</span></div>
          <div className="progress mt-3"><i style={{ width: (done / READING_GOAL * 100) + "%" }}/></div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Aktuell</div>
          <div className="num-mono text-[36px] leading-none">{reading.length}</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">in Arbeit</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Ø min/Tag</div>
          <div className="num-mono text-[36px] leading-none">{avg}</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">{days30} / 30 Tage aktiv</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Streak</div>
          <div className="num-mono text-[36px] leading-none">{streak}</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">Tage ≥ 15 min</div>
        </div>
      </div>

      {/* 30-day bar chart */}
      <div className="card p-5 md:p-6 mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-semibold">Lese-Minuten · 30 Tage</h3>
            <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-0.5">Soll: 30 min/Tag</div>
          </div>
        </div>
        <div className="relative h-[140px] flex items-end gap-[3px]">
          <div className="absolute inset-x-0" style={{ bottom: (30 / max * 100) + "%" }}>
            <div className="border-t border-dashed hairline-2"/>
            <div className="text-[10px] font-mono text-[var(--ink-mute)] mt-1">soll · 30 min</div>
          </div>
          {READING_MINUTES_30D.map((d, i) => {
            const h = (d.minutes / max) * 100;
            const ok = d.minutes >= 30;
            const bad = d.minutes === 0;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end" title={`${d.date} · ${d.minutes} min`}>
                <div className="rounded-sm" style={{
                  height: Math.max(2, h) + "%",
                  background: bad ? "var(--bg-2)" : ok ? "var(--ink)" : "var(--ink-soft)",
                  opacity: bad ? 0.5 : 1,
                }}/>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[var(--ink-mute)] mt-2">
          <span>{READING_MINUTES_30D[0].date}</span>
          <span>heute</span>
        </div>
      </div>

      {/* Sections */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-[13px] font-semibold mb-3">Lese gerade <span className="num-mono text-[11px] text-[var(--ink-mute)] ml-2 font-normal">{reading.length}</span></h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {reading.map((b, i) => <BookCard key={i} b={b}/>)}
        </div>
      </section>

      <section className="mb-6 md:mb-8">
        <h2 className="text-[13px] font-semibold mb-3">Geplant <span className="num-mono text-[11px] text-[var(--ink-mute)] ml-2 font-normal">{BOOKS.filter(b => b.status === "queued").length}</span></h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {BOOKS.filter(b => b.status === "queued").map((b, i) => <BookCard key={i} b={b}/>)}
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold mb-3">Gelesen · 2026 <span className="num-mono text-[11px] text-[var(--ink-mute)] ml-2 font-normal">{done}</span></h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {BOOKS.filter(b => b.status === "done").map((b, i) => <BookCard key={i} b={b}/>)}
        </div>
      </section>
    </Page>
  );
}

window.PageReading = PageReading;
