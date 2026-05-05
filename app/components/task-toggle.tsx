"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Loader2 } from "lucide-react";
import { actionTaskToggle } from "@/app/actions";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";

/**
 * Click-Toggle für Task-Status. Done → Reopen + umgekehrt.
 *
 * Optimistic UI: Status flippt sofort, bei Server-Error revert.
 */
export function TaskToggle({
  taskId,
  status,
  size = 14,
}: {
  taskId: string;
  status: string;
  size?: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(status);

  const isDone = optimistic === "done";

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = isDone ? "open" : "done";
    setOptimistic(newStatus);
    startTransition(async () => {
      try {
        await actionTaskToggle(taskId, status);
        toast.success(newStatus === "done" ? "Erledigt ✓" : "Wieder offen");
        router.refresh();
      } catch (err) {
        console.error(err);
        setOptimistic(status); // revert
        toast.error("Status-Fehler: " + (err as Error).message);
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "shrink-0 rounded-full border hairline flex items-center justify-center transition-colors hover:bg-[var(--bg-2)]",
        isDone && "bg-[var(--ink)] border-[var(--ink)] text-[var(--bg)]",
      )}
      style={{ width: size + 8, height: size + 8 }}
      title={isDone ? "Wieder öffnen" : "Als erledigt markieren"}
      aria-label={isDone ? "Reopen" : "Done"}
    >
      {pending ? (
        <Loader2 size={size} className="animate-spin" />
      ) : isDone ? (
        <Check size={size} />
      ) : (
        <Circle size={size} className="opacity-30" />
      )}
    </button>
  );
}
