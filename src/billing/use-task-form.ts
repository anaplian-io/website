import { useState } from "react";
import type { FormEvent } from "react";
import type { Task } from "./storage.ts";
import { createTaskDraft, taskFromDraft } from "./task-draft.ts";
import type { TaskDraft } from "./task-draft.ts";

interface TaskFormOptions {
  task: Task | null;
  clientId: string;
  timezone: string;
  onSave: (task: Task) => Promise<void>;
}

export function useTaskForm({ task, clientId, timezone, onSave }: TaskFormOptions) {
  const [draft, setDraft] = useState(() =>
    createTaskDraft(task, clientId, timezone, new Date().toISOString()),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<TaskDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(taskFromDraft(draft, task, timezone, task?.id ?? crypto.randomUUID()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save task.");
    } finally {
      setSaving(false);
    }
  }

  return { draft, update, error, saving, submit };
}
