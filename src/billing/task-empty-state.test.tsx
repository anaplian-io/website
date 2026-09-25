import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskEmptyState } from "./task-empty-state.tsx";
it("guides users through missing clients and empty task filters", async () => {
  const onAddClient = vi.fn();
  const { rerender } = render(
    <TaskEmptyState hasClients={false} filtered={false} onAddClient={onAddClient} />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add your first client" }));
  expect(onAddClient).toHaveBeenCalledOnce();
  rerender(<TaskEmptyState hasClients filtered={false} onAddClient={onAddClient} />);
  expect(screen.getByText("Add a task to track billable hours.")).toBeVisible();
  rerender(<TaskEmptyState hasClients filtered onAddClient={onAddClient} />);
  expect(screen.getByText("Add a task for this client to track billable hours.")).toBeVisible();
});
