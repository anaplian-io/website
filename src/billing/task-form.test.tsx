import { deferredPromise } from "../../tests/setup.ts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskForm } from "./task-form.tsx";
it("lets users choose a client and independently edit start and end fields", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <TaskForm
      clients={[
        { id: "a", name: "Alpha" },
        { id: "b", name: "Beta" },
      ]}
      task={null}
      timezone="America/New_York"
      onSave={onSave}
      onCancel={vi.fn()}
    />,
  );
  await user.selectOptions(screen.getByLabelText("Client"), "b");
  await user.type(screen.getByLabelText("Description (optional)"), " Review ");
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-01-01" } });
  fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "23:55:00" } });
  await user.click(screen.getByLabelText("Set an end time"));
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-01-02" } });
  fireEvent.change(screen.getByLabelText("End time"), { target: { value: "00:05:00" } });
  await user.click(screen.getByRole("button", { name: "Save task" }));
  expect(onSave).toHaveBeenCalledWith({
    id: expect.any(String),
    clientId: "b",
    description: "Review",
    start: "2026-01-02T04:55:00.000Z",
    end: "2026-01-02T05:05:00.000Z",
  });
});
it("disables editing during a save and displays errors without discarding the task", async () => {
  const deferred = deferredPromise<void>();
  const task = {
    id: "t",
    clientId: "a",
    description: "Review",
    start: "2026-01-01T15:00:00Z",
    end: null,
  };
  render(
    <TaskForm
      clients={[{ id: "a", name: "Alpha" }]}
      task={task}
      timezone="America/New_York"
      onSave={() => deferred.promise}
      onCancel={vi.fn()}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Save task" }));
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  expect(screen.getByLabelText("Start date")).toBeDisabled();
  deferred.reject(new Error("Storage full"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Storage full");
  await waitFor(() => expect(screen.getByRole("button", { name: "Save task" })).toBeEnabled());
});
it("allows cancellation when no clients exist", async () => {
  const onCancel = vi.fn();
  render(
    <TaskForm
      clients={[]}
      task={null}
      timezone="America/New_York"
      onSave={vi.fn()}
      onCancel={onCancel}
    />,
  );
  expect(screen.queryByRole("option")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalledOnce();
});
