"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ListTodo, FileText, BookOpen, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  actionCreateTask,
  actionCreateNote,
  actionAppendDaily,
  actionLogWin,
} from "@/app/actions";

type Mode = null | "task" | "note" | "daily" | "win";

/**
 * Floating-Action-Button unten rechts. Klick öffnet Menü mit 4 Quick-Adds.
 * Jede Aktion öffnet ein Modal-Dialog mit fokussiertem Form.
 *
 * @param projects Slugs aller Projekte (für Dropdown-Auswahl in Task/Note)
 */
export function QuickActions({ projects = [] }: { projects?: string[] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);

  const close = () => {
    setOpen(false);
    setMode(null);
  };

  return (
    <>
      {/* FAB */}
      {!mode && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
          {open && (
            <div className="flex flex-col gap-2 mb-3 items-end">
              <ActionButton
                icon={<ListTodo size={16} />}
                label="Task"
                onClick={() => setMode("task")}
              />
              <ActionButton
                icon={<FileText size={16} />}
                label="Note"
                onClick={() => setMode("note")}
              />
              <ActionButton
                icon={<BookOpen size={16} />}
                label="Tagebuch"
                onClick={() => setMode("daily")}
              />
              <ActionButton
                icon={<Trophy size={16} />}
                label="Win"
                onClick={() => setMode("win")}
              />
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "h-12 w-12 rounded-full bg-[var(--ink)] text-[var(--bg)] shadow-lg flex items-center justify-center transition-transform",
              open && "rotate-45",
            )}
            aria-label={open ? "Menü schließen" : "Quick-Add"}
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      {/* Modal */}
      {mode && (
        <Modal title={modeTitle(mode)} onClose={close}>
          {mode === "task" && <TaskForm projects={projects} onDone={close} />}
          {mode === "note" && <NoteForm projects={projects} onDone={close} />}
          {mode === "daily" && <DailyForm onDone={close} />}
          {mode === "win" && <WinForm onDone={close} />}
        </Modal>
      )}
    </>
  );
}

function modeTitle(m: Mode): string {
  switch (m) {
    case "task": return "Neuer Task";
    case "note": return "Neue Notiz";
    case "daily": return "Tagebuch-Eintrag";
    case "win": return "Win loggen";
    default: return "";
  }
}

function ActionButton({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 h-9 px-3 rounded-full bg-[var(--bg-2)] text-[var(--ink)] border hairline shadow-sm hover:bg-[var(--bg-3)] text-sm whitespace-nowrap"
    >
      {icon}
      {label}
    </button>
  );
}

function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="w-full max-w-md card p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="display text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost btn"
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// FORMS
// ============================================================

function FormError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="text-xs text-red-500 px-1 mt-2">{msg}</div>
  );
}

function FormSubmit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-4 h-9 rounded-md bg-[var(--ink)] text-[var(--bg)] text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Speichere…" : label}
    </button>
  );
}

const inputCls =
  "w-full px-3 h-9 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)]";
const textareaCls =
  "w-full px-3 py-2 rounded-md border hairline bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--ink-soft)] resize-none";
const labelCls = "block text-xs eyebrow mb-1.5";

function TaskForm({
  projects,
  onDone,
}: {
  projects: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await actionCreateTask(fd);
        router.refresh();
        onDone();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className={labelCls} htmlFor="task-title">Titel *</label>
        <input id="task-title" name="title" className={inputCls} required autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className={labelCls} htmlFor="task-priority">Priorität</label>
          <select id="task-priority" name="priority" className={inputCls} defaultValue="medium">
            <option value="urgent">urgent</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="task-due">Due-Date</label>
          <input id="task-due" name="due" type="date" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className={labelCls} htmlFor="task-context">Kontext</label>
          <input id="task-context" name="context" placeholder="home" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="task-project">Projekt</label>
          <select id="task-project" name="project" className={inputCls} defaultValue="">
            <option value="">— keins —</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className={labelCls} htmlFor="task-recurrence">Recurrence</label>
        <select id="task-recurrence" name="recurrence" className={inputCls} defaultValue="">
          <option value="">— keine —</option>
          <option value="daily">daily</option>
          <option value="weekdays">weekdays</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
      </div>
      <FormError msg={error} />
      <FormSubmit pending={pending} label="Task anlegen" />
    </form>
  );
}

function NoteForm({
  projects,
  onDone,
}: {
  projects: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await actionCreateNote(fd);
        router.refresh();
        onDone();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className={labelCls} htmlFor="note-title">Titel *</label>
        <input id="note-title" name="title" className={inputCls} required autoFocus />
      </div>
      <div className="mt-3">
        <label className={labelCls} htmlFor="note-body">Inhalt (Markdown)</label>
        <textarea id="note-body" name="body" rows={6} className={textareaCls} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className={labelCls} htmlFor="note-project">Projekt</label>
          <select id="note-project" name="project" className={inputCls} defaultValue="">
            <option value="">— generisch (10_Life/notes) —</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="note-tags">Tags (komma-separiert)</label>
          <input id="note-tags" name="tags" placeholder="bau, idee" className={inputCls} />
        </div>
      </div>
      <FormError msg={error} />
      <FormSubmit pending={pending} label="Notiz anlegen" />
    </form>
  );
}

function DailyForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await actionAppendDaily(fd);
        router.refresh();
        onDone();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className={labelCls} htmlFor="daily-text">Eintrag *</label>
        <textarea
          id="daily-text"
          name="text"
          rows={6}
          required
          autoFocus
          placeholder="Was beschäftigt dich gerade?"
          className={textareaCls}
        />
      </div>
      <div className="mt-3">
        <label className={labelCls} htmlFor="daily-section">Section</label>
        <select id="daily-section" name="section" className={inputCls} defaultValue="Notizen & Gedanken">
          <option>Heute</option>
          <option>Notizen & Gedanken</option>
          <option>Offen / Einsortieren</option>
          <option>Abends</option>
        </select>
      </div>
      <FormError msg={error} />
      <FormSubmit pending={pending} label="An Daily anhängen" />
    </form>
  );
}

function WinForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await actionLogWin(fd);
        router.refresh();
        onDone();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className={labelCls} htmlFor="win-text">Was war gut?</label>
        <textarea
          id="win-text"
          name="text"
          rows={4}
          required
          autoFocus
          placeholder="z.B. Statik-Skizze RDP fertig"
          className={textareaCls}
        />
      </div>
      <FormError msg={error} />
      <FormSubmit pending={pending} label="Win loggen" />
    </form>
  );
}
