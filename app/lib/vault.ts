/**
 * Vault-Reader für KI-OS Personal-OS-Vault.
 *
 * Liest Markdown + YAML-Frontmatter direkt vom Filesystem (read-only).
 * Schema entspricht der ECHTEN Vault-Struktur (keine Per-Tag-Files für
 * Habits/Sport — wir parsen Markdown-Tabellen aus Single-Files).
 *
 * Mapping Real-Vault ↔ Reader-Output siehe README.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const VAULT_PATH = process.env.VAULT_PATH ?? "/vault";
const GOAL_SLUG = "5y-2031";
const GOAL_BASE = join(VAULT_PATH, "10_Life", "goals", GOAL_SLUG);

// ─── Types ──────────────────────────────────────────────────

export type HabitStatus = "ok" | "bad" | "skip";
export const HABIT_KEYS = [
  { key: "sport", label: "Sport", target: "3-5 km" },
  { key: "lesen", label: "Lesen", target: "30 min" },
  { key: "schlaf", label: "Schlaf", target: "7+ h" },
  { key: "bildschirm", label: "Bildschirm", target: "< 22:30" },
  { key: "vision", label: "Vision", target: "1× lesen" },
  { key: "wasser", label: "Wasser", target: "2 L" },
] as const;
export type HabitKey = (typeof HABIT_KEYS)[number]["key"];
export type HabitDay = { date: string; values: Partial<Record<HabitKey, HabitStatus>> };

export type SportSession = { date: string; art: "cardio" | "kraft"; dauer: number; notiz: string };

export type Win = { date: string; saeule: string | null; text: string };

export type Book = {
  num?: number;
  title: string;
  author?: string;
  status: "aktiv" | "geplant" | "abgeschlossen";
  start?: string;
  ende?: string;
  score?: number;
  lesson?: string;
  schwerpunkt?: string;
};

export type Saeule = {
  slug: string;
  label: string;
  status: "ok" | "warn" | "bad" | "info";
  kpi: string;
  drift: number;
  note: string;
  lastUpdate?: string;
};

export type Task = {
  id: string;
  title: string;
  status: "open" | "in-progress" | "blocked" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due?: string;
  project?: string;
  context?: string;
  tags: string[];
  recurrence?: string;
  overdue?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  status: "active" | "paused" | "archived" | "completed";
  started?: string;
  parent?: string;
  tags: string[];
  taskCounts: { open: number; inProgress: number; blocked: number; overdue: number };
  lastActivity?: string;
};

export type Reminder = {
  id: string;
  fire_at: string;
  message: string;
  recurrence?: string;
};

export type DriftStatus = {
  weekly?: string;
  monthly?: string;
  quarterly?: string;
};

// ─── Helpers ────────────────────────────────────────────────

const safeReadFile = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
};

const safeReadDir = async (path: string): Promise<string[]> => {
  try {
    return await readdir(path);
  } catch {
    return [];
  }
};

const todayISO = (): string => new Date().toISOString().slice(0, 10);

// ─── Vision ─────────────────────────────────────────────────

export async function readVision(): Promise<string> {
  const raw = await safeReadFile(join(GOAL_BASE, "vision.md"));
  if (!raw) return "";
  // Manifesto-Block: > **...** (s-flag via [\s\S]-Trick statt /s)
  const m = raw.match(/>\s*\*\*([\s\S]+?)\*\*/);
  if (!m) return "";
  return m[1]
    .replace(/\n>\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Habits ─────────────────────────────────────────────────

/**
 * Liest tracker/habits.md — Markdown-Tabelle mit Datum-Zeilen.
 * Spalten: Sport | Lesen | Schlaf | Bildschirm | Vision | Wasser
 * Werte: ✓ → "ok", ✗ → "bad", - → "skip"
 *
 * Returns: letzte 30 Tage absteigend bis heute, fehlende Tage als alle "skip".
 */
export async function readHabits(days = 30): Promise<HabitDay[]> {
  const raw = await safeReadFile(join(GOAL_BASE, "tracker", "habits.md"));
  if (!raw) return [];
  const rows: Map<string, HabitDay> = new Map();
  for (const line of raw.split("\n")) {
    const m = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|(.+)\|$/);
    if (!m) continue;
    const cells = m[2].split("|").map((c) => c.trim());
    const values: Partial<Record<HabitKey, HabitStatus>> = {};
    HABIT_KEYS.forEach((h, i) => {
      const c = cells[i] ?? "";
      values[h.key] = c === "✓" ? "ok" : c === "✗" ? "bad" : "skip";
    });
    rows.set(m[1], { date: m[1], values });
  }
  // Build last N days, fill missing as all-skip
  const out: HabitDay[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(rows.get(key) ?? { date: key, values: {} });
  }
  return out;
}

// ─── Sport ──────────────────────────────────────────────────

/**
 * Liest tracker/sport-log.md — Tabelle: Datum | Art | Dauer | Notiz.
 */
