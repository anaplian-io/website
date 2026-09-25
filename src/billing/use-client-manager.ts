import { useState } from "react";
import type { FormEvent } from "react";
import type { Client } from "./storage.ts";

interface ClientManagerOptions {
  onSave: (client: Client) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function useClientManager({ onSave, onDelete }: ClientManagerOptions) {
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function cancel() {
    setEditing(null);
    setName("");
  }
  function edit(client: Client) {
    setEditing(client.id);
    setName(client.name);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a client name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({ id: editing ?? crypto.randomUUID(), name: name.trim() });
      cancel();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save client.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError("");
    try {
      await onDelete(id);
      if (editing === id) cancel();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete client.");
    } finally {
      setBusy(false);
    }
  }

  return { editing, name, setName, error, busy, cancel, edit, submit, remove };
}
