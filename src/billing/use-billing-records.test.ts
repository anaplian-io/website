import { deferredPromise } from "../../tests/setup.ts";
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import * as storage from "./storage.ts";
import { useBillingRecords } from "./use-billing-records.ts";
const task = {
  id: "t",
  clientId: "a",
  description: "Review",
  start: "2026-01-01T00:00:00Z",
  end: null,
};
it("keeps clients sorted, updates records and protects attached clients", async () => {
  const { result } = renderHook(useBillingRecords);
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(() => result.current.saveClient({ id: "b", name: "Beta" }));
  await act(() => result.current.saveClient({ id: "a", name: "Alpha" }));
  await act(() => result.current.saveClient({ id: "b", name: "Bravo" }));
  expect(result.current.clients.map((client) => client.name)).toEqual(["Alpha", "Bravo"]);
  await act(() => result.current.saveTask(task));
  await act(() => result.current.saveTask({ ...task, description: "Updated" }));
  expect(result.current.tasks).toHaveLength(1);
  expect(result.current.tasks[0].description).toBe("Updated");
  await expect(result.current.deleteClient("a")).rejects.toThrow("still has tasks");
  await act(() => result.current.deleteClient("b"));
  await act(() => result.current.deleteTask("t"));
  await act(() => result.current.deleteClient("a"));
  expect(result.current.tasks).toEqual([]);
  expect(await storage.readRecords("clients")).toEqual([]);
});
it.each([new Error("Read failed"), "unknown"])("reports loading errors", async (error) => {
  vi.spyOn(storage, "readRecords").mockRejectedValue(error);
  const { result } = renderHook(useBillingRecords);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe(
    error instanceof Error ? error.message : "Could not load records.",
  );
});
it.each([true, false])("ignores requests settled after unmount, success=%s", async (success) => {
  const deferred = deferredPromise<never[]>();
  vi.spyOn(storage, "readRecords").mockReturnValue(deferred.promise);
  const { result, unmount } = renderHook(useBillingRecords);
  unmount();
  await act(async () => {
    if (success) deferred.resolve([]);
    else deferred.reject(new Error("Late failure"));
    await deferred.promise.catch(() => undefined);
  });
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBe("");
});
it("does not update visible records when persistence fails", async () => {
  const { result } = renderHook(useBillingRecords);
  await waitFor(() => expect(result.current.loading).toBe(false));
  vi.spyOn(storage, "writeRecord").mockRejectedValue(new Error("Disk full"));
  await expect(result.current.saveTask(task)).rejects.toThrow("Disk full");
  expect(result.current.tasks).toEqual([]);
});
