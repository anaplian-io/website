import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskWorkspace } from "./task-workspace.tsx";
import type { TaskEditor } from "./task-workspace.tsx";
import type { Client, Task } from "./storage.ts";

function Workspace({
  tasks = [],
  clients = [{ id: "c", name: "Client" }],
}: {
  tasks?: Task[];
  clients?: Client[];
}) {
  const [editor, setEditor] = useState<TaskEditor>(null);
  const [filter, setFilter] = useState("");
  return (
    <TaskWorkspace
      clients={clients}
      tasks={tasks}
      timezone="America/New_York"
      filter={filter}
      editor={editor}
      onFilter={setFilter}
      onEdit={setEditor}
      onAddClient={vi.fn()}
      onSave={async () => undefined}
      onDelete={async () => undefined}
    />
  );
}
it("opens and cancels a new task and closes the editor after saving", async () => {
  const user = userEvent.setup();
  render(<Workspace />);
  await user.click(screen.getByRole("button", { name: "+ Add task" }));
  expect(screen.getByRole("heading", { name: "New task" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("heading", { name: "New task" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "+ Add task" }));
  await user.click(screen.getByRole("button", { name: "Save task" }));
  expect(screen.queryByRole("heading", { name: "New task" })).not.toBeInTheDocument();
});
it("sorts latest tasks first, filters by client and edits existing tasks", async () => {
  const user = userEvent.setup();
  const task = {
    id: "old",
    clientId: "c",
    description: "Older",
    start: "2026-01-01T00:00:00Z",
    end: null,
  };
  render(
    <Workspace
      tasks={[task, { ...task, id: "new", description: "Newer", start: "2026-01-02T00:00:00Z" }]}
      clients={[
        { id: "c", name: "Client" },
        { id: "empty", name: "Empty" },
      ]}
    />,
  );
  expect(
    screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
  ).toEqual(["Newer", "Older"]);
  await user.click(screen.getAllByRole("button", { name: "Edit task" })[0]);
  expect(screen.getByLabelText("Description (optional)")).toHaveValue("Newer");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await user.selectOptions(screen.getByLabelText("Client filter"), "empty");
  expect(screen.getByRole("heading", { name: "No tasks" })).toBeVisible();
  await user.selectOptions(screen.getByLabelText("Client filter"), "c");
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
});
it("guides users with no clients", () => {
  render(<Workspace clients={[]} />);
  expect(screen.getByRole("button", { name: "Add your first client" })).toBeVisible();
});
