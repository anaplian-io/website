import type { Client, Task } from "./storage.ts";
import { BillingError } from "./billing-error.tsx";
import { TaskCard } from "./task-card.tsx";
import { useTaskActions } from "./use-task-actions.ts";

interface TaskListProps {
  tasks: Task[];
  clients: Client[];
  timezone: string;
  editing: boolean;
  onEdit: (task: Task) => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskList({
  tasks,
  clients,
  timezone,
  editing,
  onEdit,
  onSave,
  onDelete,
}: TaskListProps) {
  const { pending, error, run } = useTaskActions({ onSave, onDelete });
  return (
    <>
      <BillingError message={error} />
      <ul className="billing-list task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            clientName={
              clients.find((client) => client.id === task.clientId)?.name ?? "Unknown client"
            }
            timezone={timezone}
            disabled={editing || pending !== null}
            deleting={pending?.id === task.id && pending.action === "delete"}
            ending={pending?.id === task.id && pending.action === "end"}
            onEdit={() => onEdit(task)}
            onDelete={() => void run(task, "delete")}
            onEnd={() => void run(task, "end")}
          />
        ))}
      </ul>
    </>
  );
}
