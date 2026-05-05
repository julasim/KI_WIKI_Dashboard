/**
 * Typed Wrappers für die MCP-Tools die das Dashboard verwendet.
 * Alle Calls landen im Audit-Log + Snapshot-System des MCP-Servers.
 */
import { mcpCall } from "./mcp-client";

// ===== Task-Operations =====

export type Priority = "urgent" | "high" | "medium" | "low";

export interface CreateTaskInput {
  title: string;
  priority?: Priority;
  due?: string | null;
  context?: string | null;
  project?: string | null;
  body?: string;
  recurrence?: "daily" | "weekdays" | "weekly" | "monthly" | null;
}

export interface CreateTaskResult {
  path: string;
  id: string;
}

export async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  return mcpCall<CreateTaskResult>("create_task", {
    title: input.title,
    priority: input.priority ?? "medium",
    due: input.due || null,
    context: input.context || null,
    project: input.project || null,
    body: input.body || "",
    recurrence: input.recurrence || null,
  });
}

export type TaskAction = "done" | "reopen" | "snooze" | "edit";

export async function taskAction(
  id: string,
  action: TaskAction,
  opts: { snooze_until?: string; due?: string; priority?: Priority; body?: string } = {},
): Promise<{ path: string; id: string; status: string; action_applied: string }> {
  return mcpCall("task", { id, action, ...opts });
}

// ===== Note-Operations =====

export interface CreateNoteInput {
  title: string;
  body?: string;
  project?: string | null;
  tags?: string[];
  subpath?: string;
}

export async function createNote(
  input: CreateNoteInput,
): Promise<{ path: string; id: string; created: string }> {
  return mcpCall("create_note", {
    title: input.title,
    body: input.body || "",
    project: input.project || null,
    tags: input.tags || [],
    subpath: input.subpath || "notes",
  });
}

// ===== Daily =====

export async function appendToDaily(
  text: string,
  section: string = "Notizen & Gedanken",
  date?: string,
): Promise<{ path: string; section: string }> {
  return mcpCall("append_to_daily", {
    text,
    section,
    ...(date ? { date } : {}),
  });
}

// ===== File-Edit =====

export async function editFile(
  path: string,
  updates: { frontmatter_updates?: Record<string, unknown>; body?: string },
): Promise<{ path: string; frontmatter: Record<string, unknown>; body_preview: string }> {
  return mcpCall("edit_file", {
    path,
    ...(updates.frontmatter_updates ? { frontmatter_updates: updates.frontmatter_updates } : {}),
    ...(updates.body !== undefined ? { body: updates.body } : {}),
  });
}

// ===== Goal-Log =====

export async function goalLog(
  goal: string,
  text: string,
  subtype: string = "tracker",
  date?: string,
): Promise<{ path: string; appended: string }> {
  return mcpCall("goal_log", {
    goal,
    text,
    subtype,
    ...(date ? { date } : {}),
  });
}

// ===== Briefing (Read, aber nützlich für Server-Components) =====

export interface BriefingTask {
  id: string;
  title: string;
  status: string;
  priority: Priority;
  due: string | null;
  project: string | null;
  context: string | null;
  recurrence?: string | null;
  last_completed?: string | null;
  path: string;
}

export interface DailyBriefing {
  date: string;
  overdue: BriefingTask[];
  today: BriefingTask[];
  upcoming_3d: BriefingTask[];
  inbox: BriefingTask[];
  recently_done: BriefingTask[];
  daily_path: string;
  daily_exists: boolean;
  summary: {
    overdue_count: number;
    today_count: number;
    upcoming_count: number;
    inbox_count: number;
    recently_done_count: number;
  };
}

export async function dailyBriefing(date?: string): Promise<DailyBriefing> {
  return mcpCall("daily_briefing", date ? { date } : {});
}
