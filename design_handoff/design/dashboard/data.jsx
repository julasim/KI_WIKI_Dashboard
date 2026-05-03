// Mock data — shape matches the spec's Markdown/YAML schemas.
// Today is 2026-05-03 (Sunday).

const TODAY = new Date(2026, 4, 3);
const STICHTAG = new Date(2031, 4, 1);

const fmt = (d) => d.toISOString().slice(0, 10);
const fmtDe = (d) => d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });
const weekday = (d) => d.toLocaleDateString("de-AT", { weekday: "long" });

const daysUntil = (target, from = TODAY) =>
  Math.round((target - from) / (1000 * 60 * 60 * 24));
const daysSinceStart = () => 1826 - daysUntil(STICHTAG);

// ── Vision ──────────────────────────────────────────────
const VISION = "Souverän leben. Klar denken. Körper, Kopf und Konto im Lot — fünf Jahre, ein Kompass.";

// ── Habits (last 30 days) ───────────────────────────────
// Values: "ok" | "bad" | "skip"
const HABIT_KEYS = [
  { key: "sport",      label: "Sport",      target: "3–5 km" },
  { key: "lesen",      label: "Lesen",      target: "30 min" },
  { key: "schlaf",     label: "Schlaf",     target: "7+ h" },
  { key: "bildschirm", label: "Bildschirm", target: "< 22:30" },
  { key: "vision",     label: "Vision",     target: "1× lesen" },
  { key: "wasser",     label: "Wasser",     target: "2 L" },
];

// Deterministic pseudo-random pattern, 30 days × 6 habits
function buildHabits() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() - i);
    const seed = (d.getDate() * 7 + d.getMonth() * 31 + i * 13) % 100;
    const dayHabits = {};
    HABIT_KEYS.forEach((h, idx) => {
      const v = (seed + idx * 17) % 10;
      // slight tilt: sport/lesen consistent recently, schlaf wobbly
      let val;
      if (h.key === "sport")      val = i < 14 ? (v < 6 ? "ok" : v < 8 ? "bad" : "skip") : (v < 4 ? "ok" : v < 7 ? "bad" : "skip");
      else if (h.key === "lesen") val = v < 7 ? "ok" : v < 9 ? "bad" : "skip";
      else if (h.key === "schlaf")val = v < 4 ? "ok" : v < 8 ? "bad" : "skip";
      else if (h.key === "bildschirm") val = v < 5 ? "ok" : v < 8 ? "bad" : "skip";
      else if (h.key === "vision") val = (i % 3 === 0) ? "ok" : "skip";
      else val = v < 6 ? "ok" : "bad";
      dayHabits[h.key] = val;
    });
    days.push({ date: fmt(d), values: dayHabits });
  }
  // Today (last entry) — partial
  const todayRow = days[days.length - 1];
  todayRow.values = { sport: "ok", lesen: "ok", schlaf: "skip", bildschirm: "skip", vision: "skip", wasser: "skip" };
  return days;
}
const HABITS_30D = buildHabits();

// ── Sport sessions (last ~12 weeks) ─────────────────────
const SPORT_SESSIONS = [
  { date: "2026-05-02", art: "cardio", dauer: 27, notiz: "4,5 km @ 05:57 pace" },
  { date: "2026-05-02", art: "cardio", dauer: 48, notiz: "mit Luisa, 8 km @ 06:00 pace" },
  { date: "2026-04-30", art: "kraft",  dauer: 55, notiz: "Push, 4×8 Bench" },
  { date: "2026-04-29", art: "cardio", dauer: 32, notiz: "5 km easy" },
  { date: "2026-04-27", art: "kraft",  dauer: 60, notiz: "Pull, Klimmzüge 5×6" },
  { date: "2026-04-26", art: "cardio", dauer: 40, notiz: "6,5 km tempo" },
  { date: "2026-04-23", art: "cardio", dauer: 28, notiz: "4 km recovery" },
  { date: "2026-04-22", art: "kraft",  dauer: 50, notiz: "Legs" },
  { date: "2026-04-20", art: "cardio", dauer: 35, notiz: "5,5 km" },
];

