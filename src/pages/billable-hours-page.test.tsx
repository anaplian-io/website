import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { expect, it, vi } from "vitest";
import { BillableHoursPage } from "./billable-hours-page.tsx";
import * as storage from "../billing/storage.ts";

function renderPage() {
  return render(
    <MemoryRouter>
      <BillableHoursPage />
    </MemoryRouter>,
  );
}
it("creates clients and multiple open tasks, persists edits and updates totals", async () => {
  const user = userEvent.setup();
  const page = renderPage();
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
  await user.click(await screen.findByRole("button", { name: "Add your first client" }));
  await user.type(screen.getByLabelText("Client name"), "Client");
  await user.click(screen.getByRole("button", { name: "Add client" }));
  await user.click(screen.getByRole("button", { name: "Tasks" }));
  for (const description of ["First", "Second"]) {
    await user.click(screen.getByRole("button", { name: "+ Add task" }));
    await user.type(screen.getByLabelText("Description (optional)"), description);
    await user.click(screen.getByRole("button", { name: "Save task" }));
    await screen.findByRole("heading", { name: description });
  }
  expect(screen.getAllByText("Open")).toHaveLength(2);
  await user.click(screen.getAllByRole("button", { name: "End now" })[0]);
  expect(await screen.findByText("0.1 hrs (6 minutes)")).toBeVisible();
  await user.click(screen.getAllByRole("button", { name: "Edit task" })[0]);
  await user.clear(screen.getByLabelText("Description (optional)"));
  await user.type(screen.getByLabelText("Description (optional)"), "Revised");
  await user.click(screen.getByRole("button", { name: "Save task" }));
  await screen.findByRole("heading", { name: "Revised" });
  page.unmount();
  renderPage();
  expect(await screen.findByRole("heading", { name: "Revised" })).toBeVisible();
  const revisedCard = screen.getByRole("heading", { name: "Revised" }).closest("li");
  if (!revisedCard) throw new Error("Task card missing");
  await user.click(within(revisedCard).getByRole("button", { name: "Delete task" }));
  await waitFor(() =>
    expect(screen.queryByRole("heading", { name: "Revised" })).not.toBeInTheDocument(),
  );
  expect(await storage.readRecords("tasks")).toHaveLength(1);
});
it("clears a deleted client's filter and preserves an unrelated filter", async () => {
  await storage.writeRecord("clients", { id: "a", name: "Alpha" });
  await storage.writeRecord("clients", { id: "b", name: "Beta" });
  const user = userEvent.setup();
  renderPage();
  await screen.findByRole("button", { name: "+ Add task" });
  await user.selectOptions(screen.getByLabelText("Client filter"), "a");
  await user.click(screen.getByRole("button", { name: "Clients 2" }));
  await user.click(screen.getByRole("button", { name: "Delete Beta" }));
  await user.click(screen.getByRole("button", { name: "Tasks" }));
  expect(screen.getByLabelText("Client filter")).toHaveValue("a");
  await user.click(screen.getByRole("button", { name: "Clients 1" }));
  await user.click(screen.getByRole("button", { name: "Delete Alpha" }));
  await user.click(screen.getByRole("button", { name: "Tasks" }));
  expect(screen.getByLabelText("Client filter")).toHaveValue("");
});
it("shows load errors", async () => {
  vi.spyOn(storage, "readRecords").mockRejectedValue(new Error("Storage unavailable"));
  renderPage();
  expect(await screen.findByRole("alert")).toHaveTextContent("Storage unavailable");
});
