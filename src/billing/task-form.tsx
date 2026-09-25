import type { Client, Task } from "./storage.ts";
import { useTaskForm } from "./use-task-form.ts";
import { ClientSelect } from "./client-select.tsx";
import { DateTimeFields } from "./date-time-fields.tsx";
import { BillingError } from "./billing-error.tsx";

interface TaskFormProps {
  clients: Client[];
  task: Task | null;
  timezone: string;
  onSave: (task: Task) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ clients, task, timezone, onSave, onCancel }: TaskFormProps) {
  const { draft, update, saving, error, submit } = useTaskForm({
    task,
    clientId: clients[0]?.id ?? "",
    timezone,
    onSave,
  });
  return (
    <form className="billing-panel" onSubmit={submit}>
      <h2>{task ? "Edit task" : "New task"}</h2>
      <fieldset disabled={saving}>
        <ClientSelect
          clients={clients}
          value={draft.clientId}
          onChange={(clientId) => update({ clientId })}
        />
        <label>
          Description <span className="field-hint">(optional)</span>
          <input
            value={draft.description}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="What are you working on?"
          />
        </label>
        <DateTimeFields label="Start" value={draft.start} onChange={(start) => update({ start })} />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={draft.completed}
            onChange={(event) => update({ completed: event.target.checked })}
          />{" "}
          Set an end time
        </label>
        {draft.completed && (
          <DateTimeFields label="End" value={draft.end} onChange={(end) => update({ end })} />
        )}
        <p>
          Times use {timezone.split("/")[1].replaceAll("_", " ")}. During the fall clock change,
          repeated times use the earlier occurrence.
        </p>
        <BillingError message={error} />
        <div className="billing-actions">
          <button className="primary-button" type="submit">
            {saving ? "Saving…" : "Save task"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}
