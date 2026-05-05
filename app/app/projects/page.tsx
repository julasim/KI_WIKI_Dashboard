import { readProjects, readTasks } from "@/lib/vault";
import Link from "next/link";
import { ProjectVelocity } from "@/components/charts/project-velocity";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, tasks] = await Promise.all([readProjects(), readTasks()]);
  const active = projects.filter((p) => p.status === "active");
  const paused = projects.filter((p) => p.status === "paused");
  const archived = projects.filter((p) => p.status === "archived" || p.status === "completed");

  const Section = ({ title, items }: { title: string; items: typeof projects }) =>
    items.length > 0 ? (
      <section>
        <div className="eyebrow mb-3">{title} · {items.length}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="card card-hover p-5 block"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="serif text-base">{p.title}</div>
                <span className="pill" style={{
                  borderColor: p.taskCounts.overdue > 0 ? "var(--bad)" : "var(--border-2)",
                  color: p.taskCounts.overdue > 0 ? "var(--bad)" : undefined,
                }}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs num-mono text-[var(--ink-mute)]">
                <span>open {p.taskCounts.open}</span>
                <span>WIP {p.taskCounts.inProgress}</span>
                {p.taskCounts.blocked > 0 && <span>blocked {p.taskCounts.blocked}</span>}
                {p.taskCounts.overdue > 0 && (
                  <span className="text-[var(--bad)]">overdue {p.taskCounts.overdue}</span>
                )}
              </div>
              {p.lastActivity && (
                <div className="text-[11px] num-mono text-[var(--ink-soft)] mt-2">
                  letzte Aktivität: {p.lastActivity}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    ) : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Inventory</div>
        <h1 className="display text-3xl md:text-4xl">Projects</h1>
        <div className="text-sm text-[var(--ink-mute)] mt-1 num-mono">{projects.length} total</div>
      </header>
      <Section title="Aktiv" items={active} />
      <Section title="Pausiert" items={paused} />
      <Section title="Archiv" items={archived} />

      {/* Velocity-Chart */}
      <section>
        <ProjectVelocity tasks={tasks} weeks={4} />
      </section>
    </div>
  );
}
