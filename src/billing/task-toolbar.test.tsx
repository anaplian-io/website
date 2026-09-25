import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskToolbar } from "./task-toolbar.tsx";
it("requires clients and no active editor before adding a task", async () => {
  const props = { clients: [], filter: "", editing: false, onFilter: vi.fn(), onAdd: vi.fn() };
  const { rerender } = render(<TaskToolbar {...props} />);
  expect(screen.getByRole("button")).toBeDisabled();
  const clients = [{ id: "c", name: "Client" }];
  rerender(<TaskToolbar {...props} clients={clients} editing />);
  expect(screen.getByRole("button")).toBeDisabled();
  rerender(<TaskToolbar {...props} clients={clients} />);
  await userEvent.click(screen.getByRole("button"));
  expect(props.onAdd).toHaveBeenCalledOnce();
});
