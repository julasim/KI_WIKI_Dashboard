import {
  readVision,
  readHabits,
  readSportSessions,
  readTasks,
  readReminders,
  readYesterdayDaily,
  computeStreak,
  HABIT_KEYS,
} from "@/lib/vault";
import { daysUntilStichtag, formatDateLongDe, weekdayDe } from "@/lib/utils";

// ISR: alle 60s neu generieren — Vault-Änderungen erscheinen schnell
export const revalidate = 60;

export default async function TodayPage() {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  const [vision, habits, sessions, tasks, reminders, yesterday, streak] = await Promise.all([
    readVision(),
    readHabits(2),
    readSportSessions(),
    readTasks(),
    readReminders(),
    readYesterdayDaily(),
    computeStreak(),
  ]);

  const todayHabits = habits[habits.length - 1];
  const tasksToday = tasks.filter(
    (t) => t.due === todayISO && t.status !== "done" && t.status !== "cancelled",
  );
  const tasksOverdue = tasks.filter(
    (t) => t.due && t.due < todayISO && t.status !== "done" && t.status !== "cancelled",
  );
  const remindersToday = reminders.filter((r) => r.fire_at.startsWith(todayISO));
  const lastSport = sessions[0];
  const daysLeft = daysUntilStichtag();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <section className="space-y-2">
        <div className="eyebrow">{weekdayDe(today)}</div>
        <h1 className="display text-3xl md:text-4xl">{formatDateLongDe(today)}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ink-mute)]">
          <span className="pill">
            <span className="dot" style={{ background: "var(--ok)" }} />
            Streak {streak.current} Tage
          </span>
          <span className="num-mono">noch {daysLeft} Tage bis Stichtag</span>
        </div>
      </section>

      {/* Vision */}
      {vision && (
        <section className="card p-5 md:p-6">
          <div className="eyebrow mb-2">Vision · 5-Jahres-Anker</div>
          <p className="serif text-lg md:text-xl text-[var(--ink-2)]">{vision}</p>
        </section>
      )}

      {/* Quick-Cards 2x2 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Tasks heute */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Tasks heute</div>
            <div className="num-mono text-xs text-[var(--ink-mute)]">
              {tasksToday.length} fällig
              {tasksOverdue.length > 0 && ` · ${tasksOverdue.length} überfällig`}
            </div>
          </div>
          {tasksToday.length === 0 && tasksOverdue.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Keine offenen Tasks für heute.</p>
          ) : (
            <ul className="space-y-2">
              {tasksOverdue.slice(0, 3).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--bad)" }} />
                  <span className="truncate text-[var(--bad)]">{t.title}</span>
                </li>
              ))}
              {tasksToday.slice(0, 3).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ink-mute)" }} />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reminders heute */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Erinnerungen</div>
            <div className="num-mono text-xs text-[var(--ink-mute)]">{remindersToday.length}</div>
          </div>
          {remindersToday.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Heute nichts geplant.</p>
          ) : (
            <ul className="space-y-2">
              {remindersToday.slice(0, 4).map((r) => (
                <li key={r.id} className="text-sm flex gap-3">
                  <span className="num-mono text-[var(--ink-mute)] shrink-0">
                    {r.fire_at.slice(11, 16)}
                  </span>
                  <span className="truncate">{r.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Habits Preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Habits heute</div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_KEYS.map((h) => {
              const v = todayHabits?.values?.[h.key];
              const cls = v === "ok" ? "ok" : v === "bad" ? "bad" : "skip";
              return (
                <div key={h.key} className="text-center">
                  <div className={`hm-cell ${cls}`} />
                  <div className="text-[10px] text-[var(--ink-mute)] mt-1.5">{h.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Letzter Sport */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow">Letzter Sport</div>
          </div>
          {!lastSport ? (
            <p className="text-sm text-[var(--ink-soft)]">Noch keine Session geloggt.</p>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pill">{lastSport.art}</span>
                <span className="num-mono text-sm">{lastSport.dauer} min</span>
              </div>
              <div className="text-sm text-[var(--ink-2)]">{lastSport.notiz}</div>
              <div className="text-[11px] num-mono text-[var(--ink-mute)] mt-1">{lastSport.date}</div>
            </div>
          )}
        </div>
      </section>

      {/* Yesterday-Recap */}
      {yesterday?.key_insight && (
        <section className="card p-5">
          <div className="eyebrow mb-2">Gestern · Key Insight</div>
          <p className="serif text-base text-[var(--ink-2)]">{yesterday.key_insight}</p>
        </section>
      )}
    </div>
  );
}