// Synthetic 12-week aggregate
const SPORT_WEEKS = (() => {
  const weeks = [];
  for (let w = 11; w >= 0; w--) {
    const cardio = ((w * 7 + 3) % 4);
    const kraft  = ((w * 5 + 2) % 3);
    weeks.push({
      week: `KW ${18 - w}`,
      cardio: Math.max(0, cardio),
      kraft:  Math.max(0, kraft),
    });
  }
  // bias most recent toward 2/1
  weeks[weeks.length - 1] = { week: "KW 18", cardio: 2, kraft: 1 };
  weeks[weeks.length - 2] = { week: "KW 17", cardio: 2, kraft: 1 };
  weeks[weeks.length - 3] = { week: "KW 16", cardio: 1, kraft: 2 };
  weeks[weeks.length - 4] = { week: "KW 15", cardio: 3, kraft: 1 };
  return weeks;
})();

const SPORT_TOTALS = {
  km: 142.6,
  hours: 38,
  sessions: SPORT_SESSIONS.length,
};

// ── Tasks (today + overdue) ─────────────────────────────
const TASKS_TODAY = [
  { id: "t-vision-revise",  title: "Vision-Statement Q2 überarbeiten",   priority: "high",   project: "5y-2031", due: "2026-05-03", overdue: false },
  { id: "t-bot-deploy",     title: "Bot-Reminder-Modul deployen",        priority: "medium", project: "ki-wiki", due: "2026-05-03", overdue: false },
  { id: "t-finanzen-review",title: "Sparquote April nachtragen",         priority: "medium", project: "finanzen",due: "2026-05-01", overdue: true  },
  { id: "t-call-luisa",     title: "Luisa wegen Mai-Trip anrufen",       priority: "low",    project: null,      due: "2026-05-03", overdue: false },
];

// ── Reminders.json ──────────────────────────────────────
const REMINDERS_TODAY = [
  { id: "rem-20260503-0900", fire_at: "2026-05-03T09:00", message: "Wochen-Anker schreiben (KW 18)", recurrence: "weekly" },
  { id: "rem-20260503-1400", fire_at: "2026-05-03T14:00", message: "Habits Check: Sport (3–5 km) + Lesen (30 min)", recurrence: "daily" },
  { id: "rem-20260503-2100", fire_at: "2026-05-03T21:00", message: "Daily-Note Abends-Sektion", recurrence: "daily" },
];

// ── Yesterday's daily ───────────────────────────────────
const YESTERDAY = {
  date: "2026-05-02",
  mood: 7,
  energy: 6,
  key_insight: "Disziplin schlägt Motivation — wenn der Anker steht, läuft der Rest fast von selbst.",
};

// ── Streak ──────────────────────────────────────────────
const STREAK = { current: 12, best: 23 };

// ── Säulen ──────────────────────────────────────────────
const SAEULEN = [
  { key: "karriere",     label: "Karriere",     status: "ok",   note: "AI-Engineering-Pfad konsistent",         metric: "Ø 38 h/Wo Deep Work" },
  { key: "finanzen",     label: "Finanzen",     status: "warn", note: "Sparquote April fehlt",                  metric: "31 % YTD" },
  { key: "sport",        label: "Sport",        status: "ok",   note: "Soll erfüllt: 2× Cardio, 1× Kraft",      metric: "3 / 3 Sessions" },
  { key: "wissen",       label: "Wissen",       status: "warn", note: "Buch 1 / 12 — hinter Plan",              metric: "1 von 4 (Q2)" },
  { key: "beziehungen",  label: "Beziehungen",  status: "ok",   note: "Familie & Luisa rhythmisch",             metric: "4 Calls / Wo" },
  { key: "mindset",      label: "Mindset",      status: "ok",   note: "Vision täglich gelesen, Anker steht",    metric: "12 Tage Streak" },
];

// ── Drift-Detektor ──────────────────────────────────────
const DRIFT = {
  wochenAnker: { last: "2026-04-26", daysAgo: 7,  status: "warn", note: "letzter Sonntag-Anker — fällig heute" },
  monatAnker:  { last: "2026-04-30", daysAgo: 3,  status: "ok",   note: "April-Review geschrieben" },
  quartalAnker:{ last: "2026-03-30", daysAgo: 34, status: "warn", note: "Q1-Review — Q2 noch offen" },
};

