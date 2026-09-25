import { useEffect, useState } from "react";
import { readRecords, writeRecord } from "./storage.ts";
import type { Client, Task } from "./storage.ts";

export function useBillingRecords() {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([readRecords("clients"), readRecords("tasks")])
      .then(([savedClients, savedTasks]) => {
        if (active) {
          setClients(savedClients);
          setTasks(savedTasks);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load records.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveClient(client: Client) {
    await writeRecord("clients", client);
    setClients((current) => [...current.filter((item) => item.id !== client.id), client]);
  }

  async function deleteClient(id: string) {
    if (tasks.some((task) => task.clientId === id)) throw new Error("This client still has tasks.");
    await writeRecord("clients", id);
    setClients((current) => current.filter((client) => client.id !== id));
  }

  async function saveTask(task: Task) {
    await writeRecord("tasks", task);
    setTasks((current) => [...current.filter((item) => item.id !== task.id), task]);
  }

  async function deleteTask(id: string) {
    await writeRecord("tasks", id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return {
    clients: [...clients].sort((a, b) => a.name.localeCompare(b.name)),
    tasks,
    loading,
    error,
    saveClient,
    deleteClient,
    saveTask,
    deleteTask,
  };
}
