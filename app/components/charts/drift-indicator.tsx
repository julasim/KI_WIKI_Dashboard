import { cn } from "@/lib/utils";

/**
 * Drift-Indicator: große Zahl mit "Tage seit letztem X-Anker".
 * Liest direkt aus DriftStatus (lib/vault.readDrift).
 *
 * Liefert max. 4 Anker als Liste (Lese-Anker, Sport-Anker, etc.).
 */
export type DriftItem = {
  label: string;
  daysSince: number | null;
  threshold?: number; // ab wann "drift" rot — default 7
};

export function DriftIndicator({ items }: { items: DriftItem[] }) {
  const visible = items.filter((i) => i.daysSince !== null);
  if (visible.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--ink-soft)]">
        Noch keine Drift-Daten.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="eyebrow mb-3 px-2">Drift — Tage ohne Aktivität</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visible.map((item) => {
          const days = item.daysSince ?? 0;
          const threshold = item.threshold ?? 7;
          const isDrift = days >= threshold;
          return (
            <div
              key={item.label}
              className={cn(
                "rounded-md p-3 text-center transition-colors border hairline",
                isDrift && "border-red-500/50 bg-red-500/5",
              )}
            >
              <div
                className={cn(
                  "display text-2xl",
                  isDrift ? "text-red-500" : "text-[var(--ink)]",
                )}
              >
                {days}
              </div>
              <div className="text-[10px] eyebrow text-[var(--ink-mute)] mt-1">
                {item.label}
              </div>
              <div className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                {days === 0 ? "heute" : days === 1 ? "Tag" : "Tage"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
