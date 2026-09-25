import type { FormEvent } from "react";

interface ClientFormProps {
  name: string;
  busy: boolean;
  editing: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({
  name,
  busy,
  editing,
  onNameChange,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Client name
        <input
          required
          value={name}
          disabled={busy}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>
      <div className="billing-actions">
        <button disabled={busy} type="submit" className="primary-button">
          {editing ? "Save name" : "Add client"}
        </button>
        {editing && (
          <button type="button" disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
