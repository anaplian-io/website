import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { expect, it, vi } from "vitest";
import { useClientManager } from "./use-client-manager.ts";
const event = { preventDefault: () => undefined } as FormEvent<HTMLFormElement>;
it("rejects whitespace names and trims valid new names", async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useClientManager({ onSave, onDelete: vi.fn() }));
  act(() => result.current.setName("  "));
  await act(() => result.current.submit(event));
  expect(result.current.error).toBe("Enter a client name.");
  expect(onSave).not.toHaveBeenCalled();
  act(() => result.current.setName(" Client "));
  await act(() => result.current.submit(event));
  expect(onSave).toHaveBeenCalledWith({ id: expect.any(String), name: "Client" });
  expect(result.current.name).toBe("");
  expect(result.current.error).toBe("");
});
it("renames with the original ID and cancels an edit after that client is deleted", async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useClientManager({ onSave, onDelete }));
  act(() => result.current.edit({ id: "c", name: "Client" }));
  act(() => result.current.setName("Renamed"));
  await act(() => result.current.submit(event));
  expect(onSave).toHaveBeenCalledWith({ id: "c", name: "Renamed" });
  act(() => result.current.edit({ id: "c", name: "Client" }));
  await act(() => result.current.remove("other"));
  expect(result.current.editing).toBe("c");
  await act(() => result.current.remove("c"));
  expect(result.current.editing).toBeNull();
  expect(result.current.name).toBe("");
});
it.each([new Error("Storage full"), "unknown"])(
  "reports save and delete failures without clearing edits",
  async (error) => {
    const { result } = renderHook(() =>
      useClientManager({
        onSave: vi.fn().mockRejectedValue(error),
        onDelete: vi.fn().mockRejectedValue(error),
      }),
    );
    act(() => result.current.edit({ id: "c", name: "Client" }));
    await act(() => result.current.submit(event));
    expect(result.current.error).toBe(
      error instanceof Error ? error.message : "Could not save client.",
    );
    await act(() => result.current.remove("c"));
    expect(result.current.error).toBe(
      error instanceof Error ? error.message : "Could not delete client.",
    );
    expect(result.current.name).toBe("Client");
    expect(result.current.busy).toBe(false);
  },
);
