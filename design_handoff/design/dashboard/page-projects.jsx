// Page 6 — Projects overview

function StatusPill({ s }) {
  const map = {
    active:   { cls: "text-ok",   label: "aktiv" },
    paused:   { cls: "text-warn", label: "pausiert" },
    archived: { cls: "text-[var(--ink-soft)]", label: "archiviert" },
    done:     { cls: "text-info", label: "abgeschlossen" },
  };
  const m = map[s] || map.active;
  return (
    <span className={"flex items-center gap-1.5 text-[11px] font-mono " + m.cls}>
      <Ic.Dot/>
      <span>{m.label}</span>
    </span>
  );
}

function ProjectCard({ p }) {
  const openTasks = TASKS_ALL.filter(t => t.project === p.slug && t.status !== "done").length;
  const overdue   = TASKS_ALL.filter(t => t.project === p.slug && t.status !== "done" && dueBucket(t, TODAY) === "overdue").length;
  return (
    <a href={"#project/" + p.slug} className="card card-hover p-5 md:p-6 block group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="eyebrow">{p.slug}</span>
            {p.parent && <span className="eyebrow text-[var(--ink-soft)]">↳ {p.parent}</span>}
          </div>
          <h3 className="text-[18px] font-semibold tracking-[-0.005em] leading-tight group-hover:underline decoration-[var(--ink-mute)] underline-offset-4">
            {p.title}
          </h3>
        </div>
        <StatusPill s={p.status}/>
      </div>
      <p className="text-[13.5px] text-[var(--ink-2)] leading-snug mb-5 line-clamp-2">{p.summary}</p>
      <div className="grid grid-cols-3 gap-2 pt-4 border-t hairline">
        <div>
          <div className="num-mono text-[16px] tabular-nums">{openTasks}</div>
          <div className="text-[10.5px] font-mono text-[var(--ink-mute)] mt-0.5">offen</div>
        </div>
        <div>
          <div className={"num-mono text-[16px] tabular-nums " + (overdue ? "text-bad" : "")}>{overdue}</div>
          <div className="text-[10.5px] font-mono text-[var(--ink-mute)] mt-0.5">drift</div>
        </div>
        <div className="text-right">
          <div className="num-mono text-[12px] text-[var(--ink-2)] mt-1">{p.recent_activity}</div>
          <div className="text-[10.5px] font-mono text-[var(--ink-mute)] mt-0.5">aktivität</div>
        </div>
      </div>
    </a>
  );
}

function PageProjects() {
  const [tab, setTab] = _useStateT("active");
  const groups = {
    active:   PROJECTS.filter(p => p.status === "active"),
    paused:   PROJECTS.filter(p => p.status === "paused"),
    archived: PROJECTS.filter(p => p.status === "archived"),
  };
  const list = groups[tab] || [];

  const Tab = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={"flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors " +
                 (tab === id ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")}>
      <span>{label}</span>
      <span className={"num-mono text-[11px] " + (tab === id ? "opacity-70" : "text-[var(--ink-soft)]")}>{groups[id].length}</span>
    </button>
  );

  return (
    <Page>
      <TopBar sub="05_Projects/" title="Projects."/>

      <div className="flex items-center justify-between mb-6 -ml-1">
        <div className="flex flex-wrap items-center gap-1">
          <Tab id="active"   label="Aktiv"/>
          <Tab id="paused"   label="Pausiert"/>
          <Tab id="archived" label="Archiv"/>
        </div>
        <button className="btn h-9"><Ic.Plus/> Neues Projekt</button>
      </div>

      {list.length === 0 ? (
        <div className="card p-10 text-center text-[var(--ink-mute)] text-[13px]">Keine Projekte in dieser Ansicht.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {list.map(p => <ProjectCard key={p.slug} p={p}/>)}
        </div>
      )}
    </Page>
  );
}

window.PageProjects = PageProjects;
