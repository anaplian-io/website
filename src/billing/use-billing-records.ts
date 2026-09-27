import { useEffect, useRef, useState } from "react";
import {
  deleteUnusedClient,
  readRecords,
  readTaskOverview,
  readTaskPage,
  writeRecord,
} from "./storage.ts";
import type { Client, Task, TaskPage, TaskTotals } from "./storage.ts";

export function useBillingRecords(filter = "") {
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState<TaskPage>({ tasks: [], next: null });
  const [totals, setTotals] = useState<TaskTotals>({ hours: 0, openCount: 0 });
  const [usedClientIds, setUsedClientIds] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [revision, setRevision] = useState(0);
  const generation = useRef({ active: false, pending: false });
  const [previousFilter, setPreviousFilter] = useState(filter);

  if (previousFilter !== filter) {
    setPreviousFilter(filter);
    setLoading(true);
    setLoadingMore(false);
    setError("");
    setPageError("");
  }

  useEffect(() => {
    const request = { active: true, pending: false };
    generation.current = request;
    Promise.all([readRecords("clients"), readTaskPage(filter, null), readTaskOverview(filter)])
      .then(([savedClients, savedPage, overview]) => {
        if (request.active) {
          setClients(savedClients);
          setPage(savedPage);
          setTotals(overview.totals);
          setUsedClientIds(overview.usedClientIds);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (request.active) {
          setError(cause instanceof Error ? cause.message : "Could not load records.");
          setLoading(false);
        }
      });
    return () => {
      request.active = false;
    };
  }, [filter, revision]);

  function refresh() {
    generation.current.active = false;
    setLoading(true);
    setLoadingMore(false);
    setError("");
    setPageError("");
    setRevision((current) => current + 1);
  }

  async function loadMore() {
    if (loading || generation.current.pending || !page.next) return;
    const request = generation.current;
    request.pending = true;
    setLoadingMore(true);
    setPageError("");
    try {
      const nextPage = await readTaskPage(filter, page.next);
      if (request.active) {
        setPage((current) => ({
          tasks: [...current.tasks, ...nextPage.tasks],
          next: nextPage.next,
        }));
      }
    } catch (cause) {
      if (request.active) {
        setPageError(cause instanceof Error ? cause.message : "Could not load more tasks.");
      }
    } finally {
      if (request.active) {
        request.pending = false;
        setLoadingMore(false);
      }
    }
  }

  async function saveClient(client: Client) {
    await writeRecord("clients", client);
    setClients((current) => [...current.filter((item) => item.id !== client.id), client]);
  }

  async function deleteClient(id: string) {
    await deleteUnusedClient(id);
    setClients((current) => current.filter((client) => client.id !== id));
  }

  async function saveTask(task: Task) {
    await writeRecord("tasks", task);
    refresh();
  }

  async function deleteTask(id: string) {
    await writeRecord("tasks", id);
    refresh();
  }

  return {
    clients: [...clients].sort((a, b) => a.name.localeCompare(b.name)),
    tasks: page.tasks,
    hasMore: page.next !== null,
    totals,
    usedClientIds,
    loading,
    loadingMore,
    error,
    pageError,
    loadMore,
    refresh,
    saveClient,
    deleteClient,
    saveTask,
    deleteTask,
  };
}
