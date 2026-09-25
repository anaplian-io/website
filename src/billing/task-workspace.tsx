import type { Client, Task } from "./storage.ts";
import { BillingSummary } from "./billing-summary.tsx";
import { TaskToolbar } from "./task-toolbar.tsx";
import { TaskForm } from "./task-form.tsx";
import { TaskEmptyState } from "./task-empty-state.tsx";
import { TaskList } from "./task-list.tsx";

export type TaskEditor = Task | "new" | null;

interface TaskWorkspaceProps {
  clients: Client[];
  tasks: Task[];
  timezone: string;
  filter: string;
  editor: TaskEditor;
  onFilter: (value: string) => void;
  onEdit: (editor: TaskEditor) => void;
  onAddClient: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskWorkspace({
  clients,
  tasks,
  timezone,
  filter,
  editor,
  onFilter,
  onEdit,
  onAddClient,
  onSave,
  onDelete,
}: TaskWorkspaceProps) {
  const visibleTasks = tasks
    .filter((task) => !filter || task.clientId === filter)
    .sort((a, b) => b.start.localeCompare(a.start));

  async function saveTask(task: Task) {
    await onSave(task);
    onEdit(null);
  }

  return (
    <>
      <BillingSummary tasks={visibleTasks} filtered={Boolean(filter)} />
      <TaskToolbar
        clients={clients}
        filter={filter}
        editing={editor !== null}
        onFilter={onFilter}
        onAdd={() => onEdit("new")}
      />
      {editor !== null && (
        <TaskForm
          key={editor === "new" ? "new" : editor.id}
          clients={clients}
          task={editor === "new" ? null : editor}
          timezone={timezone}
          onSave={saveTask}
          onCancel={() => onEdit(null)}
        />
      )}
      {!clients.length || !visibleTasks.length ? (
        <TaskEmptyState
          hasClients={clients.length > 0}
          filtered={Boolean(filter)}
          onAddClient={onAddClient}
        />
      ) : (
        <TaskList
          tasks={visibleTasks}
          clients={clients}
          timezone={timezone}
          editing={editor !== null}
          onEdit={onEdit}
          onSave={saveTask}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
