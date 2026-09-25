import type { Client } from "./storage.ts";
import { ClientSelect } from "./client-select.tsx";

interface TaskToolbarProps {
  clients: Client[];
  filter: string;
  editing: boolean;
  onFilter: (value: string) => void;
  onAdd: () => void;
}

export function TaskToolbar({ clients, filter, editing, onFilter, onAdd }: TaskToolbarProps) {
  return (
    <div className="billing-toolbar">
      <ClientSelect clients={clients} value={filter} onChange={onFilter} allowAll />
      <button className="primary-button" disabled={!clients.length || editing} onClick={onAdd}>
        + Add task
      </button>
    </div>
  );
}
