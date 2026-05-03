import { readProjects, readTasks } from "@/lib/vault";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRIO_DOT } from "@/lib/utils";

export const revalidate = 60;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [projects, tasks] = await Promise.all([readProjects(), readTasks()]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const projTasks = tasks.filter((t) => t.project === slug);
  const open = projTasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const done = projTasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <Link href="/projects" className="text-xs text-[var(--ink-mute)] hover:text-[var(--ink)]">
          ← Projects
        </Link>
        <h1 className="display text-3xl md:text-4xl mt-2">{project.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="pill">{project.status}</span>
          {project.started && (
            <span className="text-xs num-mono text-[var(--ink-mute)]">
              gestartet {project.started}
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="eyebrow">Tasks total</div>
          <div className="display text-2xl mt-1 num-mono">{projTasks.length}</div>
        </div>
        <div className="card p-3">
          <div className="eyebrow">Open</div>
          <div className="display text-2xl mt-1 num-mono">{open.length}</div>
        </div>
        <div className="card p-3">
          <div className="eyebrow">Blocked</div>
          <div className="display text-2xl mt-1 num-mono">{project.taskCounts.blocked}</div>
        </div>
        <div className="card p-3">
          <div className="eyebrow">Done</div>
          <div className="display text-2xl mt-1 num-mono">{done.length}</div>
        </div>
      </section>

      <section>
        <div className="eyebrow mb-2">Offene Tasks</div>
        {open.length === 0 ? (
          <div className="card p-5 text-sm text-[var(--ink-soft)]">Keine offenen Tasks.</div>
        ) : (
          <div className="card divide-y hairline">
            {open.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                <span className={`shrink-0 ${PRIO_DOT[t.priority] ?? ""}`}
                      style={{ width: 8, height: 8, borderRadius: 999 }} />
                <span className="flex-1 truncate">{t.title}</span>
                {t.due && (
                  <span className="num-mono text-xs text-[var(--ink-mute)]">{t.due}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] num-mono text-[var(--ink-soft)]">
        Pfad: <code>05_Projects/{project.slug}/</code>
      </p>
    </div>
  );
}
