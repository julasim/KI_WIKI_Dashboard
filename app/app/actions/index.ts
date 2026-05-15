"use server";

/**
 * Server-Actions für Dashboard-Schreibvorgänge via MCP.
 *
 * Pattern: jede Action validiert FormData, ruft das MCP-Tool, revalidiert den
 * betroffenen Pfad damit die UI sich aktualisiert.
 *
 * Alle Actions werfen bei Fehler — der UI-Code muss <form action={...}> mit
 * try/catch oder useFormState wrappen.
 */
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  appendToDaily as mcpAppendDaily,
  createNote as mcpCreateNote,
  createTask as mcpCreateTask,
  editFile as mcpEditFile,
  goalLog as mcpGoalLog,
  taskAction as mcpTaskAction,
} from "@/lib/mcp-tools";
import type { Priority, TaskAction } from "@/lib/mcp-tools";

/**
 * Auth-Guard: jede Server-Action prüft Session bevor was passiert.
 * (Middleware schützt schon die Routes, aber bei direkter Action-URL
 * absolut sicher gehen.)
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Nicht authentifiziert.");
  }
}

// ============================================================
// 1. Quick-Add-Task
// ============================================================
export async function actionCreateTask(formData: FormData) {
  await requireAuth();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Titel fehlt.");
  const priority = (String(formData.get("priority") || "medium")) as Priority;
  const due = String(formData.get("due") || "").trim() || null;
  const context = String(formData.get("context") || "").trim() || null;
  const project = String(formData.get("project") || "").trim() || null;
  const recurrence =
    (String(formData.get("recurrence") || "").trim() || null) as
      | "daily"
      | "weekdays"
      | "weekly"
      | "monthly"
      | null;

  const result = await mcpCreateTask({
    title,
    priority,
    due,
    context,
    project,
    recurrence,
  });
  revalidatePath("/tasks");
  revalidatePath("/");
  return result;
}

// ============================================================
// 2. Quick-Add-Note
// ============================================================
export async function actionCreateNote(formData: FormData) {
  await requireAuth();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Titel fehlt.");
  const body = String(formData.get("body") || "");
  const project = String(formData.get("project") || "").trim() || null;
  const tagsRaw = String(formData.get("tags") || "");
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const result = await mcpCreateNote({ title, body, project, tags });
  revalidatePath("/");
  if (project) revalidatePath(`/projects/${project}`);
  return result;
}

// ============================================================
// 3. Tagebuch-Append
// ============================================================
export async function actionAppendDaily(formData: FormData) {
  await requireAuth();
  const text = String(formData.get("text") || "").trim();
  if (!text) throw new Error("Text fehlt.");
  const section = String(formData.get("section") || "Notizen & Gedanken");
  const date = String(formData.get("date") || "").trim() || undefined;

  const result = await mcpAppendDaily(text, section, date);
  revalidatePath("/");
  return result;
}

// ============================================================
// 4. Task-Status-Toggle
// ============================================================
export async function actionTaskToggle(taskId: string, currentStatus: string) {
  await requireAuth();
  const action: TaskAction = currentStatus === "done" ? "reopen" : "done";
  const result = await mcpTaskAction(taskId, action);
  revalidatePath("/tasks");
  revalidatePath("/");
  return result;
}

// ============================================================
// 5. Goal-Log
// ============================================================
export async function actionGoalLog(formData: FormData) {
  await requireAuth();
  const goal = String(formData.get("goal") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const subtype = String(formData.get("subtype") || "tracker").trim();
  if (!goal || !text) throw new Error("goal + text sind Pflicht.");

  const result = await mcpGoalLog(goal, text, subtype);
  revalidatePath("/goals");
  return result;
}

// ============================================================
// 6. Daily-FM-Update (Energy / Mood / Insight)
// ============================================================
export async function actionUpdateDailyFM(formData: FormData) {
  await requireAuth();
  const date = String(formData.get("date") || "").trim();
  if (!date) throw new Error("date fehlt.");
  const energy = String(formData.get("energy") || "").trim();
  const mood = String(formData.get("mood") || "").trim();
  const key_insight = String(formData.get("key_insight") || "").trim();

  // Leere Felder als null → MCP edit_file entfernt das Feld via FM-merge
  const updates: Record<string, unknown> = {
    energy: energy ? Number(energy) : null,
    mood: mood ? Number(mood) : null,
    key_insight: key_insight || null,
  };

  const result = await mcpEditFile(`10_Life/daily/${date}.md`, {
    frontmatter_updates: updates,
  });
  revalidatePath("/");
  return result;
}

// ============================================================
// 7. Win loggen (Quick-Add zu Wins-Tracker)
// ============================================================
export async function actionLogWin(formData: FormData) {
  await requireAuth();
  const text = String(formData.get("text") || "").trim();
  if (!text) throw new Error("Text fehlt.");
  // Wins werden per goal_log ins 5y-2031/wins.md getrackt (Schema-Konvention)
  const result = await mcpGoalLog("5y-2031", `- ${text}`, "tracker/wins");
  revalidatePath("/wins");
  revalidatePath("/");
  return result;
}