// ── Tasks (full inventory, 10_Life/tasks/) ──────────────
const TASKS_ALL = [
  // overdue
  { id: "t-finanzen-review",  title: "Sparquote April nachtragen",            status: "open",        priority: "medium", project: "finanzen", context: "computer", due: "2026-05-01", recurrence: null,      tags: ["review","monat"] },
  { id: "t-bot-tests",        title: "Bot: Edge-Cases für /reminder testen", status: "in-progress", priority: "high",   project: "ki-wiki",  context: "computer", due: "2026-05-02", recurrence: null,      tags: ["bot","qa"] },
  // today
  { id: "t-vision-revise",    title: "Vision-Statement Q2 überarbeiten",     status: "open",        priority: "high",   project: "5y-2031",  context: "home",     due: "2026-05-03", recurrence: null,      tags: ["goals"] },
  { id: "t-bot-deploy",       title: "Bot-Reminder-Modul deployen",          status: "open",        priority: "medium", project: "ki-wiki",  context: "computer", due: "2026-05-03", recurrence: null,      tags: ["deploy"] },
  { id: "t-call-luisa",       title: "Luisa wegen Mai-Trip anrufen",         status: "open",        priority: "low",    project: null,        context: "phone",    due: "2026-05-03", recurrence: null,      tags: ["beziehungen"] },
  { id: "t-habits-check",     title: "Habits-Check (Sport + Lesen)",         status: "open",        priority: "medium", project: null,        context: "home",     due: "2026-05-03", recurrence: "daily",   last_completed: "2026-05-02", tags: ["routine"] },
  // this week
  { id: "t-wochen-anker",     title: "Wochen-Anker KW 18 schreiben",         status: "open",        priority: "high",   project: "5y-2031",  context: "home",     due: "2026-05-04", recurrence: "weekly",  tags: ["anker"] },
  { id: "t-buch-tiefarbeit",  title: "Buch: Tiefarbeit – Kapitel 4 lesen",   status: "in-progress", priority: "low",    project: null,        context: "home",     due: "2026-05-06", recurrence: null,      tags: ["wissen"] },
  { id: "t-dachboden-finish", title: "Dachboden: Restholz entsorgen",        status: "open",        priority: "low",    project: "dachboden", context: "errand",   due: "2026-05-08", recurrence: null,      tags: ["haus"] },
  { id: "t-q2-review",        title: "Q2-Review aufsetzen (Skelett)",        status: "open",        priority: "medium", project: "5y-2031",  context: "computer", due: "2026-05-09", recurrence: null,      tags: ["review","quartal"] },
  // later
  { id: "t-marathon-plan",    title: "Marathon-Trainingsplan finalisieren",  status: "open",        priority: "medium", project: "marathon", context: "home",     due: "2026-05-15", recurrence: null,      tags: ["sport"] },
  { id: "t-eltern-besuch",    title: "Eltern besuchen — Wochenende",         status: "open",        priority: "low",    project: null,        context: "errand",   due: "2026-05-23", recurrence: null,      tags: ["familie"] },
  { id: "t-jahres-finanz",    title: "Steuererklärung 2025 finalisieren",    status: "blocked",     priority: "high",   project: "finanzen", context: "computer", due: "2026-06-30", recurrence: null,      tags: ["finanzen","wartet"] },
  // ohne datum
  { id: "t-foto-archiv",      title: "Foto-Archiv 2024 ordnen",              status: "open",        priority: "low",    project: null,        context: "computer", due: null,         recurrence: null,      tags: ["archiv"] },
  { id: "t-newsletter-idea",  title: "Newsletter-Idee: 5y-System dokumentieren", status: "open",    priority: "low",    project: null,        context: "computer", due: null,         recurrence: null,      tags: ["schreiben"] },
  { id: "t-bot-graph-api",    title: "Bot: Microsoft Graph Calendar prototypen", status: "open",    priority: "medium", project: "ki-wiki",  context: "computer", due: null,         recurrence: null,      tags: ["bot","calendar"] },
];

