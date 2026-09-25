import type { Task } from "./storage.ts";
import { billableHours, displayTimestamp } from "./time.ts";

interface TaskCardProps {
  task: Task;
  clientName: string;
  timezone: string;
  disabled: boolean;
  deleting: boolean;
  ending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEnd: () => void;
}

export function TaskCard({
  task,
  clientName,
  timezone,
  disabled,
  deleting,
  ending,
  onEdit,
  onDelete,
  onEnd,
}: TaskCardProps) {
  const hours = billableHours(task.start, task.end);
  return (
    <li className="task-card">
      <div className="task-heading">
        <span className="billing-eyebrow">{clientName}</span>
        {task.end ? (
          <strong>
            {hours.toFixed(1)} hrs ({Math.round(hours * 60)} minutes)
          </strong>
        ) : (
          <span className="status">Open</span>
        )}
      </div>
      <h3>{task.description || "Untitled task"}</h3>
      <p>
        <time dateTime={task.start}>{displayTimestamp(task.start, timezone)}</time>
        <br />
        <span className="field-hint">to </span>
        {task.end ? (
          <time dateTime={task.end}>{displayTimestamp(task.end, timezone)}</time>
        ) : (
          "Still open"
        )}
      </p>
      <div className="billing-actions">
        <button disabled={disabled} onClick={onEdit}>
          Edit task
        </button>
        <button disabled={disabled} onClick={onDelete}>
          {deleting ? "Deleting…" : "Delete task"}
        </button>
        {!task.end && (
          <button disabled={disabled} onClick={onEnd}>
            {ending ? "Saving…" : "End now"}
          </button>
        )}
      </div>
    </li>
  );
}
