import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ClientForm } from "./client-form.tsx";
it("supports client naming, editing and cancellation", async () => {
  const props = {
    name: "Client",
    busy: false,
    editing: false,
    onNameChange: vi.fn(),
    onSubmit: vi.fn(async (event) => {
      event.preventDefault();
    }),
    onCancel: vi.fn(),
  };
  const { rerender } = render(<ClientForm {...props} />);
  await userEvent.type(screen.getByLabelText("Client name"), "s");
  expect(props.onNameChange).toHaveBeenCalledWith("Clients");
  await userEvent.click(screen.getByRole("button", { name: "Add client" }));
  expect(props.onSubmit).toHaveBeenCalledOnce();
  rerender(<ClientForm {...props} editing />);
  expect(screen.getByRole("button", { name: "Save name" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(props.onCancel).toHaveBeenCalledOnce();
  rerender(<ClientForm {...props} busy />);
  expect(screen.getByLabelText("Client name")).toBeDisabled();
});
