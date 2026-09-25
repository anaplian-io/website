import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ClientRow } from "./client-row.tsx";
it("allows renaming but protects referenced clients from deletion", async () => {
  const props = {
    client: { id: "c", name: "Client" },
    busy: false,
    used: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
  const { rerender } = render(<ClientRow {...props} />);
  await userEvent.click(screen.getByRole("button", { name: "Rename Client" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete Client" }));
  expect(props.onEdit).toHaveBeenCalledOnce();
  expect(props.onDelete).toHaveBeenCalledOnce();
  rerender(<ClientRow {...props} used />);
  expect(screen.getByRole("button", { name: "Delete Client" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Rename Client" })).toBeEnabled();
});
