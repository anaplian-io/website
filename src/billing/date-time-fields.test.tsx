import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DateTimeFields } from "./date-time-fields.tsx";
it("changes date and time independently", () => {
  const onChange = vi.fn();
  render(
    <DateTimeFields
      label="Start"
      value={{ date: "2026-01-01", time: "12:00:00" }}
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-01-02" } });
  expect(onChange).toHaveBeenLastCalledWith({ date: "2026-01-02", time: "12:00:00" });
  fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "13:30:00" } });
  expect(onChange).toHaveBeenLastCalledWith({ date: "2026-01-01", time: "13:30:00" });
  expect(screen.getByLabelText("Start time")).toBeRequired();
});
