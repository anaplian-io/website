import { deferredPromise } from "../../tests/setup.ts";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskList } from "./task-list.tsx";
it("routes edit, end and delete actions while locking all cards during persistence", async () => {
  const user = userEvent.setup();
  const task = {
    id: "t",
    clientId: "c",
    description: "Review",
    start: "2020-01-01T00:00:00Z",
    end: null,
  };
  const deletion = deferredPromise<void>();
  const ending = deferredPromise<void>();
  const props = {
    tasks: [task, { ...task, id: "other", clientId: "missing" }],
    clients: [{ id: "c", name: "Client" }],
    timezone: "America/New_York",
    editing: false,
    onEdit: vi.fn(),
    onSave: vi.fn(() => ending.promise),
    onDelete: vi.fn(() => deletion.promise),
  };
  render(<TaskList {...props} />);
  expect(screen.getByText("Unknown client")).toBeVisible();
  await user.click(screen.getAllByRole("button", { name: "Edit task" })[0]);
  expect(props.onEdit).toHaveBeenCalledWith(task);
  await user.click(screen.getAllByRole("button", { name: "End now" })[0]);
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  expect(screen.getAllByRole("button", { name: "Edit task" })[1]).toBeDisabled();
  ending.resolve();
  await waitFor(() =>
    expect(screen.getAllByRole("button", { name: "Edit task" })[0]).toBeEnabled(),
  );
  await user.click(screen.getAllByRole("button", { name: "Delete task" })[0]);
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  expect(props.onDelete).toHaveBeenCalledWith("t");
  deletion.resolve();
  await waitFor(() => expect(screen.queryByText("Deleting…")).not.toBeInTheDocument());
});
