import { expect, it } from "vitest";
import { createTaskDraft, taskFromDraft } from "./task-draft.ts";
import type { Task } from "./storage.ts";

const now = "2026-01-02T02:30:45.123Z";
const zone = "America/New_York";
const task: Task = { id: "t", clientId: "c", description: "Review", start: now, end: null };

it("defaults a new draft to the selected client's local current date and time", () => {
  expect(createTaskDraft(null, "c", zone, now)).toEqual({
    clientId: "c",
    description: "",
    start: { date: "2026-01-01", time: "21:30:45" },
    end: { date: "2026-01-01", time: "21:30:45" },
    completed: false,
  });
});
it("creates open tasks with trimmed descriptions and UTC timestamps", () => {
  const draft = createTaskDraft(null, "c", zone, now);
  expect(taskFromDraft({ ...draft, description: " Review " }, null, zone, "new")).toEqual({
    ...task,
    id: "new",
    start: "2026-01-02T02:30:45.000Z",
  });
});
it("preserves exact timestamps on unchanged edits including repeated fall times", () => {
  const original = { ...task, start: "2026-11-01T06:30:00.123Z", end: "2026-11-01T07:00:00.456Z" };
  expect(taskFromDraft(createTaskDraft(original, "other", zone, now), original, zone, "t")).toEqual(
    original,
  );
});
it("updates start and end dates and times, and permits reopening", () => {
  const original = { ...task, end: now };
  const draft = createTaskDraft(original, "other", zone, now);
  const changed = {
    ...draft,
    start: { date: "2026-01-02", time: "10:00" },
    end: { date: "2026-01-02", time: "11:00" },
  };
  expect(taskFromDraft(changed, original, zone, "t")).toMatchObject({
    start: "2026-01-02T15:00:00.000Z",
    end: "2026-01-02T16:00:00.000Z",
  });
  expect(taskFromDraft({ ...draft, completed: false }, original, zone, "t").end).toBeNull();
});
it("ends an open task and rejects an end before its start", () => {
  const draft = createTaskDraft(task, "c", zone, now);
  expect(
    taskFromDraft(
      { ...draft, completed: true, end: { date: "2026-01-01", time: "22:00" } },
      task,
      zone,
      "t",
    ).end,
  ).toBe("2026-01-02T03:00:00.000Z");
  expect(() => taskFromDraft({ ...draft, completed: true }, task, zone, "t")).toThrow(
    "on or after",
  );
  expect(taskFromDraft({ ...draft, completed: true }, null, zone, "t").end).toBe(
    "2026-01-02T02:30:45.000Z",
  );
});
