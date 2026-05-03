import { readTasks } from "@/lib/vault";
import { TasksView } from "./tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await readTasks();
  return <TasksView tasks={tasks} />;
}
