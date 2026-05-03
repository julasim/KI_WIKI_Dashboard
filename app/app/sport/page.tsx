import { readSportSessions, aggregateSportWeeks } from "@/lib/vault";
import { SportChart } from "./chart";

export const revalidate = 60;

export default async function SportPage() {
  const sessions = await readSportSessions();
  const weeks = aggregateSportWeeks(sessions, 12);

  // Stats
  const todayISO = new Date().toISOString().slice(0, 10);
  const monday = new Date();
  const dow = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  const sessionsThisWeek = sessions.filter((s) => new Date(s.date) >= monday).length;

  const totalMinutes = sessions.reduce((sum, s) => sum + s.dauer, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Tracking</div>
        <h1 className="display text-3xl md:text-4xl">Sport</h1>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="eyebrow">Diese Woche</div>
          <div className="display text-3xl mt-1 num-mono">{sessionsThisWeek}</div>
          <div className="text-xs text-[var(--ink-mute)]">Sessions</div>
        </div>
        <div className="card p-4">
          <div className="eyebrow">Total Sessions</div>
          <div className="display text-3xl mt-1 num-mono">{sessions.length}</div>
          <div className="text-xs text-[var(--ink-mute)]">geloggt</div>
        </div>
        <div className="card p-4 col-span-2 md:col-span-1">
          <div className="eyebrow">Total Stunden</div>
          <div className="display text-3xl mt-1 num-mono">{totalHours}</div>
          <div className="text-xs text-[var(--ink-mute)]">h</div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <div className="eyebrow mb-4">Letzte 12 Wochen</div>
        <SportChart weeks={weeks} />
      </section>

      <section className="card p-5">
        <div className="eyebrow mb-3">Log</div>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Noch keine Sessions geloggt.</p>
        ) : (
          <ul className="divide-y hairline">
            {sessions.slice(0, 20).map((s, i) => (
              <li key={`${s.date}-${i}`} className="py-2 flex items-center gap-3 text-sm">
                <span className="num-mono text-[var(--ink-mute)] w-24 shrink-0">{s.date}</span>
                <span className="pill">{s.art}</span>
                <span className="num-mono text-[var(--ink-2)] w-16 shrink-0">{s.dauer} min</span>
                <span className="text-[var(--ink-2)] truncate">{s.notiz}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
