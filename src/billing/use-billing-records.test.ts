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
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(() => result.current.saveTask({ ...task, description: "Updated" }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toHaveLength(1);
  expect(result.current.tasks[0].description).toBe("Updated");
  await expect(result.current.deleteClient("a")).rejects.toThrow("still has tasks");
  await act(() => result.current.deleteClient("b"));
  await act(() => result.current.deleteTask("t"));
  await waitFor(() => expect(result.current.loading).toBe(false));
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

it("loads bounded pages, keeps complete totals and resets after edits and filter changes", async () => {
  for (let index = 0; index < 52; index++) {
    await storage.writeRecord("tasks", {
      ...task,
      id: String(index).padStart(3, "0"),
      end: "2026-01-01T00:06:00Z",
    });
  }
  await storage.writeRecord("tasks", {
    ...task,
    id: "old",
    clientId: "b",
    start: "2025-01-01T00:00:00Z",
  });
  const { result, rerender } = renderHook(({ filter }) => useBillingRecords(filter), {
    initialProps: { filter: "" },
  });
  await act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toHaveLength(50);
  expect(result.current.hasMore).toBe(true);
  expect(result.current.totals.hours).toBeCloseTo(5.2);
  expect(result.current.totals.openCount).toBe(1);
  await expect(result.current.deleteClient("b")).rejects.toThrow("still has tasks");
  await act(() => result.current.loadMore());
  expect(result.current.tasks).toHaveLength(53);
  expect(result.current.hasMore).toBe(false);
  await act(() => result.current.loadMore());
  expect(result.current.tasks).toHaveLength(53);
  rerender({ filter: "b" });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks.map((item) => item.id)).toEqual(["old"]);
  expect(result.current.totals).toEqual({ hours: 0, openCount: 1 });
  await act(() => result.current.saveTask({ ...task, id: "old", clientId: "a" }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toEqual([]);
  expect(result.current.usedClientIds.has("b")).toBe(false);
});

it.each([new Error("Read failed"), "unknown"])(
  "preserves pages on failure and retries without duplicate requests: %s",
  async (error) => {
    const read = vi
      .spyOn(storage, "readTaskPage")
      .mockResolvedValue({ tasks: [task], next: [task.start, task.id] });
    const { result } = renderHook(useBillingRecords);
    await waitFor(() => expect(result.current.loading).toBe(false));
    const deferred = deferredPromise<storage.TaskPage>();
    read.mockReturnValueOnce(deferred.promise);
    let request!: Promise<void>;
    act(() => {
      request = result.current.loadMore();
    });
    expect(result.current.loadingMore).toBe(true);
    await act(() => result.current.loadMore());
    expect(read).toHaveBeenCalledTimes(2);
    await act(async () => {
      deferred.reject(error);
      await request;
    });
    expect(result.current.tasks).toEqual([task]);
    expect(result.current.loadingMore).toBe(false);
    expect(result.current.pageError).toBe(
      error instanceof Error ? error.message : "Could not load more tasks.",
    );
    read.mockResolvedValueOnce({ tasks: [{ ...task, id: "older" }], next: null });
    await act(() => result.current.loadMore());
    expect(result.current.tasks.map((item) => item.id)).toEqual(["t", "older"]);
    expect(result.current.pageError).toBe("");
  },
);

it.each([true, false])(
  "discards obsolete page results after changing the filter, success=%s",
  async (success) => {
    const read = vi
      .spyOn(storage, "readTaskPage")
      .mockResolvedValue({ tasks: [task], next: [task.start, task.id] });
    const { result, rerender } = renderHook(({ filter }) => useBillingRecords(filter), {
      initialProps: { filter: "" },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const deferred = deferredPromise<storage.TaskPage>();
    read.mockReturnValueOnce(deferred.promise);
    let request!: Promise<void>;
    act(() => {
      request = result.current.loadMore();
    });
    read.mockResolvedValueOnce({ tasks: [], next: null });
    rerender({ filter: "empty" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      if (success) deferred.resolve({ tasks: [{ ...task, id: "obsolete" }], next: null });
      else deferred.reject(new Error("Obsolete error"));
      await request;
    });
    expect(result.current.tasks).toEqual([]);
    expect(result.current.pageError).toBe("");
    expect(result.current.loadingMore).toBe(false);
  },
);

it("retries a failed initial load", async () => {
  vi.spyOn(storage, "readTaskPage").mockRejectedValueOnce(new Error("Temporary failure"));
  const { result } = renderHook(useBillingRecords);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe("Temporary failure");
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBe("");
});
