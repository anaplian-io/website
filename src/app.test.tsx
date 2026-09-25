import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "./app.tsx";

function renderPage(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("personal website", () => {
  it("opens the app app and returns home", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("link", { name: /Billable hours/ }));
    expect(screen.getByRole("heading", { level: 1, name: "Billable hours" })).toBeVisible();
    expect(await screen.findByRole("button", { name: "Add your first client" })).toBeVisible();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(document.title).toBe("Billable hours · Anaplian.io");
    await user.click(screen.getByRole("link", { name: "Anaplian.io" }));
    expect(screen.getByRole("heading", { name: /Apps/ })).toBeVisible();
  });

  it("supports a direct link to the app", () => {
    renderPage("/apps/billable-hours");
    expect(screen.getByRole("heading", { name: "Billable hours" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Anaplian.io" })).toHaveAttribute("href", "/");
  });

  it("provides a recovery link for unknown addresses", async () => {
    const user = userEvent.setup();
    renderPage("/missing");
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeVisible();
    expect(document.title).toBe("Page not found · Anaplian.io");
    await user.click(screen.getByRole("link", { name: "Anaplian.io" }));
    expect(screen.getByRole("heading", { name: "Anaplian.io" })).toBeVisible();
  });

  it("lets keyboard users reach and open the app", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.tab();
    expect(screen.getByRole("link", { name: "ethan@anaplian.io" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: /Billable hours/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Billable hours" })).toBeVisible();
  });
});
