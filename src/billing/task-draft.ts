import type { Task } from "./storage.ts";
import { localFields, utcTimestamp } from "./time.ts";

export interface DateTimeFields {
  date: string;
  time: string;
}
export interface TaskDraft {
  clientId: string;
  description: string;
  start: DateTimeFields;
  end: DateTimeFields;
  completed: boolean;
}

export function createTaskDraft(
  task: Task | null,
  clientId: string,
  timezone: string,
  now: string,
): TaskDraft {
  return {
    clientId: task?.clientId ?? clientId,
    description: task?.description ?? "",
    start: localFields(task?.start ?? now, timezone),
    end: localFields(task?.end ?? now, timezone),
    completed: Boolean(task?.end),
  };
}

function resolveTimestamp(fields: DateTimeFields, original: string | null, timezone: string) {
  if (original) {
    const previous = localFields(original, timezone);
    if (fields.date === previous.date && fields.time === previous.time) return original;
  }
  return utcTimestamp(fields.date, fields.time, timezone);
}

export function taskFromDraft(
  draft: TaskDraft,
  original: Task | null,
  timezone: string,
  id: string,
): Task {
  const start = resolveTimestamp(draft.start, original?.start ?? null, timezone);
  const end = draft.completed ? resolveTimestamp(draft.end, original?.end ?? null, timezone) : null;
  if (end && end < start) throw new Error("End time must be on or after the start time.");
  return { id, clientId: draft.clientId, description: draft.description.trim(), start, end };
}
