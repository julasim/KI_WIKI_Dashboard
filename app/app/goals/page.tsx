import { readVision, readSaeulen, readDrift } from "@/lib/vault";
import { daysUntilStichtag } from "@/lib/utils";
import { GoalsProgress } from "@/components/charts/goals-progress";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [vision, saeulen, drift] = await Promise.all([
    readVision(),
    readSaeulen(),
    readDrift(),
  ]);
  const daysLeft = daysUntilStichtag();
  const todayISO = new Date().toISOString().slice(0, 10);

  const driftDays = (date?: string): number | null => {
    if (!date || date === "—") return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const today = new Date(todayISO);
    return Math.round((today.getTime() - d.getTime()) / 86400_000);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="eyebrow">Compass</div>
        <h1 className="display text-3xl md:text-4xl">5-Jahres-Goals</h1>
        <div className="text-sm text-[var(--ink-mute)] mt-1 num-mono">
          Stichtag 01.05.2031 · noch {daysLeft} Tage
        </div>
      </header>

      {vision && (
        <section className="card p-5 md:p-6">
          <div className="eyebrow mb-2">Vision</div>
          <p className="serif text-lg md:text-xl text-[var(--ink-2)]">{vision}</p>
        </section>
      )}

      {/* Drift-Detector */}
      <section className="card p-5">
        <div className="eyebrow mb-3">Anker-Disziplin</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["weekly", "monthly", "quarterly"] as const).map((period) => {
            const date = drift[period];
            const days = driftDays(date);
            const label = period === "weekly" ? "Wochen-Anker" : period === "monthly" ? "Monats-Anker" : "Quartals-Anker";
            const ok = days !== null && days <= (period === "weekly" ? 7 : period === "monthly" ? 35 : 100);
            return (
              <div key={period} className="rounded-lg p-3" style={{ background: "var(--bg-2)" }}>
                <div className="text-xs text-[var(--ink-mute)]">{label}</div>
                <div className="text-sm num-mono mt-1">
                  {date ?? "—"}
                </div>
                {days !== null && (
                  <div className="text-[11px] num-mono mt-1" style={{ color: ok ? "var(--ok)" : "var(--bad)" }}>
                    vor {days} Tagen
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Säulen */}
      {saeulen.length > 0 && (
        <section>
          <div className="eyebrow mb-3">6 Säulen</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saeulen.map((s) => (
              <div key={s.slug} className="card p-4">
                <div className="serif text-base">{s.label}</div>
                {s.kpi && (
                  <div className="text-sm text-[var(--ink-2)] mt-1.5">{s.kpi}</div>
                )}
                {s.note && (
                  <div className="text-xs text-[var(--ink-mute)] mt-2">{s.note}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Säulen-Progress als Radial-Chart */}
      {saeulen.length > 0 && (
        <section>
          <GoalsProgress saeulen={saeulen} />
        </section>
      )}
    </div>
  );
}
