import { openDB } from "idb";
import type { DBSchema } from "idb";
import { billableHours } from "./time.ts";

export interface Client {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  clientId: string;
  description: string;
  start: string;
  end: string | null;
}

interface BillingDatabase extends DBSchema {
  clients: { key: string; value: Client };
  tasks: {
    key: string;
    value: Task;
    indexes: { "by-start": [string, string]; "by-client-start": [string, string, string] };
  };
}

export interface TaskTotals {
  hours: number;
  openCount: number;
}

export interface TaskPage {
  tasks: Task[];
  next: [string, string] | null;
}

export const taskPageSize = 50;

type StoreName = "clients" | "tasks";

async function openDatabase() {
  try {
    const database = await openDB<BillingDatabase>("billable-hours", 2, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          db.createObjectStore("clients", { keyPath: "id" });
          db.createObjectStore("tasks", { keyPath: "id" });
        }
        const tasks = transaction.objectStore("tasks");
        tasks.createIndex("by-start", ["start", "id"]);
        tasks.createIndex("by-client-start", ["clientId", "start", "id"]);
      },
      blocking() {
        database.close();
      },
    });
    return database;
  } catch {
    throw new Error("Could not open local storage. Check your browser storage settings.");
  }
}

export async function readTaskPage(clientId: string, before: TaskPage["next"]): Promise<TaskPage> {
  const database = await openDatabase();
  try {
    const store = database.transaction("tasks").store;
    const index = store.index(clientId ? "by-client-start" : "by-start");
    const range = clientId
      ? IDBKeyRange.bound([clientId], before ? [clientId, ...before] : [clientId, []], false, true)
      : before
        ? IDBKeyRange.upperBound(before, true)
        : undefined;
    let cursor = await index.openCursor(range, "prev");
    const tasks: Task[] = [];
    let next: TaskPage["next"] = null;
    while (cursor && tasks.length < taskPageSize) {
      tasks.push(cursor.value);
      next = [cursor.value.start, cursor.value.id];
      cursor = await cursor.continue();
    }
    return { tasks, next: cursor ? next : null };
  } catch {
    throw new Error("Could not read saved tasks.");
  } finally {
    database.close();
  }
}

export async function readTaskOverview(clientId: string) {
  const database = await openDatabase();
  try {
    const totals: TaskTotals = { hours: 0, openCount: 0 };
    const usedClientIds = new Set<string>();
    let cursor = await database.transaction("tasks").store.openCursor();
    while (cursor) {
      const task = cursor.value;
      usedClientIds.add(task.clientId);
      if (!clientId || task.clientId === clientId) {
        totals.hours += billableHours(task.start, task.end);
        if (!task.end) totals.openCount++;
      }
      cursor = await cursor.continue();
    }
    return { totals, usedClientIds };
  } catch {
    throw new Error("Could not read task totals.");
  } finally {
    database.close();
  }
}

export async function deleteUnusedClient(id: string) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(["clients", "tasks"], "readwrite");
    const task = await transaction
      .objectStore("tasks")
      .index("by-client-start")
      .getKey(IDBKeyRange.bound([id], [id, []]));
    if (task !== undefined) throw new Error("This client still has tasks.");
    await transaction.objectStore("clients").delete(id);
    await transaction.done;
  } finally {
    database.close();
  }
}

export async function readRecords<Name extends StoreName>(store: Name) {
  const database = await openDatabase();
  try {
    return await database.getAll(store);
  } catch {
    throw new Error("Could not read saved records.");
  } finally {
    database.close();
  }
}

export async function writeRecord<Name extends StoreName>(
  store: Name,
  record: BillingDatabase[Name]["value"] | string,
) {
  const database = await openDatabase();
  try {
    if (typeof record === "string") await database.delete(store, record);
    else await database.put(store, record);
  } catch {
    throw new Error("Could not save changes. Your browser storage may be full or unavailable.");
  } finally {
    database.close();
  }
}
