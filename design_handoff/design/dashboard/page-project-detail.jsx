// Page 7 — Project Detail (05_Projects/<slug>/)

function ProjectTaskRow({ t }) {
  const overdue = dueBucket(t, TODAY) === "overdue";
  const statusDot =
    t.status === "blocked"     ? "text-bad" :
    t.status === "in-progress" ? "text-info" :
    t.status === "done"        ? "text-ok" : "text-[var(--ink-soft)]";
  return (
    <li className="flex items-center gap-3 px-1 py-2.5 border-b hairline last:border-0">
      <button className="w-4 h-4 rounded-[5px] border hairline-2 hover:border-[var(--ink)] shrink-0" aria-label="abhaken"/>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] leading-snug truncate">{t.title}</div>
        <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono text-[var(--ink-mute)]">
          <span className={statusDot}><Ic.Dot/></span>
          <span>{STATUS_LABELS[t.status]}</span>
          {t.context && <span>· @{t.context}</span>}
        </div>
      </div>
      <span className={"num-mono text-[11px] tabular-nums " + (overdue ? "text-bad" : "text-[var(--ink-mute)]")}>
        {t.due || "—"}
      </span>
    </li>
  );
}

function FileLink({ icon = "Doc", date, title, path }) {
  const Icon = Ic[icon];
  return (
    <a href="#" className="flex items-start gap-3 px-1 py-2.5 border-b hairline last:border-0 hover:bg-[var(--surface-2)] -mx-3 px-3 rounded-md transition-colors">
      <span className="mt-0.5 text-[var(--ink-soft)]"><Icon/></span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] leading-snug truncate">{title}</div>
        <div className="text-[10.5px] font-mono text-[var(--ink-mute)] mt-0.5">{date} · {path}</div>
      </div>
      <span className="text-[var(--ink-soft)] mt-0.5"><Ic.Arrow/></span>
    </a>
  );
}

function PageProjectDetail({ slug }) {
  const p = PROJECTS.find(x => x.slug === slug);
  if (!p) {
    return (
      <Page>
        <TopBar sub="404" title="Projekt nicht gefunden."/>
        <a href="#projects" className="btn"><Ic.ArrowLeft/> Zurück</a>
      </Page>
    );
  }

  const tasks   = TASKS_ALL.filter(t => t.project === slug);
  const open    = tasks.filter(t => t.status !== "done");
  const blocked = tasks.filter(t => t.status === "blocked");
  const overdue = tasks.filter(t => t.status !== "done" && dueBucket(t, TODAY) === "overdue");

  return (
    <Page>
      <a href="#projects" className="inline-flex items-center gap-2 text-[12px] font-mono text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors mb-5">
        <Ic.ArrowLeft/> alle Projekte
      </a>

      <header className="mb-8 md:mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="eyebrow">{p.slug}</span>
          <StatusPill s={p.status}/>
          {p.parent && <span className="text-[11px] font-mono text-[var(--ink-mute)]">↳ untergeordnet zu <a href={"#project/"+p.parent} className="hover:text-[var(--ink)]">{p.parent}</a></span>}
        </div>
        <h1 className="serif text-[34px] md:text-[44px] leading-[1.05] mb-4">{p.title}</h1>
        <p className="text-[15px] md:text-[16px] text-[var(--ink-2)] leading-relaxed max-w-[680px]">{p.summary}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {p.tags.map(t => <span key={t} className="pill">#{t}</span>)}
        </div>
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
        <div className="card p-5">
          <div className="eyebrow mb-2">Offen</div>
          <div className="num-mono text-[28px] leading-none">{open.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Drift</div>
          <div className={"num-mono text-[28px] leading-none " + (overdue.length ? "text-bad" : "")}>{overdue.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Blockiert</div>
          <div className={"num-mono text-[28px] leading-none " + (blocked.length ? "text-warn" : "")}>{blocked.length}</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow mb-2">Gestartet</div>
          <div className="num-mono text-[16px] mt-2">{p.started}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 md:gap-6">

        {/* Tasks */}
        <section className="card p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold">Tasks</h3>
            <span className="eyebrow">{open.length} offen</span>
          </div>
          {open.length === 0 ? (
            <div className="text-[13px] text-[var(--ink-mute)] py-6 text-center">Alles erledigt.</div>
          ) : (
            <ul className="px-1">
              {open.sort((a,b) => (PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority])).map(t => <ProjectTaskRow key={t.id} t={t}/>)}
            </ul>
          )}
        </section>

        {/* Notes & meetings */}
        <aside className="space-y-5 md:space-y-6">
          <section className="card p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold">Notes</h3>
              <span className="eyebrow">{p.notes.length}</span>
            </div>
            {p.notes.length === 0 ? (
              <div className="text-[13px] text-[var(--ink-mute)] py-4 text-center">Noch keine Notes.</div>
            ) : (
              <div>
                {p.notes.map((n, i) => <FileLink key={i} {...n}/>)}
              </div>
            )}
          </section>

          <section className="card p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold">Meetings</h3>
              <span className="eyebrow">{p.meetings.length}</span>
            </div>
            {p.meetings.length === 0 ? (
              <div className="text-[13px] text-[var(--ink-mute)] py-4 text-center">Keine Meetings.</div>
            ) : (
              <div>
                {p.meetings.map((m, i) => <FileLink key={i} icon="Calendar" {...m}/>)}
              </div>
            )}
          </section>

          <section className="card p-5 md:p-6">
            <div className="eyebrow mb-2">Vault-Pfad</div>
            <code className="text-[12px] font-mono text-[var(--ink-2)] block leading-relaxed">
              05_Projects/<br/>
              <span className="text-[var(--ink)]">{p.slug}/</span>README.md
            </code>
          </section>
        </aside>
      </div>
    </Page>
  );
}

window.PageProjectDetail = PageProjectDetail;
