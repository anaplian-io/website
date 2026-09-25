import { useState } from "react";
import type { Task } from "./storage.ts";

interface TaskActionsOptions {
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function useTaskActions({ onSave, onDelete }: TaskActionsOptions) {
  const [pending, setPending] = useState<{ id: string; action: "delete" | "end" } | null>(null);
  const [error, setError] = useState("");

  async function run(task: Task, action: "delete" | "end") {
    setPending({ id: task.id, action });
    setError("");
    try {
      if (action === "delete") {
        await onDelete(task.id);
      } else {
        const end = new Date().toISOString();
        if (end < task.start)
          throw new Error("This task starts in the future. Edit its start before ending it now.");
        await onSave({ ...task, end });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not ${action} task.`);
    } finally {
      setPending(null);
    }
  }

  return { pending, error, run };
}