// ── Projects (05_Projects/<slug>/README.md) ─────────────
const PROJECTS = [
  {
    slug: "ki-wiki", title: "KI_WIKI Vault & Bot", status: "active",
    started: "2025-11-12", parent: null,
    tags: ["bot","vault","infra"],
    summary: "Personal-OS-Backbone — Vault, Telegram-Bot, Reminder-Engine. Single source of truth für Tasks, Notes, Reminders.",
    notes: [
      { date: "2026-05-02", title: "Reminder-Modul Design-Note", path: "notes/reminder-modul.md" },
      { date: "2026-04-28", title: "Frontmatter-Schema v2",      path: "notes/schema-v2.md" },
      { date: "2026-04-21", title: "Vault-Struktur Refactor",    path: "notes/vault-refactor.md" },
    ],
    meetings: [
      { date: "2026-04-30", title: "Architektur-Review (solo)",  path: "meetings/2026-04-30.md" },
    ],
    recent_activity: "vor 6 h",
  },
  {
    slug: "5y-2031", title: "5-Jahres-System 2031", status: "active",
    started: "2026-05-01", parent: null,
    tags: ["goals","life"],
    summary: "Sechs Säulen, Wochen/Monats/Quartals-Anker, Drift-Detektor. Ziel-Stichtag: 01.05.2031.",
    notes: [
      { date: "2026-05-02", title: "Vision-Statement v0",        path: "notes/vision-v0.md" },
      { date: "2026-05-01", title: "Säulen-Definition",          path: "notes/säulen.md" },
    ],
    meetings: [],
    recent_activity: "heute",
  },
  {
    slug: "finanzen", title: "Finanzen 2026", status: "active",
    started: "2026-01-04", parent: null,
    tags: ["finanzen"],
    summary: "Cashflow, Sparquote, Steuern. Monatlicher Review am Monatsende.",
    notes: [
      { date: "2026-04-15", title: "Sparquote-Methodik",         path: "notes/sparquote.md" },
    ],
    meetings: [],
    recent_activity: "vor 3 T",
  },
  {
    slug: "marathon", title: "Marathon Wien 2026", status: "active",
    started: "2026-02-10", parent: null,
    tags: ["sport","training"],
    summary: "16-Wochen-Trainingsplan. Ziel: sub-4 h. Race-Day: 12.10.2026.",
    notes: [
      { date: "2026-04-26", title: "Trainingsblock 3 Review",    path: "notes/block-3.md" },
    ],
    meetings: [],
    recent_activity: "vor 1 W",
  },
  {
    slug: "dachboden", title: "Dachboden-Ausbau", status: "active",
    started: "2026-03-01", parent: null,
    tags: ["haus","renovierung"],
    summary: "Eigenleistung. Dämmung + Trockenbau + Boden. Aktuell: Restholz entsorgen, dann Verkleidung.",
    notes: [],
    meetings: [],
    recent_activity: "gestern",
  },
  {
    slug: "claude-code", title: "Claude Code Workflows", status: "paused",
    started: "2025-12-08", parent: "ki-wiki",
    tags: ["bot","tooling"],
    summary: "Subprojekt: Claude Code als Schreib-Layer für den Vault. Pausiert bis Bot v1.0 stabil.",
    notes: [],
    meetings: [],
    recent_activity: "vor 3 W",
  },
  {
    slug: "podcast-archive", title: "Podcast-Archiv", status: "archived",
    started: "2025-06-01", parent: null,
    tags: ["wissen"],
    summary: "Archiviert. Notes nach 02_Wiki/wissen/podcasts/ migriert.",
    notes: [],
    meetings: [],
    recent_activity: "vor 4 M",
  },
];

