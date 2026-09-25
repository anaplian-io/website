import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import { AppCard } from "./app-card.tsx";

it("presents the supplied app details and destination", () => {
  render(
    <MemoryRouter>
      <AppCard
        title="Example tool"
        description="A useful tool."
        href="/apps/example"
        status="Available"
      />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Example tool" })).toBeVisible();
  expect(screen.getByText("A useful tool.")).toBeVisible();
  expect(screen.getByText("Available")).toBeVisible();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/apps/example");
});
