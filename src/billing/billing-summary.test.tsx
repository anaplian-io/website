import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { BillingSummary } from "./billing-summary.tsx";
it("displays all-time totals independently of loaded task pages", () => {
  const { rerender } = render(
    <BillingSummary totals={{ hours: 0.2, openCount: 1 }} filtered={false} />,
  );
  expect(screen.getByText("0.2")).toBeVisible();
  expect(screen.getByText("1")).toBeVisible();
  expect(screen.getByText(/All-time totals\./)).toBeVisible();
  rerender(<BillingSummary totals={{ hours: 0, openCount: 0 }} filtered />);
  expect(screen.getByText("0.0")).toBeVisible();
  expect(screen.getByText(/All-time totals for this client/)).toBeVisible();
});
