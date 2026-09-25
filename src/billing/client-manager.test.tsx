import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ClientManager } from "./client-manager.tsx";
it("supports creating, renaming, cancelling and deleting unreferenced clients", async () => {
  const user = userEvent.setup();
  const props = {
    clients: [],
    tasks: [],
    onSave: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };
  const { rerender } = render(<ClientManager {...props} />);
  expect(screen.getByText(/Add your first client/)).toBeVisible();
  await user.type(screen.getByLabelText("Client name"), "Client");
  await user.click(screen.getByRole("button", { name: "Add client" }));
  expect(props.onSave).toHaveBeenCalledWith({ id: expect.any(String), name: "Client" });
  rerender(<ClientManager {...props} clients={[{ id: "c", name: "Client" }]} />);
  await user.click(screen.getByRole("button", { name: "Rename Client" }));
  expect(screen.getByLabelText("Client name")).toHaveValue("Client");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByLabelText("Client name")).toHaveValue("");
  await user.click(screen.getByRole("button", { name: "Delete Client" }));
  expect(props.onDelete).toHaveBeenCalledWith("c");
  rerender(
    <ClientManager
      {...props}
      clients={[{ id: "c", name: "Client" }]}
      tasks={[
        { id: "t", clientId: "c", description: "", start: "2026-01-01T00:00:00Z", end: null },
      ]}
    />,
  );
  expect(screen.getByRole("button", { name: "Delete Client" })).toBeDisabled();
});
