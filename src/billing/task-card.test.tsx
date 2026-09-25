import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskCard } from "./task-card.tsx";
it("shows completed durations, local timestamps and open task actions", async () => {
  const task = {
    id: "t",
    clientId: "c",
    description: "Review",
    start: "2026-01-01T15:00:00Z",
    end: "2026-01-01T15:09:00Z",
  };
  const props = {
    task,
    clientName: "Client",
    timezone: "America/New_York",
    disabled: false,
    deleting: false,
    ending: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onEnd: vi.fn(),
  };
  const { rerender } = render(<TaskCard {...props} />);
  expect(screen.getByText("0.2 hrs (12 minutes)")).toBeVisible();
  expect(screen.getByText(/10:09 AM EST/)).toHaveAttribute("datetime", task.end);
  expect(screen.queryByRole("button", { name: "End now" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Edit task" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete task" }));
  expect(props.onEdit).toHaveBeenCalledOnce();
  expect(props.onDelete).toHaveBeenCalledOnce();
  rerender(<TaskCard {...props} task={{ ...task, description: "", end: null }} />);
  expect(screen.getByRole("heading", { name: "Untitled task" })).toBeVisible();
  expect(screen.getByText("Open")).toBeVisible();
  expect(screen.getByText("Still open")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "End now" }));
  expect(props.onEnd).toHaveBeenCalledOnce();
  rerender(<TaskCard {...props} task={{ ...task, end: null }} disabled deleting ending />);
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
});
