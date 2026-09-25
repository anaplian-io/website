import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { BillingError } from "./billing-error.tsx";
it("announces errors only when a message exists", () => {
  const { rerender } = render(<BillingError message="" />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  rerender(<BillingError message="Save failed" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Save failed");
});
