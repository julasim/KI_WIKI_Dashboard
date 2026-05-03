import {
  readProjects,
  readTasks,
  readProjectNotes,
  readProjectMeetings,
} from "@/lib/vault";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetailTabs } from "./detail-tabs";
import { PRIO_DOT, PRIO_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [projects, tasks, notes, meetings] = await Promise.all([
    readProjects(),
    readTasks(),
    readProjectNotes(slug),
    readProjectMeetings(slug),
  ]);
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
            <span className="text-xs num-mono text-[var(--ink-mute)]">gestartet {project.started}</span>
          )}
          {project.parent && (
            <span className="text-xs num-mono text-[var(--ink-mute)]">
              ↳ Subprojekt von <Link className="hover:text-[var(--ink)]" href={`/projects/${project.parent}`}>{project.parent}</Link>
            </span>
          )}
        </div>
      </header>

      {/* Stats */}
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
          <div className="eyebrow">Done</div>
          <div className="display text-2xl mt-1 num-mono">{done.length}</div>
        </div>
        <div className="card p-3">
          <div className="eyebrow">Notes / Meetings</div>
          <div className="display text-2xl mt-1 num-mono">
            {notes.length} / {meetings.length}
          </div>
        </div>
      </section>

      {/* Tabs: Tasks / Notes / Meetings */}
      <ProjectDetailTabs
        tasks={open.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          due: t.due,
          status: t.status,
          context: t.context,
          recurrence: t.recurrence,
          prioDot: PRIO_DOT[t.priority] ?? "",
          prioLabel: PRIO_LABEL[t.priority] ?? t.priority,
        }))}
        notes={notes}
        meetings={meetings}
      />

      <p className="text-[11px] num-mono text-[var(--ink-soft)]">
        Pfad: <code>05_Projects/{project.slug}/</code>
      </p>
    </div>
  );
}
