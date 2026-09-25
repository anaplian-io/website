import type { Client, Task } from "./storage.ts";
import { useClientManager } from "./use-client-manager.ts";
import { ClientForm } from "./client-form.tsx";
import { ClientRow } from "./client-row.tsx";
import { BillingError } from "./billing-error.tsx";

interface ClientManagerProps {
  clients: Client[];
  tasks: Task[];
  onSave: (client: Client) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ClientManager({ clients, tasks, onSave, onDelete }: ClientManagerProps) {
  const form = useClientManager({ onSave, onDelete });
  return (
    <section className="billing-panel" aria-labelledby="clients-heading">
      <h2 id="clients-heading">Clients</h2>
      <ClientForm
        name={form.name}
        busy={form.busy}
        editing={form.editing !== null}
        onNameChange={form.setName}
        onSubmit={form.submit}
        onCancel={form.cancel}
      />
      <BillingError message={form.error} />
      {clients.length === 0 && <p>Add your first client to start tracking time.</p>}
      <ul className="billing-list">
        {clients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            used={tasks.some((task) => task.clientId === client.id)}
            busy={form.busy}
            onEdit={() => form.edit(client)}
            onDelete={() => void form.remove(client.id)}
          />
        ))}
      </ul>
      {clients.length > 0 && <p>Clients with tasks can be renamed, but cannot be deleted.</p>}
    </section>
  );
}
