import { deferredPromise } from "../../tests/setup.ts";
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useTaskActions } from "./use-task-actions.ts";
const task = { id: "t", clientId: "c", description: "", start: "2026-01-01T00:00:00Z", end: null };
it("ends tasks at the current UTC instant and rejects future starts", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
  const onSave = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useTaskActions({ onSave, onDelete: vi.fn() }));
  await act(() => result.current.run(task, "end"));
  expect(onSave).toHaveBeenCalledWith({ ...task, end: "2026-01-01T01:00:00.000Z" });
  await act(() => result.current.run({ ...task, start: "2026-01-02T00:00:00Z" }, "end"));
  expect(result.current.error).toContain("starts in the future");
  expect(onSave).toHaveBeenCalledOnce();
});
it("keeps a delete pending until persistence completes", async () => {
  const deferred = deferredPromise<void>();
  const onDelete = vi.fn(() => deferred.promise);
  const { result } = renderHook(() => useTaskActions({ onSave: vi.fn(), onDelete }));
  let operation: Promise<void> | undefined;
  act(() => {
    operation = result.current.run(task, "delete");
  });
  expect(result.current.pending).toEqual({ id: "t", action: "delete" });
  await act(async () => {
    deferred.resolve();
    await operation;
  });
  expect(onDelete).toHaveBeenCalledWith("t");
  expect(result.current.pending).toBeNull();
});
it.each([new Error("Disk full"), "unknown"])(
  "reports action errors and releases pending state",
  async (error) => {
    const { result } = renderHook(() =>
      useTaskActions({ onSave: vi.fn(), onDelete: vi.fn().mockRejectedValue(error) }),
    );
    await act(() => result.current.run(task, "delete"));
    expect(result.current.error).toBe(
      error instanceof Error ? error.message : "Could not delete task.",
    );
    expect(result.current.pending).toBeNull();
  },
);
