import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { BillingHeader } from "./billing-header.tsx";
it("offers the five cities and locks selection while editing", async () => {
  const onTimezoneChange = vi.fn();
  const props = { timezone: "America/New_York", disabled: false, onTimezoneChange };
  const { rerender } = render(<BillingHeader {...props} />);
  expect(screen.getAllByRole("option").map((item) => item.textContent)).toEqual([
    "New York",
    "Chicago",
    "Denver",
    "Phoenix",
    "Los Angeles",
  ]);
  await userEvent.selectOptions(screen.getByLabelText("Timezone"), "America/Denver");
  expect(onTimezoneChange).toHaveBeenCalledWith("America/Denver");
  rerender(<BillingHeader {...props} disabled />);
  expect(screen.getByLabelText("Timezone")).toBeDisabled();
});
