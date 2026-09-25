import type { Client } from "./storage.ts";

interface ClientSelectProps {
  clients: Client[];
  value: string;
  onChange: (value: string) => void;
  allowAll?: boolean;
}

export function ClientSelect({ clients, value, onChange, allowAll = false }: ClientSelectProps) {
  return (
    <label>
      {allowAll ? "Client filter" : "Client"}
      <select required={!allowAll} value={value} onChange={(event) => onChange(event.target.value)}>
        {allowAll && <option value="">All clients</option>}
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </label>
  );
}
