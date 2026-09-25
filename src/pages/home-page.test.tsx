import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import { HomePage } from "./home-page.tsx";

it("introduces the site and lists the upcoming app", () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { level: 1, name: "Anaplian.io" })).toBeVisible();
  expect(screen.getByRole("link", { name: "ethan@anaplian.io" })).toHaveAttribute(
    "href",
    "mailto:ethan@anaplian.io",
  );
  const apps = within(screen.getByRole("region", { name: "Apps" }));
  expect(apps.getByRole("link", { name: /Billable hours/ })).toHaveAttribute(
    "href",
    "/apps/billable-hours",
  );
  expect(apps.getByText("Coming soon")).toBeVisible();
  expect(document.title).toBe("Ethan Fortner — Software Engineer in NYC | Anaplian.io");
});