export async function readSportSessions(): Promise<SportSession[]> {
  const raw = await safeReadFile(join(GOAL_BASE, "tracker", "sport-log.md"));
  if (!raw) return [];
  const out: SportSession[] = [];
  for (const line of raw.split("\n")) {
    const m = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(cardio|kraft)\s*\|\s*(\d+)\s*\|\s*(.*?)\s*\|$/);
    if (!m) continue;
    out.push({ date: m[1], art: m[2] as "cardio" | "kraft", dauer: parseInt(m[3], 10), notiz: m[4] });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Aggregiert Sport-Sessions in Wochen-Buckets (cardio + kraft separat).
 */
export function aggregateSportWeeks(
  sessions: SportSession[],
  weeks = 12,
): { week: string; cardio: number; kraft: number }[] {
  const today = new Date();
  // Montag dieser Woche
  const mondayThis = new Date(today);
  const dow = (today.getDay() + 6) % 7; // Mo=0
  mondayThis.setDate(today.getDate() - dow);
  mondayThis.setHours(0, 0, 0, 0);

  const out: { week: string; cardio: number; kraft: number }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const wkStart = new Date(mondayThis);
    wkStart.setDate(mondayThis.getDate() - w * 7);
    const wkEnd = new Date(wkStart);
    wkEnd.setDate(wkStart.getDate() + 7);
    const wkLabel = isoWeek(wkStart);
    let cardio = 0;
    let kraft = 0;
    for (const s of sessions) {
      const d = new Date(s.date);
      if (d >= wkStart && d < wkEnd) {
        if (s.art === "cardio") cardio++;
        else if (s.art === "kraft") kraft++;
      }
    }
    out.push({ week: wkLabel, cardio, kraft });
  }
  return out;
}

function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `KW ${weekNo}`;
}

// ─── Wins ───────────────────────────────────────────────────

/**
 * Liest tracker/wins.md — Datums-Sektionen mit Bullets.
 *   ## 2026-05-02
 *   - Win 1
 *   - Win 2
 */
export async function readWins(): Promise<Win[]> {
  const raw = await safeReadFile(join(GOAL_BASE, "tracker", "wins.md"));
  if (!raw) return [];
  const out: Win[] = [];
  let currentDate: string | null = null;
  for (const line of raw.split("\n")) {
    const dm = line.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
    if (dm) {
      currentDate = dm[1];
      continue;
    }
    if (!currentDate) continue;
    const bm = line.match(/^-\s+(.+)/);
    if (bm) {
      out.push({ date: currentDate, saeule: null, text: bm[1].trim() });
    }
  }
  return out;
}

// ─── Books / Lesen ──────────────────────────────────────────

/**
 * Liest tracker/lesen.md mit 3 Markdown-Tabellen-Sektionen:
 *   ## Aktiv | ## Geplant | ## Abgeschlossen
 */
export async function readBooks(): Promise<Book[]> {
  const raw = await safeReadFile(join(GOAL_BASE, "tracker", "lesen.md"));
  if (!raw) return [];
  const out: Book[] = [];
  const sections = raw.split(/^##\s+/m);
  for (const section of sections) {
    const titleMatch = section.match(/^(Aktiv|Geplant|Abgeschlossen)/i);
    if (!titleMatch) continue;
    const status = titleMatch[1].toLowerCase() as Book["status"];
    for (const line of section.split("\n")) {
      // Match Tabellen-Zeilen (mit | und mind. 2 Pipes), aber NICHT Header (--|--)
      if (!line.startsWith("|") || line.includes("---")) continue;
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length < 2 || !cells[0] || cells[0] === "#") continue;
      // Geplant-Format: einfacher Name als 1. Spalte oder Titel-Liste
      const num = parseInt(cells[0], 10);
      out.push({
        num: isNaN(num) ? undefined : num,
        title: (cells[1] ?? cells[0]) || "(?)",
        author: cells[2],
        start: cells[4],
        ende: cells[5],
        lesson: cells[cells.length - 1],
        status,
      });
    }
    // Geplant ist Liste (- Bullet) nicht Tabelle
    if (status === "geplant") {
      for (const line of section.split("\n")) {
        const bm = line.match(/^-\s+\*?(.+?)\*?\s*(?:—|-)\s*(.+?)$/);
        if (bm) {
          out.push({ title: bm[1].trim(), author: bm[2].trim(), status: "geplant" });
        }
      }
    }
  }
  return out;
}

// ─── Säulen ─────────────────────────────────────────────────

/**
 * Liest säulen.md (oder readme.md mit Säulen-Tabelle). Heuristik weil
 * Format flexibel ist.
 */
