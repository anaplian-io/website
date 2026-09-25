import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { BillingSummary } from "./billing-summary.tsx";
it("sums rounded tasks separately and counts open tasks", () => {
  const task = {
    id: "t",
    clientId: "c",
    description: "",
    start: "2026-01-01T00:00:00Z",
    end: "2026-01-01T00:02:00Z",
  };
  const { rerender } = render(
    <BillingSummary
      tasks={[task, { ...task, id: "t2" }, { ...task, id: "t3", end: null }]}
      filtered={false}
    />,
  );
  expect(screen.getByText("0.2")).toBeVisible();
  expect(screen.getByText("1")).toBeVisible();
  expect(screen.getByText(/All-time totals\./)).toBeVisible();
  rerender(<BillingSummary tasks={[]} filtered />);
  expect(screen.getByText("0.0")).toBeVisible();
  expect(screen.getByText(/All-time totals for this client/)).toBeVisible();
});
