import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ClientSelect } from "./client-select.tsx";
it("requires a client in forms and permits all clients in filters", async () => {
  const props = {
    clients: [
      { id: "a", name: "Alice" },
      { id: "b", name: "Bob" },
    ],
    value: "a",
    onChange: vi.fn(),
  };
  const { rerender } = render(<ClientSelect {...props} />);
  expect(screen.getByLabelText("Client")).toBeRequired();
  await userEvent.selectOptions(screen.getByLabelText("Client"), "b");
  expect(props.onChange).toHaveBeenCalledWith("b");
  rerender(<ClientSelect {...props} allowAll value="" />);
  expect(screen.getByLabelText("Client filter")).not.toBeRequired();
  expect(screen.getByRole("option", { name: "All clients" })).toBeVisible();
});
