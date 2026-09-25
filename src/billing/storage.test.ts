import { expect, it, vi } from "vitest";
import { readRecords, writeRecord } from "./storage.ts";

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
