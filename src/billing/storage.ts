import { openDB } from "idb";
import type { DBSchema } from "idb";

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
  tasks: { key: string; value: Task };
}

type StoreName = "clients" | "tasks";

async function openDatabase() {
  try {
    const database = await openDB<BillingDatabase>("billable-hours", 1, {
      upgrade(db) {
        db.createObjectStore("clients", { keyPath: "id" });
        db.createObjectStore("tasks", { keyPath: "id" });
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
