// Page 5 — Tasks (Inbox view)

const { useState: _useStateT, useMemo: _useMemoT } = React;

const PRIO_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
const STATUS_LABELS = {
  open: "offen",
  "in-progress": "in Arbeit",
  blocked: "blockiert",
  done: "erledigt",
};

function dueBucket(t, today) {
  if (!t.due) return "later";
  const d = new Date(t.due);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "week";
  return "later";
}
function bucketLabel(b) {
  return { overdue: "Überfällig", today: "Heute", week: "Diese Woche", later: "Später", none: "Ohne Datum" }[b] || b;
}

function TaskRow({ t, today }) {
  const overdue = dueBucket(t, today) === "overdue";
  const prioCls =
    t.priority === "high"   ? "bg-warn-soft" :
    t.priority === "urgent" ? "bg-bad-soft"  :
    t.priority === "medium" ? "bg-info-soft" : "";
  const statusDot =
    t.status === "blocked"     ? "text-bad" :
    t.status === "in-progress" ? "text-info" :
    t.status === "done"        ? "text-ok" : "text-[var(--ink-soft)]";

  return (
    <li className="grid grid-cols-[20px_1fr_auto] md:grid-cols-[20px_1fr_auto_auto_auto] gap-3 md:gap-4 items-center px-1 py-3 border-b hairline last:border-0">
      <button className="w-4 h-4 rounded-[5px] border hairline-2 hover:border-[var(--ink)] transition-colors" aria-label="abhaken"/>
      <div className="min-w-0">
        <div className="text-[14px] leading-snug truncate">{t.title}</div>
        <div className="flex items-center gap-2 mt-1 text-[10.5px] font-mono text-[var(--ink-mute)]">
          <span className={statusDot}><Ic.Dot/></span>
          <span>{STATUS_LABELS[t.status]}</span>
          {t.project && <a href={"#project/" + t.project} className="hover:text-[var(--ink)] transition-colors">· {t.project}</a>}
          {t.context && <span>· @{t.context}</span>}
          {t.recurrence && <span>· ↻ {t.recurrence}</span>}
        </div>
      </div>
      <span className={"pill " + prioCls} style={{ borderColor: "transparent" }}>
        {t.priority}
      </span>
      <span className={"num-mono text-[11px] tabular-nums hidden md:inline " + (overdue ? "text-bad" : "text-[var(--ink-mute)]")}>
        {t.due || "—"}
      </span>
      <button className="btn btn-ghost h-7 px-2 hidden md:inline-flex" aria-label="öffnen">
        <Ic.Arrow/>
      </button>
    </li>
  );
}

function PageTasks() {
  const [filter, setFilter] = _useStateT("active"); // active | overdue | today | week | none | all
  const [groupBy, setGroupBy] = _useStateT("due");  // due | project | priority

  const filtered = _useMemoT(() => {
    let list = TASKS_ALL;
    if (filter === "active") list = list.filter(t => t.status !== "done");
    if (filter === "overdue") list = list.filter(t => dueBucket(t, TODAY) === "overdue");
    if (filter === "today")   list = list.filter(t => dueBucket(t, TODAY) === "today");
    if (filter === "week")    list = list.filter(t => ["today","week","overdue"].includes(dueBucket(t, TODAY)));
    if (filter === "none")    list = list.filter(t => !t.due);
    return list;
  }, [filter]);

  const groups = _useMemoT(() => {
    const g = {};
    if (groupBy === "due") {
      for (const t of filtered) {
        const b = t.due ? dueBucket(t, TODAY) : "none";
        (g[b] = g[b] || []).push(t);
      }
      const order = ["overdue","today","week","later","none"];
      return order.filter(k => g[k]).map(k => ({ key: k, label: bucketLabel(k), items: g[k] }));
    }
    if (groupBy === "project") {
      for (const t of filtered) {
        const k = t.project || "—";
        (g[k] = g[k] || []).push(t);
      }
      return Object.keys(g).sort().map(k => ({ key: k, label: k === "—" ? "Ohne Projekt" : k, items: g[k] }));
    }
    // priority
    for (const t of filtered) (g[t.priority] = g[t.priority] || []).push(t);
    const order = ["urgent","high","medium","low"];
    return order.filter(k => g[k]).map(k => ({ key: k, label: k, items: g[k] }));
  }, [filtered, groupBy]);

  // sort within group by priority then due
  for (const grp of groups) {
    grp.items.sort((a,b) => (PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority]) || ((a.due||"9999") < (b.due||"9999") ? -1 : 1));
  }

  const counts = {
    all: TASKS_ALL.filter(t => t.status !== "done").length,
    overdue: TASKS_ALL.filter(t => dueBucket(t, TODAY) === "overdue" && t.status !== "done").length,
    today: TASKS_ALL.filter(t => dueBucket(t, TODAY) === "today" && t.status !== "done").length,
    week: TASKS_ALL.filter(t => ["overdue","today","week"].includes(dueBucket(t, TODAY)) && t.status !== "done").length,
    none: TASKS_ALL.filter(t => !t.due && t.status !== "done").length,
  };

  const FilterTab = ({ id, label, n }) => (
    <button onClick={() => setFilter(id)}
      className={"flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors " +
                 (filter === id ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")}>
      <span>{label}</span>
      <span className={"num-mono text-[11px] " + (filter === id ? "opacity-70" : "text-[var(--ink-soft)]")}>{n}</span>
    </button>
  );

  return (
    <Page>
      <TopBar
        sub={"Inbox · " + counts.all + " offen"}
        title="Tasks."
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-4 -ml-1">
        <FilterTab id="active"  label="Alle aktiv"   n={counts.all}/>
        <FilterTab id="overdue" label="Überfällig"   n={counts.overdue}/>
        <FilterTab id="today"   label="Heute"        n={counts.today}/>
        <FilterTab id="week"    label="Diese Woche"  n={counts.week}/>
        <FilterTab id="none"    label="Ohne Datum"   n={counts.none}/>
      </div>

      {/* Grouping toggle */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b hairline">
        <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--ink-mute)]">
          <span>gruppieren nach</span>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border hairline">
            {[["due","Datum"],["project","Projekt"],["priority","Priorität"]].map(([k,l]) => (
              <button key={k} onClick={() => setGroupBy(k)}
                className={"px-2.5 h-6 rounded-md text-[11px] transition-colors " +
                           (groupBy === k ? "bg-[var(--bg-2)] text-[var(--ink)]" : "hover:text-[var(--ink)]")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button className="btn h-8 text-[12px]"><Ic.Plus/> Neu</button>
      </div>

      {/* Groups */}
      <div className="space-y-7">
        {groups.map(grp => (
          <section key={grp.key}>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-[13px] font-semibold tracking-[-0.005em]">
                {grp.label}
                <span className="num-mono text-[11px] text-[var(--ink-mute)] ml-2 font-normal">{grp.items.length}</span>
              </h2>
              {grp.key === "overdue" && <span className="eyebrow text-bad">drift</span>}
            </div>
            <div className="card overflow-hidden">
              <ul className="px-4">
                {grp.items.map(t => <TaskRow key={t.id} t={t} today={TODAY}/>)}
              </ul>
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <div className="card p-10 text-center text-[var(--ink-mute)] text-[13px]">Keine Tasks in diesem Filter.</div>
        )}
      </div>
    </Page>
  );
}

window.PageTasks = PageTasks;
