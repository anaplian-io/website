import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useTimezone } from "./use-timezone.ts";
it.each([null, "invalid", "America/Denver"])(
  "loads a valid saved preference or defaults to New York: %s",
  (saved) => {
    if (saved) localStorage.setItem("billable-hours-timezone", saved);
    const { result } = renderHook(useTimezone);
    expect(result.current.timezone).toBe(saved === "America/Denver" ? saved : "America/New_York");
  },
);
it("tolerates inaccessible settings and reports failed preference writes", () => {
  const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Denied");
  });
  const { result } = renderHook(useTimezone);
  expect(result.current.timezone).toBe("America/New_York");
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Denied");
  });
  act(() => result.current.changeTimezone("America/Phoenix"));
  expect(result.current.timezone).toBe("America/Phoenix");
  expect(result.current.error).toContain("could not save");
  write.mockRestore();
  read.mockRestore();
  act(() => result.current.changeTimezone("America/Chicago"));
  expect(result.current.error).toBe("");
  expect(localStorage.getItem("billable-hours-timezone")).toBe("America/Chicago");
});
