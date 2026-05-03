import { readWins } from "@/lib/vault";

export const revalidate = 60;

export default async function WinsPage() {
  const wins = await readWins();
  const today = new Date();
  const cutoff30 = new Date(today.getTime() - 30 * 86400_000);
  const wins30 = wins.filter((w) => new Date(w.date) >= cutoff30);

  // Group by date
  const grouped: Map<string, typeof wins> = new Map();
  for (const w of wins) {
    const k = w.date;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(w);
  }
  const sortedDates = [...grouped.keys()].sort().reverse();

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Tracking</div>
        <h1 className="display text-3xl md:text-4xl">Wins</h1>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="eyebrow">Letzte 30 Tage</div>
          <div className="display text-3xl mt-1 num-mono">{wins30.length}</div>
        </div>
        <div className="card p-4">
          <div className="eyebrow">Total</div>
          <div className="display text-3xl mt-1 num-mono">{wins.length}</div>
        </div>
      </section>

      <section className="card p-5">
        {wins.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">Noch keine Wins geloggt.</p>
        ) : (
          <div className="space-y-5">
            {sortedDates.slice(0, 30).map((date) => (
              <div key={date}>
                <div className="num-mono text-xs text-[var(--ink-mute)] mb-1.5">{date}</div>
                <ul className="space-y-1">
                  {grouped.get(date)!.map((w, i) => (
                    <li key={i} className="text-sm text-[var(--ink-2)]">
                      • {w.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
