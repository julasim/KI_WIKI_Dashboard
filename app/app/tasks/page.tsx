import { readTasks } from "@/lib/vault";
import { PRIO_DOT, PRIO_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await readTasks();
  const todayISO = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");

  const overdue = open.filter((t) => t.due && t.due < todayISO);
  const today = open.filter((t) => t.due === todayISO);
  const week = open.filter((t) => {
    if (!t.due || t.due <= todayISO) return false;
    const d = new Date(t.due);
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return d <= limit;
  });
  const noDate = open.filter((t) => !t.due);
  const later = open.filter((t) => t.due && t.due > todayISO && !week.includes(t));

  const groups = [
    { label: "Überfällig", items: overdue, color: "var(--bad)" },
    { label: "Heute", items: today },
    { label: "Diese Woche", items: week },
    { label: "Später", items: later },
    { label: "Ohne Datum", items: noDate },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Inventory</div>
        <h1 className="display text-3xl md:text-4xl">Tasks</h1>
        <div className="text-sm text-[var(--ink-mute)] mt-1 num-mono">{open.length} offen</div>
      </header>

      {groups.map((g) => (
        g.items.length > 0 && (
          <section key={g.label}>
            <div className="eyebrow mb-2" style={{ color: g.color }}>{g.label} · {g.items.length}</div>
            <div className="card divide-y hairline">
              {g.items.map((t) => (
                <div key={t.id} className="px-4 py-3 flex items-center gap-3 text-sm card-hover">
                  <span className={`shrink-0 ${PRIO_DOT[t.priority] ?? ""}`}
                        style={{ width: 8, height: 8, borderRadius: 999 }} />
                  <span className="flex-1 truncate">{t.title}</span>
                  {t.project && <span className="pill">{t.project}</span>}
                  {t.context && <span className="pill">@{t.context}</span>}
                  {t.recurrence && <span className="pill">↻ {t.recurrence}</span>}
                  {t.due && (
                    <span className="num-mono text-xs text-[var(--ink-mute)] shrink-0 w-20 text-right">
                      {t.due}
                    </span>
                  )}
                  <span className="num-mono text-[10px] text-[var(--ink-soft)] shrink-0 hidden md:inline w-12 text-right">
                    {PRIO_LABEL[t.priority]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )
      ))}

      {open.length === 0 && (
        <p className="text-sm text-[var(--ink-soft)] text-center py-12">Keine offenen Tasks.</p>
      )}
    </div>
  );
}
