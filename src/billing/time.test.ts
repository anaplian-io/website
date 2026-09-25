import { expect, it, vi } from "vitest";
import { billableHours, displayTimestamp, localFields, timezones, utcTimestamp } from "./time.ts";

it.each([
  [0, 0.1],
  [2, 0.1],
  [6, 0.1],
  [8.99, 0.1],
  [9, 0.2],
  [12, 0.2],
  [15, 0.3],
  [60, 1],
  [1440, 24],
])("rounds %s elapsed minutes to %s billable hours", (minutes, expected) => {
  const start = "2026-01-01T00:00:00.000Z";
  expect(billableHours(start, new Date(Date.parse(start) + minutes * 60000).toISOString())).toBe(
    expected,
  );
});
it("excludes open tasks", () => expect(billableHours("2026-01-01T00:00:00Z", null)).toBe(0));
it.each(timezones)("round trips winter and summer timestamps in %s", (zone) => {
  for (const iso of ["2026-01-15T02:34:56.000Z", "2026-07-15T02:34:56.000Z"]) {
    const fields = localFields(iso, zone);
    expect(utcTimestamp(fields.date, fields.time, zone)).toBe(iso);
  }
});
it("handles date rollover and minute-only input", () => {
  expect(localFields("2026-01-01T02:00:00Z", "America/New_York")).toEqual({
    date: "2025-12-31",
    time: "21:00:00",
  });
  expect(utcTimestamp("2025-12-31", "21:00", "America/New_York")).toBe("2026-01-01T02:00:00.000Z");
});
it("rejects invalid input and nonexistent spring times", () => {
  expect(() => utcTimestamp("", "", "America/New_York")).toThrow("valid date and time");
  expect(() => utcTimestamp("2026-03-08", "02:30", "America/New_York")).toThrow("does not exist");
});
it("chooses the earlier repeated fall time and keeps Phoenix on standard time", () => {
  expect(utcTimestamp("2026-11-01", "01:30", "America/New_York")).toBe("2026-11-01T05:30:00.000Z");
  expect(utcTimestamp("2026-07-01", "12:00", "America/Phoenix")).toBe("2026-07-01T19:00:00.000Z");
});
it("formats an instant in the selected timezone", () => {
  expect(displayTimestamp("2026-01-01T02:00:00Z", "America/New_York")).toMatch(
    /Dec 31, 2025.*9:00 PM.*EST/,
  );
});
it("does not crash when an Intl provider omits a requested part", () => {
  vi.spyOn(Intl.DateTimeFormat.prototype, "formatToParts").mockReturnValue([]);
  expect(localFields("2026-01-01T00:00:00Z", "America/New_York")).toEqual({
    date: "--",
    time: "::",
  });
});
