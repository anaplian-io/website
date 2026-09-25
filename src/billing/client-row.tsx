import type { Client } from "./storage.ts";

interface ClientRowProps {
  client: Client;
  used: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientRow({ client, used, busy, onEdit, onDelete }: ClientRowProps) {
  return (
    <li className="client-row">
      <span>{client.name}</span>
      <div className="billing-actions">
        <button disabled={busy} onClick={onEdit} aria-label={`Rename ${client.name}`}>
          Rename
        </button>
        <button
          disabled={busy || used}
          title={used ? "Clients with tasks cannot be deleted" : undefined}
          aria-label={`Delete ${client.name}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