// ── Wins (Erfolgs-Tagebuch) ─────────────────────────────
const WINS = [
  { date: "2026-05-02", saeule: "sport",       text: "8 km mit Luisa @ 06:00 — neuer Long-Run." },
  { date: "2026-05-02", saeule: "karriere",    text: "Bot-Reminder-Modul fertig getestet, Edge-Cases sauber." },
  { date: "2026-05-01", saeule: "mindset",     text: "Vision-Statement v0 fertig — endlich auf Papier." },
  { date: "2026-04-30", saeule: "karriere",    text: "Architektur-Review für Vault: Schema v2 freigegeben." },
  { date: "2026-04-29", saeule: "beziehungen", text: "Eltern angerufen, 40 min — gut getan." },
  { date: "2026-04-28", saeule: "wissen",      text: "Tiefarbeit Kapitel 3 durch — Notizen verlinkt." },
  { date: "2026-04-26", saeule: "sport",       text: "6,5 km Tempo-Run — Pace 5:42, neue PB." },
  { date: "2026-04-25", saeule: "finanzen",    text: "März-Sparquote 34 % — über Ziel." },
  { date: "2026-04-23", saeule: "mindset",     text: "Quartals-Anker Q1 sauber abgeschlossen." },
  { date: "2026-04-22", saeule: "karriere",    text: "Telegram-Bot v0.9 deployed — läuft 48 h ohne Crash." },
  { date: "2026-04-20", saeule: "beziehungen", text: "Wandertag mit Familie — Kalkalpen, 14 km." },
  { date: "2026-04-18", saeule: "sport",       text: "Kraft: Klimmzüge 5×6 — sauber, ohne Schwung." },
  { date: "2026-04-15", saeule: "wissen",      text: "Podcast Lex × Karpathy 2× durchgehört, Notizen." },
  { date: "2026-04-12", saeule: "finanzen",    text: "ETF-Sparplan auf 1200 € erhöht." },
  { date: "2026-04-10", saeule: "karriere",    text: "MCP-Server für Vault-Search prototypisiert." },
];

// ── Reading log ─────────────────────────────────────────
const READING_GOAL = 12; // pro Jahr
const BOOKS = [
  { title: "Tiefarbeit",                       author: "Cal Newport",         status: "reading",  progress: 0.42, started: "2026-04-22", finished: null,         pages: 304, saeule: "wissen",   note: "Kapitel 4 — Regeln der Tiefarbeit." },
  { title: "Atomic Habits",                    author: "James Clear",         status: "done",     progress: 1.0,  started: "2026-03-18", finished: "2026-04-08", pages: 320, saeule: "mindset",  note: "1 % besser pro Tag — 4-Felder-Modell übernommen." },
  { title: "The Almanack of Naval Ravikant",   author: "Eric Jorgenson",      status: "done",     progress: 1.0,  started: "2026-02-25", finished: "2026-03-15", pages: 244, saeule: "mindset",  note: "Hebel: Kapital, Code, Content." },
  { title: "Clean Architecture",               author: "Robert C. Martin",    status: "done",     progress: 1.0,  started: "2026-01-04", finished: "2026-02-20", pages: 432, saeule: "karriere", note: "Boundaries · Use-Cases · Frameworks austauschbar." },
  { title: "Die Macht der Gewohnheit",         author: "Charles Duhigg",      status: "queued",   progress: 0.0,  started: null,         finished: null,         pages: 416, saeule: "mindset",  note: "Q3 geplant." },
  { title: "Designing Data-Intensive Apps",    author: "Martin Kleppmann",    status: "queued",   progress: 0.0,  started: null,         finished: null,         pages: 616, saeule: "karriere", note: "Nach Tiefarbeit." },
];

const READING_MINUTES_30D = (() => {
  // synthetic 30-day reading minutes, target = 30/day
  const arr = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(TODAY); d.setDate(TODAY.getDate() - i);
    const seed = (d.getDate() * 11 + i * 7) % 13;
    let m = 0;
    if (seed < 8)      m = 25 + (seed * 4);
    else if (seed < 11) m = 10 + seed;
    else                m = 0;
    arr.push({ date: fmt(d), minutes: m });
  }
  return arr;
})();

Object.assign(window, {
  TODAY, STICHTAG, fmt, fmtDe, weekday, daysUntil, daysSinceStart,
  VISION,
  HABIT_KEYS, HABITS_30D,
  SPORT_SESSIONS, SPORT_WEEKS, SPORT_TOTALS,
  TASKS_TODAY, REMINDERS_TODAY, YESTERDAY, STREAK,
  SAEULEN, DRIFT,
  TASKS_ALL, PROJECTS,
  WINS, BOOKS, READING_GOAL, READING_MINUTES_30D,
});
