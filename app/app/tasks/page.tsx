import { readTasks, readProjects } from "@/lib/vault";
import { TasksView } from "./tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([readTasks(), readProjects()]);
  const projectSlugs = projects.map((p) => p.slug).sort();
  return <TasksView tasks={tasks} projectSlugs={projectSlugs} />;
}
