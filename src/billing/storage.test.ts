import { expect, it, vi } from "vitest";
import { openDB } from "idb";
import {
  deleteUnusedClient,
  readRecords,
  readTaskOverview,
  readTaskPage,
  taskPageSize,
  writeRecord,
} from "./storage.ts";

const task = {
  id: "t",
  clientId: "c",
  description: "Review",
  start: "2026-01-01T00:00:00.000Z",
  end: null,
};

it("upgrades a populated V1 database in place and indexes its existing records", async () => {
  const database = await openDB("billable-hours", 1, {
    upgrade(db) {
      db.createObjectStore("clients", { keyPath: "id" });
      db.createObjectStore("tasks", { keyPath: "id" });
    },
  });
  await database.put("clients", { id: "c", name: "Client" });
  await database.put("tasks", task);
  database.close();
  expect(await readTaskPage("", null)).toEqual({ tasks: [task], next: null });
  expect(await readTaskPage("c", null)).toEqual({ tasks: [task], next: null });
  expect(await readRecords("clients")).toEqual([{ id: "c", name: "Client" }]);
  const upgraded = await openDB("billable-hours", 2);
  expect(upgraded.version).toBe(2);
  upgraded.close();
});

it.each(["", "c"])(
  "paginates tied start times without omissions for filter '%s'",
  async (filter) => {
    const tasks = Array.from({ length: taskPageSize + 2 }, (_, index) => ({
      ...task,
      id: String(index).padStart(3, "0"),
    }));
    for (const item of tasks) await writeRecord("tasks", item);
    await writeRecord("tasks", {
      ...task,
      id: "new",
      clientId: "other",
      start: "2026-02-01T00:00:00.000Z",
    });
    const first = await readTaskPage(filter, null);
    expect(first.tasks).toHaveLength(taskPageSize);
    const second = await readTaskPage(filter, first.next);
    const expected = tasks.reverse();
    if (!filter)
      expected.unshift({
        ...task,
        id: "new",
        clientId: "other",
        start: "2026-02-01T00:00:00.000Z",
      });
    expect([...first.tasks, ...second.tasks]).toEqual(expected);
    expect(second.next).toBeNull();
    expect(await readTaskPage("missing", null)).toEqual({ tasks: [], next: null });
  },
);

it("finishes an exactly full page without advertising another page", async () => {
  for (let index = 0; index < taskPageSize; index++)
    await writeRecord("tasks", { ...task, id: String(index) });
  expect((await readTaskPage("", null)).next).toBeNull();
});

it("computes all-time and client totals and protects clients independently of pages", async () => {
  await writeRecord("clients", { id: "c", name: "Client" });
  await writeRecord("clients", { id: "empty", name: "Empty" });
  await writeRecord("tasks", task);
  await writeRecord("tasks", { ...task, id: "done", end: "2026-01-01T00:02:00.000Z" });
  await writeRecord("tasks", {
    ...task,
    id: "other",
    clientId: "b",
    end: "2026-01-01T00:02:00.000Z",
  });
  expect(await readTaskOverview("")).toEqual({
    totals: { hours: 0.2, openCount: 1 },
    usedClientIds: new Set(["c", "b"]),
  });
  expect((await readTaskOverview("c")).totals).toEqual({ hours: 0.1, openCount: 1 });
  expect((await readTaskOverview("missing")).totals).toEqual({ hours: 0, openCount: 0 });
  await expect(deleteUnusedClient("c")).rejects.toThrow("still has tasks");
  await deleteUnusedClient("empty");
  expect(await readRecords("clients")).toEqual([{ id: "c", name: "Client" }]);
});

it("reports failed page and overview reads and closes connections", async () => {
  const close = vi.spyOn(IDBDatabase.prototype, "close");
  vi.spyOn(IDBIndex.prototype, "openCursor").mockImplementation(() => {
    throw new Error("Read failed");
  });
  await expect(readTaskPage("", null)).rejects.toThrow("Could not read saved tasks");
  vi.spyOn(IDBObjectStore.prototype, "openCursor").mockImplementation(() => {
    throw new Error("Read failed");
  });
  await expect(readTaskOverview("")).rejects.toThrow("Could not read task totals");
  expect(close).toHaveBeenCalledTimes(2);
});

it("persists, updates and deletes records without mixing stores", async () => {
  await writeRecord("clients", { id: "c", name: "Client" });
  await writeRecord("tasks", {
    id: "t",
    clientId: "c",
    description: "Review",
    start: "2026-01-01T00:00:00Z",
    end: null,
  });
  await writeRecord("clients", { id: "c", name: "Renamed" });
  expect(await readRecords("clients")).toEqual([{ id: "c", name: "Renamed" }]);
  expect(await readRecords("tasks")).toHaveLength(1);
  await writeRecord("tasks", "t");
  expect(await readRecords("tasks")).toEqual([]);
  expect(await readRecords("clients")).toHaveLength(1);
});
it("reports unavailable database access", async () => {
  vi.spyOn(indexedDB, "open").mockImplementation(() => {
    throw new Error("Denied");
  });
  await expect(readRecords("clients")).rejects.toThrow("Could not open local storage");
});
it("reports read failures and closes the connection", async () => {
  const close = vi.spyOn(IDBDatabase.prototype, "close");
  vi.spyOn(IDBObjectStore.prototype, "getAll").mockImplementation(() => {
    throw new Error("Read failed");
  });
  await expect(readRecords("clients")).rejects.toThrow("Could not read saved records");
  expect(close).toHaveBeenCalled();
});
it("reports failed writes without persisting changes", async () => {
  vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(() => {
    throw new Error("Quota");
  });
  await expect(writeRecord("clients", { id: "c", name: "Client" })).rejects.toThrow(
    "Could not save changes",
  );
  expect(await readRecords("clients")).toEqual([]);
});
it("releases a connection when another tab requests an upgrade", async () => {
  await writeRecord("clients", { id: "c", name: "Client" });
  const close = vi.spyOn(IDBDatabase.prototype, "close");
  const getAll = IDBObjectStore.prototype.getAll;
  vi.spyOn(IDBObjectStore.prototype, "getAll").mockImplementation(function (this: IDBObjectStore) {
    const request = getAll.call(this);
    this.transaction.db.dispatchEvent(
      new IDBVersionChangeEvent("versionchange", { oldVersion: 1, newVersion: 2 }),
    );
    return request;
  });
  expect(await readRecords("clients")).toEqual([{ id: "c", name: "Client" }]);
  expect(close).toHaveBeenCalledTimes(2);
});