export async function readSaeulen(): Promise<Saeule[]> {
  const raw = await safeReadFile(join(GOAL_BASE, "readme.md"));
  if (!raw) return [];
  const m = raw.match(/\|\s*Säule\s*\|\s*Status\s*\|\s*Nächster Anker\s*\|[^\n]*\n((?:\|[^\n]*\|\n)+)/);
  if (!m) return [];
  const out: Saeule[] = [];
  for (const row of m[1].trim().split("\n")) {
    const cells = row.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    if (cells.every((c) => /^-+$/.test(c))) continue; // Header-Separator
    out.push({
      slug: cells[0].toLowerCase(),
      label: cells[0],
      status: "info",
      kpi: cells[1] ?? "",
      drift: 0,
      note: cells[2] ?? "",
    });
  }
  return out;
}

// ─── Drift-Detector ─────────────────────────────────────────

export async function readDrift(): Promise<DriftStatus> {
  const raw = await safeReadFile(join(GOAL_BASE, "readme.md"));
  if (!raw) return {};
  const out: DriftStatus = {};
  for (const [label, key] of [
    ["Letzter Wochen-Anker", "weekly"],
    ["Letzter Monats-Anker", "monthly"],
    ["Letzter Quartals-Anker", "quarterly"],
  ] as const) {
    const m = raw.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\d-]+|—)`));
    if (m) out[key] = m[1];
  }
  return out;
}

// ─── Tasks ──────────────────────────────────────────────────

export async function readTasks(): Promise<Task[]> {
  const tasksDir = join(VAULT_PATH, "10_Life", "tasks");
  const files = await safeReadDir(tasksDir);
  const today = todayISO();
  const out: Task[] = [];
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const raw = await safeReadFile(join(tasksDir, f));
    if (!raw) continue;
    try {
      const parsed = matter(raw);
      const meta = parsed.data;
      out.push({
        id: meta.id ?? f.replace(/\.md$/, ""),
        title: meta.title ?? f.replace(/\.md$/, ""),
        status: meta.status ?? "open",
        priority: meta.priority ?? "medium",
        due: meta.due,
        project: meta.project,
        context: meta.context,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        recurrence: meta.recurrence,
        overdue: meta.due && meta.due < today,
      });
    } catch {
      // skip parse errors
    }
  }
  return out;
}

// ─── Projects ───────────────────────────────────────────────

export async function readProjects(): Promise<Project[]> {
  const projectsDir = join(VAULT_PATH, "05_Projects");
  const slugs = await safeReadDir(projectsDir);
  const tasks = await readTasks();
  const today = todayISO();
  const out: Project[] = [];
  for (const slug of slugs) {
    const readmePath = join(projectsDir, slug, "README.md");
    const raw = await safeReadFile(readmePath);
    if (!raw) continue;
    try {
      const parsed = matter(raw);
      const meta = parsed.data;
      const projTasks = tasks.filter((t) => t.project === slug);
      const taskCounts = {
        open: projTasks.filter((t) => t.status === "open").length,
        inProgress: projTasks.filter((t) => t.status === "in-progress").length,
        blocked: projTasks.filter((t) => t.status === "blocked").length,
        overdue: projTasks.filter((t) => t.due && t.due < today && t.status !== "done").length,
      };
      const stats = await stat(readmePath);
      out.push({
        slug,
        title: meta.title ?? slug,
        status: meta.status ?? "active",
        started: meta.started,
        parent: meta.parent,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        taskCounts,
        lastActivity: stats.mtime.toISOString().slice(0, 10),
      });
    } catch {
      // skip
    }
  }
  return out;
}

// ─── Reminders ──────────────────────────────────────────────

export async function readReminders(): Promise<Reminder[]> {
  const raw = await safeReadFile(join(VAULT_PATH, "06_Meta", "reminders.json"));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

// ─── Streak (aus habits.md) ─────────────────────────────────

export async function computeStreak(): Promise<{ current: number; best: number }> {
  const habits = await readHabits(180); // letzte 180 Tage für best-streak
  let current = 0;
  let best = 0;
  let run = 0;
  // Iteration von alt → neu, dann am Ende current vom Heute aus
  for (const day of habits) {
    const anyOk = Object.values(day.values).some((v) => v === "ok");
    if (anyOk) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  // Current = von hinten her run laufend zählen
  for (let i = habits.length - 1; i >= 0; i--) {
    const anyOk = Object.values(habits[i].values).some((v) => v === "ok");
    if (anyOk) current++;
    else break;
  }
  return { current, best };
}

// ─── Yesterday Daily ────────────────────────────────────────

export async function readYesterdayDaily(): Promise<{
  date: string;
  mood?: number;
  energy?: number;
  key_insight?: string;
} | null> {
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const date = yest.toISOString().slice(0, 10);
  const raw = await safeReadFile(join(VAULT_PATH, "10_Life", "daily", `${date}.md`));
  if (!raw) return null;
  try {
    const parsed = matter(raw);
    return {
      date,
      mood: parsed.data.mood,
      energy: parsed.data.energy,
      key_insight: parsed.data.key_insight,
    };
  } catch {
    return null;
  }
}
