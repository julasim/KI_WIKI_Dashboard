"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProjectNote, ProjectMeeting } from "@/lib/vault";

type TaskRow = {
  id: string;
  title: string;
  priority: string;
  due?: string;
  status: string;
  context?: string;
  recurrence?: string;
  prioDot: string;
  prioLabel: string;
};

type Tab = "tasks" | "notes" | "meetings";

export function ProjectDetailTabs({
  tasks,
  notes,
  meetings,
}: {
  tasks: TaskRow[];
  notes: ProjectNote[];
  meetings: ProjectMeeting[];
}) {
  const [tab, setTab] = useState<Tab>("tasks");

  return (
    <div className="space-y-4">
      {/* Tab-Bar */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg border hairline w-fit">
        {(
          [
            ["tasks", `Tasks (${tasks.length})`],
            ["notes", `Notes (${notes.length})`],
            ["meetings", `Meetings (${meetings.length})`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "px-3 h-7 rounded-md text-[12px] transition-colors",
              tab === k
                ? "bg-[var(--bg-2)] text-[var(--ink)]"
                : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {tab === "tasks" && (
        <div>
          {tasks.length === 0 ? (
            <div className="card p-6 text-sm text-[var(--ink-soft)] text-center">
              Keine offenen Tasks.
            </div>
          ) : (
            <div className="card divide-y hairline overflow-hidden">
              {tasks.map((t) => (
                <div key={t.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                  <span className={cn("shrink-0", t.prioDot)}
                        style={{ width: 8, height: 8, borderRadius: 999 }} />
                  <span className="flex-1 truncate">{t.title}</span>
                  {t.context && <span className="pill">@{t.context}</span>}
                  {t.recurrence && <span className="pill">↻ {t.recurrence}</span>}
                  {t.due && (
                    <span className="num-mono text-xs text-[var(--ink-mute)] shrink-0 w-20 text-right">
                      {t.due}
                    </span>
                  )}
                  <span className="num-mono text-[10px] text-[var(--ink-soft)] shrink-0 hidden md:inline w-12 text-right">
                    {t.prioLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="card p-6 text-sm text-[var(--ink-soft)] text-center">
              Keine Notes vorhanden.
            </div>
          ) : (
            notes.map((n) => (
              <details key={n.id} className="card p-4 group">
                <summary className="cursor-pointer flex items-center gap-2 list-none">
                  <span className="text-[var(--ink-soft)] text-xs group-open:rotate-90 transition-transform">▶</span>
                  <div className="flex-1 min-w-0">
                    <div className="serif text-base truncate">{n.title}</div>
                    {n.subpath && n.subpath !== "notes" && (
                      <div className="text-[10px] num-mono text-[var(--ink-soft)] mt-0.5">
                        {n.subpath}/
                      </div>
                    )}
                  </div>
                  {n.date && (
                    <span className="num-mono text-[11px] text-[var(--ink-mute)] shrink-0">{n.date}</span>
                  )}
                </summary>
                {n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {n.tags.map((t) => (
                      <span key={t} className="pill">#{t}</span>
                    ))}
                  </div>
                )}
                <div
                  className="prose-vault mt-4"
                  dangerouslySetInnerHTML={{ __html: n.bodyHtml }}
                />
              </details>
            ))
          )}
        </div>
      )}

      {/* Meetings */}
      {tab === "meetings" && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <div className="card p-6 text-sm text-[var(--ink-soft)] text-center">
              Keine Meetings vorhanden.
            </div>
          ) : (
            meetings.map((m) => (
              <details key={m.id} className="card p-4 group">
                <summary className="cursor-pointer flex items-center gap-2 list-none">
                  <span className="text-[var(--ink-soft)] text-xs group-open:rotate-90 transition-transform">▶</span>
                  <span className="serif text-base flex-1">{m.title}</span>
                  {m.date && (
                    <span className="num-mono text-[11px] text-[var(--ink-mute)]">{m.date}</span>
                  )}
                </summary>
                {m.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 text-xs text-[var(--ink-mute)]">
                    <span>mit:</span>
                    {m.attendees.map((a, i) => (
                      <span key={i} className="pill">{a}</span>
                    ))}
                  </div>
                )}
                <div
                  className="prose-vault mt-4"
                  dangerouslySetInnerHTML={{ __html: m.bodyHtml }}
                />
              </details>
            ))
          )}
        </div>
      )}
    </div>
  );
}
