import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import { BillableHoursPage } from "./billable-hours-page.tsx";

it("clearly identifies the calculator as an upcoming app", () => {
  render(
    <MemoryRouter>
      <BillableHoursPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { level: 1, name: "Billable hours" })).toBeVisible();
  expect(screen.getByText("Coming soon")).toBeVisible();
  expect(screen.getByText("A billable hours calculator for attorneys.")).toBeVisible();
  expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  expect(document.title).toBe("Billable hours · Anaplian.io");
});
