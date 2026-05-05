"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimal-Toast-System (kein extra Lib).
 * Usage:
 *   const toast = useToast();
 *   toast.success("Task erstellt");
 *   toast.error("Fehler: ...");
 *
 * Toasts erscheinen unten links und verschwinden nach 3s.
 */

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; msg: string };

interface ToastApi {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: alert wenn kein Provider
    return {
      success: (m) => console.log("[toast]", m),
      error: (m) => console.error("[toast]", m),
      info: (m) => console.log("[toast]", m),
    };
  }
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, msg: string) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, kind, msg }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const api: ToastApi = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
    info: (msg) => push("info", msg),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-[160px] md:bottom-4 left-4 right-4 md:right-auto z-[60] flex flex-col gap-2 max-w-sm md:max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-2 px-3 py-2 rounded-md border hairline shadow-lg text-sm pointer-events-auto",
              t.kind === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              t.kind === "error" && "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
              t.kind === "info" && "bg-[var(--bg-2)] text-[var(--ink)]",
            )}
            role="status"
          >
            <span className="shrink-0 mt-0.5">
              {t.kind === "success" && <Check size={16} />}
              {t.kind === "error" && <AlertCircle size={16} />}
              {t.kind === "info" && <span className="block w-4 h-4 rounded-full bg-current opacity-50" />}
            </span>
            <span className="flex-1">{t.msg}</span>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 opacity-50 hover:opacity-100"
              aria-label="Schließen"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
