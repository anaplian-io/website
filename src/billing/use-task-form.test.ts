import { deferredPromise } from "../../tests/setup.ts";
import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { expect, it, vi } from "vitest";
import { useTaskForm } from "./use-task-form.ts";
const event = { preventDefault: () => undefined } as FormEvent<HTMLFormElement>;
const task = {
  id: "t",
  clientId: "c",
  description: "Review",
  start: "2026-01-01T15:00:00.123Z",
  end: null,
};
it("keeps form saving until persistence finishes and preserves existing IDs", async () => {
  const deferred = deferredPromise<void>();
  const onSave = vi.fn(() => deferred.promise);
  const { result } = renderHook(() =>
    useTaskForm({ task, clientId: "c", timezone: "America/New_York", onSave }),
  );
  act(() => result.current.update({ description: " Revised " }));
  let pending: Promise<void> | undefined;
  act(() => {
    pending = result.current.submit(event);
  });
  expect(result.current.saving).toBe(true);
  expect(onSave).toHaveBeenCalledWith({ ...task, description: "Revised" });
  await act(async () => {
    deferred.resolve();
    await pending;
  });
  expect(result.current.saving).toBe(false);
});
it.each([new Error("Storage full"), "unknown"])(
  "retains the draft after failed saves",
  async (error) => {
    const { result } = renderHook(() =>
      useTaskForm({
        task: null,
        clientId: "c",
        timezone: "America/New_York",
        onSave: vi.fn().mockRejectedValue(error),
      }),
    );
    act(() => result.current.update({ description: "Keep this" }));
    await act(() => result.current.submit(event));
    expect(result.current.error).toBe(
      error instanceof Error ? error.message : "Could not save task.",
    );
    expect(result.current.draft.description).toBe("Keep this");
    expect(result.current.saving).toBe(false);
  },
);
