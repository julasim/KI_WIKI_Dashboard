"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { actionUpdateDailyFM } from "@/app/actions";
import { useToast } from "./toast";

/**
 * Energy/Mood/Insight-Updater für die heutige Daily.
 * Slider 1-10, Insight-Textarea, Save-Button.
 *
 * Initial-Werte kommen aus heutiger Daily-FM (yesterday-Komponente liefert sie nicht
 * — daher als Prop reingereicht oder auf null gesetzt).
 */
export function DailyFMForm({
  date,
  initialEnergy,
  initialMood,
  initialInsight,
}: {
  date: string;
  initialEnergy?: number | null;
  initialMood?: number | null;
  initialInsight?: string | null;
}) {
  const [energy, setEnergy] = useState<string>(
    initialEnergy != null ? String(initialEnergy) : "",
  );
  const [mood, setMood] = useState<string>(
    initialMood != null ? String(initialMood) : "",
  );
  const [insight, setInsight] = useState<string>(initialInsight ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const submit = () => {
    const fd = new FormData();
    fd.set("date", date);
    fd.set("energy", energy);
    fd.set("mood", mood);
    fd.set("key_insight", insight);
    startTransition(async () => {
      try {
        await actionUpdateDailyFM(fd);
        toast.success("Daily aktualisiert");
        router.refresh();
      } catch (err) {
        toast.error("Fehler: " + (err as Error).message);
      }
    });
  };

  return (
    <div className="card p-5">
      <div className="eyebrow mb-3">Heute · Tracking</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs eyebrow mb-1.5" htmlFor="energy">
            Energy {energy && <span className="num-mono">({energy}/10)</span>}
          </label>
          <input
            id="energy"
            type="range"
            min="0"
            max="10"
            step="1"
            value={energy || "0"}
            onChange={(e) => setEnergy(e.target.value === "0" ? "" : e.target.value)}
            className="w-full"
            style={{ accentColor: "#f59e0b" }}
          />
        </div>
        <div>
          <label className="block text-xs eyebrow mb-1.5" htmlFor="mood">
            Mood {mood && <span className="num-mono">({mood}/10)</span>}
          </label>
          <input
            id="mood"
            type="range"
            min="0"
            max="10"
            step="1"
            value={mood || "0"}
            onChange={(e) => setMood(e.target.value === "0" ? "" : e.target.value)}
            className="w-full"
            style={{ accentColor: "#06b6d4" }}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs eyebrow mb-1.5" htmlFor="insight">
          Key Insight (was nehme ich heute mit?)
        </label>
        <textarea
          id="insight"
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          rows={2}
          placeholder="Eine Erkenntnis vom Tag…"
          className="w-full px-3 py-2 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)] resize-none"
        />
      </div>
      <button
        onClick={submit}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-md bg-[var(--ink)] text-[var(--bg)] text-sm font-medium disabled:opacity-50"
      >
        <Save size={14} />
        {pending ? "Speichere…" : "Speichern"}
      </button>
    </div>
  );
}
