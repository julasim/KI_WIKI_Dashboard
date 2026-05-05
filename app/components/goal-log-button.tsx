"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X } from "lucide-react";
import { actionGoalLog } from "@/app/actions";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";

/**
 * Button + inline Modal für Goal-Log-Einträge.
 *
 * Default: schreibt in 10_Life/goals/<goal>/<subtype>.md mit Datum-Header.
 *
 * @param goal Slug des Goals (z.B. "5y-2031")
 * @param subtype Tracker-Type (default "tracker")
 * @param label Label fürs Button (z.B. "Sport-Eintrag", "Win loggen")
 */
export function GoalLogButton({
  goal,
  subtype = "tracker",
  label,
  className,
}: {
  goal: string;
  subtype?: string;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const submit = () => {
    if (!text.trim()) return;
    const fd = new FormData();
    fd.set("goal", goal);
    fd.set("subtype", subtype);
    fd.set("text", text);
    startTransition(async () => {
      try {
        await actionGoalLog(fd);
        toast.success(`${label} gespeichert`);
        setText("");
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error("Fehler: " + (err as Error).message);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs h-7 px-2 rounded-md border hairline hover:bg-[var(--bg-2)]",
          className,
        )}
      >
        <PlusCircle size={12} /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="display text-base">{label}</h3>
              <button
                onClick={() => setOpen(false)}
                className="btn-ghost btn"
                aria-label="Schließen"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              autoFocus
              placeholder={`Was zu ${label}?`}
              className="w-full px-3 py-2 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
            />
            <div className="text-[11px] text-[var(--ink-mute)] mt-1">
              <kbd className="num-mono">Ctrl+Enter</kbd> zum Speichern
            </div>
            <button
              onClick={submit}
              disabled={pending || !text.trim()}
              className="w-full mt-3 h-9 rounded-md bg-[var(--ink)] text-[var(--bg)] text-sm font-medium disabled:opacity-50"
            >
              {pending ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
