// Page 8 — Wins (Erfolgs-Tagebuch)

function WinRow({ w }) {
  const saeule = SAEULEN.find(s => s.key === w.saeule);
  return (
    <li className="grid grid-cols-[64px_1fr_auto] gap-3 md:gap-5 items-start py-3.5 border-b hairline last:border-0">
      <div className="num-mono text-[11px] text-[var(--ink-mute)] pt-1">{w.date.slice(5)}</div>
      <div className="text-[14px] leading-snug text-[var(--ink)]">{w.text}</div>
      <span className="pill capitalize">{saeule ? saeule.label : w.saeule}</span>
    </li>
  );
}

function PageWins() {
  const [filter, setFilter] = React.useState("all");
  const list = filter === "all" ? WINS : WINS.filter(w => w.saeule === filter);

  // by-säule counts
  const counts = {};
  for (const w of WINS) counts[w.saeule] = (counts[w.saeule] || 0) + 1;

  return (
    <Page>
      <TopBar sub={"Erfolgs-Tagebuch · " + WINS.length + " Einträge"} title="Wins."/>

      <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="card p-5">
          <div className="eyebrow mb-2">Diesen Monat</div>
          <div className="num-mono text-[36px] leading-none">{WINS.filter(w => w.date.startsWith("2026-05") || w.date.startsWith("2026-04")).length}</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">letzte 30 Tage</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Stärkste Säule</div>
          <div className="num-mono text-[26px] leading-none capitalize mt-1">
            {Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0]}
          </div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">{Object.entries(counts).sort((a,b) => b[1]-a[1])[0][1]} Wins</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Quelle</div>
          <div className="text-[13px] font-mono text-[var(--ink-2)] mt-1">tracker/<wbr/>wins.md</div>
          <div className="text-[11px] font-mono text-[var(--ink-mute)] mt-2">type: tracker · saeule: mindset</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 -ml-1">
        <button onClick={() => setFilter("all")}
          className={"flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors " +
            (filter === "all" ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")}>
          Alle <span className={"num-mono text-[11px] " + (filter==="all"?"opacity-70":"text-[var(--ink-soft)]")}>{WINS.length}</span>
        </button>
        {SAEULEN.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={"flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors " +
              (filter === s.key ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")}>
            {s.label}
            <span className={"num-mono text-[11px] " + (filter===s.key?"opacity-70":"text-[var(--ink-soft)]")}>{counts[s.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="card p-5 md:p-6">
        <ul className="px-1">
          {list.map((w, i) => <WinRow key={i} w={w}/>)}
        </ul>
      </div>
    </Page>
  );
}

window.PageWins = PageWins;
