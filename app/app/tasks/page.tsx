import { readTasks } from "@/lib/vault";
import { TasksView } from "./tasks-view";
import { TasksBurndown } from "@/components/charts/tasks-burndown";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await readTasks();
  return (
    <div className="space-y-6">
      <TasksView tasks={tasks} />
      <TasksBurndown tasks={tasks} />
    </div>
  );
}
