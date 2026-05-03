"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Task } from "@/lib/vault";
import { cn, PRIO_DOT, PRIO_LABEL } from "@/lib/utils";

const PRIO_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

type DueBucket = "overdue" | "today" | "week" | "later" | "none";

function dueBucket(t: Task, todayISO: string): DueBucket {
  if (!t.due) return "none";
  if (t.due < todayISO) return "overdue";
  if (t.due === todayISO) return "today";
  const diff = (new Date(t.due).getTime() - new Date(todayISO).getTime()) / 86400_000;
  if (diff <= 7) return "week";
  return "later";
}

const BUCKET_LABEL: Record<DueBucket, string> = {
  overdue: "Überfällig",
  today: "Heute",
  week: "Diese Woche",
  later: "Später",
  none: "Ohne Datum",
};

type FilterStatus = "active" | "overdue" | "today" | "week" | "none";
type GroupBy = "due" | "project" | "priority";

export function TasksView({ tasks }: { tasks: Task[] }) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [filter, setFilter] = useState<FilterStatus>("active");
  const [groupBy, setGroupBy] = useState<GroupBy>("due");

  // Counters für Filter-Tabs
  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
    return {
      active: open.length,
      overdue: open.filter((t) => dueBucket(t, todayISO) === "overdue").length,
      today: open.filter((t) => dueBucket(t, todayISO) === "today").length,
      week: open.filter((t) => ["overdue", "today", "week"].includes(dueBucket(t, todayISO))).length,
      none: open.filter((t) => !t.due).length,
    };
  }, [tasks, todayISO]);

  // Apply Status-Filter
  const filtered = useMemo(() => {
    let list = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
    if (filter === "overdue") list = list.filter((t) => dueBucket(t, todayISO) === "overdue");
    if (filter === "today") list = list.filter((t) => dueBucket(t, todayISO) === "today");
    if (filter === "week") list = list.filter((t) => ["overdue", "today", "week"].includes(dueBucket(t, todayISO)));
    if (filter === "none") list = list.filter((t) => !t.due);
    return list;
  }, [tasks, todayISO, filter]);

  // Group + sort
  const groups = useMemo(() => {
    const g: Record<string, Task[]> = {};
    if (groupBy === "due") {
      for (const t of filtered) {
        const b = dueBucket(t, todayISO);
        (g[b] = g[b] || []).push(t);
      }
      const order: DueBucket[] = ["overdue", "today", "week", "later", "none"];
      return order
        .filter((k) => g[k])
        .map((k) => ({ key: k, label: BUCKET_LABEL[k], items: g[k] }));
    }
    if (groupBy === "project") {
      for (const t of filtered) {
        const k = t.project || "__none__";
        (g[k] = g[k] || []).push(t);
      }
      return Object.keys(g)
        .sort((a, b) => (a === "__none__" ? 1 : b === "__none__" ? -1 : a.localeCompare(b)))
        .map((k) => ({ key: k, label: k === "__none__" ? "Ohne Projekt" : k, items: g[k] }));
    }
    // priority
    for (const t of filtered) {
      (g[t.priority] = g[t.priority] || []).push(t);
    }
    const order = ["urgent", "high", "medium", "low"];
    return order
      .filter((k) => g[k])
      .map((k) => ({ key: k, label: PRIO_LABEL[k] ?? k, items: g[k] }));
  }, [filtered, groupBy, todayISO]);

  // Sort within group
  for (const grp of groups) {
    grp.items.sort((a, b) =>
      (PRIO_ORDER[a.priority] ?? 9) - (PRIO_ORDER[b.priority] ?? 9) ||
      ((a.due || "9999") < (b.due || "9999") ? -1 : 1),
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Inventory · {counts.active} offen</div>
        <h1 className="display text-3xl md:text-4xl">Tasks</h1>
      </header>

      {/* Filter-Tabs (Status) */}
      <div className="flex flex-wrap gap-1">
        {([
          ["active", "Alle aktiv", counts.active],
          ["overdue", "Überfällig", counts.overdue],
          ["today", "Heute", counts.today],
          ["week", "Diese Woche", counts.week],
          ["none", "Ohne Datum", counts.none],
        ] as const).map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] font-medium transition-colors",
              filter === id
                ? "bg-[var(--ink)] text-[var(--bg)]"
                : "text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
            )}
          >
            <span>{label}</span>
            <span className={cn("num-mono text-[11px]", filter === id ? "opacity-70" : "text-[var(--ink-soft)]")}>{n}</span>
          </button>
        ))}
      </div>

      {/* Gruppieren-Toggle */}
      <div className="flex items-center justify-end gap-2 text-[12px] text-[var(--ink-mute)] pb-4 border-b hairline">
        <span className="num-mono">gruppieren:</span>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg border hairline">
          {(
            [
              ["due", "Datum"],
              ["project", "Projekt"],
              ["priority", "Priorität"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setGroupBy(k)}
              className={cn(
                "px-2.5 h-6 rounded-md text-[11px] transition-colors",
                groupBy === k
                  ? "bg-[var(--bg-2)] text-[var(--ink)]"
                  : "hover:text-[var(--ink)] text-[var(--ink-mute)]",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="text-xs text-[var(--ink-mute)] num-mono -mt-2">
        {filtered.length} {filtered.length === 1 ? "Task" : "Tasks"} angezeigt
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.length === 0 ? (
          <div className="card p-10 text-center text-sm text-[var(--ink-soft)]">
            Keine Tasks in diesem Filter.
          </div>
        ) : (
          groups.map((grp) => (
            <section key={grp.key}>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-[13px] font-semibold">
                  {grp.label}
                  <span className="num-mono text-[11px] text-[var(--ink-mute)] ml-2 font-normal">
                    {grp.items.length}
                  </span>
                </h2>
                {grp.key === "overdue" && <span className="eyebrow text-bad">drift</span>}
              </div>
              <div className="card divide-y hairline overflow-hidden">
                {grp.items.map((t) => (
                  <div key={t.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                    <span
                      className={cn("shrink-0", PRIO_DOT[t.priority] ?? "")}
                      style={{ width: 8, height: 8, borderRadius: 999 }}
                    />
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.project && (
                      <Link
                        href={`/projects/${t.project}`}
                        className="pill hover:border-[var(--ink)] transition-colors"
                      >
                        {t.project}
                      </Link>
                    )}
                    {t.context && <span className="pill">@{t.context}</span>}
                    {t.recurrence && <span className="pill">↻ {t.recurrence}</span>}
                    {t.due && (
                      <span
                        className={cn(
                          "num-mono text-xs shrink-0 w-20 text-right",
                          dueBucket(t, todayISO) === "overdue" ? "text-[var(--bad)]" : "text-[var(--ink-mute)]",
                        )}
                      >
                        {t.due}
                      </span>
                    )}
                    <span className="num-mono text-[10px] text-[var(--ink-soft)] shrink-0 hidden md:inline w-12 text-right">
                      {PRIO_LABEL[t.priority] ?? t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
