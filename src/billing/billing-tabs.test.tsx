import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { BillingTabs } from "./billing-tabs.tsx";
it("identifies the current section and navigates both ways", async () => {
  const onChange = vi.fn();
  const { rerender } = render(<BillingTabs tab="tasks" clientCount={2} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Tasks" })).toHaveAttribute("aria-current", "page");
  await userEvent.click(screen.getByRole("button", { name: "Clients 2" }));
  expect(onChange).toHaveBeenLastCalledWith("clients");
  rerender(<BillingTabs tab="clients" clientCount={2} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Clients 2" })).toHaveAttribute("aria-current", "page");
  await userEvent.click(screen.getByRole("button", { name: "Tasks" }));
  expect(onChange).toHaveBeenLastCalledWith("tasks");
});
